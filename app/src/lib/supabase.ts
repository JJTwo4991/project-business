import { createClient } from '@supabase/supabase-js';
import type { BusinessType, CostItem, RentGuide } from '../types';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { COST_ITEMS } from '../data/costItems';
import { RENT_GUIDES } from '../data/rentGuide';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export async function fetchBusinessTypes(): Promise<BusinessType[]> {
  // Local data is source of truth (sub_types, updated fields)
  return BUSINESS_TYPES;
}

export async function fetchCostItems(businessTypeId: number): Promise<CostItem[]> {
  return COST_ITEMS.filter(c => c.business_type_id === businessTypeId);
}

export async function fetchRentGuide(): Promise<RentGuide[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('rent_guides')
      .select('*')
      .order('id');
    if (!error && data && data.length > 0) return data;
  }
  return RENT_GUIDES;
}

export async function fetchRealRentData(): Promise<Map<string, number> | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('api_rent_data')
    .select('region, rent_per_sqm')
    .order('updated_at', { ascending: false });
  if (error || !data || data.length === 0) return null;
  // Get latest quarter's data (all rows with same max quarter)
  const map = new Map<string, number>();
  for (const row of data) {
    if (!map.has(row.region)) {
      map.set(row.region, row.rent_per_sqm);
    }
  }
  return map.size > 0 ? map : null;
}

export async function fetchStartupCostBenchmark(businessTypeId: number): Promise<{ totalCost: number; source: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('api_startup_costs')
    .select('total_cost, source')
    .eq('business_type_id', businessTypeId)
    .order('year', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return { totalCost: data.total_cost, source: data.source };
}

// FTC 업종 중분류 → 앱 business_type_id 매핑
const INDUSTRY_SUB_TO_BT_ID: Record<string, number> = {
  '치킨': 1,
  '커피': 2, '카페': 2,
  '편의점': 3,
  '미용': 4, '헤어': 4,
  '분식': 5,
  '한식': 6, // 삼겹살/반찬가게는 한식 내 brandFilter로 처리
  '세탁': 7,
  '피자': 8,
  '제과': 9, '베이커리': 9,
  '아이스크림': 14,
};

function mapIndustrySubToBusinessTypeId(industrySub: string): number | null {
  for (const [keyword, id] of Object.entries(INDUSTRY_SUB_TO_BT_ID)) {
    if (industrySub.includes(keyword)) return id;
  }
  return null;
}

export interface FranchiseCostRow {
  brand_name: string;
  company_name: string | null;
  registration_no: string | null;
  industry_sub: string;
  franchise_fee: number;
  education_fee: number;
  deposit: number;
  other_cost: number;
  total_cost: number;
  interior_per_33sqm: number;
  base_area_sqm: number;
  interior_total: number;
}

export async function fetchFranchiseCosts(businessTypeId: number): Promise<FranchiseCostRow[]> {
  if (!supabase) return [];

  // Find which industry_sub values map to this business_type_id
  const matchingSubs = Object.entries(INDUSTRY_SUB_TO_BT_ID)
    .filter(([, id]) => id === businessTypeId)
    .map(([keyword]) => keyword);

  if (matchingSubs.length === 0) return [];

  // Query all franchise_costs and filter by industry_sub containing keywords
  const { data, error } = await supabase
    .from('franchise_costs')
    .select('brand_name, company_name, registration_no, industry_sub, franchise_fee, education_fee, deposit, other_cost, total_cost, interior_per_33sqm, base_area_sqm, interior_total')
    .order('total_cost', { ascending: false });

  if (error || !data) return [];

  return data.filter(row => {
    const btId = mapIndustrySubToBusinessTypeId(row.industry_sub);
    return btId === businessTypeId;
  });
}

export async function fetchRegionalSalesBenchmark(businessTypeId: number, region: string): Promise<{ avgSales: number; source: string } | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('api_regional_sales')
    .select('avg_sales_per_area, source')
    .eq('business_type_id', businessTypeId)
    .eq('region', region)
    .order('year', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) return null;
  return { avgSales: data.avg_sales_per_area, source: data.source };
}
