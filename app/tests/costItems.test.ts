import { describe, it, expect } from 'vitest';
import { getMiscFixedDefault, getInvestmentBreakdown } from '../src/data/costItems';

describe('getMiscFixedDefault', () => {
  it('치킨전문점(id:1) 기타 고정비 > 0', () => {
    const result = getMiscFixedDefault(1);
    expect(result).toBeGreaterThan(0);
  });

  it('없는 업종 id는 0', () => {
    expect(getMiscFixedDefault(999)).toBe(0);
  });
});

describe('getInvestmentBreakdown', () => {
  it('치킨전문점 초기투자 항목 반환', () => {
    const items = getInvestmentBreakdown(1, 'medium');
    expect(items.length).toBeGreaterThan(0);
    items.forEach(item => {
      expect(item.label).toBeTruthy();
      expect(item.amount).toBeGreaterThan(0);
      expect(item.editable).toBe(true);
    });
  });

  it('규모별 금액 차등', () => {
    const small = getInvestmentBreakdown(1, 'small');
    const large = getInvestmentBreakdown(1, 'large');
    const smallTotal = small.reduce((s, i) => s + i.amount, 0);
    const largeTotal = large.reduce((s, i) => s + i.amount, 0);
    expect(largeTotal).toBeGreaterThan(smallTotal);
  });
});
