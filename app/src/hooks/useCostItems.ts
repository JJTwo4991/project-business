import { useState, useEffect } from 'react';
import type { CostItem } from '../types';
import { fetchCostItems } from '../lib/supabase';

export function useCostItems(businessTypeId: number | null) {
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessTypeId) return;
    setLoading(true);
    setError(null);
    fetchCostItems(businessTypeId)
      .then(setCostItems)
      .catch((e: Error) => setError(e.message ?? '비용 데이터 로딩 실패'))
      .finally(() => setLoading(false));
  }, [businessTypeId]);

  return { costItems, loading, error };
}
