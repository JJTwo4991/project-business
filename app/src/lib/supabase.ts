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
  // Supabase 스키마와 로컬 타입이 다르므로 항상 로컬 데이터 사용
  return BUSINESS_TYPES;
}

export async function fetchCostItems(businessTypeId: number): Promise<CostItem[]> {
  // 로컬 데이터 사용 (Supabase 스키마 불일치 방지)
  return COST_ITEMS.filter(c => c.business_type_id === businessTypeId);
}

export async function fetchRentGuide(): Promise<RentGuide[]> {
  // 로컬 데이터 사용 (Supabase 스키마 불일치 방지)
  return RENT_GUIDES;
}

// 이미용(4)은 네일(11)에서도 공유
const SHARED_BT_IDS: Record<number, number[]> = {
  11: [4, 11],
};

export interface FranchiseCostRow {
  brand_name: string;
  company_name: string | null;
  registration_no: string | null;
  industry_sub: string;
  business_type_id: number;
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

  // business_type_id로 직접 쿼리
  const queryIds = SHARED_BT_IDS[businessTypeId] ?? [businessTypeId];
  const { data, error } = await supabase
    .from('franchise_costs')
    .select('brand_name, company_name, registration_no, industry_sub, business_type_id, franchise_fee, education_fee, deposit, other_cost, total_cost, interior_per_33sqm, base_area_sqm, interior_total')
    .in('business_type_id', queryIds)
    .order('total_cost', { ascending: false });
  if (error || !data) return [];
  return data;
}
