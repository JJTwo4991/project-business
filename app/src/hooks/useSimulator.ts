import { useState, useCallback, useMemo } from 'react';
import type { BusinessType, BusinessScale, CapitalStructure, SimulatorInputs, SimulationResult } from '../types';
import { runSimulation } from '../lib/calculator';

interface UseSimulatorResult {
  inputs: SimulatorInputs | null;
  result: SimulationResult | null;
  setBusinessType: (bt: BusinessType) => void;
  setScale: (scale: BusinessScale) => void;
  setCapital: (capital: CapitalStructure) => void;
  setRegion: (region: SimulatorInputs['region']) => void;
  setOverride: (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region'>, value: number) => void;
  calculate: () => boolean;
}

const DEFAULT_CAPITAL: CapitalStructure = {
  initial_investment: 50_000_000,
  equity: 30_000_000,
  interest_rate: 0.055,
  loan_term_years: 5,
};

export function useSimulator(): UseSimulatorResult {
  const [businessType, setBusinessTypeState] = useState<BusinessType | null>(null);
  const [scale, setScaleState] = useState<BusinessScale>('medium');
  const [capital, setCapital] = useState<CapitalStructure>(DEFAULT_CAPITAL);
  const [region, setRegion] = useState<SimulatorInputs['region']>(undefined);
  const [overrides, setOverrides] = useState<Partial<SimulatorInputs>>({
    discount_rate: 0.15,
    growth_rate: 0.00,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);

  const setBusinessType = useCallback((bt: BusinessType) => {
    setBusinessTypeState(bt);
    const inv = bt.initial_investment_medium;
    setCapital(prev => ({
      ...prev,
      initial_investment: inv,
      equity: Math.round(inv * 0.6),
    }));
  }, []);

  const setScale = useCallback((newScale: BusinessScale) => {
    setScaleState(newScale);
    setBusinessTypeState(prev => {
      if (!prev) return prev;
      const inv = newScale === 'small' ? prev.initial_investment_small
        : newScale === 'large' ? prev.initial_investment_large
        : prev.initial_investment_medium;
      setCapital(c => ({
        ...c,
        initial_investment: inv,
        equity: Math.min(c.equity, inv),
      }));
      return prev;
    });
  }, []);

  const inputs: SimulatorInputs | null = useMemo(() => {
    if (!businessType) return null;
    return { business_type: businessType, scale, capital, region, ...overrides };
  }, [businessType, scale, capital, region, overrides]);

  const calculate = useCallback((): boolean => {
    if (!inputs) return false;
    try {
      setResult(runSimulation(inputs));
      return true;
    } catch {
      return false;
    }
  }, [inputs]);

  const setOverride = useCallback(
    (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region'>, value: number) => {
      setOverrides(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    inputs,
    result,
    setBusinessType,
    setScale,
    setCapital,
    setRegion,
    setOverride,
    calculate,
  };
}
