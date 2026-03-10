import { useState, useEffect } from 'react';
import type { BusinessType } from '../types';
import { fetchBusinessTypes } from '../lib/supabase';

interface UseBusinessTypesResult {
  businessTypes: BusinessType[];
  loading: boolean;
  error: string | null;
}

export function useBusinessTypes(): UseBusinessTypesResult {
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBusinessTypes()
      .then(setBusinessTypes)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { businessTypes, loading, error };
}
