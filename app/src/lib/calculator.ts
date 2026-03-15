import type {
  SimulatorInputs, MonthlyPnL, PaybackResult, DCFResult, SimulationResult,
  DailyPnL, SGADetail, PnLAnnotation,
} from '../types';
import { calcTotalTax, calcEffectiveTaxRate } from './tax';

// 배달앱 수수료: 업종별 차등 (배달의민족·요기요 평균 중개수수료율 10% 기준)
const DELIVERY_RATES: Record<number, number> = {
  1: 0.10,   // 치킨: 10%
  5: 0.10,   // 분식: 10%
  8: 0.10,   // 피자: 10%
  2: 0.01,   // 카페: 1% (전체 주문 중 10%가 배달 가정)
  6: 0.033,  // 한식: 3.3% (전체 주문 중 1/3이 배달 가정)
};

// 기타비용률 (매출 대비, 배달수수료 제외)
// 외식: 기타 7.0% - 배달 1.2% ≈ 6% (외식업체 경영실태조사 2024, KREI 2025년 제6호 p.2)
// 소매: 도소매업 기타 7.7% (소상공인실태조사 2023 p.89), 배달 없으므로 6%로 보수적 적용
// 서비스/카페: 외식업과 유사 구조, 6% 적용 (직접 출처 없음, 추정)
export function getMiscCostRate(_category: string): number {
  return 0.06;
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
  // 재료비율: 기본값에 10% 가산 (소상공인 보수적 추정, 소규모 매장은 대형 대비 구매단가 불리)
  const baseCostRatio = inputs.material_cost_ratio_override ?? bt.material_cost_ratio;
  const material_cost_ratio = inputs.material_cost_ratio_override != null
    ? baseCostRatio
    : Math.min(baseCostRatio * 1.10, 0.95);

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
  const operatingDays = inputs.operating_days ?? getOperatingDays(bt.id);

  const daily = calcDailyPnL(inputs);
  const revenue = daily.daily_revenue * operatingDays;
  const cogs = daily.daily_cogs * operatingDays;
  const gross_profit = revenue - cogs;

  const laborHeadcount = inputs.labor_headcount ?? 1;
  const labor = bt.labor_cost_monthly_per_person * laborHeadcount;
  const rent = inputs.rent_monthly ?? 0;

  const deliveryRate = DELIVERY_RATES[bt.id] ?? 0;
  const delivery_commission = deliveryRate > 0
    ? Math.round(revenue * deliveryRate)
    : 0;

  // 기타 영업비용: 매출 대비 비율 (공과금, 보험료, 소모품비 등 포함)
  // 외식: 기타 7.0% - 배달 1.2% ≈ 6% (외식업체 경영실태조사 2024, KREI p.2)
  const miscRate = getMiscCostRate(bt.category);
  const misc_operating = Math.round(revenue * miscRate);

  // 프랜차이즈 수수료 (변동비 — 매출 연동)
  const royalty = Math.round(revenue * params.franchise_royalty_rate);
  const advertising_fund = Math.round(revenue * params.franchise_ad_rate);
  const other_franchise_fees = Math.round(revenue * params.franchise_other_rate);

  const contingency = 0;

  const sg_and_a = labor + rent + delivery_commission + misc_operating + royalty + advertising_fund + other_franchise_fees;
  const sga_detail: SGADetail = { labor, labor_headcount: laborHeadcount, rent, delivery_commission, misc_operating, misc_rate: miscRate, royalty, advertising_fund, other_franchise_fees, contingency };

  const operating_profit = gross_profit - sg_and_a;
  const debt = getDebt(capital);
  const interest_expense = debt > 0 ? Math.round(debt * capital.interest_rate / 12) : 0;
  const pretax_income = operating_profit - interest_expense;
  // 부가세: (매출총이익) × 10/110 (B2C 업종, 일반과세자 기준)
  const vat = Math.round(gross_profit * 10 / 110);
  const tax = calcTotalTax(pretax_income);
  const net_income = pretax_income - vat - tax;
  const loanMonths = Math.max(1, capital.loan_term_years * 12);
  const principal_repayment = debt > 0 ? Math.round(debt / loanMonths) : 0;
  const free_cash_flow = net_income - principal_repayment;

  return {
    revenue, cogs, gross_profit, sg_and_a, sga_detail, operating_profit,
    interest_expense, pretax_income, vat, tax, net_income,
    principal_repayment, free_cash_flow,
  };
}

export function generateAnnotations(inputs: SimulatorInputs): PnLAnnotation {
  const { business_type: bt, capital } = inputs;
  const params = resolveBusinessParams(inputs);
  const dailyCustomers = getDailyCustomers(inputs, params);
  const operatingDays = inputs.operating_days ?? getOperatingDays(bt.id);
  const laborHeadcount = inputs.labor_headcount ?? 1;
  const debt = getDebt(capital);
  const costRatioPercent = Math.round(params.material_cost_ratio * 100);
  const dRate = DELIVERY_RATES[bt.id] ?? 0;

  return {
    revenue: `객단가 ${params.avg_ticket_price.toLocaleString()}원 × 일 ${dailyCustomers}명 × ${operatingDays}일`,
    cogs: bt.id === 3
      ? `상품 원가·본사 수수료 등 ${costRatioPercent}% 적용 (업종 평균 추정치)`
      : `재료비율 ${costRatioPercent}% 적용 (업종 평균 추정치, 외식산업실태조사, 소상공인실태조사 등 참고)`,
    sga: `인건비 ${laborHeadcount}명 × ${(bt.labor_cost_monthly_per_person / 10000).toFixed(0)}만원${dRate > 0 ? ` + 배달수수료 매출의 ${(dRate * 100).toFixed(dRate < 0.05 ? 1 : 0)}%` : ''} + 기타영업비용 매출의 ${(getMiscCostRate(bt.category) * 100).toFixed(0)}%${inputs.selected_brand && (params.franchise_royalty_rate > 0 || params.franchise_ad_rate > 0) ? ` + 상표사용료 ${(params.franchise_royalty_rate * 100).toFixed(1)}% + 광고분담금 ${(params.franchise_ad_rate * 100).toFixed(1)}%` : ''}`,
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

  for (let month = 1; month <= 120; month++) {
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

export type ScenarioType = 'base' | 'high' | 'low';

export const SCENARIO_MULTIPLIERS: Record<ScenarioType, number> = {
  base: 1.0,
  high: 1.15,
  low: 0.70,
};

export function calcScenarioDailyPnL(inputs: SimulatorInputs, scenario: ScenarioType): DailyPnL {
  const base = calcDailyPnL(inputs);
  const mult = SCENARIO_MULTIPLIERS[scenario];
  const daily_revenue = Math.round(base.daily_revenue * mult);
  const daily_cogs = Math.round(base.daily_cogs * mult);
  const daily_gross_profit = daily_revenue - daily_cogs;
  return { daily_revenue, daily_cogs, daily_gross_profit };
}

export function calcScenarioMonthlyPnL(inputs: SimulatorInputs, scenario: ScenarioType): MonthlyPnL {
  const basePnl = calcMonthlyPnL(inputs);
  const mult = SCENARIO_MULTIPLIERS[scenario];
  const { business_type: bt } = inputs;
  const params = resolveBusinessParams(inputs);

  const revenue = Math.round(basePnl.revenue * mult);
  const cogs = Math.round(basePnl.cogs * mult);
  const gross_profit = revenue - cogs;

  // 매출 연동 비용은 시나리오 매출 기준으로 재계산
  const miscRate = getMiscCostRate(bt.category);
  const misc_operating = Math.round(revenue * miscRate);
  const royalty = Math.round(revenue * params.franchise_royalty_rate);
  const advertising_fund = Math.round(revenue * params.franchise_ad_rate);
  const other_franchise_fees = Math.round(revenue * params.franchise_other_rate);

  // 고정비는 기본 PnL에서 가져옴
  const { labor, labor_headcount, rent, delivery_commission, contingency } = basePnl.sga_detail;

  const sg_and_a = labor + rent + delivery_commission + misc_operating + royalty + advertising_fund + other_franchise_fees;
  const sga_detail: SGADetail = { labor, labor_headcount, rent, delivery_commission, misc_operating, misc_rate: miscRate, royalty, advertising_fund, other_franchise_fees, contingency };

  const operating_profit = gross_profit - sg_and_a;
  const interest_expense = basePnl.interest_expense;
  const pretax_income = operating_profit - interest_expense;
  const vat = Math.round(gross_profit * 10 / 110);
  const tax = calcTotalTax(pretax_income);
  const net_income = pretax_income - vat - tax;
  const principal_repayment = basePnl.principal_repayment;
  const free_cash_flow = net_income - principal_repayment;

  return {
    revenue, cogs, gross_profit, sg_and_a, sga_detail, operating_profit,
    interest_expense, pretax_income, vat, tax, net_income,
    principal_repayment, free_cash_flow,
  };
}

export function calcScenarioPayback(inputs: SimulatorInputs, scenario: ScenarioType): PaybackResult {
  const mult = SCENARIO_MULTIPLIERS[scenario];
  const { capital } = inputs;
  const debt = getDebt(capital);
  const totalMonths = Math.max(1, capital.loan_term_years * 12);
  const principalPerMonth = debt > 0 ? Math.round(debt / totalMonths) : 0;

  const depositAmount = inputs.selected_brand?.deposit
    ?? capital.investment_breakdown?.find(
        item => item.category === 'deposit' && item.label.includes('보증금')
      )?.amount
    ?? 0;
  const paybackInvestment = Math.max(0, capital.initial_investment - depositAmount);

  const basePnl = calcMonthlyPnL(inputs);
  const { business_type: bt } = inputs;
  const params = resolveBusinessParams(inputs);
  const scenarioRevenue = Math.round(basePnl.revenue * mult);
  const scenarioCogs = Math.round(basePnl.cogs * mult);
  const scenarioGrossProfit = scenarioRevenue - scenarioCogs;

  // 매출 연동 비용 재계산
  const miscRate = getMiscCostRate(bt.category);
  const scenarioMiscOperating = Math.round(scenarioRevenue * miscRate);
  const scenarioRoyalty = Math.round(scenarioRevenue * params.franchise_royalty_rate);
  const scenarioAdFund = Math.round(scenarioRevenue * params.franchise_ad_rate);
  const scenarioOtherFranchise = Math.round(scenarioRevenue * params.franchise_other_rate);
  const { labor, rent, delivery_commission } = basePnl.sga_detail;
  const scenarioSGA = labor + rent + delivery_commission + scenarioMiscOperating + scenarioRoyalty + scenarioAdFund + scenarioOtherFranchise;
  const operating_profit = scenarioGrossProfit - scenarioSGA;
  const scenarioVat = Math.round(scenarioGrossProfit * 10 / 110);

  let remainingDebt = debt;
  let cumulative = -paybackInvestment;
  const cumulative_cashflow: { month: number; value: number }[] = [];
  let payback_months: number | null = null;

  for (let month = 1; month <= 120; month++) {
    const interestThisMonth = remainingDebt > 0
      ? Math.round(remainingDebt * capital.interest_rate / 12)
      : 0;
    const pretax_income = operating_profit - interestThisMonth;
    const tax = calcTotalTax(pretax_income);
    const net_income = pretax_income - scenarioVat - tax;
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
