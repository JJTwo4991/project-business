import type {
  SimulatorInputs, MonthlyPnL, PaybackResult, DCFResult, SimulationResult,
  DailyPnL, SGADetail, PnLAnnotation,
} from '../types';
import { calcTotalTax, calcEffectiveTaxRate } from './tax';
import { getCostBreakdown } from '../data/costItems';

// 기타비용률 (소상공인실태조사 2023 기준, 매출 대비)
// 외식/주점업: 약 5%, 소매: 약 4%, 서비스/카페: 약 6%
// 출처: 소상공인실태조사 2023, 외식업체 경영실태 보고서
export function getMiscCostRate(category: string): number {
  if (category === '외식') return 0.05;
  if (category === '소매') return 0.04;
  return 0.06; // 서비스, 카페, 기타
}

// 3-C: operating days by business type
const OPERATING_DAYS_MAP: Record<number, number> = {
  3: 30,  // 편의점 (24시간/365일)
  14: 30, // 무인아이스크림 (무인 운영)
  16: 30, // 무인카페 (무인 운영)
};
const DEFAULT_OPERATING_DAYS = 26;

export function getOperatingDays(businessTypeId: number): number {
  return OPERATING_DAYS_MAP[businessTypeId] ?? DEFAULT_OPERATING_DAYS;
}

// 3-A: resolve business params from BusinessType + SubType + overrides
interface ResolvedParams {
  avg_ticket_price: number;
  material_cost_ratio: number;
  avg_daily_customers_small: number;
  avg_daily_customers_medium: number;
  avg_daily_customers_large: number;
  franchise_royalty_rate: number;
  franchise_ad_rate: number;
  franchise_other_rate: number;
}

export function resolveBusinessParams(inputs: SimulatorInputs): ResolvedParams {
  const bt = inputs.business_type;
  const brand = inputs.selected_brand;

  // Override chain: user override > business_type default
  const avg_ticket_price = inputs.ticket_price_override ?? bt.avg_ticket_price;
  const material_cost_ratio = inputs.material_cost_ratio_override ?? bt.material_cost_ratio;

  const avg_daily_customers_small = bt.avg_daily_customers_small;
  const avg_daily_customers_medium = bt.avg_daily_customers_medium;
  const avg_daily_customers_large = bt.avg_daily_customers_large;

  const franchise_royalty_rate = brand?.royalty_rate ?? 0;
  const franchise_ad_rate = brand?.advertising_rate ?? 0;
  const franchise_other_rate = brand?.other_fees_rate ?? 0;

  return {
    avg_ticket_price,
    material_cost_ratio,
    avg_daily_customers_small,
    avg_daily_customers_medium,
    avg_daily_customers_large,
    franchise_royalty_rate,
    franchise_ad_rate,
    franchise_other_rate,
  };
}

function getDebt(capital: SimulatorInputs['capital']): number {
  return Math.max(0, capital.initial_investment - capital.equity);
}

function getDailyCustomers(inputs: SimulatorInputs, params: ResolvedParams): number {
  if (inputs.daily_customers_override != null) return inputs.daily_customers_override;
  const { scale } = inputs;
  return scale === 'small' ? params.avg_daily_customers_small
    : scale === 'large' ? params.avg_daily_customers_large
    : params.avg_daily_customers_medium;
}

export function calcDailyPnL(inputs: SimulatorInputs): DailyPnL {
  const params = resolveBusinessParams(inputs);
  const dailyCustomers = getDailyCustomers(inputs, params);
  const daily_revenue = params.avg_ticket_price * dailyCustomers;
  const daily_cogs = Math.round(daily_revenue * params.material_cost_ratio);
  const daily_gross_profit = daily_revenue - daily_cogs;
  return { daily_revenue, daily_cogs, daily_gross_profit };
}

export function calcMonthlyPnL(inputs: SimulatorInputs): MonthlyPnL {
  const { business_type: bt, capital } = inputs;
  const params = resolveBusinessParams(inputs);
  const operatingDays = getOperatingDays(bt.id);

  const daily = calcDailyPnL(inputs);
  const revenue = daily.daily_revenue * operatingDays;
  const cogs = daily.daily_cogs * operatingDays;
  const gross_profit = revenue - cogs;

  const laborHeadcount = inputs.labor_headcount ?? 1;
  const labor = bt.labor_cost_monthly_per_person * laborHeadcount;
  const rent = inputs.rent_monthly ?? 0;

  // Cost breakdown from costItems (공과금, 배달앱수수료)
  const breakdown = getCostBreakdown(bt.id);
  const utilities = breakdown.utilities;
  const delivery_commission = breakdown.delivery;

  // 기타고정비: 매출 대비 비율 (소상공인실태조사 2023 기준)
  const miscRate = getMiscCostRate(bt.category);
  const other_fixed = Math.round(revenue * miscRate);

  // 3-D: 프랜차이즈 수수료 (변동비 — 매출 연동)
  const royalty = Math.round(revenue * params.franchise_royalty_rate);
  const advertising_fund = Math.round(revenue * params.franchise_ad_rate);
  const other_franchise_fees = Math.round(revenue * params.franchise_other_rate);

  // 예비비: 제거 (별도 버퍼로 산정하지 않음)
  const contingency = 0;

  const sg_and_a = labor + rent + utilities + delivery_commission + other_fixed + royalty + advertising_fund + other_franchise_fees;
  const sga_detail: SGADetail = { labor, labor_headcount: laborHeadcount, rent, utilities, delivery_commission, other_fixed, royalty, advertising_fund, other_franchise_fees, contingency };

  const operating_profit = gross_profit - sg_and_a;
  const debt = getDebt(capital);
  const interest_expense = debt > 0 ? Math.round(debt * capital.interest_rate / 12) : 0;
  const pretax_income = operating_profit - interest_expense;
  const tax = calcTotalTax(pretax_income);
  const net_income = pretax_income - tax;
  const loanMonths = Math.max(1, capital.loan_term_years * 12);
  const principal_repayment = debt > 0 ? Math.round(debt / loanMonths) : 0;
  const free_cash_flow = net_income - principal_repayment;

  return {
    revenue, cogs, gross_profit, sg_and_a, sga_detail, operating_profit,
    interest_expense, pretax_income, tax, net_income,
    principal_repayment, free_cash_flow,
  };
}

export function generateAnnotations(inputs: SimulatorInputs): PnLAnnotation {
  const { business_type: bt, capital } = inputs;
  const params = resolveBusinessParams(inputs);
  const dailyCustomers = getDailyCustomers(inputs, params);
  const operatingDays = getOperatingDays(bt.id);
  const laborHeadcount = inputs.labor_headcount ?? 1;
  const debt = getDebt(capital);
  const costRatioPercent = Math.round(params.material_cost_ratio * 100);
  const breakdown = getCostBreakdown(bt.id);

  return {
    revenue: `객단가 ${params.avg_ticket_price.toLocaleString()}원 × 일 ${dailyCustomers}명 × ${operatingDays}일`,
    cogs: `재료비율 ${costRatioPercent}% 적용 (업종 평균 추정치, 외식산업실태조사, 소상공인실태조사 등 참고)`,
    sga: `인건비 ${laborHeadcount}명 × ${(bt.labor_cost_monthly_per_person / 10000).toFixed(0)}만원 + 공과금 ${(breakdown.utilities / 10000).toFixed(0)}만원 + 배달수수료 ${(breakdown.delivery / 10000).toFixed(0)}만원 + 기타고정비 매출의 ${(getMiscCostRate(bt.category) * 100).toFixed(0)}%${inputs.selected_brand && (params.franchise_royalty_rate > 0 || params.franchise_ad_rate > 0) ? ` + 상표사용료 ${(params.franchise_royalty_rate * 100).toFixed(1)}% + 광고분담금 ${(params.franchise_ad_rate * 100).toFixed(1)}%` : ''}`,
    interest: debt > 0
      ? `대출 ${(debt / 10000).toLocaleString()}만원 × 연 ${(capital.interest_rate * 100).toFixed(1)}% ÷ 12 (초월 기준, 상환 시 점차 감소)`
      : '대출 없음',
    tax: '종합소득세 2025년 구간세율 + 지방소득세 10%',
    principal: debt > 0
      ? `대출 ${(debt / 10000).toLocaleString()}만원 ÷ ${capital.loan_term_years * 12}개월 (원금균등상환, 이자 별도)`
      : '대출 없음',
  };
}

export function calcPayback(inputs: SimulatorInputs): PaybackResult {
  const { capital } = inputs;
  const debt = getDebt(capital);
  const totalMonths = Math.max(1, capital.loan_term_years * 12);
  const principalPerMonth = debt > 0 ? Math.round(debt / totalMonths) : 0;

  // 프랜차이즈 보증금은 돌려받을 수 있어 회수기간 계산에서 제외
  const depositAmount = inputs.selected_brand?.deposit
    ?? capital.investment_breakdown?.find(
        item => item.category === 'deposit' && item.label.includes('보증금')
      )?.amount
    ?? 0;
  const paybackInvestment = Math.max(0, capital.initial_investment - depositAmount);

  let remainingDebt = debt;
  let cumulative = -paybackInvestment;
  const cumulative_cashflow: { month: number; value: number }[] = [];
  let payback_months: number | null = null;

  const { gross_profit, sg_and_a } = calcMonthlyPnL(inputs);
  const operating_profit = gross_profit - sg_and_a;

  for (let month = 1; month <= 60; month++) {
    const interestThisMonth = remainingDebt > 0
      ? Math.round(remainingDebt * capital.interest_rate / 12)
      : 0;
    const pretax_income = operating_profit - interestThisMonth;
    const tax = calcTotalTax(pretax_income);
    const net_income = pretax_income - tax;
    const monthlyFCF = net_income - (month <= totalMonths ? principalPerMonth : 0);

    cumulative += monthlyFCF;
    cumulative_cashflow.push({ month, value: Math.round(cumulative) });

    if (payback_months === null && cumulative >= 0) {
      payback_months = month;
    }

    if (month <= totalMonths) {
      remainingDebt = Math.max(0, remainingDebt - principalPerMonth);
    }
  }

  return { payback_months, cumulative_cashflow };
}

export function calcDCF(pnl: MonthlyPnL, inputs: SimulatorInputs): DCFResult {
  const discount_rate = inputs.discount_rate ?? 0.15;
  const growth_rate = inputs.growth_rate ?? 0.00;

  const effectiveTaxRate = calcEffectiveTaxRate(pnl.operating_profit);
  const annualOperatingProfit = pnl.operating_profit * 12;
  const fcf_annual = Math.round(annualOperatingProfit * (1 - effectiveTaxRate));

  const denominator = discount_rate - growth_rate;
  const business_value = (denominator <= 0 || fcf_annual <= 0)
    ? null
    : Math.round(fcf_annual / denominator);

  return { fcf_annual, business_value, discount_rate, growth_rate };
}

export function runSimulation(inputs: SimulatorInputs): SimulationResult {
  const pnl = calcMonthlyPnL(inputs);
  const daily = calcDailyPnL(inputs);
  const annotations = generateAnnotations(inputs);
  const payback = calcPayback(inputs);
  const dcf = calcDCF(pnl, inputs);
  return { inputs, pnl, daily, annotations, payback, dcf };
}
