import { useState, useCallback } from 'react';
import styles from './ResultPage.module.css';
import { CashFlowChart } from '../../components/CashFlowChart/CashFlowChart';
import { PnLDisplay } from '../../components/PnLDisplay/PnLDisplay';
import type { SimulationResult, StepId } from '../../types';
import { formatKRWShort, formatPercent, formatMonths } from '../../lib/format';
import {
  calcScenarioDailyPnL,
  calcScenarioMonthlyPnL,
  calcScenarioPayback,
  resolveBusinessParams,
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

function DataSourcesSection({ businessType }: { businessType: { id: number; name: string; data_sources?: string[] } }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen(v => !v), []);

  const sources = [
    { label: '비용 구조 (기타영업비용)', value: '외식업체 경영실태조사 2024 (한국농촌경제연구원, KREI 2025년 제6호 p.2)' },
    { label: '기타영업비용 교차검증', value: '소상공인실태조사 2023 (중소벤처기업부 p.89)' },
    { label: '종합소득세', value: '2025년 종합소득세 8단계 누진세율 (국세청)' },
    { label: '부가세', value: '매출총이익 × 10/110 (B2C 일반과세자 기준)' },
    { label: '재료비율', value: `업종 기본값 × 1.1 (소상공인 보수적 가산, AI 추정치)` },
    { label: '배달앱 수수료', value: '배달의민족·요기요 평균 중개수수료율 기반 (AI 추정치)' },
    { label: '프랜차이즈 비용', value: '공정거래위원회 가맹사업정보공개서 2024년' },
    { label: '임대료', value: '한국부동산원 상업용부동산 임대동향조사 2025Q4' },
    { label: '업종 기본값', value: businessType.data_sources?.join(', ') ?? 'AI 추정치' },
  ];

  return (
    <div className={styles.sourcesSection}>
      <button className={styles.sourcesToggle} onClick={toggle}>
        {open ? '▼' : '▶'} 데이터 출처
      </button>
      {open && (
        <div className={styles.sourcesList}>
          {sources.map((s, i) => (
            <div key={i} className={styles.sourceItem}>
              <span className={styles.sourceLabel}>{s.label}</span>
              <span className={styles.sourceValue}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DisclaimerSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.disclaimerCard}>
      <div className={styles.disclaimerHeader}>
        <span className={styles.disclaimerIcon}>⚠️</span>
        <span className={styles.disclaimerTitle}>시뮬레이션 결과 안내</span>
      </div>
      <p className={styles.disclaimerMain}>
        본 결과는 <strong>AI 기반 추정치</strong>이며, 실제 창업 시 수익을 보장하지 않습니다. 투자 의사결정의 근거로 사용할 수 없습니다.
      </p>
      <button
        className={styles.disclaimerToggle}
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? '접기' : '면책 조항 전문 보기'}
      </button>
      {expanded && (
        <div className={styles.disclaimerFull}>
          <p>1. 본 시뮬레이션의 모든 수치(매출, 비용, 손익, 투자회수기간, 사업체 가치 등)는 통계 데이터와 AI 추정치를 기반으로 산출한 <strong>참고용 예측값</strong>이며, 실제 영업 결과와 상이할 수 있습니다.</p>
          <p>2. 객단가, 일 방문객 수, 원가율 등 핵심 변수는 공식 통계가 아닌 <strong>AI 추정치</strong>를 포함하고 있으며, 실제 값은 입지, 경쟁 환경, 운영 역량, 시장 변동 등에 따라 크게 달라질 수 있습니다.</p>
          <p>3. 본 서비스는 <strong>정보 제공 목적</strong>으로만 제작되었으며, 재무·투자·법률·세무 자문을 대체하지 않습니다. 실제 창업 및 투자 결정 시 반드시 전문가와 상담하시기 바랍니다.</p>
          <p>4. 세금 계산(종합소득세, 부가세)은 간이 추정이며 개인별 공제, 감면, 신고 방식에 따라 실제 세액과 차이가 있을 수 있습니다. 정확한 세금은 세무사에게 문의하세요.</p>
          <p>5. 서비스 제공자는 본 시뮬레이션 결과를 근거로 한 <strong>어떠한 경제적 손실에 대해서도 책임을 지지 않습니다.</strong></p>
        </div>
      )}
    </div>
  );
}

export function ResultPage({ result, view, onBack, onNext, onGoTo }: Props) {
  const { annotations, payback, dcf, inputs } = result;
  const [scenario, setScenario] = useState<ScenarioType>('base');
  const cogsLabel = inputs.business_type.id === 3 ? '상품 원가' : undefined;
  const materialCostRatio = resolveBusinessParams(inputs).material_cost_ratio;

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
              cogsLabel={cogsLabel}
              materialCostRatio={materialCostRatio}
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
              cogsLabel={cogsLabel}
              materialCostRatio={materialCostRatio}
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

            <p className={styles.dcfNote}>
              인테리어, 비품 승계 등에 따라 실제 권리금은 달라질 수 있습니다
            </p>
          </div>
        )}

        <DisclaimerSection />
        <DataSourcesSection businessType={inputs.business_type} />
      </div>

      {!isLastResult && (
        <button className={styles.nextBtn} onClick={onNext}>
          {view === 'result-monthly' ? '원금회수기간 계산' : '다음'}
        </button>
      )}
    </div>
  );
}
