import { useState, useEffect } from 'react';
import { fetchStartupCostBenchmark, fetchRegionalSalesBenchmark, fetchRealRentData } from '../lib/supabase';

interface BenchmarkData {
  // FTC startup cost for this business type
  startupCost: { totalCost: number; source: string } | null;
  // FTC regional sales for this business type + region
  regionalSales: { avgSales: number; source: string } | null;
  // Real rent data from R-ONE for this region (시도 level)
  realRent: number | null; // won/sqm
  // Derived: estimated monthly revenue from FTC data
  estimatedMonthlyRevenue: number | null;
}

const EMPTY: BenchmarkData = {
  startupCost: null,
  regionalSales: null,
  realRent: null,
  estimatedMonthlyRevenue: null,
};

export function useBenchmarkData(
  businessTypeId: number | null,
  region: string | null  // 시도 name like '서울', '경기'
): BenchmarkData {
  const [data, setData] = useState<BenchmarkData>(EMPTY);

  useEffect(() => {
    if (!businessTypeId) {
      setData(EMPTY);
      return;
    }

    let cancelled = false;

    async function load() {
      const [startupCost, regionalSales, rentMap] = await Promise.all([
        fetchStartupCostBenchmark(businessTypeId!).catch(() => null),
        region ? fetchRegionalSalesBenchmark(businessTypeId!, region).catch(() => null) : Promise.resolve(null),
        fetchRealRentData().catch(() => null),
      ]);

      if (cancelled) return;

      const realRent = (rentMap && region) ? (rentMap.get(region) ?? null) : null;

      // arUnitAvrgSlsAmt is annual average sales per store (already * 1000 from raw API).
      // Monthly estimate = annual / 12.
      const estimatedMonthlyRevenue =
        regionalSales ? Math.round(regionalSales.avgSales / 12) : null;

      setData({ startupCost, regionalSales, realRent, estimatedMonthlyRevenue });
    }

    load();

    return () => { cancelled = true; };
  }, [businessTypeId, region]);

  return data;
}
