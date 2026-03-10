import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepNavigation } from '../src/hooks/useStepNavigation';
import type { BusinessType } from '../src/types';

const mockBusiness: BusinessType = {
  id: 1,
  name: '치킨전문점',
  category: '외식',
  avg_ticket_price: 22000,
  material_cost_ratio: 0.38,
  avg_daily_customers_small: 25,
  avg_daily_customers_medium: 55,
  avg_daily_customers_large: 90,
  labor_cost_monthly_per_person: 2800000,
  misc_fixed_cost_monthly: 350000,
  initial_investment_min: 40000000,
  initial_investment_max: 100000000,
  initial_investment_small: 30000000,
  initial_investment_medium: 50000000,
  initial_investment_large: 80000000,
  avg_monthly_revenue_min: 10000000,
  avg_monthly_revenue_max: 35000000,
  closure_rate_1yr: 0.22,
  closure_rate_3yr: 0.52,
  closure_rate_5yr: 0.72,
  data_sources: [],
};

// mockBusiness kept for potential future use
void mockBusiness;

describe('useStepNavigation', () => {
  it('초기 스텝은 select-industry', () => {
    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.currentStep).toBe('select-industry');
    expect(result.current.isFirstStep).toBe(true);
  });

  it('goNext로 다음 스텝 이동', () => {
    const { result } = renderHook(() => useStepNavigation());
    act(() => result.current.goNext());
    expect(result.current.currentStep).toBe('select-region');
  });

  it('goTo로 특정 스텝 이동', () => {
    const { result } = renderHook(() => useStepNavigation());
    act(() => result.current.goTo('set-investment'));
    expect(result.current.currentStep).toBe('set-investment');
  });

  it('goBack으로 이전 스텝 이동', () => {
    const { result } = renderHook(() => useStepNavigation());
    act(() => result.current.goTo('select-scale'));
    act(() => result.current.goBack());
    expect(result.current.currentStep).toBe('select-region');
  });

  it('reset으로 처음으로', () => {
    const { result } = renderHook(() => useStepNavigation());
    act(() => result.current.goTo('confirm'));
    act(() => result.current.reset());
    expect(result.current.currentStep).toBe('select-industry');
  });

  it('progress는 0~1 사이', () => {
    const { result } = renderHook(() => useStepNavigation());
    expect(result.current.progress).toBeGreaterThanOrEqual(0);
    expect(result.current.progress).toBeLessThanOrEqual(1);
  });

  it('result 스텝은 isResultStep=true', () => {
    const { result } = renderHook(() => useStepNavigation());
    act(() => result.current.goTo('result-monthly'));
    expect(result.current.isResultStep).toBe(true);
  });
});
