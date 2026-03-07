import { useState, useEffect, useMemo } from 'react';
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
      .catch((e: Error) => setError(e.message ?? '지역 데이터 로딩 실패'))
      .finally(() => setLoading(false));
  }, []);

  const sidos = useMemo(() =>
    [...new Set(rentGuides.map(r => r.sido))].sort(),
    [rentGuides]
  );

  const getSigungus = (sido: string) =>
    rentGuides.filter(r => r.sido === sido).map(r => r.sigungu).sort();

  const getRent = (sido: string, sigungu: string) =>
    rentGuides.find(r => r.sido === sido && r.sigungu === sigungu);

  return { rentGuides, loading, error, sidos, getSigungus, getRent };
}
