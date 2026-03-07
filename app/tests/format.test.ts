import { describe, it, expect } from 'vitest';
import { formatKRW, formatKRWShort, formatPercent, formatMonths } from '../src/lib/format';

describe('formatKRW', () => {
  it('1000 → "1,000원"', () => {
    expect(formatKRW(1000)).toBe('1,000원');
  });
  it('1234567 → "1,234,567원"', () => {
    expect(formatKRW(1_234_567)).toBe('1,234,567원');
  });
  it('음수 → "-1,000원"', () => {
    expect(formatKRW(-1000)).toBe('-1,000원');
  });
  it('0 → "0원"', () => {
    expect(formatKRW(0)).toBe('0원');
  });
});

describe('formatKRWShort', () => {
  it('10,000,000 → "1,000만원"', () => {
    expect(formatKRWShort(10_000_000)).toBe('1,000만원');
  });
  it('100,000,000 → "1억원"', () => {
    expect(formatKRWShort(100_000_000)).toBe('1억원');
  });
  it('150,000,000 → "1.5억원"', () => {
    expect(formatKRWShort(150_000_000)).toBe('1.5억원');
  });
  it('5,000,000 → "500만원"', () => {
    expect(formatKRWShort(5_000_000)).toBe('500만원');
  });
  it('Infinity → "∞"', () => {
    expect(formatKRWShort(Infinity)).toBe('∞');
  });
});

describe('formatPercent', () => {
  it('0.055 → "5.5%"', () => {
    expect(formatPercent(0.055)).toBe('5.5%');
  });
  it('0.15 → "15.0%"', () => {
    expect(formatPercent(0.15)).toBe('15.0%');
  });
});

describe('formatMonths', () => {
  it('13개월 → "1년 1개월"', () => {
    expect(formatMonths(13)).toBe('1년 1개월');
  });
  it('12개월 → "1년"', () => {
    expect(formatMonths(12)).toBe('1년');
  });
  it('null → "60개월 이내 미회수"', () => {
    expect(formatMonths(null)).toBe('60개월 이내 미회수');
  });
  it('6개월 → "6개월"', () => {
    expect(formatMonths(6)).toBe('6개월');
  });
});
