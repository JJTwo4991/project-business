import { useState, useCallback, useEffect, useRef } from 'react';
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
import { useFullScreenAd } from '../../hooks/useFullScreenAd';

type ResultView = 'result-daily' | 'result-monthly' | 'result-payback' | 'result-dcf';

const TITLES: Record<ResultView, string> = {
  'result-daily': '일 손익',
  'result-monthly': '월 손익',
  'result-payback': '투자회수기간',
  'result-dcf': '추정 사업가치',
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
    { label: '비용 구조 (기타영업비용)', value: '외식업체 경영실태조사 2024 (한국농촌경제연구원, KREI)' },
    { label: '기타영업비용 교차검증', value: '소상공인실태조사 2023 (중소벤처기업부)' },
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
        이 결과는 <strong>정부 공시 자료와 업계 자료를 활용한 AI 기반 추정치</strong>이며, 실제 창업 시 수익을 보장하지 않아요. 투자를 결정하는 근거로 사용할 수 없어요.
      </p>
      <button
        className={styles.disclaimerToggle}
        onClick={() => setExpanded(v => !v)}
      >
        {expanded ? '접기' : '면책 조항 전문 보기'}
      </button>
      {expanded && (
        <div className={styles.disclaimerFull}>
          <p>1. 이 시뮬레이션의 모든 수치(매출, 비용, 손익, 투자금 회수 기간, 사업체 가치 등)는 통계 데이터와 AI 추정치를 기반으로 산출한 <strong>참고용 예측값</strong>이며, 실제 영업 결과와 다를 수 있어요.</p>
          <p>2. 객단가, 일 방문객 수, 원가율 등 핵심 변수는 공식 통계가 아닌 <strong>AI 추정치</strong>를 포함하고 있으며, 실제 값은 입지, 경쟁 환경, 운영 역량, 시장 변동 등에 따라 크게 달라질 수 있어요.</p>
          <p>3. 이 서비스는 <strong>정보 제공 목적</strong>으로만 만들었으며, 재무·투자·법률·세무 자문을 대체하지 않아요. 실제 창업 및 투자 결정 시 반드시 전문가와 상담해 주세요.</p>
          <p>4. 세금 계산(종합소득세, 부가세)은 간이 추정이며 개인별 공제, 감면, 신고 방식에 따라 실제 세액과 차이가 있을 수 있어요. 정확한 세금은 세무사에게 문의하세요.</p>
          <p>5. 서비스 제공자는 이 시뮬레이션 결과를 근거로 한 <strong>어떠한 경제적 손실에 대해서도 책임지지 않아요.</strong></p>
        </div>
      )}
    </div>
  );
}

function DcfLimitationsSection() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const toggle = useCallback((key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const items = [
    {
      key: 'model',
      icon: '🧮',
      title: '영구 현금흐름 모델 (Gordon Growth Model)',
      summary: '이 사업이 영원히 지속된다는 가정하에 계산된 이론적 가치예요',
      detail: '사업가치 추정에 사용된 DCF(Discounted Cash Flow) 모델은 현재 수익이 무한히 지속된다고 가정해요. 실제 자영업의 평균 존속 기간은 3~5년이며, 업종·입지에 따라 크게 달라요. 사업이 오래 유지될수록 이 추정치에 가까워지지만, 단기 운영을 계획한다면 실제 가치는 훨씬 낮을 수 있어요.',
    },
    {
      key: 'assumption',
      icon: '🎯',
      title: '모든 예측이 맞아야 성립하는 숫자',
      summary: '입력하신 매출·비용이 그대로 실현되었을 때의 가상 시나리오예요',
      detail: '방문객 수, 객단가, 원가율, 임대료 등 사장님이 입력한 모든 조건이 매달 동일하게 유지된다고 가정해요. 현실에서는 계절 변동, 경쟁점 출점, 원자재 가격 변동, 임대료 인상 등 수많은 변수가 작용해요. 하나의 변수만 바뀌어도 결과는 크게 달라질 수 있어요.',
    },
    {
      key: 'market',
      icon: '🤝',
      title: '실제 거래 가격과는 다릅니다',
      summary: '실제 사업 양도 금액은 협상, 입지, 시장 상황 등 복합 요인에 따라 달라져요',
      detail: '실제 양도 가격은 상권의 유동인구, 건물 조건, 인테리어 상태, 단골 고객 수, 브랜드 인지도, 계약 잔여 기간, 임대인 동의 여부, 매수자의 협상력 등 이 시뮬레이터가 반영하지 못하는 수많은 요소에 따라 달라져요.',
    },
    {
      key: 'rate',
      icon: '📊',
      title: '할인율과 성장률에 극도로 민감',
      summary: '할인율 1%p 차이로 추정 가치가 수천만 원 변할 수 있어요',
      detail: '현재 할인율 15%, 성장률 0%로 설정되어 있어요. 할인율을 10%로 낮추면 추정 가치가 50% 상승하고, 20%로 높이면 25% 하락해요. 이 파라미터는 투자 위험도와 기대 수익률을 반영하는 주관적 수치이므로, 절대적인 정답은 없어요.',
    },
    {
      key: 'tax',
      icon: '📋',
      title: '세금·부채 구조 단순화',
      summary: '개인별 공제·감면·부채 상황에 따라 실제 현금흐름은 달라집니다',
      detail: '종합소득세는 8단계 누진세율 기본 계산만 적용했으며, 개인별 소득공제·세액공제·감면·4대보험 등은 반영하지 않았어요. 또한 대출 상환 구조, 추가 차입, 운전자금 필요량 등 자금 흐름의 복잡성을 단순화했어요.',
    },
    {
      key: 'guidance',
      icon: '💡',
      title: '이 숫자, 이렇게 활용하세요',
      summary: '절대적 가치가 아닌, 상대적 감(感)을 잡는 도구로 사용하세요',
      detail: '이 추정치는 "이 사업이 잘 되면 대략 이 정도 가치가 있을 수 있겠구나" 하는 감각을 제공하기 위한 거예요. 업종 간 비교, 투자 규모 대비 기대 가치 파악, 협상 시 출발점 설정 등의 용도로 활용하세요. 실제 매매 시에는 반드시 공인중개사, 세무사, 변호사 등 전문가와 상담해 주세요.',
    },
  ];

  return (
    <div className={styles.dcfLimitations}>
      <div className={styles.dcfLimHeader}>
        <span className={styles.dcfLimBadge}>꼭 읽어보세요</span>
        <h3 className={styles.dcfLimTitle}>추정 사업가치의 한계</h3>
        <p className={styles.dcfLimSubtitle}>
          아래 내용을 이해하신 후 결과를 참고해주세요
        </p>
      </div>

      <div className={styles.dcfLimList}>
        {items.map(item => (
          <div
            key={item.key}
            className={`${styles.dcfLimItem} ${openItems[item.key] ? styles.dcfLimItemOpen : ''}`}
          >
            <button
              className={styles.dcfLimItemBtn}
              onClick={() => toggle(item.key)}
              aria-expanded={!!openItems[item.key]}
            >
              <span className={styles.dcfLimItemIcon}>{item.icon}</span>
              <div className={styles.dcfLimItemText}>
                <span className={styles.dcfLimItemTitle}>{item.title}</span>
                <span className={styles.dcfLimItemSummary}>{item.summary}</span>
              </div>
              <span className={styles.dcfLimChevron}>
                {openItems[item.key] ? '−' : '+'}
              </span>
            </button>
            {openItems[item.key] && (
              <div className={styles.dcfLimItemDetail}>
                <p>{item.detail}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.dcfLimFooter}>
        <p>이 추정치를 투자·매매·계약의 근거로 사용하지 마세요.</p>
        <p>실제 거래할 때는 전문가와 꼭 상담해 주세요.</p>
      </div>
    </div>
  );
}

const BANNER_AD_GROUP_ID = 'ait-ad-test-banner-id';

function BannerAdSlot() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const { TossAds } = await import('@apps-in-toss/web-framework');
        if (cancelled || !TossAds?.initialize?.isSupported?.() || !containerRef.current) return;

        TossAds.initialize({
          callbacks: {
            onInitialized: () => {
              if (cancelled || !containerRef.current) return;
              bannerRef.current = TossAds.attachBanner(
                BANNER_AD_GROUP_ID,
                containerRef.current,
                {
                  theme: 'light',
                  variant: 'card',
                  callbacks: {
                    onAdRendered: () => {},
                    onNoFill: () => {},
                  },
                },
              );
            },
            onInitializationFailed: () => {},
          },
        });
      } catch {
        // 미지원 환경
      }
    }

    init();
    return () => {
      cancelled = true;
      bannerRef.current?.destroy();
    };
  }, []);

  return <div ref={containerRef} className={styles.bannerAd} />;
}

export function ResultPage({ result, view, onBack, onNext, onGoTo }: Props) {
  const { annotations, payback, dcf, inputs } = result;
  const [scenario, setScenario] = useState<ScenarioType>('base');
  const cogsLabel = inputs.business_type.id === 3 ? '상품 원가' : undefined;
  const materialCostRatio = resolveBusinessParams(inputs).material_cost_ratio;
  const ad = useFullScreenAd();

  const handleEdit = useCallback(async () => {
    if (ad.isSupported) {
      await ad.showAd();
    }
    onGoTo('confirm');
  }, [ad, onGoTo]);

  const handleNext = useCallback(async () => {
    if (ad.isSupported) {
      await ad.showAd();
    }
    onNext();
  }, [ad, onNext]);

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
              onClick={handleEdit}
            >
              결과 수정하기
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
              <p className={styles.summaryLabel}>추정 사업가치</p>
              {dcf.business_value !== null ? (
                <>
                  <p className={styles.summaryValue}>
                    <strong>{formatKRWShort(dcf.business_value * 0.9)} ~ {formatKRWShort(dcf.business_value * 1.1)}</strong>
                  </p>
                </>
              ) : (
                <p className={styles.summaryValue}>아직 산정하기 어려워요</p>
              )}
              <p className={styles.summarySubtext}>연 현금흐름 {formatKRWShort(dcf.fcf_annual)}</p>
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

            <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center', margin: '12px 0 0' }}>
              이 계산 결과는 향후 권리금 산정의 근거가 될 수 있습니다
            </p>

          </div>
        )}

        {view === 'result-dcf' && <DcfLimitationsSection />}

        <BannerAdSlot />
        <DisclaimerSection />
        <DataSourcesSection businessType={inputs.business_type} />
      </div>

      {!isLastResult && (
        <button className={styles.nextBtn} onClick={view === 'result-daily' ? onNext : handleNext}>
          {view === 'result-daily' ? '월 손익 확인하기' : view === 'result-monthly' ? '원금 회수기간 계산하기' : view === 'result-payback' ? '사업 가치 계산하기' : '다음'}
        </button>
      )}
    </div>
  );
}
