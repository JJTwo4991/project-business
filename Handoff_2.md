# 자영업 수익 시뮬레이터 - Claude Code Handoff (PART 2/3)

## 컴포넌트 + 페이지 파일

---

## FILE: src/components/BusinessTypeCard/BusinessTypeCard.tsx
```tsx
import styles from './BusinessTypeCard.module.css';
import type { BusinessType } from '../../types';
import { formatKRWShort } from '../../lib/format';

const CATEGORY_EMOJI: Record<string, string> = {
  '외식': '🍜',
  '카페': '☕',
  '소매': '🛍️',
  '서비스': '✂️',
  '교육': '📚',
  '운동': '💪',
  '기타': '🏪',
};

interface Props {
  business: BusinessType;
  onSelect: (bt: BusinessType) => void;
}

export function BusinessTypeCard({ business, onSelect }: Props) {
  const emoji = CATEGORY_EMOJI[business.category] ?? '🏪';
  const revenueRange = `${formatKRWShort(business.avg_monthly_revenue_min)} ~ ${formatKRWShort(business.avg_monthly_revenue_max)}`;
  const closureLabel = `1년 폐업률 ${Math.round(business.closure_rate_1yr * 100)}%`;

  return (
    <button
      className={styles.card}
      onClick={() => onSelect(business)}
      aria-label={`${business.name} 선택`}
    >
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.name}>{business.name}</span>
      <span className={styles.category}>{business.category}</span>
      <span className={styles.revenue}>{revenueRange}</span>
      <span className={styles.closure}>{closureLabel}</span>
    </button>
  );
}
```

## FILE: src/components/BusinessTypeCard/BusinessTypeCard.module.css
```css
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  text-align: left;
  width: 100%;
  transition: box-shadow 0.15s ease, transform 0.1s ease;
}

.card:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

.emoji {
  font-size: 28px;
  line-height: 1;
}

.name {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text);
}

.category {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  background: #EFF6FF;
  padding: 2px 8px;
  border-radius: 100px;
  font-weight: 600;
}

.revenue {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: var(--spacing-xs);
}

.closure {
  font-size: var(--font-size-xs);
  color: var(--color-danger);
  font-weight: 500;
}
```

---

## FILE: src/components/SliderInput/SliderInput.tsx
```tsx
import styles from './SliderInput.module.css';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

export function SliderInput({ label, value, min, max, step, format, onChange }: Props) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{format(value)}</span>
      </div>
      <div className={styles.track}>
        <input
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ '--fill-percent': `${percent}%` } as React.CSSProperties}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>
      <div className={styles.ticks}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
```

## FILE: src/components/SliderInput/SliderInput.module.css
```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 500;
}

.value {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-primary);
}

.track {
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) var(--fill-percent, 50%),
    var(--color-border) var(--fill-percent, 50%),
    var(--color-border) 100%
  );
  border-radius: 2px;
  outline: none;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px white, 0 0 0 5px var(--color-primary);
  cursor: pointer;
  transition: box-shadow 0.15s;
}

.ticks {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
```

---

## FILE: src/components/CashFlowChart/CashFlowChart.tsx
```tsx
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer
} from 'recharts';
import styles from './CashFlowChart.module.css';
import type { PaybackResult } from '../../types';
import { formatKRWShort } from '../../lib/format';

interface Props {
  payback: PaybackResult;
}

export function CashFlowChart({ payback }: Props) {
  const { cumulative_cashflow, payback_months } = payback;

  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={cumulative_cashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashFillPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3182F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3182F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E8EB" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickLine={false}
            label={{ value: '월', position: 'insideRight', offset: 10, fontSize: 11 }}
          />
          <YAxis
            tickFormatter={(v: number) => formatKRWShort(v)}
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip
            formatter={(v: number) => [formatKRWShort(v), '누적 현금흐름']}
            labelFormatter={(l: number) => `${l}개월째`}
          />
          <ReferenceLine y={0} stroke="#191F28" strokeWidth={1.5} />
          {payback_months !== null && (
            <ReferenceLine
              x={payback_months}
              stroke="#23C55E"
              strokeDasharray="4 4"
              label={{ value: `${payback_months}개월`, position: 'top', fontSize: 11, fill: '#23C55E' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3182F6"
            strokeWidth={2}
            fill="url(#cashFillPos)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## FILE: src/components/CashFlowChart/CashFlowChart.module.css
```css
.wrapper {
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  padding: var(--spacing-sm) 0;
}
```

---

## FILE: src/components/RegionSelector/RegionSelector.tsx
```tsx
import { useState } from 'react';
import styles from './RegionSelector.module.css';
import type { RentGuide } from '../../types';
import { formatKRWShort } from '../../lib/format';

interface Props {
  sidos: string[];
  getSigungus: (sido: string) => string[];
  getRent: (sido: string, sigungu: string) => RentGuide | undefined;
  scaleSqm: number;
  onSelect: (rent: { sido: string; sigungu: string; rent_per_sqm: number; monthly: number }) => void;
}

export function RegionSelector({ sidos, getSigungus, getRent, scaleSqm, onSelect }: Props) {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');

  const sigungus = sido ? getSigungus(sido) : [];
  const rentInfo = sido && sigungu ? getRent(sido, sigungu) : undefined;
  const monthlyRent = rentInfo ? Math.round(rentInfo.rent_per_sqm * scaleSqm) : null;

  const handleSido = (v: string) => {
    setSido(v);
    setSigungu('');
  };

  const handleSigungu = (v: string) => {
    setSigungu(v);
    const info = getRent(sido, v);
    if (info) {
      const monthly = Math.round(info.rent_per_sqm * scaleSqm);
      onSelect({ sido, sigungu: v, rent_per_sqm: info.rent_per_sqm, monthly });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.selects}>
        <select className={styles.select} value={sido} onChange={e => handleSido(e.target.value)}>
          <option value="">시/도 선택</option>
          {sidos.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={styles.select} value={sigungu} onChange={e => handleSigungu(e.target.value)} disabled={!sido}>
          <option value="">시/군/구 선택</option>
          {sigungus.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {monthlyRent !== null && (
        <div className={styles.guide}>
          <span className={styles.guideLabel}>월 임대료 가이던스</span>
          <span className={styles.guideValue}>~{formatKRWShort(monthlyRent)}</span>
          <span className={styles.guideSub}>
            ({scaleSqm}㎡ 기준, {sigungu} 평균 {rentInfo!.rent_per_sqm.toLocaleString()}원/㎡)
          </span>
        </div>
      )}
    </div>
  );
}
```

## FILE: src/components/RegionSelector/RegionSelector.module.css
```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.selects {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.select {
  padding: 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238B95A1' fill='none' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.select:disabled {
  opacity: 0.5;
}

.guide {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #F0F7FF;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-primary);
}

.guideLabel {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.guideValue {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-primary);
}

.guideSub {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}
```

---

## FILE: src/components/PnLDisplay/PnLDisplay.tsx
```tsx
import { useState } from 'react';
import styles from './PnLDisplay.module.css';
import type { MonthlyPnL, DailyPnL, PnLAnnotation, CostItem } from '../../types';
import { formatKRW } from '../../lib/format';

interface PnLRowProps {
  label: string;
  value: number;
  annotation?: string;
  highlight?: boolean;
  indent?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
}

function PnLRow({ label, value, annotation, highlight, indent, expandable, expanded, onToggle }: PnLRowProps) {
  return (
    <div className={styles.rowGroup}>
      <div
        className={`${styles.row} ${highlight ? styles.rowHighlight : ''} ${indent ? styles.rowIndent : ''} ${expandable ? styles.rowExpandable : ''}`}
        onClick={expandable ? onToggle : undefined}
      >
        <span className={styles.label}>
          {expandable && <span className={styles.chevron}>{expanded ? '▼' : '▶'}</span>}
          {label}
        </span>
        <span className={`${styles.value} ${value < 0 ? styles.negative : ''} ${highlight ? styles.highlightValue : ''}`}>
          {formatKRW(value)}
        </span>
      </div>
      {annotation && (
        <div className={styles.annotation}>{annotation}</div>
      )}
    </div>
  );
}

interface SGADetailProps {
  detail: MonthlyPnL['sga_detail'];
  costItems: CostItem[];
}

function SGADetail({ detail, costItems }: SGADetailProps) {
  const miscItems = costItems.filter(c => !c.is_initial_cost && c.cost_category !== 'labor' && c.cost_category !== 'rent');

  return (
    <div className={styles.sgaDetail}>
      <div className={styles.sgaRow}>
        <span>인건비 ({detail.labor_headcount}명)</span>
        <span>{formatKRW(-detail.labor)}</span>
      </div>
      <div className={styles.sgaRow}>
        <span>임대료</span>
        <span>{formatKRW(-detail.rent)}</span>
      </div>
      <div className={styles.sgaRow}>
        <span>기타 고정비</span>
        <span>{formatKRW(-detail.misc_fixed)}</span>
      </div>
      {miscItems.length > 0 && (
        <div className={styles.sgaMiscHint}>
          {miscItems.map(c => c.cost_name).join(', ')} 등
        </div>
      )}
    </div>
  );
}

interface Props {
  pnl: MonthlyPnL;
  daily: DailyPnL;
  annotations: PnLAnnotation;
  costItems: CostItem[];
  mode: 'daily' | 'monthly';
}

export function PnLDisplay({ pnl, daily, annotations, costItems, mode }: Props) {
  const [sgaExpanded, setSgaExpanded] = useState(false);

  if (mode === 'daily') {
    return (
      <div className={styles.card}>
        <PnLRow label="일 매출" value={daily.daily_revenue}
          annotation={`객단가 × 일 방문객`} />
        <PnLRow label="일 매출원가" value={-daily.daily_cogs} indent
          annotation={annotations.cogs} />
        <PnLRow label="일 매출총이익" value={daily.daily_gross_profit} highlight />
        <div className={styles.dailyNote}>
          고정비(인건비, 임대료 등)는 월손익 탭에서 확인하세요
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <PnLRow label="매출" value={pnl.revenue} annotation={annotations.revenue} />
      <PnLRow label="매출원가" value={-pnl.cogs} indent annotation={annotations.cogs} />
      <PnLRow label="매출총이익" value={pnl.gross_profit} />
      <PnLRow
        label="판관비"
        value={-pnl.sg_and_a}
        annotation={annotations.sga}
        expandable
        expanded={sgaExpanded}
        onToggle={() => setSgaExpanded(!sgaExpanded)}
      />
      {sgaExpanded && <SGADetail detail={pnl.sga_detail} costItems={costItems} />}
      <PnLRow label="영업이익" value={pnl.operating_profit} />
      <PnLRow label="이자비용" value={-pnl.interest_expense} indent annotation={annotations.interest} />
      <PnLRow label="세전이익" value={pnl.pretax_income} />
      <PnLRow label="세금" value={-pnl.tax} indent annotation={annotations.tax} />
      <PnLRow label="세후이익" value={pnl.net_income} />
      <PnLRow label="원금상환" value={-pnl.principal_repayment} indent annotation={annotations.principal} />
      <PnLRow label="월 실제 현금흐름" value={pnl.free_cash_flow} highlight />
    </div>
  );
}
```

## FILE: src/components/PnLDisplay/PnLDisplay.module.css
```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.rowGroup {
  border-bottom: 1px solid var(--color-border);
}
.rowGroup:last-child { border-bottom: none; }

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.rowHighlight {
  background: #F0F7FF;
  margin: 0 calc(-1 * var(--spacing-md));
  padding: 12px var(--spacing-md);
  border-radius: var(--radius-sm);
}

.rowIndent .label {
  padding-left: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.rowExpandable {
  cursor: pointer;
}
.rowExpandable:active {
  background: #f8f9fa;
  margin: 0 calc(-1 * var(--spacing-md));
  padding: 10px var(--spacing-md);
  border-radius: var(--radius-sm);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.value {
  font-size: var(--font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

.highlightValue {
  font-size: var(--font-size-lg);
  font-weight: 800;
  color: var(--color-primary);
}

.negative { color: var(--color-danger); }

.chevron {
  font-size: 10px;
  color: var(--color-text-secondary);
  transition: transform 0.15s;
}

.annotation {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: 0 0 8px var(--spacing-md);
  line-height: 1.4;
}

.sgaDetail {
  background: #f8f9fa;
  margin: 0 calc(-1 * var(--spacing-md));
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) calc(var(--spacing-md) * 2);
  border-top: 1px dashed var(--color-border);
}

.sgaRow {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: 4px 0;
}

.sgaMiscHint {
  font-size: 10px;
  color: var(--color-text-secondary);
  opacity: 0.7;
  padding-top: 4px;
  font-style: italic;
}

.dailyNote {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--spacing-md) 0 var(--spacing-sm);
  opacity: 0.7;
}
```

---

## FILE: src/pages/HomePage/HomePage.tsx
```tsx
import styles from './HomePage.module.css';
import { useBusinessTypes } from '../../hooks/useBusinessTypes';
import { BusinessTypeCard } from '../../components/BusinessTypeCard/BusinessTypeCard';
import type { BusinessType } from '../../types';

interface Props {
  onSelect: (bt: BusinessType) => void;
}

export function HomePage({ onSelect }: Props) {
  const { businessTypes, loading, error } = useBusinessTypes();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>자영업 수익 시뮬레이터</h1>
        <p className={styles.subtitle}>업종을 선택하면 수익성을 분석해드려요</p>
      </header>

      {loading && (
        <div className={styles.center}>
          <span className={styles.spinner} aria-label="로딩 중" />
          <p>데이터 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <p>데이터를 불러오지 못했어요.</p>
          <p className={styles.errorDetail}>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className={styles.grid}>
          {businessTypes.map(bt => (
            <BusinessTypeCard key={bt.id} business={bt} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## FILE: src/pages/HomePage/HomePage.module.css
```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: var(--spacing-lg) var(--spacing-md);
}

.header {
  margin-bottom: var(--spacing-lg);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--color-text);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: var(--spacing-md);
  color: var(--color-text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.errorBox {
  padding: var(--spacing-lg);
  background: #FFF0F0;
  border-radius: var(--radius-md);
  color: var(--color-danger);
  text-align: center;
}

.errorDetail {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}
```

---

## FILE: src/pages/InputPage/InputPage.tsx
```tsx
import styles from './InputPage.module.css';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import { RegionSelector } from '../../components/RegionSelector/RegionSelector';
import type { SimulatorInputs, BusinessScale, CapitalStructure, RentGuide } from '../../types';
import { formatKRWShort, formatPercent } from '../../lib/format';

interface Props {
  inputs: SimulatorInputs;
  rentGuide: {
    sidos: string[];
    getSigungus: (sido: string) => string[];
    getRent: (sido: string, sigungu: string) => RentGuide | undefined;
    loading: boolean;
  };
  onBack: () => void;
  onScale: (scale: BusinessScale) => void;
  onCapital: (capital: CapitalStructure) => void;
  onRentSelect: (rent: { sido: string; sigungu: string; rent_per_sqm: number; monthly: number }) => void;
  onCalculate: () => void;
}

const SCALE_LABELS: Record<BusinessScale, string> = {
  small: '소규모',
  medium: '중간',
  large: '대형',
};

export function InputPage({ inputs, rentGuide, onBack, onScale, onCapital, onRentSelect, onCalculate }: Props) {
  const { business_type: bt, scale, capital } = inputs;
  const debt = Math.max(0, capital.initial_investment - capital.equity);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          ←
        </button>
        <h2 className={styles.title}>{bt.name}</h2>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>규모 선택</h3>
        <div className={styles.scaleGroup}>
          {(['small', 'medium', 'large'] as BusinessScale[]).map(s => {
            const inv = s === 'small' ? bt.initial_investment_small
              : s === 'large' ? bt.initial_investment_large
              : bt.initial_investment_medium;
            const customers = s === 'small' ? bt.avg_daily_customers_small
              : s === 'large' ? bt.avg_daily_customers_large
              : bt.avg_daily_customers_medium;
            return (
              <button
                key={s}
                className={`${styles.scaleBtn} ${scale === s ? styles.scaleBtnActive : ''}`}
                onClick={() => onScale(s)}
              >
                <span className={styles.scaleName}>{SCALE_LABELS[s]}</span>
                <span className={styles.scaleDetail}>일 {customers}명</span>
                <span className={styles.scaleInvestment}>~{formatKRWShort(inv)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>지역 선택</h3>
        <RegionSelector
          sidos={rentGuide.sidos}
          getSigungus={rentGuide.getSigungus}
          getRent={rentGuide.getRent}
          scaleSqm={scale === 'small' ? 33 : scale === 'large' ? 66 : 50}
          onSelect={onRentSelect}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>자본 구조</h3>

        <SliderInput
          label="초기투자금"
          value={capital.initial_investment}
          min={bt.initial_investment_min}
          max={bt.initial_investment_max}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onCapital({ ...capital, initial_investment: v, equity: Math.min(capital.equity, v) })}
        />

        <SliderInput
          label="자기자본"
          value={capital.equity}
          min={0}
          max={capital.initial_investment}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onCapital({ ...capital, equity: v })}
        />

        <div className={styles.debtInfo}>
          <span className={styles.debtLabel}>타인자본 (대출)</span>
          <span className={styles.debtValue}>{formatKRWShort(debt)}</span>
        </div>

        <SliderInput
          label="금리"
          value={capital.interest_rate}
          min={0.02}
          max={0.12}
          step={0.005}
          format={v => formatPercent(v)}
          onChange={v => onCapital({ ...capital, interest_rate: v })}
        />

        <SliderInput
          label="대출기간"
          value={capital.loan_term_years}
          min={1}
          max={10}
          step={1}
          format={v => `${v}년`}
          onChange={v => onCapital({ ...capital, loan_term_years: v })}
        />
      </section>

      <div className={styles.footer}>
        <button className={styles.calcBtn} onClick={onCalculate}>
          계산하기
        </button>
      </div>
    </div>
  );
}
```

## FILE: src/pages/InputPage/InputPage.module.css
```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-bottom: 100px;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.backBtn {
  font-size: var(--font-size-xl);
  color: var(--color-text);
  padding: 0;
  line-height: 1;
  min-width: 32px;
}

.title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0;
}

.section {
  padding: var(--spacing-lg) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.sectionTitle {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 var(--spacing-md) 0;
}

.scaleGroup {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
}

.scaleBtn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-md) var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  transition: border-color 0.15s, background 0.15s;
}

.scaleBtnActive {
  border-color: var(--color-primary);
  background: #EFF6FF;
}

.scaleName {
  font-size: var(--font-size-sm);
  font-weight: 700;
}

.scaleDetail {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.debtInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-top: 1px dashed var(--color-border);
  margin-top: var(--spacing-sm);
}

.debtLabel {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.debtValue {
  font-size: var(--font-size-md);
  font-weight: 700;
  color: var(--color-danger);
}

.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  padding: var(--spacing-md);
  background: var(--color-surface);
  box-shadow: 0 -2px 12px rgba(0,0,0,0.08);
}

.calcBtn {
  width: 100%;
  padding: 18px;
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-lg);
  font-weight: 700;
  border-radius: var(--radius-md);
  transition: background 0.15s;
}

.calcBtn:active { background: var(--color-primary-dark); }

.scaleInvestment {
  font-size: var(--font-size-xs);
  color: var(--color-primary);
  font-weight: 600;
}
```

---

## FILE: src/pages/ResultPage/ResultPage.tsx
```tsx
import { useState, useCallback } from 'react';
import styles from './ResultPage.module.css';
import { CashFlowChart } from '../../components/CashFlowChart/CashFlowChart';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import { PnLDisplay } from '../../components/PnLDisplay/PnLDisplay';
import type { SimulationResult, SimulatorInputs, CostItem } from '../../types';
import { formatKRW, formatKRWShort, formatPercent, formatMonths } from '../../lib/format';

type Tab = 'daily' | 'monthly' | 'payback' | 'dcf';

interface Props {
  result: SimulationResult;
  costItems: CostItem[];
  onBack: () => void;
  onOverride: (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital'>, value: number) => void;
  onRecalculate: () => void;
}

export function ResultPage({ result, costItems, onBack, onOverride, onRecalculate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('monthly');
  const { pnl, daily, annotations, payback, dcf, inputs } = result;

  const handleOverrideAndRecalc = useCallback(
    (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital'>, value: number) => {
      onOverride(key, value);
      onRecalculate();
    },
    [onOverride, onRecalculate]
  );

  const TABS: { id: Tab; label: string }[] = [
    { id: 'daily', label: '일손익' },
    { id: 'monthly', label: '월손익' },
    { id: 'payback', label: '투자회수' },
    { id: 'dcf', label: '사업체가치' },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">←</button>
        <h2 className={styles.title}>{inputs.business_type.name} 분석 결과</h2>
      </header>

      <nav className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.content} role="tabpanel">
        {activeTab === 'daily' && (
          <div className={styles.pnlSection}>
            <PnLDisplay
              pnl={pnl}
              daily={daily}
              annotations={annotations}
              costItems={costItems}
              mode="daily"
            />
          </div>
        )}

        {activeTab === 'monthly' && (
          <div className={styles.pnlSection}>
            <PnLDisplay
              pnl={pnl}
              daily={daily}
              annotations={annotations}
              costItems={costItems}
              mode="monthly"
            />
            <div className={styles.sliderSection}>
              <p className={styles.sliderHint}>슬라이더로 수치를 조정해보세요</p>
              <SliderInput
                label="일 방문객 수"
                value={inputs.daily_customers_override ?? (
                  inputs.scale === 'small' ? inputs.business_type.avg_daily_customers_small :
                  inputs.scale === 'large' ? inputs.business_type.avg_daily_customers_large :
                  inputs.business_type.avg_daily_customers_medium
                )}
                min={5}
                max={300}
                step={5}
                format={v => `${v}명`}
                onChange={v => handleOverrideAndRecalc('daily_customers_override', v)}
              />
              <SliderInput
                label="객단가"
                value={inputs.ticket_price_override ?? inputs.business_type.avg_ticket_price}
                min={1000}
                max={100_000}
                step={1000}
                format={formatKRW}
                onChange={v => handleOverrideAndRecalc('ticket_price_override', v)}
              />
              <SliderInput
                label="월 임대료"
                value={inputs.rent_monthly ?? 0}
                min={0}
                max={5_000_000}
                step={100_000}
                format={formatKRWShort}
                onChange={v => handleOverrideAndRecalc('rent_monthly', v)}
              />
            </div>
          </div>
        )}

        {activeTab === 'payback' && (
          <div className={styles.paybackSection}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>투자회수기간</p>
              <p className={styles.summaryValue}>{formatMonths(payback.payback_months)}</p>
              <p className={styles.summarySubtext}>초기투자금 {formatKRWShort(inputs.capital.initial_investment)}</p>
            </div>
            <CashFlowChart payback={payback} />
          </div>
        )}

        {activeTab === 'dcf' && (
          <div className={styles.dcfSection}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>사업체 추정 가치</p>
              <p className={styles.summaryValue}>{formatKRWShort(dcf.business_value)}</p>
              <p className={styles.summarySubtext}>연 FCF {formatKRWShort(dcf.fcf_annual)}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.dcfRow}>
                <span>할인율</span>
                <span>{formatPercent(dcf.discount_rate)}</span>
              </div>
              <div className={styles.dcfRow}>
                <span>성장률</span>
                <span>{formatPercent(dcf.growth_rate)}</span>
              </div>
            </div>

            <div className={styles.sliderSection}>
              <SliderInput
                label="할인율"
                value={inputs.discount_rate ?? 0.15}
                min={0.05}
                max={0.30}
                step={0.01}
                format={v => formatPercent(v)}
                onChange={v => handleOverrideAndRecalc('discount_rate', v)}
              />
              <SliderInput
                label="성장률"
                value={inputs.growth_rate ?? 0.00}
                min={-0.05}
                max={0.10}
                step={0.01}
                format={v => formatPercent(v)}
                onChange={v => handleOverrideAndRecalc('growth_rate', v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## FILE: src/pages/ResultPage/ResultPage.module.css
```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 10;
}

.backBtn {
  font-size: var(--font-size-xl);
  color: var(--color-text);
  padding: 0;
  line-height: 1;
  min-width: 32px;
}

.title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0;
}

.tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 57px;
  z-index: 9;
}

.tab {
  padding: var(--spacing-md) 0;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.tabActive {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.content {
  padding: var(--spacing-md);
  flex: 1;
}

.pnlSection, .paybackSection, .dcfSection {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.pnlRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
}

.pnlRow:last-child { border-bottom: none; }

.pnlRowHighlight {
  background: #F0F7FF;
  margin: 0 calc(-1 * var(--spacing-md));
  padding: 12px var(--spacing-md);
  border-radius: var(--radius-sm);
  border: none;
}

.pnlRowIndent .pnlLabel {
  padding-left: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.pnlLabel { font-size: var(--font-size-sm); font-weight: 500; }
.pnlValue { font-size: var(--font-size-sm); font-weight: 600; }
.highlightValue { font-size: var(--font-size-lg); font-weight: 800; color: var(--color-primary); }
.negative { color: var(--color-danger); }

.summaryCard {
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  color: white;
}

.summaryLabel {
  font-size: var(--font-size-sm);
  opacity: 0.85;
  margin: 0 0 var(--spacing-sm) 0;
}

.summaryValue {
  font-size: var(--font-size-2xl);
  font-weight: 800;
  margin: 0 0 var(--spacing-sm) 0;
}

.summarySubtext {
  font-size: var(--font-size-sm);
  opacity: 0.7;
  margin: 0;
}

.dcfRow {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}

.dcfRow:last-child { border-bottom: none; }

.sliderSection {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.sliderHint {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-md) 0;
  text-align: center;
}
```
