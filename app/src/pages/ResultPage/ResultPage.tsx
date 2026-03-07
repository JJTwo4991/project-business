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
  onOverride: (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region'>, value: number) => void;
  onRecalculate: () => void;
}

export function ResultPage({ result, costItems, onBack, onOverride, onRecalculate }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('monthly');
  const { pnl, daily, annotations, payback, dcf, inputs } = result;

  const handleOverrideAndRecalc = useCallback(
    (key: keyof Omit<SimulatorInputs, 'business_type' | 'scale' | 'capital' | 'region'>, value: number) => {
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
              <p className={styles.summaryValue}>{dcf.business_value !== null ? formatKRWShort(dcf.business_value) : '산정 불가'}</p>
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
