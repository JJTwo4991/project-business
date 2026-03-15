import { useState, useCallback } from 'react';
import type { SimulationResult } from '../types';

const STORAGE_KEY = 'sim_recent';
const MAX_ITEMS = 3;

export interface SavedSimulation {
  id: string;
  savedAt: number;
  businessName: string;
  businessId: number;
  scale: string;
  region?: string;
  monthlyNetIncome: number;
  paybackMonths: number | null;
  businessValue: number | null;
  /** Full result for restoring */
  result: SimulationResult;
}

function load(): SavedSimulation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function persist(items: SavedSimulation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

export function useRecentSimulations() {
  const [items, setItems] = useState<SavedSimulation[]>(load);

  const save = useCallback((result: SimulationResult) => {
    const entry: SavedSimulation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      savedAt: Date.now(),
      businessName: result.inputs.business_type.name,
      businessId: result.inputs.business_type.id,
      scale: result.inputs.scale,
      region: result.inputs.region
        ? `${result.inputs.region.sido} ${result.inputs.region.sangkwon}`
        : undefined,
      monthlyNetIncome: result.pnl.net_income,
      paybackMonths: result.payback.payback_months,
      businessValue: result.dcf.business_value,
      result,
    };

    setItems(prev => {
      // Remove duplicate (same business + scale + region)
      const filtered = prev.filter(
        p => !(p.businessId === entry.businessId && p.scale === entry.scale && p.region === entry.region)
      );
      const next = [entry, ...filtered].slice(0, MAX_ITEMS);
      persist(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(p => p.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { items, save, remove };
}
