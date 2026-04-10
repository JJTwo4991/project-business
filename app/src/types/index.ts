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
  survival_rate_3yr?: number;
  data_sources: string[];
}

export interface FranchiseBrand {
  name: string;
  business_type_id: number;
  initial_fee: number;
  education_fee: number;
  deposit: number;
  interior_per_sqm: number;
  other_cost: number;
  source: string;
  royalty_rate: number;        // 상표사용료 (매출 대비 소수, 예: 0.06)
  advertising_rate: number;    // 광고분담금 (매출 대비 소수, 예: 0.045)
  other_fees_rate?: number;    // 기타 수수료 (기본값 0)
  fees_source?: string;        // 수수료 출처
}

export type InvestmentCategory = 'deposit' | 'interior' | 'equipment' | 'franchise' | 'other';

export interface InvestmentItem {
  category: InvestmentCategory;
  label: string;
  amount: number;
  editable: boolean;
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
  investment_breakdown?: InvestmentItem[];
}

export interface RentGuide {
  id: number;
  sido: string;
  region: string;
  sangkwon: string;
  rent_per_sqm: number;
  data_quarter: string | null;
}

export interface SimulatorInputs {
  business_type: BusinessType;
  scale: BusinessScale;
  capital: CapitalStructure;
  daily_customers_override?: number;
  operating_days?: number;          // 월 영업일수 (사용자 선택)
  ticket_price_override?: number;
  rent_monthly?: number;
  labor_headcount?: number;
  discount_rate?: number;
  growth_rate?: number;
  region?: { sido: string; sangkwon: string; rent_per_sqm: number };
  material_cost_ratio_override?: number;
  misc_fixed_cost_override?: number;
  delivery_commission_rate_override?: number;  // 배달수수료율 오버라이드
  delivery_commission_override?: number;       // 배달수수료 금액 직접 오버라이드
  misc_rate_override?: number;                 // 기타비용률 오버라이드
  misc_operating_override?: number;            // 기타비용 금액 직접 오버라이드
  rent_deposit?: number;
  selected_brand?: FranchiseBrand;
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
  delivery_commission: number;  // 배달앱수수료 (변동비)
  misc_operating: number;       // 기타 영업비용 (공과금, 보험료, 소모품비 등)
  misc_rate: number;            // 기타 영업비용 비율 (매출 대비)
  royalty: number;              // 상표사용료 (변동비)
  advertising_fund: number;     // 광고분담금 (변동비)
  other_franchise_fees: number; // 기타 프랜차이즈 수수료 (변동비)
  contingency: number;          // 예비비
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
  vat: number;                  // 부가세 납부액 (매출총이익 × 10/110)
  tax: number;                  // 종합소득세 + 지방소득세
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

export type StepId = 'select-industry' | 'industry-transition' | 'select-scale' |
  'investment-breakdown' | 'select-region' | 'set-investment' | 'set-loan' |
  'transition-operating' | 'set-customers' | 'set-ticket' | 'set-labor' | 'set-rent' | 'set-sga' | 'confirm' |
  'business-mbti' | 'result-daily' | 'result-monthly' | 'result-payback' | 'set-misc' | 'result-dcf';

export interface ScaleDescription {
  scale: BusinessScale;
  label: string;
  sqm: number;
  seats?: number;
  description: string;
}
