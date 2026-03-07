import { describe, it, expect } from 'vitest';
import { calcIncomeTax, calcLocalTax, calcTotalTax, calcEffectiveTaxRate } from '../src/lib/tax';

describe('calcIncomeTax - 종합소득세 2025년 구간', () => {
  it('과표 0원 → 세금 0원', () => {
    expect(calcIncomeTax(0)).toBe(0);
  });

  it('과표 1,000만원 → 6% 구간', () => {
    expect(calcIncomeTax(10_000_000)).toBe(600_000);
  });

  it('과표 3,000만원 → 15% 구간 (누진공제 126만)', () => {
    expect(calcIncomeTax(30_000_000)).toBe(3_240_000);
  });

  it('과표 6,000만원 → 24% 구간 (누진공제 576만)', () => {
    expect(calcIncomeTax(60_000_000)).toBe(8_640_000);
  });

  it('과표 1억원 → 35% 구간 (누진공제 1,544만)', () => {
    expect(calcIncomeTax(100_000_000)).toBe(19_560_000);
  });

  it('과표 2억원 → 38% 구간 (누진공제 1,994만)', () => {
    expect(calcIncomeTax(200_000_000)).toBe(56_060_000);
  });

  it('과표 4억원 → 40% 구간 (누진공제 2,594만)', () => {
    expect(calcIncomeTax(400_000_000)).toBe(134_060_000);
  });

  it('과표 7억원 → 42% 구간 (누진공제 3,594만)', () => {
    expect(calcIncomeTax(700_000_000)).toBe(258_060_000);
  });

  it('과표 12억원 → 45% 구간 (누진공제 6,594만)', () => {
    expect(calcIncomeTax(1_200_000_000)).toBe(474_060_000);
  });

  it('음수 과표 → 0원 (결손 처리)', () => {
    expect(calcIncomeTax(-5_000_000)).toBe(0);
  });
});

describe('calcLocalTax - 지방소득세 = 소득세의 10%', () => {
  it('소득세 600,000원 → 지방소득세 60,000원', () => {
    expect(calcLocalTax(600_000)).toBe(60_000);
  });
});

describe('calcTotalTax - 월 세금 (연간 기준으로 계산 후 /12)', () => {
  it('월 세전이익 500만원 → 연 6,000만원 기준 세금/12', () => {
    const monthlyPretax = 5_000_000;
    const annualPretax = monthlyPretax * 12;
    const annualIncomeTax = calcIncomeTax(annualPretax);
    const annualLocalTax = calcLocalTax(annualIncomeTax);
    const expectedMonthlyTax = Math.round((annualIncomeTax + annualLocalTax) / 12);
    expect(calcTotalTax(monthlyPretax)).toBe(expectedMonthlyTax);
  });

  it('음수 세전이익 → 세금 0', () => {
    expect(calcTotalTax(-1_000_000)).toBe(0);
  });
});

describe('calcEffectiveTaxRate', () => {
  it('월 세전이익 500만 → 실효세율 반환 (0~1)', () => {
    const rate = calcEffectiveTaxRate(5_000_000);
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(1);
  });
});
