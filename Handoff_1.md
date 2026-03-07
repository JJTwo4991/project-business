# 자영업 수익 시뮬레이터 - Claude Code Handoff (PART 1/3)

## 프로젝트 개요
예비 자영업자가 14개 한국 업종의 월 손익, 투자회수기간, 사업체가치를 시뮬레이션하는 모바일 웹앱.
- **Tech**: Vite 7 + React 19 + TypeScript + CSS Modules + Recharts
- **데이터**: 로컬 (Supabase 의존 없음, 테스트용)
- **테스트**: Vitest, 57/57 통과

## 실행 순서
1. 프로젝트 루트 디렉토리 생성
2. PART1 파일들 생성 (설정, 타입, 라이브러리, 데이터)
3. PART2 파일들 생성 (컴포넌트, 페이지)
4. PART3 파일들 생성 (테스트)
5. `npm install && npm test && npm run dev`

---

## FILE: package.json
```json
{
  "name": "app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.98.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "recharts": "^3.7.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@types/node": "^24.11.0",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "@vitest/ui": "^4.0.18",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "jsdom": "^28.1.0",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.48.0",
    "vite": "^7.3.1",
    "vitest": "^4.0.18"
  }
}
```

## FILE: tsconfig.json
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

## FILE: tsconfig.app.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["src"]
}
```

## FILE: tsconfig.node.json
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "types": ["node"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

## FILE: vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
})
```

## FILE: vitest.config.ts
```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
```

## FILE: index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>app</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## FILE: src/main.tsx
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## FILE: src/index.css
```css
*, *::before, *::after { box-sizing: border-box; }

:root {
  --color-bg: #f5f5f5;
  --color-surface: #ffffff;
  --color-primary: #3182F6;
  --color-primary-dark: #1B64DA;
  --color-text: #191F28;
  --color-text-secondary: #8B95A1;
  --color-border: #E5E8EB;
  --color-success: #23C55E;
  --color-danger: #F04438;
  --color-warning: #F79009;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-md: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}

html, body { margin: 0; padding: 0; background: var(--color-bg); }

body {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--color-text);
  font-size: var(--font-size-md);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

#root { min-height: 100dvh; }

button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

input[type="range"] { cursor: pointer; }
```

## FILE: src/App.module.css
```css
.root {
  max-width: 480px;
  margin: 0 auto;
  min-height: 100dvh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
}
```

## FILE: src/App.tsx
```tsx
import { useState } from 'react';
import styles from './App.module.css';
import { HomePage } from './pages/HomePage/HomePage';
import { InputPage } from './pages/InputPage/InputPage';
import { ResultPage } from './pages/ResultPage/ResultPage';
import type { BusinessType } from './types';
import { useSimulator } from './hooks/useSimulator';
import { useRentGuide } from './hooks/useRentGuide';
import { useCostItems } from './hooks/useCostItems';

type Page = 'home' | 'input' | 'result';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const simulator = useSimulator();
  const rentGuide = useRentGuide();
  const { costItems } = useCostItems(simulator.inputs?.business_type?.id ?? null);

  const handleSelectBusiness = (bt: BusinessType) => {
    simulator.setBusinessType(bt);
    setPage('input');
  };

  const handleCalculate = () => {
    simulator.calculate();
    setPage('result');
  };

  const handleBack = () => {
    setPage(prev => prev === 'result' ? 'input' : 'home');
  };

  const handleRentSelect = (rent: { sido: string; sigungu: string; rent_per_sqm: number; monthly: number }) => {
    simulator.setRegion({ sido: rent.sido, sigungu: rent.sigungu, rent_per_sqm: rent.rent_per_sqm });
    simulator.setOverride('rent_monthly', rent.monthly);
  };

  return (
    <div className={styles.root}>
      {page === 'home' && (
        <HomePage onSelect={handleSelectBusiness} />
      )}
      {page === 'input' && simulator.inputs && (
        <InputPage
          inputs={simulator.inputs}
          rentGuide={rentGuide}
          onBack={handleBack}
          onScale={simulator.setScale}
          onCapital={simulator.setCapital}
          onRentSelect={handleRentSelect}
          onCalculate={handleCalculate}
        />
      )}
      {page === 'result' && simulator.result && (
        <ResultPage
          result={simulator.result}
          costItems={costItems}
          onBack={handleBack}
          onOverride={simulator.setOverride}
          onRecalculate={simulator.calculate}
        />
      )}
    </div>
  );
}
```

---

## FILE: src/types/index.ts
```ts
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
  business_value: number;
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
```

---

## FILE: src/lib/tax.ts
```ts
interface TaxBracket {
  limit: number;
  rate: number;
  deduction: number;
}

const TAX_BRACKETS: TaxBracket[] = [
  { limit: 14_000_000,    rate: 0.06, deduction: 0 },
  { limit: 50_000_000,    rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000,    rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000,   rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000,   rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000,   rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity,      rate: 0.45, deduction: 65_940_000 },
];

export function calcIncomeTax(annualTaxableIncome: number): number {
  if (annualTaxableIncome <= 0) return 0;
  const bracket = TAX_BRACKETS.find(b => annualTaxableIncome <= b.limit)!;
  return Math.round(annualTaxableIncome * bracket.rate - bracket.deduction);
}

export function calcLocalTax(incomeTax: number): number {
  return Math.round(incomeTax * 0.1);
}

export function calcTotalTax(monthlyPretaxIncome: number): number {
  if (monthlyPretaxIncome <= 0) return 0;
  const annual = monthlyPretaxIncome * 12;
  const incomeTax = calcIncomeTax(annual);
  const localTax = calcLocalTax(incomeTax);
  return Math.round((incomeTax + localTax) / 12);
}

export function calcEffectiveTaxRate(monthlyPretaxIncome: number): number {
  if (monthlyPretaxIncome <= 0) return 0;
  const tax = calcTotalTax(monthlyPretaxIncome);
  return tax / monthlyPretaxIncome;
}
```

## FILE: src/lib/calculator.ts
```ts
import type {
  SimulatorInputs, MonthlyPnL, PaybackResult, DCFResult, SimulationResult,
  DailyPnL, SGADetail, PnLAnnotation,
} from '../types';
import { calcTotalTax, calcEffectiveTaxRate } from './tax';

const OPERATING_DAYS = 26;

function getDebt(capital: SimulatorInputs['capital']): number {
  return Math.max(0, capital.initial_investment - capital.equity);
}

function getDailyCustomers(inputs: SimulatorInputs): number {
  const { business_type: bt, scale } = inputs;
  return inputs.daily_customers_override ??
    (scale === 'small' ? bt.avg_daily_customers_small :
     scale === 'large' ? bt.avg_daily_customers_large :
     bt.avg_daily_customers_medium);
}

function getTicketPrice(inputs: SimulatorInputs): number {
  return inputs.ticket_price_override ?? inputs.business_type.avg_ticket_price;
}

export function calcDailyPnL(inputs: SimulatorInputs): DailyPnL {
  const dailyCustomers = getDailyCustomers(inputs);
  const ticketPrice = getTicketPrice(inputs);
  const daily_revenue = ticketPrice * dailyCustomers;
  const daily_cogs = Math.round(daily_revenue * inputs.business_type.material_cost_ratio);
  const daily_gross_profit = daily_revenue - daily_cogs;
  return { daily_revenue, daily_cogs, daily_gross_profit };
}

export function calcMonthlyPnL(inputs: SimulatorInputs): MonthlyPnL {
  const { business_type: bt, capital } = inputs;
  const daily = calcDailyPnL(inputs);
  const revenue = daily.daily_revenue * OPERATING_DAYS;
  const cogs = daily.daily_cogs * OPERATING_DAYS;
  const gross_profit = revenue - cogs;

  const laborHeadcount = inputs.labor_headcount ?? 1;
  const labor = bt.labor_cost_monthly_per_person * laborHeadcount;
  const rent = inputs.rent_monthly ?? 0;
  const misc_fixed = bt.misc_fixed_cost_monthly;
  const sg_and_a = labor + rent + misc_fixed;
  const sga_detail: SGADetail = { labor, labor_headcount: laborHeadcount, rent, misc_fixed };

  const operating_profit = gross_profit - sg_and_a;
  const debt = getDebt(capital);
  const interest_expense = debt > 0 ? Math.round(debt * capital.interest_rate / 12) : 0;
  const pretax_income = operating_profit - interest_expense;
  const tax = calcTotalTax(pretax_income);
  const net_income = pretax_income - tax;
  const principal_repayment = debt > 0 ? Math.round(debt / (capital.loan_term_years * 12)) : 0;
  const free_cash_flow = net_income - principal_repayment;

  return {
    revenue, cogs, gross_profit, sg_and_a, sga_detail, operating_profit,
    interest_expense, pretax_income, tax, net_income,
    principal_repayment, free_cash_flow,
  };
}

export function generateAnnotations(inputs: SimulatorInputs): PnLAnnotation {
  const { business_type: bt, capital } = inputs;
  const dailyCustomers = getDailyCustomers(inputs);
  const ticketPrice = getTicketPrice(inputs);
  const laborHeadcount = inputs.labor_headcount ?? 1;
  const debt = getDebt(capital);
  const costRatioPercent = Math.round(bt.material_cost_ratio * 100);

  return {
    revenue: `객단가 ${ticketPrice.toLocaleString()}원 × 일 ${dailyCustomers}명 × ${OPERATING_DAYS}일`,
    cogs: `${bt.name} 업계 평균 매출원가율 ${costRatioPercent}% 적용`,
    sga: `인건비 ${laborHeadcount}명 × ${(bt.labor_cost_monthly_per_person / 10000).toFixed(0)}만원 + 임대료 + 기타고정비 ${(bt.misc_fixed_cost_monthly / 10000).toFixed(0)}만원`,
    interest: debt > 0
      ? `대출 ${(debt / 10000).toLocaleString()}만원 × 연 ${(capital.interest_rate * 100).toFixed(1)}% ÷ 12개월`
      : '대출 없음',
    tax: '종합소득세 2025년 구간세율 + 지방소득세 10%',
    principal: debt > 0
      ? `대출 ${(debt / 10000).toLocaleString()}만원 ÷ ${capital.loan_term_years * 12}개월 (원금균등)`
      : '대출 없음',
  };
}

export function calcPayback(inputs: SimulatorInputs): PaybackResult {
  const { capital } = inputs;
  const debt = getDebt(capital);
  const totalMonths = capital.loan_term_years * 12;
  const principalPerMonth = debt > 0 ? Math.round(debt / totalMonths) : 0;

  let remainingDebt = debt;
  let cumulative = -capital.initial_investment;
  const cumulative_cashflow: { month: number; value: number }[] = [];
  let payback_months: number | null = null;

  const { gross_profit, sg_and_a } = calcMonthlyPnL(inputs);
  const operating_profit = gross_profit - sg_and_a;

  for (let month = 1; month <= 60; month++) {
    const interestThisMonth = remainingDebt > 0
      ? Math.round(remainingDebt * capital.interest_rate / 12)
      : 0;

    const pretax_income = operating_profit - interestThisMonth;
    const tax = calcTotalTax(pretax_income);
    const net_income = pretax_income - tax;
    const monthlyFCF = net_income - (month <= totalMonths ? principalPerMonth : 0);

    cumulative += monthlyFCF;
    cumulative_cashflow.push({ month, value: Math.round(cumulative) });

    if (payback_months === null && cumulative >= 0) {
      payback_months = month;
    }

    if (month <= totalMonths) {
      remainingDebt = Math.max(0, remainingDebt - principalPerMonth);
    }
  }

  return { payback_months, cumulative_cashflow };
}

export function calcDCF(pnl: MonthlyPnL, inputs: SimulatorInputs): DCFResult {
  const discount_rate = inputs.discount_rate ?? 0.15;
  const growth_rate = inputs.growth_rate ?? 0.00;

  const effectiveTaxRate = calcEffectiveTaxRate(pnl.operating_profit);
  const annualOperatingProfit = pnl.operating_profit * 12;
  const fcf_annual = Math.round(annualOperatingProfit * (1 - effectiveTaxRate));

  const business_value = discount_rate === growth_rate
    ? Infinity
    : Math.round(fcf_annual / (discount_rate - growth_rate));

  return { fcf_annual, business_value, discount_rate, growth_rate };
}

export function runSimulation(inputs: SimulatorInputs): SimulationResult {
  const pnl = calcMonthlyPnL(inputs);
  const daily = calcDailyPnL(inputs);
  const annotations = generateAnnotations(inputs);
  const payback = calcPayback(inputs);
  const dcf = calcDCF(pnl, inputs);
  return { inputs, pnl, daily, annotations, payback, dcf };
}
```

## FILE: src/lib/format.ts
```ts
export function formatKRW(value: number): string {
  const formatted = Math.abs(Math.round(value)).toLocaleString('ko-KR');
  return value < 0 ? `-${formatted}원` : `${formatted}원`;
}

export function formatKRWShort(value: number): string {
  if (!isFinite(value)) return '∞';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 100_000_000) {
    const bok = abs / 100_000_000;
    return `${sign}${parseFloat(bok.toFixed(1))}억원`;
  }
  if (abs >= 10_000) {
    const man = Math.round(abs / 10_000);
    return `${sign}${man.toLocaleString('ko-KR')}만원`;
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}

export function formatPercent(rate: number, decimals = 1): string {
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function formatMonths(months: number | null): string {
  if (months === null) return '60개월 이내 미회수';
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (years === 0) return `${remaining}개월`;
  if (remaining === 0) return `${years}년`;
  return `${years}년 ${remaining}개월`;
}
```

## FILE: src/lib/supabase.ts
```ts
import type { BusinessType, CostItem, RentGuide } from '../types';
import { BUSINESS_TYPES } from '../data/businessTypes';
import { COST_ITEMS } from '../data/costItems';
import { RENT_GUIDES } from '../data/rentGuide';

// Local data mode (no Supabase dependency)
export async function fetchBusinessTypes(): Promise<BusinessType[]> {
  return BUSINESS_TYPES;
}

export async function fetchCostItems(businessTypeId: number): Promise<CostItem[]> {
  return COST_ITEMS.filter(c => c.business_type_id === businessTypeId);
}

export async function fetchRentGuide(): Promise<RentGuide[]> {
  return RENT_GUIDES;
}
```

---

## FILE: src/data/businessTypes.ts
```ts
import type { BusinessType } from '../types';

export const BUSINESS_TYPES: BusinessType[] = [
  {id:1,name:"치킨전문점",category:"외식",avg_ticket_price:22000,material_cost_ratio:0.38,avg_daily_customers_small:25,avg_daily_customers_medium:55,avg_daily_customers_large:90,labor_cost_monthly_per_person:2800000,misc_fixed_cost_monthly:350000,initial_investment_min:40000000,initial_investment_max:100000000,avg_monthly_revenue_min:10000000,avg_monthly_revenue_max:35000000,closure_rate_1yr:0.22,closure_rate_3yr:0.52,closure_rate_5yr:0.72,data_sources:["통계청","소상공인시장진흥공단"],initial_investment_small:30000000,initial_investment_medium:50000000,initial_investment_large:80000000},
  {id:2,name:"커피전문점",category:"카페",avg_ticket_price:5500,material_cost_ratio:0.25,avg_daily_customers_small:80,avg_daily_customers_medium:180,avg_daily_customers_large:350,labor_cost_monthly_per_person:2500000,misc_fixed_cost_monthly:400000,initial_investment_min:30000000,initial_investment_max:150000000,avg_monthly_revenue_min:8000000,avg_monthly_revenue_max:40000000,closure_rate_1yr:0.18,closure_rate_3yr:0.45,closure_rate_5yr:0.65,data_sources:["통계청","한국카페산업연구원"],initial_investment_small:25000000,initial_investment_medium:50000000,initial_investment_large:100000000},
  {id:3,name:"편의점",category:"소매",avg_ticket_price:8000,material_cost_ratio:0.72,avg_daily_customers_small:100,avg_daily_customers_medium:250,avg_daily_customers_large:500,labor_cost_monthly_per_person:2400000,misc_fixed_cost_monthly:200000,initial_investment_min:50000000,initial_investment_max:150000000,avg_monthly_revenue_min:30000000,avg_monthly_revenue_max:80000000,closure_rate_1yr:0.10,closure_rate_3yr:0.30,closure_rate_5yr:0.50,data_sources:["통계청","편의점산업협회"],initial_investment_small:40000000,initial_investment_medium:70000000,initial_investment_large:120000000},
  {id:4,name:"미용실",category:"서비스",avg_ticket_price:25000,material_cost_ratio:0.10,avg_daily_customers_small:8,avg_daily_customers_medium:15,avg_daily_customers_large:30,labor_cost_monthly_per_person:2800000,misc_fixed_cost_monthly:300000,initial_investment_min:20000000,initial_investment_max:80000000,avg_monthly_revenue_min:5000000,avg_monthly_revenue_max:25000000,closure_rate_1yr:0.15,closure_rate_3yr:0.40,closure_rate_5yr:0.60,data_sources:["통계청","대한미용사회"],initial_investment_small:15000000,initial_investment_medium:30000000,initial_investment_large:60000000},
  {id:5,name:"분식점",category:"외식",avg_ticket_price:8000,material_cost_ratio:0.35,avg_daily_customers_small:40,avg_daily_customers_medium:80,avg_daily_customers_large:150,labor_cost_monthly_per_person:2500000,misc_fixed_cost_monthly:250000,initial_investment_min:15000000,initial_investment_max:50000000,avg_monthly_revenue_min:8000000,avg_monthly_revenue_max:25000000,closure_rate_1yr:0.25,closure_rate_3yr:0.55,closure_rate_5yr:0.75,data_sources:["통계청","소상공인시장진흥공단"],initial_investment_small:20000000,initial_investment_medium:35000000,initial_investment_large:60000000},
  {id:6,name:"삼겹살전문점",category:"외식",avg_ticket_price:30000,material_cost_ratio:0.42,avg_daily_customers_small:20,avg_daily_customers_medium:45,avg_daily_customers_large:80,labor_cost_monthly_per_person:2800000,misc_fixed_cost_monthly:400000,initial_investment_min:50000000,initial_investment_max:120000000,avg_monthly_revenue_min:15000000,avg_monthly_revenue_max:40000000,closure_rate_1yr:0.20,closure_rate_3yr:0.48,closure_rate_5yr:0.70,data_sources:["통계청","외식산업연구원"],initial_investment_small:35000000,initial_investment_medium:60000000,initial_investment_large:100000000},
  {id:7,name:"세탁소",category:"서비스",avg_ticket_price:12000,material_cost_ratio:0.15,avg_daily_customers_small:15,avg_daily_customers_medium:30,avg_daily_customers_large:50,labor_cost_monthly_per_person:2500000,misc_fixed_cost_monthly:200000,initial_investment_min:30000000,initial_investment_max:80000000,avg_monthly_revenue_min:5000000,avg_monthly_revenue_max:20000000,closure_rate_1yr:0.12,closure_rate_3yr:0.35,closure_rate_5yr:0.55,data_sources:["통계청","한국세탁업중앙회"],initial_investment_small:15000000,initial_investment_medium:30000000,initial_investment_large:50000000},
  {id:8,name:"피자전문점",category:"외식",avg_ticket_price:25000,material_cost_ratio:0.35,avg_daily_customers_small:20,avg_daily_customers_medium:45,avg_daily_customers_large:80,labor_cost_monthly_per_person:2700000,misc_fixed_cost_monthly:350000,initial_investment_min:40000000,initial_investment_max:100000000,avg_monthly_revenue_min:10000000,avg_monthly_revenue_max:30000000,closure_rate_1yr:0.20,closure_rate_3yr:0.50,closure_rate_5yr:0.70,data_sources:["통계청","소상공인시장진흥공단"],initial_investment_small:30000000,initial_investment_medium:55000000,initial_investment_large:90000000},
  {id:9,name:"베이커리",category:"카페",avg_ticket_price:8000,material_cost_ratio:0.30,avg_daily_customers_small:50,avg_daily_customers_medium:120,avg_daily_customers_large:250,labor_cost_monthly_per_person:2600000,misc_fixed_cost_monthly:400000,initial_investment_min:40000000,initial_investment_max:150000000,avg_monthly_revenue_min:10000000,avg_monthly_revenue_max:40000000,closure_rate_1yr:0.18,closure_rate_3yr:0.45,closure_rate_5yr:0.65,data_sources:["통계청","제과제빵협회"],initial_investment_small:25000000,initial_investment_medium:50000000,initial_investment_large:90000000},
  {id:10,name:"학원(교습소)",category:"교육",avg_ticket_price:200000,material_cost_ratio:0.05,avg_daily_customers_small:5,avg_daily_customers_medium:15,avg_daily_customers_large:30,labor_cost_monthly_per_person:3000000,misc_fixed_cost_monthly:300000,initial_investment_min:10000000,initial_investment_max:50000000,avg_monthly_revenue_min:3000000,avg_monthly_revenue_max:20000000,closure_rate_1yr:0.15,closure_rate_3yr:0.40,closure_rate_5yr:0.60,data_sources:["통계청","교육부"],initial_investment_small:10000000,initial_investment_medium:25000000,initial_investment_large:50000000},
  {id:11,name:"네일샵",category:"서비스",avg_ticket_price:35000,material_cost_ratio:0.08,avg_daily_customers_small:6,avg_daily_customers_medium:12,avg_daily_customers_large:25,labor_cost_monthly_per_person:2600000,misc_fixed_cost_monthly:200000,initial_investment_min:10000000,initial_investment_max:40000000,avg_monthly_revenue_min:4000000,avg_monthly_revenue_max:15000000,closure_rate_1yr:0.18,closure_rate_3yr:0.45,closure_rate_5yr:0.65,data_sources:["통계청","대한미용사회"],initial_investment_small:10000000,initial_investment_medium:20000000,initial_investment_large:35000000},
  {id:12,name:"헬스장(PT샵)",category:"운동",avg_ticket_price:80000,material_cost_ratio:0.05,avg_daily_customers_small:10,avg_daily_customers_medium:25,avg_daily_customers_large:50,labor_cost_monthly_per_person:3200000,misc_fixed_cost_monthly:500000,initial_investment_min:30000000,initial_investment_max:100000000,avg_monthly_revenue_min:8000000,avg_monthly_revenue_max:30000000,closure_rate_1yr:0.15,closure_rate_3yr:0.40,closure_rate_5yr:0.60,data_sources:["통계청","체육시설협회"],initial_investment_small:30000000,initial_investment_medium:60000000,initial_investment_large:120000000},
  {id:13,name:"반찬가게",category:"소매",avg_ticket_price:15000,material_cost_ratio:0.45,avg_daily_customers_small:20,avg_daily_customers_medium:45,avg_daily_customers_large:80,labor_cost_monthly_per_person:2500000,misc_fixed_cost_monthly:250000,initial_investment_min:15000000,initial_investment_max:50000000,avg_monthly_revenue_min:8000000,avg_monthly_revenue_max:25000000,closure_rate_1yr:0.20,closure_rate_3yr:0.48,closure_rate_5yr:0.68,data_sources:["통계청","소상공인시장진흥공단"],initial_investment_small:15000000,initial_investment_medium:25000000,initial_investment_large:40000000},
  {id:14,name:"무인아이스크림",category:"소매",avg_ticket_price:5000,material_cost_ratio:0.55,avg_daily_customers_small:30,avg_daily_customers_medium:70,avg_daily_customers_large:150,labor_cost_monthly_per_person:0,misc_fixed_cost_monthly:300000,initial_investment_min:20000000,initial_investment_max:60000000,avg_monthly_revenue_min:5000000,avg_monthly_revenue_max:20000000,closure_rate_1yr:0.15,closure_rate_3yr:0.40,closure_rate_5yr:0.60,data_sources:["통계청","프랜차이즈협회"],initial_investment_small:20000000,initial_investment_medium:35000000,initial_investment_large:55000000},
];
```

## FILE: src/data/costItems.ts
```ts
import type { CostItem } from '../types';

export const COST_ITEMS: CostItem[] = [
  {id:1,business_type_id:1,cost_category:"rent",cost_name:"임대료",amount_monthly_min:800000,amount_monthly_max:2500000,is_initial_cost:false,note:"상권별 편차 큼"},
  {id:2,business_type_id:1,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2800000,amount_monthly_max:2800000,is_initial_cost:false,note:"1인 기준"},
  {id:3,business_type_id:1,cost_category:"material",cost_name:"식재료비",amount_monthly_min:3800000,amount_monthly_max:13300000,is_initial_cost:false,note:"매출의 38%"},
  {id:4,business_type_id:1,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:500000,is_initial_cost:false,note:"전기/가스/수도"},
  {id:5,business_type_id:1,cost_category:"equipment",cost_name:"프랜차이즈 가맹비",amount_monthly_min:10000000,amount_monthly_max:30000000,is_initial_cost:true,note:"초기 1회"},
  {id:6,business_type_id:1,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:15000000,amount_monthly_max:50000000,is_initial_cost:true,note:"초기 1회"},
  {id:7,business_type_id:1,cost_category:"marketing",cost_name:"배달앱 수수료",amount_monthly_min:300000,amount_monthly_max:1500000,is_initial_cost:false,note:"매출의 약 10%"},
  {id:8,business_type_id:1,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:350000,amount_monthly_max:350000,is_initial_cost:false,note:"소모품/보험 등"},
  {id:9,business_type_id:2,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3500000,is_initial_cost:false,note:"역세권 기준"},
  {id:10,business_type_id:2,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:11,business_type_id:2,cost_category:"material",cost_name:"원두/부자재",amount_monthly_min:2000000,amount_monthly_max:10000000,is_initial_cost:false,note:"매출의 25%"},
  {id:12,business_type_id:2,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:13,business_type_id:2,cost_category:"equipment",cost_name:"커피머신/설비",amount_monthly_min:10000000,amount_monthly_max:50000000,is_initial_cost:true,note:"에스프레소 머신 등"},
  {id:14,business_type_id:2,cost_category:"equipment",cost_name:"인테리어",amount_monthly_min:15000000,amount_monthly_max:80000000,is_initial_cost:true,note:"평당 200~400만"},
  {id:15,business_type_id:2,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:400000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:16,business_type_id:3,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3000000,is_initial_cost:false,note:null},
  {id:17,business_type_id:3,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2400000,amount_monthly_max:2400000,is_initial_cost:false,note:"1인 기준"},
  {id:18,business_type_id:3,cost_category:"material",cost_name:"상품매입비",amount_monthly_min:21600000,amount_monthly_max:57600000,is_initial_cost:false,note:"매출의 72%"},
  {id:19,business_type_id:3,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:300000,amount_monthly_max:600000,is_initial_cost:false,note:"24시간 운영"},
  {id:20,business_type_id:3,cost_category:"equipment",cost_name:"가맹보증금",amount_monthly_min:20000000,amount_monthly_max:50000000,is_initial_cost:true,note:null},
  {id:21,business_type_id:3,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:20000000,amount_monthly_max:80000000,is_initial_cost:true,note:null},
  {id:22,business_type_id:3,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:200000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:23,business_type_id:4,cost_category:"rent",cost_name:"임대료",amount_monthly_min:600000,amount_monthly_max:2000000,is_initial_cost:false,note:null},
  {id:24,business_type_id:4,cost_category:"labor",cost_name:"디자이너 인건비",amount_monthly_min:2800000,amount_monthly_max:2800000,is_initial_cost:false,note:"1인 기준"},
  {id:25,business_type_id:4,cost_category:"material",cost_name:"미용재료비",amount_monthly_min:500000,amount_monthly_max:2500000,is_initial_cost:false,note:"매출의 10%"},
  {id:26,business_type_id:4,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:300000,is_initial_cost:false,note:null},
  {id:27,business_type_id:4,cost_category:"equipment",cost_name:"인테리어/의자/도구",amount_monthly_min:10000000,amount_monthly_max:50000000,is_initial_cost:true,note:null},
  {id:28,business_type_id:4,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:300000,amount_monthly_max:300000,is_initial_cost:false,note:null},
  {id:29,business_type_id:5,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:30,business_type_id:5,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:31,business_type_id:5,cost_category:"material",cost_name:"식재료비",amount_monthly_min:2800000,amount_monthly_max:8750000,is_initial_cost:false,note:"매출의 35%"},
  {id:32,business_type_id:5,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:350000,is_initial_cost:false,note:null},
  {id:33,business_type_id:5,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:8000000,amount_monthly_max:30000000,is_initial_cost:true,note:null},
  {id:34,business_type_id:5,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:250000,amount_monthly_max:250000,is_initial_cost:false,note:null},
  {id:35,business_type_id:6,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3000000,is_initial_cost:false,note:null},
  {id:36,business_type_id:6,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2800000,amount_monthly_max:2800000,is_initial_cost:false,note:"1인 기준"},
  {id:37,business_type_id:6,cost_category:"material",cost_name:"고기/식재료",amount_monthly_min:6300000,amount_monthly_max:16800000,is_initial_cost:false,note:"매출의 42%"},
  {id:38,business_type_id:6,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:250000,amount_monthly_max:600000,is_initial_cost:false,note:"환기시설 전기료"},
  {id:39,business_type_id:6,cost_category:"equipment",cost_name:"인테리어/설비",amount_monthly_min:25000000,amount_monthly_max:70000000,is_initial_cost:true,note:"좌석/환풍기 등"},
  {id:40,business_type_id:6,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:400000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:41,business_type_id:7,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:42,business_type_id:7,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:43,business_type_id:7,cost_category:"material",cost_name:"세제/용제",amount_monthly_min:750000,amount_monthly_max:3000000,is_initial_cost:false,note:"매출의 15%"},
  {id:44,business_type_id:7,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:400000,is_initial_cost:false,note:"수도/전기"},
  {id:45,business_type_id:7,cost_category:"equipment",cost_name:"세탁장비",amount_monthly_min:15000000,amount_monthly_max:50000000,is_initial_cost:true,note:"드라이/워시 기기"},
  {id:46,business_type_id:7,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:200000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:47,business_type_id:8,cost_category:"rent",cost_name:"임대료",amount_monthly_min:800000,amount_monthly_max:2500000,is_initial_cost:false,note:null},
  {id:48,business_type_id:8,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2700000,amount_monthly_max:2700000,is_initial_cost:false,note:"1인 기준"},
  {id:49,business_type_id:8,cost_category:"material",cost_name:"식재료비",amount_monthly_min:3500000,amount_monthly_max:10500000,is_initial_cost:false,note:"매출의 35%"},
  {id:50,business_type_id:8,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:200000,amount_monthly_max:450000,is_initial_cost:false,note:null},
  {id:51,business_type_id:8,cost_category:"equipment",cost_name:"오븐/설비",amount_monthly_min:15000000,amount_monthly_max:50000000,is_initial_cost:true,note:null},
  {id:52,business_type_id:8,cost_category:"marketing",cost_name:"배달앱 수수료",amount_monthly_min:300000,amount_monthly_max:1200000,is_initial_cost:false,note:null},
  {id:53,business_type_id:8,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:350000,amount_monthly_max:350000,is_initial_cost:false,note:null},
  {id:54,business_type_id:9,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1000000,amount_monthly_max:3000000,is_initial_cost:false,note:null},
  {id:55,business_type_id:9,cost_category:"labor",cost_name:"제빵사 인건비",amount_monthly_min:2600000,amount_monthly_max:2600000,is_initial_cost:false,note:"1인 기준"},
  {id:56,business_type_id:9,cost_category:"material",cost_name:"밀가루/부자재",amount_monthly_min:3000000,amount_monthly_max:12000000,is_initial_cost:false,note:"매출의 30%"},
  {id:57,business_type_id:9,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:250000,amount_monthly_max:500000,is_initial_cost:false,note:"오븐 전기료"},
  {id:58,business_type_id:9,cost_category:"equipment",cost_name:"오븐/설비/인테리어",amount_monthly_min:20000000,amount_monthly_max:80000000,is_initial_cost:true,note:null},
  {id:59,business_type_id:9,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:400000,amount_monthly_max:400000,is_initial_cost:false,note:null},
  {id:60,business_type_id:10,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:2000000,is_initial_cost:false,note:null},
  {id:61,business_type_id:10,cost_category:"labor",cost_name:"강사 인건비",amount_monthly_min:3000000,amount_monthly_max:3000000,is_initial_cost:false,note:"1인 기준"},
  {id:62,business_type_id:10,cost_category:"material",cost_name:"교재/부자재",amount_monthly_min:150000,amount_monthly_max:1000000,is_initial_cost:false,note:"매출의 5%"},
  {id:63,business_type_id:10,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:100000,amount_monthly_max:250000,is_initial_cost:false,note:null},
  {id:64,business_type_id:10,cost_category:"equipment",cost_name:"인테리어/교구",amount_monthly_min:5000000,amount_monthly_max:30000000,is_initial_cost:true,note:null},
  {id:65,business_type_id:10,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:300000,amount_monthly_max:300000,is_initial_cost:false,note:null},
  {id:66,business_type_id:11,cost_category:"rent",cost_name:"임대료",amount_monthly_min:400000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:67,business_type_id:11,cost_category:"labor",cost_name:"네일리스트 인건비",amount_monthly_min:2600000,amount_monthly_max:2600000,is_initial_cost:false,note:"1인 기준"},
  {id:68,business_type_id:11,cost_category:"material",cost_name:"재료비",amount_monthly_min:320000,amount_monthly_max:1200000,is_initial_cost:false,note:"매출의 8%"},
  {id:69,business_type_id:11,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:100000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:70,business_type_id:11,cost_category:"equipment",cost_name:"인테리어/장비",amount_monthly_min:5000000,amount_monthly_max:25000000,is_initial_cost:true,note:null},
  {id:71,business_type_id:11,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:200000,amount_monthly_max:200000,is_initial_cost:false,note:null},
  {id:72,business_type_id:12,cost_category:"rent",cost_name:"임대료",amount_monthly_min:1500000,amount_monthly_max:4000000,is_initial_cost:false,note:"넓은 면적 필요"},
  {id:73,business_type_id:12,cost_category:"labor",cost_name:"PT강사 인건비",amount_monthly_min:3200000,amount_monthly_max:3200000,is_initial_cost:false,note:"1인 기준"},
  {id:74,business_type_id:12,cost_category:"material",cost_name:"소모품",amount_monthly_min:400000,amount_monthly_max:1500000,is_initial_cost:false,note:"매출의 5%"},
  {id:75,business_type_id:12,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:300000,amount_monthly_max:600000,is_initial_cost:false,note:null},
  {id:76,business_type_id:12,cost_category:"equipment",cost_name:"운동기구/인테리어",amount_monthly_min:15000000,amount_monthly_max:60000000,is_initial_cost:true,note:null},
  {id:77,business_type_id:12,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:500000,amount_monthly_max:500000,is_initial_cost:false,note:null},
  {id:78,business_type_id:13,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:79,business_type_id:13,cost_category:"labor",cost_name:"직원 인건비",amount_monthly_min:2500000,amount_monthly_max:2500000,is_initial_cost:false,note:"1인 기준"},
  {id:80,business_type_id:13,cost_category:"material",cost_name:"식재료비",amount_monthly_min:3600000,amount_monthly_max:11250000,is_initial_cost:false,note:"매출의 45%"},
  {id:81,business_type_id:13,cost_category:"utilities",cost_name:"공과금",amount_monthly_min:150000,amount_monthly_max:350000,is_initial_cost:false,note:null},
  {id:82,business_type_id:13,cost_category:"equipment",cost_name:"주방설비/인테리어",amount_monthly_min:8000000,amount_monthly_max:30000000,is_initial_cost:true,note:null},
  {id:83,business_type_id:13,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:250000,amount_monthly_max:250000,is_initial_cost:false,note:null},
  {id:84,business_type_id:14,cost_category:"rent",cost_name:"임대료",amount_monthly_min:500000,amount_monthly_max:1500000,is_initial_cost:false,note:null},
  {id:85,business_type_id:14,cost_category:"material",cost_name:"아이스크림 매입비",amount_monthly_min:2750000,amount_monthly_max:11000000,is_initial_cost:false,note:"매출의 55%"},
  {id:86,business_type_id:14,cost_category:"utilities",cost_name:"공과금/냉동전기",amount_monthly_min:200000,amount_monthly_max:500000,is_initial_cost:false,note:"냉동고 전기료"},
  {id:87,business_type_id:14,cost_category:"equipment",cost_name:"냉동고/인테리어",amount_monthly_min:10000000,amount_monthly_max:35000000,is_initial_cost:true,note:null},
  {id:88,business_type_id:14,cost_category:"equipment",cost_name:"무인시스템(키오스크)",amount_monthly_min:3000000,amount_monthly_max:10000000,is_initial_cost:true,note:null},
  {id:89,business_type_id:14,cost_category:"other",cost_name:"기타 고정비",amount_monthly_min:300000,amount_monthly_max:300000,is_initial_cost:false,note:"CCTV/보안"},
];
```

## FILE: src/data/rentGuide.ts
```ts
import type { RentGuide } from '../types';

export const RENT_GUIDES: RentGuide[] = [
  {id:1,sido:"서울특별시",sigungu:"강남구",rent_per_sqm:55000,deposit_per_sqm:350000,data_quarter:"2025Q1"},
  {id:2,sido:"서울특별시",sigungu:"서초구",rent_per_sqm:48000,deposit_per_sqm:320000,data_quarter:"2025Q1"},
  {id:3,sido:"서울특별시",sigungu:"송파구",rent_per_sqm:38000,deposit_per_sqm:250000,data_quarter:"2025Q1"},
  {id:4,sido:"서울특별시",sigungu:"마포구",rent_per_sqm:40000,deposit_per_sqm:260000,data_quarter:"2025Q1"},
  {id:5,sido:"서울특별시",sigungu:"영등포구",rent_per_sqm:35000,deposit_per_sqm:230000,data_quarter:"2025Q1"},
  {id:6,sido:"서울특별시",sigungu:"강서구",rent_per_sqm:28000,deposit_per_sqm:180000,data_quarter:"2025Q1"},
  {id:7,sido:"서울특별시",sigungu:"종로구",rent_per_sqm:45000,deposit_per_sqm:300000,data_quarter:"2025Q1"},
  {id:8,sido:"서울특별시",sigungu:"중구",rent_per_sqm:50000,deposit_per_sqm:330000,data_quarter:"2025Q1"},
  {id:9,sido:"서울특별시",sigungu:"용산구",rent_per_sqm:42000,deposit_per_sqm:280000,data_quarter:"2025Q1"},
  {id:10,sido:"서울특별시",sigungu:"성동구",rent_per_sqm:35000,deposit_per_sqm:230000,data_quarter:"2025Q1"},
  {id:11,sido:"서울특별시",sigungu:"광진구",rent_per_sqm:32000,deposit_per_sqm:210000,data_quarter:"2025Q1"},
  {id:12,sido:"서울특별시",sigungu:"동대문구",rent_per_sqm:30000,deposit_per_sqm:200000,data_quarter:"2025Q1"},
  {id:13,sido:"서울특별시",sigungu:"중랑구",rent_per_sqm:22000,deposit_per_sqm:150000,data_quarter:"2025Q1"},
  {id:14,sido:"서울특별시",sigungu:"성북구",rent_per_sqm:25000,deposit_per_sqm:170000,data_quarter:"2025Q1"},
  {id:15,sido:"서울특별시",sigungu:"강북구",rent_per_sqm:20000,deposit_per_sqm:140000,data_quarter:"2025Q1"},
  {id:16,sido:"서울특별시",sigungu:"도봉구",rent_per_sqm:20000,deposit_per_sqm:140000,data_quarter:"2025Q1"},
  {id:17,sido:"서울특별시",sigungu:"노원구",rent_per_sqm:23000,deposit_per_sqm:155000,data_quarter:"2025Q1"},
  {id:18,sido:"서울특별시",sigungu:"은평구",rent_per_sqm:23000,deposit_per_sqm:155000,data_quarter:"2025Q1"},
  {id:19,sido:"서울특별시",sigungu:"서대문구",rent_per_sqm:28000,deposit_per_sqm:185000,data_quarter:"2025Q1"},
  {id:20,sido:"서울특별시",sigungu:"양천구",rent_per_sqm:27000,deposit_per_sqm:180000,data_quarter:"2025Q1"},
  {id:21,sido:"서울특별시",sigungu:"구로구",rent_per_sqm:25000,deposit_per_sqm:165000,data_quarter:"2025Q1"},
  {id:22,sido:"서울특별시",sigungu:"금천구",rent_per_sqm:23000,deposit_per_sqm:155000,data_quarter:"2025Q1"},
  {id:23,sido:"서울특별시",sigungu:"동작구",rent_per_sqm:30000,deposit_per_sqm:200000,data_quarter:"2025Q1"},
  {id:24,sido:"서울특별시",sigungu:"관악구",rent_per_sqm:25000,deposit_per_sqm:170000,data_quarter:"2025Q1"},
  {id:25,sido:"서울특별시",sigungu:"강동구",rent_per_sqm:30000,deposit_per_sqm:200000,data_quarter:"2025Q1"},
  {id:26,sido:"경기도",sigungu:"수원시",rent_per_sqm:25000,deposit_per_sqm:170000,data_quarter:"2025Q1"},
  {id:27,sido:"경기도",sigungu:"성남시",rent_per_sqm:30000,deposit_per_sqm:200000,data_quarter:"2025Q1"},
  {id:28,sido:"경기도",sigungu:"용인시",rent_per_sqm:22000,deposit_per_sqm:150000,data_quarter:"2025Q1"},
  {id:29,sido:"경기도",sigungu:"부천시",rent_per_sqm:22000,deposit_per_sqm:150000,data_quarter:"2025Q1"},
  {id:30,sido:"경기도",sigungu:"안양시",rent_per_sqm:25000,deposit_per_sqm:165000,data_quarter:"2025Q1"},
  {id:31,sido:"경기도",sigungu:"고양시",rent_per_sqm:22000,deposit_per_sqm:150000,data_quarter:"2025Q1"},
  {id:32,sido:"경기도",sigungu:"화성시",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:33,sido:"경기도",sigungu:"평택시",rent_per_sqm:16000,deposit_per_sqm:110000,data_quarter:"2025Q1"},
  {id:34,sido:"경기도",sigungu:"파주시",rent_per_sqm:15000,deposit_per_sqm:100000,data_quarter:"2025Q1"},
  {id:35,sido:"부산광역시",sigungu:"해운대구",rent_per_sqm:30000,deposit_per_sqm:200000,data_quarter:"2025Q1"},
  {id:36,sido:"부산광역시",sigungu:"부산진구",rent_per_sqm:25000,deposit_per_sqm:170000,data_quarter:"2025Q1"},
  {id:37,sido:"부산광역시",sigungu:"중구",rent_per_sqm:28000,deposit_per_sqm:185000,data_quarter:"2025Q1"},
  {id:38,sido:"대구광역시",sigungu:"중구",rent_per_sqm:25000,deposit_per_sqm:165000,data_quarter:"2025Q1"},
  {id:39,sido:"대구광역시",sigungu:"수성구",rent_per_sqm:22000,deposit_per_sqm:150000,data_quarter:"2025Q1"},
  {id:40,sido:"인천광역시",sigungu:"남동구",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:41,sido:"인천광역시",sigungu:"연수구",rent_per_sqm:22000,deposit_per_sqm:150000,data_quarter:"2025Q1"},
  {id:42,sido:"대전광역시",sigungu:"유성구",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:43,sido:"대전광역시",sigungu:"서구",rent_per_sqm:20000,deposit_per_sqm:135000,data_quarter:"2025Q1"},
  {id:44,sido:"광주광역시",sigungu:"동구",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:45,sido:"광주광역시",sigungu:"서구",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:46,sido:"울산광역시",sigungu:"남구",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:47,sido:"세종특별자치시",sigungu:"세종시",rent_per_sqm:18000,deposit_per_sqm:120000,data_quarter:"2025Q1"},
  {id:48,sido:"제주특별자치도",sigungu:"제주시",rent_per_sqm:20000,deposit_per_sqm:135000,data_quarter:"2025Q1"},
  {id:49,sido:"강원특별자치도",sigungu:"춘천시",rent_per_sqm:14000,deposit_per_sqm:95000,data_quarter:"2025Q1"},
  {id:50,sido:"충청북도",sigungu:"청주시",rent_per_sqm:15000,deposit_per_sqm:100000,data_quarter:"2025Q1"},
];
```

---

## FILE: src/hooks/useBusinessTypes.ts
```ts
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
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { businessTypes, loading, error };
}
```

## FILE: src/hooks/useSimulator.ts
```ts
import { useState, useCallback, useMemo } from 'react';
import type { BusinessType, BusinessScale, CapitalStructure, SimulatorInputs, SimulationResult } from '../types';
import { runSimulation } from '../lib/calculator';

interface UseSimulatorResult {
  inputs: SimulatorInputs | null;
  result: SimulationResult | null;
  setBusinessType: (bt: BusinessType) => void;
  setScale: (scale: BusinessScale) => void;
  setCapital: (capital: CapitalStructure) => void;
  setRegion: (region: SimulatorInputs['region']) => void;
  setOverride: (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region'>, value: number) => void;
  calculate: () => void;
}

const DEFAULT_CAPITAL: CapitalStructure = {
  initial_investment: 50_000_000,
  equity: 30_000_000,
  interest_rate: 0.055,
  loan_term_years: 5,
};

export function useSimulator(): UseSimulatorResult {
  const [businessType, setBusinessTypeState] = useState<BusinessType | null>(null);
  const [scale, setScaleState] = useState<BusinessScale>('medium');
  const [capital, setCapital] = useState<CapitalStructure>(DEFAULT_CAPITAL);
  const [region, setRegion] = useState<SimulatorInputs['region']>(undefined);
  const [overrides, setOverrides] = useState<Partial<SimulatorInputs>>({
    discount_rate: 0.15,
    growth_rate: 0.00,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);

  const setBusinessType = useCallback((bt: BusinessType) => {
    setBusinessTypeState(bt);
    const inv = bt.initial_investment_medium;
    setCapital(prev => ({
      ...prev,
      initial_investment: inv,
      equity: Math.round(inv * 0.6),
    }));
  }, []);

  const setScale = useCallback((newScale: BusinessScale) => {
    setScaleState(newScale);
    setBusinessTypeState(prev => {
      if (!prev) return prev;
      const inv = newScale === 'small' ? prev.initial_investment_small
        : newScale === 'large' ? prev.initial_investment_large
        : prev.initial_investment_medium;
      setCapital(c => ({
        ...c,
        initial_investment: inv,
        equity: Math.min(c.equity, inv),
      }));
      return prev;
    });
  }, []);

  const inputs: SimulatorInputs | null = useMemo(() => {
    if (!businessType) return null;
    return { business_type: businessType, scale, capital, region, ...overrides };
  }, [businessType, scale, capital, region, overrides]);

  const calculate = useCallback(() => {
    if (!inputs) return;
    setResult(runSimulation(inputs));
  }, [inputs]);

  const setOverride = useCallback(
    (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region'>, value: number) => {
      setOverrides(prev => ({ ...prev, [key]: value }));
    },
    []
  );

  return {
    inputs,
    result,
    setBusinessType,
    setScale,
    setCapital,
    setRegion,
    setOverride,
    calculate,
  };
}
```

## FILE: src/hooks/useRentGuide.ts
```ts
import { useState, useEffect, useMemo } from 'react';
import type { RentGuide } from '../types';
import { fetchRentGuide } from '../lib/supabase';

interface UseRentGuideResult {
  rentGuides: RentGuide[];
  loading: boolean;
  sidos: string[];
  getSigungus: (sido: string) => string[];
  getRent: (sido: string, sigungu: string) => RentGuide | undefined;
}

export function useRentGuide(): UseRentGuideResult {
  const [rentGuides, setRentGuides] = useState<RentGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentGuide()
      .then(setRentGuides)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sidos = useMemo(() =>
    [...new Set(rentGuides.map(r => r.sido))].sort(),
    [rentGuides]
  );

  const getSigungus = (sido: string) =>
    rentGuides.filter(r => r.sido === sido).map(r => r.sigungu).sort();

  const getRent = (sido: string, sigungu: string) =>
    rentGuides.find(r => r.sido === sido && r.sigungu === sigungu);

  return { rentGuides, loading, sidos, getSigungus, getRent };
}
```

## FILE: src/hooks/useCostItems.ts
```ts
import { useState, useEffect } from 'react';
import type { CostItem } from '../types';
import { fetchCostItems } from '../lib/supabase';

export function useCostItems(businessTypeId: number | null) {
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!businessTypeId) return;
    setLoading(true);
    fetchCostItems(businessTypeId)
      .then(setCostItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [businessTypeId]);

  return { costItems, loading };
}
```
