export type BusinessScale = 'small' | 'medium' | 'large';

export interface BusinessType {
  id: number;
  name: string;
  category: string;
  avg_ticket_price: number;
  material_cost_ratio: number;
  avg_daily_customers_small: number;
  avg_daily_customers_medium: number;
  avg_daily_customers_large: number;
  labor_cost_monthly_per_person: number;
  misc_fixed_cost_monthly: number;
  initial_investment_min: number;
  initial_investment_max: number;
  initial_investment_small: number;
  initial_investment_medium: number;
  initial_investment_large: number;
  avg_monthly_revenue_min: number;
  avg_monthly_revenue_max: number;
  closure_rate_1yr: number;
  closure_rate_3yr: number;
  closure_rate_5yr: number;
  data_sources: string[];
}

export interface CostItem {
  id: number;
  business_type_id: number;
  cost_category: 'material' | 'labor' | 'rent' | 'utilities' | 'equipment' | 'marketing' | 'other';
  cost_name: string;
  amount_monthly_min: number;
  amount_monthly_max: number;
  is_initial_cost: boolean;
  note: string | null;
}

export interface CapitalStructure {
  initial_investment: number;
  equity: number;
  interest_rate: number;
  loan_term_years: number;
}

export interface RentGuide {
  id: number;
  sido: string;
  sigungu: string;
  rent_per_sqm: number;
  deposit_per_sqm: number | null;
  data_quarter: string | null;
}

export interface SimulatorInputs {
  business_type: BusinessType;
  scale: BusinessScale;
  capital: CapitalStructure;
  daily_customers_override?: number;
  ticket_price_override?: number;
  rent_monthly?: number;
  labor_headcount?: number;
  discount_rate?: number;
  growth_rate?: number;
  region?: { sido: string; sigungu: string; rent_per_sqm: number };
}

export interface DailyPnL {
  daily_revenue: number;
  daily_cogs: number;
  daily_gross_profit: number;
}

export interface SGADetail {
  labor: number;
  labor_headcount: number;
  rent: number;
  misc_fixed: number;
}

export interface MonthlyPnL {
  revenue: number;
  cogs: number;
  gross_profit: number;
  sg_and_a: number;
  sga_detail: SGADetail;
  operating_profit: number;
  interest_expense: number;
  pretax_income: number;
  tax: number;
  net_income: number;
  principal_repayment: number;
  free_cash_flow: number;
}

export interface PaybackResult {
  payback_months: number | null;
  cumulative_cashflow: { month: number; value: number }[];
}

export interface DCFResult {
  fcf_annual: number;
  business_value: number | null;
  discount_rate: number;
  growth_rate: number;
}

export interface PnLAnnotation {
  revenue: string;
  cogs: string;
  sga: string;
  interest: string;
  tax: string;
  principal: string;
}

export interface SimulationResult {
  inputs: SimulatorInputs;
  pnl: MonthlyPnL;
  daily: DailyPnL;
  annotations: PnLAnnotation;
  payback: PaybackResult;
  dcf: DCFResult;
}
