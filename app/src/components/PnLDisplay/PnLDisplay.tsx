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
