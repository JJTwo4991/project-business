import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchFranchiseCosts } from '../lib/supabase';
import type { FranchiseCostRow } from '../lib/supabase';
import { getFranchisesByType } from '../data/franchiseData';
import type { FranchiseBrand } from '../data/franchiseData';

export interface FranchiseBrandUnified {
  name: string;
  company_name: string | null;
  business_type_id: number;
  initial_fee: number;
  education_fee: number;
  deposit: number;
  interior_per_sqm: number; // 원/㎡ (3.3㎡당 → ㎡당 환산)
  other_cost: number;
  source: string;
  royalty_rate: number;
  advertising_rate: number;
  other_fees_rate?: number;
  fees_source?: string;
}

function rowToBrand(row: FranchiseCostRow, businessTypeId: number): FranchiseBrandUnified {
  // interior_per_33sqm (3.3㎡당, 천원→원 already converted in scraper) → ㎡당 환산
  const interiorPerSqm = row.interior_per_33sqm > 0
    ? Math.round(row.interior_per_33sqm / 3.3)
    : 0;

  return {
    name: row.brand_name,
    company_name: row.company_name,
    business_type_id: businessTypeId,
    initial_fee: row.franchise_fee,
    education_fee: row.education_fee,
    deposit: row.deposit,
    interior_per_sqm: interiorPerSqm,
    other_cost: row.other_cost,
    source: 'FTC 정보공개서',
    royalty_rate: 0,        // Supabase 스키마에 컬럼 추가 후 연결
    advertising_rate: 0,    // Supabase 스키마에 컬럼 추가 후 연결
  };
}

function localToBrand(b: FranchiseBrand): FranchiseBrandUnified {
  return {
    name: b.name,
    company_name: null,
    business_type_id: b.business_type_id,
    initial_fee: b.initial_fee,
    education_fee: b.education_fee,
    deposit: b.deposit,
    interior_per_sqm: b.interior_per_sqm,
    other_cost: b.other_cost,
    source: b.source,
    royalty_rate: b.royalty_rate,
    advertising_rate: b.advertising_rate,
    other_fees_rate: b.other_fees_rate,
    fees_source: b.fees_source,
  };
}

export function useFranchiseCosts(businessTypeId: number) {
  const [supabaseBrands, setSupabaseBrands] = useState<FranchiseBrandUnified[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchFranchiseCosts(businessTypeId).then(rows => {
      if (cancelled) return;
      if (rows.length > 0) {
        setSupabaseBrands(rows.map(r => rowToBrand(r, businessTypeId)));
      } else {
        setSupabaseBrands(null); // fallback to local
      }
      setLoading(false);
    }).catch(() => {
      if (!cancelled) {
        setSupabaseBrands(null);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [businessTypeId]);

  // Fallback: local data
  const localBrands = useMemo(
    () => getFranchisesByType(businessTypeId).map(localToBrand),
    [businessTypeId]
  );

  const brands = supabaseBrands ?? localBrands;

  const search = useCallback((query: string): FranchiseBrandUnified[] => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return brands;
    return brands.filter(b => b.name.toLowerCase().includes(trimmed));
  }, [brands]);

  const hasBrands = brands.length > 0;

  return { brands, search, loading, hasBrands };
}
