import { useState, useEffect } from 'react';
import type { CostItem } from '../types';
import { fetchCostItems } from '../lib/supabase';

export function useCostItems(businessTypeId: number | null) {
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessTypeId) {
      setCostItems([]);
      return;
    }
    setLoading(true);
    fetchCostItems(businessTypeId)
      .then(setCostItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [businessTypeId]);

  return { costItems, loading, error };
}
