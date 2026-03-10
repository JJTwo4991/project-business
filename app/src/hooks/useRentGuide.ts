import { useState, useEffect, useMemo, useCallback } from 'react';
import type { RentGuide } from '../types';
import { fetchRentGuide } from '../lib/supabase';

interface UseRentGuideResult {
  rentGuides: RentGuide[];
  loading: boolean;
  error: string | null;
  sidos: string[];
  getSigungus: (sido: string) => string[];
  getRent: (sido: string, sigungu: string) => RentGuide | undefined;
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

  const getSigungus = useCallback((sido: string) =>
    rentGuides.filter(r => r.sido === sido).map(r => r.sigungu).sort(),
    [rentGuides]
  );

  const getRent = useCallback((sido: string, sigungu: string) =>
    rentGuides.find(r => r.sido === sido && r.sigungu === sigungu),
    [rentGuides]
  );

  return { rentGuides, loading, error, sidos, getSigungus, getRent };
}
