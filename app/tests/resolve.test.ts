import { describe, it, expect } from 'vitest';
import { resolveBusinessParams, getOperatingDays } from '../src/lib/calculator';
import { BUSINESS_TYPES } from '../src/data/businessTypes';
import type { SimulatorInputs, CapitalStructure } from '../src/types';

const mockCapital: CapitalStructure = {
  initial_investment: 50_000_000,
  equity: 30_000_000,
  interest_rate: 0.055,
  loan_term_years: 5,
};

describe('resolveBusinessParams', () => {
  it('기본값: BusinessType 파라미터 반환', () => {
    const chicken = BUSINESS_TYPES.find(b => b.id === 1)!;
    const inputs: SimulatorInputs = {
      business_type: chicken,
      scale: 'medium',
      capital: mockCapital,
    };
    const params = resolveBusinessParams(inputs);
    expect(params.avg_ticket_price).toBe(chicken.avg_ticket_price);
    // 기본값은 × 1.10 가산
    expect(params.material_cost_ratio).toBeCloseTo(chicken.material_cost_ratio * 1.10, 4);
  });

  it('사용자 오버라이드 > BusinessType 우선순위', () => {
    const chicken = BUSINESS_TYPES.find(b => b.id === 1)!;
    const inputs: SimulatorInputs = {
      business_type: chicken,
      scale: 'medium',
      capital: mockCapital,
      ticket_price_override: 25000,
      material_cost_ratio_override: 0.40,
    };
    const params = resolveBusinessParams(inputs);
    expect(params.avg_ticket_price).toBe(25000);
    expect(params.material_cost_ratio).toBe(0.40);
  });

  it('franchise_royalty_rate는 항상 0', () => {
    const chicken = BUSINESS_TYPES.find(b => b.id === 1)!;
    const inputs: SimulatorInputs = {
      business_type: chicken,
      scale: 'medium',
      capital: mockCapital,
    };
    const params = resolveBusinessParams(inputs);
    expect(params.franchise_royalty_rate).toBe(0);
  });

  it('미용실 기본값 반환', () => {
    const hairshop = BUSINESS_TYPES.find(b => b.id === 4)!;
    const inputs: SimulatorInputs = {
      business_type: hairshop,
      scale: 'medium',
      capital: mockCapital,
    };
    const params = resolveBusinessParams(inputs);
    expect(params.avg_ticket_price).toBe(hairshop.avg_ticket_price);
    expect(params.franchise_royalty_rate).toBe(0);
  });
});

describe('getOperatingDays', () => {
  it('편의점(id:3) = 30일', () => {
    expect(getOperatingDays(3)).toBe(30);
  });

  it('무인아이스크림(id:14) = 30일', () => {
    expect(getOperatingDays(14)).toBe(30);
  });

  it('일반 업종 = 26일', () => {
    expect(getOperatingDays(1)).toBe(26);
    expect(getOperatingDays(2)).toBe(26);
    expect(getOperatingDays(4)).toBe(26);
  });
});
