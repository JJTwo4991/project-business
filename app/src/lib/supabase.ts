import { createClient } from '@supabase/supabase-js';
import type { BusinessType, CostItem, RentGuide } from '../types';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { COST_ITEMS } from '../data/costItems';
import { RENT_GUIDES } from '../data/rentGuide';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const useSupabase = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '여기에_프로젝트_URL_입력');

const supabase = useSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function fetchBusinessTypes(): Promise<BusinessType[]> {
  if (!supabase) return BUSINESS_TYPES;

  const { data, error } = await supabase
    .from('business_types')
    .select('*')
    .order('id');

  if (error) {
    console.warn('Supabase fetch failed, using local data:', error.message);
    return BUSINESS_TYPES;
  }

  return data as BusinessType[];
}

export async function fetchCostItems(businessTypeId: number): Promise<CostItem[]> {
  if (!supabase) return COST_ITEMS.filter(c => c.business_type_id === businessTypeId);

  const { data, error } = await supabase
    .from('cost_items')
    .select('*')
    .eq('business_type_id', businessTypeId)
    .order('id');

  if (error) {
    console.warn('Supabase fetch failed, using local data:', error.message);
    return COST_ITEMS.filter(c => c.business_type_id === businessTypeId);
  }

  return data as CostItem[];
}

export async function fetchRentGuide(): Promise<RentGuide[]> {
  if (!supabase) return RENT_GUIDES;

  const { data, error } = await supabase
    .from('rent_guides')
    .select('*')
    .order('id');

  if (error) {
    console.warn('Supabase fetch failed, using local data:', error.message);
    return RENT_GUIDES;
  }

  return data as RentGuide[];
}
