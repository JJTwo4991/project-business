import { useState } from 'react';
import styles from './PnLDisplay.module.css';
import type { MonthlyPnL, DailyPnL, PnLAnnotation } from '../../types';
import { formatKRW, formatKRWShort } from '../../lib/format';

interface PnLRowProps {
  label: string;
  value: number;
  annotation?: string;
  highlight?: boolean;
  indent?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  marginPct?: number; // 이익률 표시 (optional)
}

function PnLRow({ label, value, annotation, highlight, indent, expandable, expanded, onToggle, marginPct }: PnLRowProps) {
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
          {marginPct !== undefined && (
            <span className={styles.marginPct}>
              {` (${marginPct >= 0 ? '' : ''}${marginPct.toFixed(1)}%)`}
            </span>
          )}
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
  revenue: number;
}

function SGADetailRow({ label, value, annotation }: { label: string; value: number; annotation: string }) {
  return (
    <div className={styles.sgaRow}>
      <div className={styles.sgaRowMain}>
        <span>{label}</span>
        <span>{formatKRW(-value)}</span>
      </div>
      <div className={styles.sgaRowAnnotation}>{annotation}</div>
    </div>
  );
}

function SGADetailView({ detail, revenue }: SGADetailProps) {
  const perPerson = detail.labor_headcount > 0
    ? Math.round(detail.labor / detail.labor_headcount)
    : detail.labor;
  const deliveryPercent = revenue > 0
    ? Math.round((detail.delivery_commission / revenue) * 100)
    : 0;

  return (
    <div className={styles.sgaDetail}>
      <div className={styles.sgaGroupLabel}>고정비</div>
      <SGADetailRow
        label={`인건비 (${detail.labor_headcount}명)`}
        value={detail.labor}
        annotation={`${detail.labor_headcount}명 × ${formatKRWShort(perPerson)}/월 (2025 최저임금+4대보험 기준)`}
      />
      {detail.rent > 0 && (
        <SGADetailRow
          label="임대료"
          value={detail.rent}
          annotation="사용자 설정 금액"
        />
      )}
      {detail.utilities > 0 && (
        <SGADetailRow
          label="공과금"
          value={detail.utilities}
          annotation="업종별 평균 (한국전력공사 2024 상업용 전기요금 기준)"
        />
      )}
      {detail.other_fixed > 0 && (
        <SGADetailRow
          label="기타고정비"
          value={detail.other_fixed}
          annotation="소모품·위생용품·보험료 등 (업종별 평균 추정)"
        />
      )}
      {detail.contingency > 0 && (
        <SGADetailRow
          label="예비비"
          value={detail.contingency}
          annotation="월 매출의 5% (불확실성 대비)"
        />
      )}
      {(detail.delivery_commission > 0 || detail.royalty > 0 || detail.advertising_fund > 0 || detail.other_franchise_fees > 0) && (
        <>
          <div className={styles.sgaGroupLabel}>변동비</div>
          {detail.delivery_commission > 0 && (
            <SGADetailRow
              label="배달앱 수수료"
              value={detail.delivery_commission}
              annotation={`매출의 약 ${deliveryPercent}% (배달앱 평균 수수료율)`}
            />
          )}
          {detail.royalty > 0 && (
            <SGADetailRow
              label="상표사용료"
              value={detail.royalty}
              annotation={`매출의 ${(detail.royalty / revenue * 100).toFixed(1)}% (가맹본부 로열티)`}
            />
          )}
          {detail.advertising_fund > 0 && (
            <SGADetailRow
              label="광고분담금"
              value={detail.advertising_fund}
              annotation={`매출의 ${(detail.advertising_fund / revenue * 100).toFixed(1)}% (가맹본부 광고비)`}
            />
          )}
          {detail.other_franchise_fees > 0 && (
            <SGADetailRow
              label="기타 수수료"
              value={detail.other_franchise_fees}
              annotation="가맹본부 기타 수수료"
            />
          )}
        </>
      )}
    </div>
  );
}

interface Props {
  pnl: MonthlyPnL;
  daily: DailyPnL;
  annotations: PnLAnnotation;
  mode: 'daily' | 'monthly';
}

function buildSgaSummary(detail: MonthlyPnL['sga_detail']): string {
  const parts: string[] = [];
  const man = (v: number) => `${Math.round(v / 10000)}만`;
  if (detail.labor > 0) parts.push(`인건비 ${detail.labor_headcount}명×${man(detail.labor / detail.labor_headcount)}`);
  if (detail.rent > 0) parts.push(`임대료 ${man(detail.rent)}원`);
  if (detail.utilities > 0) parts.push(`공과금 ${man(detail.utilities)}원`);
  if (detail.other_fixed > 0) parts.push(`기타 ${man(detail.other_fixed)}원`);
  if (detail.contingency > 0) parts.push(`예비비 ${man(detail.contingency)}원`);
  if (detail.delivery_commission > 0) parts.push(`배달수수료 ${man(detail.delivery_commission)}원`);
  if (detail.royalty > 0) parts.push(`상표사용료 ${man(detail.royalty)}원`);
  if (detail.advertising_fund > 0) parts.push(`광고분담금 ${man(detail.advertising_fund)}원`);
  if (detail.other_franchise_fees > 0) parts.push(`기타수수료 ${man(detail.other_franchise_fees)}원`);
  return parts.join(' + ');
}

export function PnLDisplay({ pnl, daily, annotations, mode }: Props) {
  const [sgaExpanded, setSgaExpanded] = useState(false);

  if (mode === 'daily') {
    return (
      <div className={styles.card}>
        <PnLRow label="일 매출" value={daily.daily_revenue}
          annotation={`객단가 × 일 방문객`} />
        <PnLRow label="일 재료비" value={-daily.daily_cogs} indent
          annotation={annotations.cogs} />
        <PnLRow label="일 매출총이익" value={daily.daily_gross_profit} highlight />
        <div className={styles.dailyNote}>
          고정비(인건비, 임대료 등)는 월손익 탭에서 확인하세요
        </div>
      </div>
    );
  }

  const sgaSummary = buildSgaSummary(pnl.sga_detail);

  return (
    <div className={styles.card}>
      <PnLRow label="매출" value={pnl.revenue} annotation={annotations.revenue} />
      <PnLRow label="재료비" value={-pnl.cogs} indent annotation={annotations.cogs} />
      <PnLRow label="매출총이익" value={pnl.gross_profit} />
      <PnLRow
        label="판매관리비"
        value={-pnl.sg_and_a}
        annotation={sgaSummary}
        expandable
        expanded={sgaExpanded}
        onToggle={() => setSgaExpanded(!sgaExpanded)}
      />
      {sgaExpanded && <SGADetailView detail={pnl.sga_detail} revenue={pnl.revenue} />}
      <PnLRow
        label="영업이익"
        value={pnl.operating_profit}
        marginPct={pnl.revenue > 0 ? pnl.operating_profit / pnl.revenue * 100 : 0}
      />
      <PnLRow label="이자비용" value={-pnl.interest_expense} indent annotation={annotations.interest} />
      <PnLRow label="세금" value={-pnl.tax} indent annotation={annotations.tax} />
      <PnLRow
        label="당기순이익"
        value={pnl.net_income}
        highlight
        marginPct={pnl.revenue > 0 ? pnl.net_income / pnl.revenue * 100 : 0}
      />
      <PnLRow label="원금상환" value={-pnl.principal_repayment} indent annotation={annotations.principal} />
      <PnLRow label="월 실제 현금흐름" value={pnl.free_cash_flow} highlight />
    </div>
  );
}
