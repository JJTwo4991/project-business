import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RentGuide } from '../types';
import { fetchRentGuide } from '../lib/supabase';

interface UseRentGuideResult {
  rentGuides: RentGuide[];
  loading: boolean;
  error: string | null;
  sidos: string[];
  getRegions: (sido: string) => string[];
  getSangkwons: (sido: string, region: string) => string[];
  getRent: (sido: string, sangkwon: string) => RentGuide | undefined;
}

export function useRentGuide(): UseRentGuideResult {
  const [rentGuides, setRentGuides] = useState<RentGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRentGuide()
      .then(setRentGuides)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sidos = useMemo(() =>
    [...new Set(rentGuides.map(r => r.sido))].sort(),
    [rentGuides]
  );

  const getRegions = useCallback((sido: string) =>
    [...new Set(rentGuides.filter(r => r.sido === sido).map(r => r.region))].sort(),
    [rentGuides]
  );

  const getSangkwons = useCallback((sido: string, region: string) =>
    rentGuides.filter(r => r.sido === sido && r.region === region).map(r => r.sangkwon).sort(),
    [rentGuides]
  );

  const getRent = useCallback((sido: string, sangkwon: string) =>
    rentGuides.find(r => r.sido === sido && r.sangkwon === sangkwon),
    [rentGuides]
  );

  return { rentGuides, loading, error, sidos, getRegions, getSangkwons, getRent };
}
