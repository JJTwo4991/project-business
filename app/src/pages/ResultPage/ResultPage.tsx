import { useState } from 'react';
import styles from './ResultPage.module.css';
import { CashFlowChart } from '../../components/CashFlowChart/CashFlowChart';
import { PnLDisplay } from '../../components/PnLDisplay/PnLDisplay';
import type { SimulationResult, StepId } from '../../types';
import { formatKRWShort, formatPercent, formatMonths } from '../../lib/format';
import {
  calcScenarioDailyPnL,
  calcScenarioMonthlyPnL,
  calcScenarioPayback,
  type ScenarioType,
} from '../../lib/calculator';

type ResultView = 'result-daily' | 'result-monthly' | 'result-payback' | 'result-dcf';

const TITLES: Record<ResultView, string> = {
  'result-daily': '일 손익',
  'result-monthly': '월 손익',
  'result-payback': '투자회수기간',
  'result-dcf': '권리금 (사업체 추정 가치)',
};

const SCENARIO_DESCS: Record<ScenarioType, string> = {
  high: '예상보다 더 잘 됐을 때',
  base: '사장님의 예측이 딱 맞을 경우',
  low: '안전 제일. 예상보다 장사가 안 되는 경우',
};

interface Props {
  result: SimulationResult;
  view: ResultView;
  onBack: () => void;
  onNext: () => void;
  onGoTo: (step: StepId) => void;
}

function ScenarioTabs({ scenario, onChange }: { scenario: ScenarioType; onChange: (s: ScenarioType) => void }) {
  return (
    <div className={styles.scenarioTabs}>
      <button
        className={`${styles.scenarioTab} ${scenario === 'high' ? styles.scenarioTabActive : ''}`}
        onClick={() => onChange('high')}
      >
        📈 High
      </button>
      <button
        className={`${styles.scenarioTab} ${scenario === 'base' ? styles.scenarioTabActive : ''}`}
        onClick={() => onChange('base')}
      >
        😎 Base
      </button>
      <button
        className={`${styles.scenarioTab} ${scenario === 'low' ? styles.scenarioTabActive : ''}`}
        onClick={() => onChange('low')}
      >
        🛡️ Low
      </button>
    </div>
  );
}

export function ResultPage({ result, view, onBack, onNext, onGoTo }: Props) {
  const { annotations, payback, dcf, inputs } = result;
  const [scenario, setScenario] = useState<ScenarioType>('base');

  const isLastResult = view === 'result-dcf';

  const scenarioDaily = calcScenarioDailyPnL(inputs, scenario);
  const scenarioPnl = calcScenarioMonthlyPnL(inputs, scenario);
  const scenarioPaybackBase = calcScenarioPayback(inputs, 'base');
  const scenarioPaybackHigh = calcScenarioPayback(inputs, 'high');
  const scenarioPaybackLow = calcScenarioPayback(inputs, 'low');

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">←</button>
        <h2 className={styles.title}>{TITLES[view]}</h2>
      </header>

      <div className={styles.content}>
        {view === 'result-daily' && (
          <div className={styles.pnlSection}>
            <ScenarioTabs scenario={scenario} onChange={setScenario} />
            <p className={styles.scenarioDesc}>{SCENARIO_DESCS[scenario]}</p>
            <PnLDisplay
              pnl={scenarioPnl}
              daily={scenarioDaily}
              annotations={annotations}
              mode="daily"
            />
          </div>
        )}

        {view === 'result-monthly' && (
          <div className={styles.pnlSection}>
            <ScenarioTabs scenario={scenario} onChange={setScenario} />
            <p className={styles.scenarioDesc}>{SCENARIO_DESCS[scenario]}</p>
            <PnLDisplay
              pnl={scenarioPnl}
              daily={scenarioDaily}
              annotations={annotations}
              mode="monthly"
            />
            <button
              className={styles.editBtn}
              onClick={() => onGoTo('confirm')}
            >
              수정하기
            </button>
          </div>
        )}

        {view === 'result-payback' && (
          <div className={styles.paybackSection}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>투자회수기간 (Base)</p>
              <p className={styles.summaryValue}>{formatMonths(payback.payback_months)}</p>
              <p className={styles.summarySubtext}>초기투자금 {formatKRWShort(inputs.capital.initial_investment)}</p>
            </div>
            <CashFlowChart
              payback={scenarioPaybackBase}
              highPayback={scenarioPaybackHigh}
              lowPayback={scenarioPaybackLow}
            />
          </div>
        )}

        {view === 'result-dcf' && (
          <div className={styles.dcfSection}>
            <div className={styles.summaryCard}>
              <p className={styles.summaryLabel}>권리금 (사업체 추정 가치)</p>
              {dcf.business_value !== null ? (
                <>
                  <p className={styles.summaryValue}>
                    추정 권리금: ~{formatKRWShort(dcf.business_value)}
                  </p>
                  <p className={styles.summarySubtext}>
                    ({formatKRWShort(dcf.business_value * 0.9)} ~ {formatKRWShort(dcf.business_value * 1.1)})
                  </p>
                </>
              ) : (
                <p className={styles.summaryValue}>산정 불가</p>
              )}
              <p className={styles.summarySubtext}>연 FCF {formatKRWShort(dcf.fcf_annual)}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.dcfRow}>
                <span>사업 가치 할인율</span>
                <span>{formatPercent(dcf.discount_rate)}</span>
              </div>
              <div className={styles.dcfRow}>
                <span>연간 매출 성장률</span>
                <span>{formatPercent(dcf.growth_rate)}</span>
              </div>
            </div>

            <div className={styles.disclaimer}>
              인테리어, 비품 승계 등에 따라 실제 권리금은 달라질 수 있습니다
            </div>
          </div>
        )}

        <div className={styles.disclaimer}>
          본 시뮬레이션은 참고용이며, 부가가치세(VAT)는 반영되지 않았습니다.
          실제 수익은 입지, 경쟁, 운영 역량 등에 따라 크게 달라질 수 있습니다.
        </div>
      </div>

      {!isLastResult && (
        <button className={styles.nextBtn} onClick={onNext}>
          {view === 'result-monthly' ? '원금회수기간 계산' : '다음'}
        </button>
      )}
    </div>
  );
}
