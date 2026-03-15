import { useState, useMemo } from 'react';
import styles from './PnLDisplay.module.css';
import type { MonthlyPnL, DailyPnL, PnLAnnotation } from '../../types';
import { formatKRW, formatKRWShort } from '../../lib/format';
import { calcTotalTax } from '../../lib/tax';

interface PnLRowProps {
  label: string;
  value: number;
  annotation?: string;
  highlight?: boolean;
  indent?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  marginPct?: number;
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

interface ExtraCost {
  name: string;
  amount: number;
}

interface SGADetailProps {
  detail: MonthlyPnL['sga_detail'];
  revenue: number;
  extraCosts: ExtraCost[];
  onAddExtra: () => void;
  onUpdateExtra: (idx: number, cost: ExtraCost) => void;
  onRemoveExtra: (idx: number) => void;
}

function SGADetailView({ detail, revenue, extraCosts, onAddExtra, onUpdateExtra, onRemoveExtra }: SGADetailProps) {
  const perPerson = detail.labor_headcount > 0
    ? Math.round(detail.labor / detail.labor_headcount)
    : detail.labor;
  const deliveryPercentRaw = revenue > 0
    ? (detail.delivery_commission / revenue) * 100
    : 0;
  const deliveryPercent = deliveryPercentRaw < 5
    ? deliveryPercentRaw.toFixed(1)
    : Math.round(deliveryPercentRaw);
  const deliveryNote = deliveryPercentRaw <= 1.5
    ? ' (전체 주문 중 10%는 배달로 가정)'
    : deliveryPercentRaw <= 4
    ? ' (전체 주문 중 1/3이 배달로 가정)'
    : '';

  const miscPercent = Math.round(detail.misc_rate * 100);

  return (
    <div className={styles.sgaDetail}>
      <div className={styles.sgaGroupLabel}>고정비</div>
      <SGADetailRow
        label={`인건비 (${Math.round(detail.labor_headcount)}명)`}
        value={detail.labor}
        annotation={`${Math.round(detail.labor_headcount)}명 × ${formatKRWShort(perPerson)}/월 (2025 최저임금+4대보험 기준)`}
      />
      {detail.rent > 0 && (
        <SGADetailRow
          label="임대료"
          value={detail.rent}
          annotation="사용자 설정 금액"
        />
      )}

      <div className={styles.sgaGroupLabel}>변동비</div>
      <SGADetailRow
        label="기타 영업비용"
        value={detail.misc_operating}
        annotation={`매출의 ${miscPercent}% (공과금·보험료·소모품비 등, 소상공인실태조사 2023 기준)`}
      />
      {detail.delivery_commission > 0 && (
        <SGADetailRow
          label="배달앱 수수료"
          value={detail.delivery_commission}
          annotation={`매출의 ${deliveryPercent}%${deliveryNote}`}
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

      {extraCosts.map((ec, i) => (
        <div key={i} className={styles.extraCostRow}>
          <div className={styles.extraCostInputs}>
            <input
              type="text"
              className={styles.extraCostName}
              value={ec.name}
              placeholder="비용명"
              onChange={e => onUpdateExtra(i, { ...ec, name: e.target.value })}
            />
            <input
              type="text"
              inputMode="numeric"
              className={styles.extraCostAmount}
              value={ec.amount > 0 ? ec.amount.toLocaleString('ko-KR') : ''}
              placeholder="금액"
              onChange={e => {
                const v = Number(e.target.value.replace(/,/g, ''));
                if (!Number.isNaN(v)) onUpdateExtra(i, { ...ec, amount: v });
              }}
            />
            <button className={styles.extraCostRemove} onClick={() => onRemoveExtra(i)}>✕</button>
          </div>
          {ec.amount > 0 && (
            <div className={styles.sgaRowAnnotation}>{formatKRWShort(ec.amount)}/월</div>
          )}
        </div>
      ))}

      <button className={styles.addCostBtn} onClick={onAddExtra}>
        (+) 비용 추가하기
      </button>
    </div>
  );
}

interface Props {
  pnl: MonthlyPnL;
  daily: DailyPnL;
  annotations: PnLAnnotation;
  mode: 'daily' | 'monthly';
  cogsLabel?: string;
  materialCostRatio?: number;
}

function buildSgaSummary(detail: MonthlyPnL['sga_detail'], extraTotal: number): string {
  const parts: string[] = [];
  const man = (v: number) => `${Math.round(v / 10000)}만`;
  if (detail.labor > 0) parts.push(`인건비 ${Math.round(detail.labor_headcount)}명×${man(detail.labor / detail.labor_headcount)}`);
  if (detail.rent > 0) parts.push(`임대료 ${man(detail.rent)}원`);
  if (detail.misc_operating > 0) parts.push(`기타영업비용 ${man(detail.misc_operating)}원`);
  if (detail.delivery_commission > 0) parts.push(`배달수수료 ${man(detail.delivery_commission)}원`);
  if (detail.royalty > 0) parts.push(`상표사용료 ${man(detail.royalty)}원`);
  if (detail.advertising_fund > 0) parts.push(`광고분담금 ${man(detail.advertising_fund)}원`);
  if (detail.other_franchise_fees > 0) parts.push(`기타수수료 ${man(detail.other_franchise_fees)}원`);
  if (extraTotal > 0) parts.push(`추가비용 ${man(extraTotal)}원`);
  return parts.join(' + ');
}

export function PnLDisplay({ pnl, daily, annotations, mode, cogsLabel, materialCostRatio }: Props) {
  const costLabel = cogsLabel ?? '재료비';
  const [sgaExpanded, setSgaExpanded] = useState(false);
  const [extraCosts, setExtraCosts] = useState<ExtraCost[]>([]);
  const [costRatioOverride, setCostRatioOverride] = useState<number | null>(null);
  const [editingRatio, setEditingRatio] = useState(false);

  const extraTotal = extraCosts.reduce((s, c) => s + c.amount, 0);
  const effectiveRatio = costRatioOverride ?? materialCostRatio;

  // 재료비율 + 추가비용 반영 실시간 재계산
  const adjusted = useMemo(() => {
    const cogs = effectiveRatio != null
      ? Math.round(pnl.revenue * effectiveRatio)
      : pnl.cogs;
    const gross_profit = pnl.revenue - cogs;
    const sg_and_a = pnl.sg_and_a + extraTotal;
    const operating_profit = gross_profit - sg_and_a;
    const pretax_income = operating_profit - pnl.interest_expense;
    const vat = Math.round(gross_profit * 10 / 110);
    const tax = calcTotalTax(pretax_income);
    const net_income = pretax_income - vat - tax;
    const free_cash_flow = net_income - pnl.principal_repayment;
    return { cogs, gross_profit, sg_and_a, operating_profit, pretax_income, vat, tax, net_income, free_cash_flow };
  }, [pnl, extraTotal, effectiveRatio]);

  if (mode === 'daily') {
    return (
      <div className={styles.card}>
        <PnLRow label="일 매출" value={daily.daily_revenue}
          annotation={`객단가 × 일 방문객`} />
        <PnLRow label={`일 ${costLabel}`} value={-daily.daily_cogs} indent
          annotation={annotations.cogs} />
        <PnLRow label="일 매출총이익" value={daily.daily_gross_profit} highlight />
        <div className={styles.dailyNote}>
          고정비(인건비, 임대료 등)는 월손익 탭에서 확인하세요
        </div>
      </div>
    );
  }

  const sgaSummary = buildSgaSummary(pnl.sga_detail, extraTotal);

  return (
    <div className={styles.card}>
      <PnLRow label="매출" value={pnl.revenue} annotation={annotations.revenue} />
      <PnLRow label={costLabel} value={-adjusted.cogs} indent />
      {effectiveRatio != null && (
        <div className={styles.cogsAnnotation}>
          <div className={styles.cogsRatioLine}>
            {costLabel}율{' '}
            {editingRatio ? (
              <input
                type="text"
                inputMode="numeric"
                className={styles.ratioInput}
                value={Math.round(effectiveRatio * 100)}
                autoFocus
                onBlur={() => setEditingRatio(false)}
                onChange={e => {
                  const v = Number(e.target.value.replace(/[^0-9]/g, ''));
                  if (!Number.isNaN(v) && v >= 0 && v <= 99) setCostRatioOverride(v / 100);
                }}
              />
            ) : (
              <strong>{Math.round(effectiveRatio * 100)}%</strong>
            )}
            {' '}적용
            {!editingRatio && (
              <button className={styles.ratioEditBtn} onClick={() => setEditingRatio(true)}>
                수정하기
              </button>
            )}
          </div>
          <div className={styles.cogsSource}>{annotations.cogs}</div>
        </div>
      )}
      <PnLRow label="매출총이익" value={adjusted.gross_profit} />
      <PnLRow
        label="판매관리비"
        value={-adjusted.sg_and_a}
        annotation={sgaSummary}
        expandable
        expanded={sgaExpanded}
        onToggle={() => setSgaExpanded(!sgaExpanded)}
      />
      {sgaExpanded && (
        <SGADetailView
          detail={pnl.sga_detail}
          revenue={pnl.revenue}
          extraCosts={extraCosts}
          onAddExtra={() => setExtraCosts(prev => [...prev, { name: '', amount: 0 }])}
          onUpdateExtra={(i, c) => setExtraCosts(prev => prev.map((ec, j) => j === i ? c : ec))}
          onRemoveExtra={(i) => setExtraCosts(prev => prev.filter((_, j) => j !== i))}
        />
      )}
      <PnLRow
        label="영업이익"
        value={adjusted.operating_profit}
        marginPct={pnl.revenue > 0 ? adjusted.operating_profit / pnl.revenue * 100 : 0}
      />
      <PnLRow label="이자비용" value={-pnl.interest_expense} indent annotation={annotations.interest} />
      <PnLRow label="부가세" value={-adjusted.vat} indent annotation="매출총이익 × 10/110 (B2C 일반과세자 기준)" />
      <PnLRow label="종합소득세" value={-adjusted.tax} indent annotation={annotations.tax} />
      <PnLRow
        label="당기순이익"
        value={adjusted.net_income}
        highlight
        marginPct={pnl.revenue > 0 ? adjusted.net_income / pnl.revenue * 100 : 0}
      />
      <PnLRow label="원금상환" value={-pnl.principal_repayment} indent annotation={annotations.principal} />
      <PnLRow label="월 실제 현금흐름" value={adjusted.free_cash_flow} highlight />
    </div>
  );
}
