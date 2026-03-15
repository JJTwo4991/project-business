import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { BusinessType, BusinessScale, CapitalStructure, SimulatorInputs, SimulationResult, FranchiseBrand } from '../types';
import { runSimulation } from '../lib/calculator';
import { getScaleSqm } from '../lib/scale';

const SIM_STORAGE_KEY = 'sim_state';

interface UseSimulatorResult {
  inputs: SimulatorInputs | null;
  result: SimulationResult | null;
  selectedBrand: FranchiseBrand | null;
  setBusinessType: (bt: BusinessType) => void;
  setScale: (scale: BusinessScale) => void;
  setCapital: (capital: CapitalStructure) => void;
  setRegion: (region: SimulatorInputs['region']) => void;
  setSelectedBrand: (brand: FranchiseBrand | null) => void;
  setOverride: (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region' | 'selected_brand'>, value: number) => void;
  calculate: () => boolean;
  reset: () => void;
  restoreResult: (result: SimulationResult) => void;
}

const DEFAULT_CAPITAL: CapitalStructure = {
  initial_investment: 50_000_000,
  equity: 0,
  interest_rate: 0.055,
  loan_term_years: 5,
};

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SIM_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function useSimulator(): UseSimulatorResult {
  const saved = useRef(loadSavedState());
  const [businessType, setBusinessTypeState] = useState<BusinessType | null>(saved.current?.businessType ?? null);
  const [scale, setScaleState] = useState<BusinessScale>(saved.current?.scale ?? 'medium');
  const [capital, setCapital] = useState<CapitalStructure>(saved.current?.capital ?? DEFAULT_CAPITAL);
  const [region, setRegion] = useState<SimulatorInputs['region']>(saved.current?.region ?? undefined);
  const [selectedBrand, setSelectedBrand] = useState<FranchiseBrand | null>(saved.current?.selectedBrand ?? null);
  const [overrides, setOverrides] = useState<Partial<SimulatorInputs>>(saved.current?.overrides ?? {
    discount_rate: 0.15,
    growth_rate: 0.00,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Save state to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(SIM_STORAGE_KEY, JSON.stringify({
        businessType, scale, capital, region, selectedBrand, overrides,
      }));
    } catch { /* ignore */ }
  }, [businessType, scale, capital, region, selectedBrand, overrides]);

  const setBusinessType = useCallback((bt: BusinessType) => {
    setBusinessTypeState(bt);
    const inv = bt.initial_investment_medium;
    setCapital(prev => ({
      ...prev,
      initial_investment: inv,
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
      // Auto-recalculate rent when scale changes and region is already selected
      setRegion(r => {
        if (r?.rent_per_sqm) {
          const sqm = getScaleSqm(newScale, prev.id);
          setOverrides(o => ({ ...o, rent_monthly: Math.round(r.rent_per_sqm * sqm) }));
        }
        return r;
      });
      return prev;
    });
  }, []);

  const inputs: SimulatorInputs | null = useMemo(() => {
    if (!businessType) return null;
    return { business_type: businessType, scale, capital, region, selected_brand: selectedBrand ?? undefined, ...overrides };
  }, [businessType, scale, capital, region, selectedBrand, overrides]);

  // Auto-recalculate when inputs change (only after first explicit calculate)
  useEffect(() => {
    if (!inputs || !hasCalculated) return;
    try {
      setResult(runSimulation(inputs));
    } catch {
      // silently fail
    }
  }, [inputs, hasCalculated]);

  const calculate = useCallback((): boolean => {
    if (!inputs) return false;
    try {
      setResult(runSimulation(inputs));
      setHasCalculated(true);
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

  const restoreResult = useCallback((saved: SimulationResult) => {
    const { inputs: si } = saved;
    setBusinessTypeState(si.business_type);
    setScaleState(si.scale);
    setCapital(si.capital);
    setRegion(si.region);
    setSelectedBrand(si.selected_brand ?? null);
    const { business_type: _bt, scale: _s, capital: _c, region: _r, selected_brand: _sb, ...rest } = si;
    setOverrides(rest);
    setResult(saved);
    setHasCalculated(true);
  }, []);

  const reset = useCallback(() => {
    setBusinessTypeState(null);
    setScaleState('medium');
    setCapital(DEFAULT_CAPITAL);
    setRegion(undefined);
    setSelectedBrand(null);
    setOverrides({ discount_rate: 0.15, growth_rate: 0.00 });
    setResult(null);
    setHasCalculated(false);
    try { localStorage.removeItem(SIM_STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return {
    inputs,
    result,
    selectedBrand,
    setBusinessType,
    setScale,
    setCapital,
    setRegion,
    setSelectedBrand,
    setOverride,
    calculate,
    reset,
    restoreResult,
  };
}
