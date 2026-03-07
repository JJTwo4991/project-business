import { describe, it, expect } from 'vitest';
import { runSimulation } from '../src/lib/calculator';
import type { BusinessType, SimulatorInputs } from '../src/types';

const realBusiness: BusinessType = {
  id: 1,
  name: '치킨전문점',
  category: '외식',
  avg_ticket_price: 22000,
  material_cost_ratio: 0.38,
  avg_daily_customers_small: 25,
  avg_daily_customers_medium: 55,
  avg_daily_customers_large: 90,
  labor_cost_monthly_per_person: 2_800_000,
  misc_fixed_cost_monthly: 350_000,
  initial_investment_min: 40_000_000,
  initial_investment_max: 100_000_000,
  initial_investment_small: 30_000_000,
  initial_investment_medium: 50_000_000,
  initial_investment_large: 80_000_000,
  avg_monthly_revenue_min: 10_000_000,
  avg_monthly_revenue_max: 35_000_000,
  closure_rate_1yr: 0.22,
  closure_rate_3yr: 0.52,
  closure_rate_5yr: 0.72,
  data_sources: [],
};

const inputs: SimulatorInputs = {
  business_type: realBusiness,
  scale: 'medium',
  capital: {
    initial_investment: 70_000_000,
    equity: 40_000_000,
    interest_rate: 0.055,
    loan_term_years: 5,
  },
  rent_monthly: 1_800_000,
  labor_headcount: 1,
  discount_rate: 0.15,
  growth_rate: 0.0,
};

describe('runSimulation - integration', () => {
  it('전체 파이프라인이 올바른 구조를 반환해야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.pnl).toBeDefined();
    expect(result.payback).toBeDefined();
    expect(result.dcf).toBeDefined();
  });

  it('매출은 0보다 커야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.pnl.revenue).toBeGreaterThan(0);
  });

  it('세금은 0 이상이어야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.pnl.tax).toBeGreaterThanOrEqual(0);
  });

  it('60개월 누적 현금흐름 배열이 반환되어야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.payback.cumulative_cashflow).toHaveLength(60);
  });

  it('사업체가치는 숫자여야 한다', () => {
    const result = runSimulation(inputs);
    expect(typeof result.dcf.business_value).toBe('number');
  });

  it('타인자본이 0인 경우 이자비용과 원금상환이 모두 0이어야 한다', () => {
    const noDebtInputs: SimulatorInputs = {
      ...inputs,
      capital: { ...inputs.capital, equity: 70_000_000 },
    };
    const result = runSimulation(noDebtInputs);
    expect(result.pnl.interest_expense).toBe(0);
    expect(result.pnl.principal_repayment).toBe(0);
  });

  it('월 실제 현금흐름 = 세후이익 - 원금상환', () => {
    const result = runSimulation(inputs);
    expect(result.pnl.free_cash_flow).toBe(result.pnl.net_income - result.pnl.principal_repayment);
  });
});
