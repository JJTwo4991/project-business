import { describe, it, expect } from 'vitest';
import { calcMonthlyPnL, calcPayback, calcDCF, runSimulation, calcDailyPnL, generateAnnotations } from '../src/lib/calculator';
import type { BusinessType, CapitalStructure, SimulatorInputs } from '../src/types';

const mockBusiness: BusinessType = {
  id: 1,
  name: '치킨집',
  category: '외식',
  avg_ticket_price: 20000,
  material_cost_ratio: 0.35,
  avg_daily_customers_small: 30,
  avg_daily_customers_medium: 60,
  avg_daily_customers_large: 100,
  labor_cost_monthly_per_person: 2_500_000,
  misc_fixed_cost_monthly: 300_000,
  initial_investment_min: 30_000_000,
  initial_investment_max: 80_000_000,
  initial_investment_small: 30_000_000,
  initial_investment_medium: 55_000_000,
  initial_investment_large: 80_000_000,
  avg_monthly_revenue_min: 10_000_000,
  avg_monthly_revenue_max: 30_000_000,
  closure_rate_1yr: 0.2,
  closure_rate_3yr: 0.5,
  closure_rate_5yr: 0.7,
  data_sources: [],
};

const mockCapital: CapitalStructure = {
  initial_investment: 50_000_000,
  equity: 30_000_000,
  interest_rate: 0.055,
  loan_term_years: 5,
};

const mockInputs: SimulatorInputs = {
  business_type: mockBusiness,
  scale: 'medium',
  capital: mockCapital,
  rent_monthly: 1_500_000,
  labor_headcount: 1,
  discount_rate: 0.15,
  growth_rate: 0.00,
};

describe('calcMonthlyPnL', () => {
  it('매출 = 객단가 × 일방문객(medium) × 26일', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const expectedRevenue = 20000 * 60 * 26;
    expect(pnl.revenue).toBe(expectedRevenue);
  });

  it('매출원가 = 매출 × 재료비비율', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const expectedCogs = Math.round(pnl.revenue * 0.35);
    expect(pnl.cogs).toBe(expectedCogs);
  });

  it('매출총이익 = 매출 - 매출원가', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.gross_profit).toBe(pnl.revenue - pnl.cogs);
  });

  it('판관비 = 인건비 + 임대료 + 기타고정비', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const expectedSGA = 2_500_000 * 1 + 1_500_000 + 300_000;
    expect(pnl.sg_and_a).toBe(expectedSGA);
  });

  it('영업이익 = 매출총이익 - 판관비', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.operating_profit).toBe(pnl.gross_profit - pnl.sg_and_a);
  });

  it('이자비용 = (대출잔액) × 금리 / 12', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const debt = 50_000_000 - 30_000_000;
    const expectedInterest = Math.round(debt * 0.055 / 12);
    expect(pnl.interest_expense).toBe(expectedInterest);
  });

  it('세전이익 = 영업이익 - 이자비용', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.pretax_income).toBe(pnl.operating_profit - pnl.interest_expense);
  });

  it('세후이익 = 세전이익 - 세금', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.net_income).toBe(pnl.pretax_income - pnl.tax);
  });

  it('원금상환 = 대출금 / (기간년 × 12)', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const debt = 50_000_000 - 30_000_000;
    const expectedPrincipal = Math.round(debt / (5 * 12));
    expect(pnl.principal_repayment).toBe(expectedPrincipal);
  });

  it('월 실제 현금흐름 = 세후이익 - 원금상환', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.free_cash_flow).toBe(pnl.net_income - pnl.principal_repayment);
  });

  it('대출 없는 경우 이자비용 = 0, 원금상환 = 0', () => {
    const noDebtInputs: SimulatorInputs = {
      ...mockInputs,
      capital: { ...mockCapital, equity: 50_000_000 },
    };
    const pnl = calcMonthlyPnL(noDebtInputs);
    expect(pnl.interest_expense).toBe(0);
    expect(pnl.principal_repayment).toBe(0);
  });
});

describe('calcPayback', () => {
  it('60개월 누적 현금흐름 배열 반환', () => {
    const result = calcPayback(mockInputs);
    expect(result.cumulative_cashflow).toHaveLength(60);
  });

  it('첫 번째 달의 누적 = 초기투자금의 음수 + 첫달 현금흐름', () => {
    const result = calcPayback(mockInputs);
    const firstPoint = result.cumulative_cashflow[0];
    expect(firstPoint.month).toBe(1);
    expect(firstPoint.value).toBeLessThan(0);
  });

  it('매월 이자 감소 반영 (잔액 기준)', () => {
    const result = calcPayback(mockInputs);
    const last = result.cumulative_cashflow[59].value;
    const first = result.cumulative_cashflow[0].value;
    expect(last).toBeGreaterThan(first);
  });
});

describe('calcDCF', () => {
  it('FCF = 영업이익 × (1 - 실효세율), 연간 기준', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const dcf = calcDCF(pnl, mockInputs);
    expect(dcf.fcf_annual).toBeGreaterThan(0);
  });

  it('사업체가치 = FCF / (할인율 - 성장률)', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const dcf = calcDCF(pnl, mockInputs);
    const expected = Math.round(dcf.fcf_annual / (0.15 - 0.00));
    expect(dcf.business_value).toBe(expected);
  });

  it('할인율 = 성장률이면 사업체가치 = null', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const sameRateInputs = { ...mockInputs, discount_rate: 0.05, growth_rate: 0.05 };
    const dcf = calcDCF(pnl, sameRateInputs);
    expect(dcf.business_value).toBeNull();
  });
});

describe('runSimulation', () => {
  it('전체 시뮬레이션 결과 반환', () => {
    const result = runSimulation(mockInputs);
    expect(result.pnl).toBeDefined();
    expect(result.payback).toBeDefined();
    expect(result.dcf).toBeDefined();
    expect(result.inputs).toEqual(mockInputs);
  });
});

describe('sga_detail', () => {
  it('sga_detail breaks down labor, rent, misc', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.sga_detail.labor + pnl.sga_detail.rent + pnl.sga_detail.misc_fixed).toBe(pnl.sg_and_a);
  });
});

describe('calcDailyPnL', () => {
  it('calcDailyPnL returns daily figures', () => {
    const daily = calcDailyPnL(mockInputs);
    const pnl = calcMonthlyPnL(mockInputs);
    expect(daily.daily_revenue * 26).toBe(pnl.revenue);
  });
});

describe('generateAnnotations', () => {
  it('generateAnnotations includes cost ratio percentage', () => {
    const ann = generateAnnotations(mockInputs);
    expect(ann.cogs).toContain('%');
    expect(ann.revenue).toContain('×');
  });
});
