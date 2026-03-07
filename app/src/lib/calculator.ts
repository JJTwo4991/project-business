import type {
  SimulatorInputs, MonthlyPnL, PaybackResult, DCFResult, SimulationResult,
  DailyPnL, SGADetail, PnLAnnotation,
} from '../types';
import { calcTotalTax, calcEffectiveTaxRate } from './tax';

const OPERATING_DAYS = 26;

function getDebt(capital: SimulatorInputs['capital']): number {
  return Math.max(0, capital.initial_investment - capital.equity);
}

function getDailyCustomers(inputs: SimulatorInputs): number {
  const { business_type: bt, scale } = inputs;
  return inputs.daily_customers_override ??
    (scale === 'small' ? bt.avg_daily_customers_small :
     scale === 'large' ? bt.avg_daily_customers_large :
     bt.avg_daily_customers_medium);
}

function getTicketPrice(inputs: SimulatorInputs): number {
  return inputs.ticket_price_override ?? inputs.business_type.avg_ticket_price;
}

export function calcDailyPnL(inputs: SimulatorInputs): DailyPnL {
  const dailyCustomers = getDailyCustomers(inputs);
  const ticketPrice = getTicketPrice(inputs);
  const daily_revenue = ticketPrice * dailyCustomers;
  const daily_cogs = Math.round(daily_revenue * inputs.business_type.material_cost_ratio);
  const daily_gross_profit = daily_revenue - daily_cogs;
  return { daily_revenue, daily_cogs, daily_gross_profit };
}

export function calcMonthlyPnL(inputs: SimulatorInputs): MonthlyPnL {
  const { business_type: bt, capital } = inputs;
  const daily = calcDailyPnL(inputs);
  const revenue = daily.daily_revenue * OPERATING_DAYS;
  const cogs = daily.daily_cogs * OPERATING_DAYS;
  const gross_profit = revenue - cogs;

  const laborHeadcount = inputs.labor_headcount ?? 1;
  const labor = bt.labor_cost_monthly_per_person * laborHeadcount;
  const rent = inputs.rent_monthly ?? 0;
  const misc_fixed = bt.misc_fixed_cost_monthly;
  const sg_and_a = labor + rent + misc_fixed;
  const sga_detail: SGADetail = { labor, labor_headcount: laborHeadcount, rent, misc_fixed };

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
  const dailyCustomers = getDailyCustomers(inputs);
  const ticketPrice = getTicketPrice(inputs);
  const laborHeadcount = inputs.labor_headcount ?? 1;
  const debt = getDebt(capital);
  const costRatioPercent = Math.round(bt.material_cost_ratio * 100);

  return {
    revenue: `객단가 ${ticketPrice.toLocaleString()}원 × 일 ${dailyCustomers}명 × ${OPERATING_DAYS}일`,
    cogs: `${bt.name} 업계 평균 매출원가율 ${costRatioPercent}% 적용`,
    sga: `인건비 ${laborHeadcount}명 × ${(bt.labor_cost_monthly_per_person / 10000).toFixed(0)}만원 + 임대료 + 기타고정비 ${(bt.misc_fixed_cost_monthly / 10000).toFixed(0)}만원`,
    interest: debt > 0
      ? `대출 ${(debt / 10000).toLocaleString()}만원 × 연 ${(capital.interest_rate * 100).toFixed(1)}% ÷ 12개월`
      : '대출 없음',
    tax: '종합소득세 2025년 구간세율 + 지방소득세 10%',
    principal: debt > 0
      ? `대출 ${(debt / 10000).toLocaleString()}만원 ÷ ${capital.loan_term_years * 12}개월 (원금균등)`
      : '대출 없음',
  };
}

export function calcPayback(inputs: SimulatorInputs): PaybackResult {
  const { capital } = inputs;
  const debt = getDebt(capital);
  const totalMonths = Math.max(1, capital.loan_term_years * 12);
  const principalPerMonth = debt > 0 ? Math.round(debt / totalMonths) : 0;

  let remainingDebt = debt;
  let cumulative = -capital.initial_investment;
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
  const business_value = (denominator === 0 || fcf_annual <= 0)
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
