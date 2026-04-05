import { useCallback, useEffect, useRef, useState } from 'react';
import type { StepId } from './types';
import styles from './App.module.css';
import { PageTransition } from './components/PageTransition/PageTransition';
import { StepIndicator } from './components/StepIndicator/StepIndicator';
import type { BusinessType, InvestmentItem } from './types';
import { useSimulator } from './hooks/useSimulator';
import { useBusinessTypes } from './hooks/useBusinessTypes';
import { useRentGuide } from './hooks/useRentGuide';
import { useStepNavigation } from './hooks/useStepNavigation';
import { trackClick } from './lib/analytics';
import { ResultPage } from './pages/ResultPage/ResultPage';
import { IndustrySelectStep } from './pages/WizardSteps/IndustrySelectStep';
import { ScaleSelectStep } from './pages/WizardSteps/ScaleSelectStep';
import { RegionStep } from './pages/WizardSteps/RegionStep';
import { InvestmentStep, LoanStep } from './pages/WizardSteps/InvestmentStep';
import { InvestmentBreakdownStep } from './pages/WizardSteps/InvestmentBreakdownStep';
import { TicketStep, LaborStep, RentStep, MiscStep } from './pages/WizardSteps/OperatingParamsSteps';
import { VisitorEstimationStep } from './pages/WizardSteps/VisitorEstimationStep';
import { TossTransition } from './components/TossTransition/TossTransition';
import { IndustryTransition } from './components/IndustryTransition/IndustryTransition';
import { getIndustryIcon } from './assets/icons';

const INDUSTRY_TAGLINES: Record<number, { tagline: string; sub: string }> = {
  1:  { tagline: '치킨 싫어하는 사람은 없는 거 아시죠?', sub: '바삭한 치킨으로 동네 맛집이 되어볼까요' },
  2:  { tagline: '한 잔의 커피가 만드는 일상 속 행복', sub: '향긋한 원두향이 가득한 나만의 공간' },
  3:  { tagline: '24시간 돌아가는 동네 필수 인프라', sub: '언제나 열려있는 든든한 이웃' },
  4:  { tagline: '손끝에서 시작되는 변신의 마법', sub: '스타일 하나로 자신감을 선물하세요' },
  5:  { tagline: '떡볶이·김밥, 누구나 사랑하는 국민 간식', sub: '학교 앞 추억의 맛을 사장님의 손으로' },
  6:  { tagline: '따뜻한 밥 한 끼의 힘, 한식의 저력', sub: '정성 가득한 한 상을 차려보세요' },
  7:  { tagline: '깔끔한 옷이 주는 자신감, 세탁의 가치', sub: '빨래 고민 없는 동네를 만들어요' },
  8:  { tagline: '도우 위에 펼쳐지는 맛의 조합', sub: '한 조각의 행복을 배달해요' },
  9:  { tagline: '갓 구운 빵 냄새, 그 유혹을 이길 수 있나요?', sub: '매일 아침 행복을 구워내세요' },
  11: { tagline: '작은 손톱 위에 피어나는 나만의 개성', sub: '섬세한 손길로 아름다움을 완성해요' },
  13: { tagline: '바쁜 현대인의 식탁을 책임지는 든든한 한 끼', sub: '집밥이 그리운 사람들의 안식처' },
  14: { tagline: '무인으로 돌아가는 달콤한 수익 모델', sub: '사장님이 없어도 매출은 쌓여요' },
  15: { tagline: '하루의 끝, 한 잔의 위로가 되는 공간', sub: '오늘 하루도 수고했다, 한 잔 어때요' },
  16: { tagline: '사장 없이도 커피는 내려집니다', sub: '24시간 일하는 커피머신이 사장님 대신' },
};
import { ConfirmStep } from './pages/WizardSteps/ConfirmStep';
import { UI_ICONS } from './assets/icons';
import { TossNavBar } from './components/TossNavBar/TossNavBar';
import { useRecentSimulations } from './hooks/useRecentSimulations';
import type { SavedSimulation } from './hooks/useRecentSimulations';
import { useFullScreenAd } from './hooks/useFullScreenAd';
import { BusinessMbtiPage } from './pages/BusinessMbtiPage/BusinessMbtiPage';

/** 토스 WebView 환경 감지 (토스 앱 내 미니앱으로 실행 중인지) */
const isTossWebView = /TossApp/i.test(navigator.userAgent);

export default function App() {
  const simulator = useSimulator();
  const { businessTypes } = useBusinessTypes();
  const rentGuide = useRentGuide();
  const nav = useStepNavigation();
  const recentSims = useRecentSimulations();
  const ad = useFullScreenAd();

  const customBackRef = useRef<(() => boolean) | null>(null);

  // 스텝 전환 시 스크롤을 상단으로 리셋
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [nav.currentStep]);

  const handleSelectBusiness = useCallback((bt: BusinessType) => {
    simulator.setBusinessType(bt);
    nav.goTo('industry-transition');
  }, [simulator, nav]);

  const handleScaleSelect = useCallback((scale: 'small' | 'medium' | 'large') => {
    simulator.setScale(scale);
  }, [simulator]);

  const handleRentSelect = useCallback((rent: { sido: string; sangkwon: string; rent_per_sqm: number; monthly: number }) => {
    simulator.setRegion({ sido: rent.sido, sangkwon: rent.sangkwon, rent_per_sqm: rent.rent_per_sqm });
    simulator.setOverride('rent_monthly', rent.monthly);
  }, [simulator]);

  const handleInvestmentBreakdownChange = useCallback((items: InvestmentItem[]) => {
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    simulator.setCapital({
      ...simulator.inputs!.capital,
      investment_breakdown: items,
      initial_investment: total,
      equity: Math.min(simulator.inputs!.capital.equity, total),
    });
  }, [simulator]);

  // Save to recent simulations when a new result appears
  const lastSavedResult = useRef<object | null>(null);
  useEffect(() => {
    if (simulator.result && simulator.result !== lastSavedResult.current) {
      lastSavedResult.current = simulator.result;
      recentSims.save(simulator.result);
    }
  }, [simulator.result, recentSims]);

  const handleCalculate = useCallback(() => {
    simulator.calculate();
    nav.goTo('business-mbti');
  }, [simulator, nav]);

  const handleMbtiShareSuccess = useCallback(() => {
    nav.goTo('result-daily');
  }, [nav]);

  const handleMbtiSkip = useCallback(async () => {
    if (ad.isSupported) {
      await ad.showAd();
    }
    nav.goTo('result-daily');
  }, [nav, ad]);

  const handleRestoreSimulation = useCallback((item: SavedSimulation) => {
    simulator.restoreResult(item.result);
    nav.goTo('result-daily');
  }, [simulator, nav]);

  const handleGoHome = useCallback(() => {
    trackClick('다시_시뮬레이션', { from_step: nav.currentStep });
    simulator.reset();
    nav.goTo('select-industry');
  }, [simulator, nav]);

  // 확인 화면에서 수정 모드
  const [editReturnStep, setEditReturnStep] = useState<StepId | null>(null);

  const handleConfirmEdit = useCallback((step: StepId) => {
    setEditReturnStep('confirm');
    nav.goTo(step);
  }, [nav]);

  const goBackToConfirm = useCallback(() => {
    setEditReturnStep(null);
    nav.goTo('confirm');
  }, [nav]);

  // 수정 모드일 때 goNext 대신 confirm으로 복귀
  const effectiveGoNext = editReturnStep ? goBackToConfirm : nav.goNext;

  const renderStep = () => {
    if (!simulator.inputs && nav.currentStep !== 'select-industry') {
      return null;
    }

    switch (nav.currentStep) {
      case 'select-industry':
        return (
          <IndustrySelectStep
            businessTypes={businessTypes}
            onSelect={handleSelectBusiness}
            recentSimulations={recentSims.items}
            onRestoreSimulation={handleRestoreSimulation}
            onRemoveSimulation={recentSims.remove}
          />
        );

      case 'industry-transition': {
        const bt = simulator.inputs?.business_type;
        if (!bt) return null;
        const info = INDUSTRY_TAGLINES[bt.id] ?? { tagline: bt.name, sub: '' };
        return (
          <IndustryTransition
            emoji={getIndustryIcon(bt.id, bt.category)}
            tagline={info.tagline}
            subMessage={info.sub}
            buttonText="시작하기"
            onComplete={effectiveGoNext}
          />
        );
      }

      case 'select-scale':
        return simulator.inputs ? (
          <ScaleSelectStep
            businessType={simulator.inputs.business_type}
            selected={simulator.inputs.scale}
            onSelect={handleScaleSelect}
            onNext={effectiveGoNext}
          />
        ) : null;

      case 'investment-breakdown':
        return simulator.inputs ? (
          <InvestmentBreakdownStep
            businessTypeId={simulator.inputs.business_type.id}
            scale={simulator.inputs.scale}
            breakdown={simulator.inputs.capital.investment_breakdown}
            onChange={handleInvestmentBreakdownChange}
            onBrandSelect={simulator.setSelectedBrand}
            onNext={effectiveGoNext}
            registerBackHandler={h => { customBackRef.current = h; }}
          />
        ) : null;

      case 'select-region':
        return simulator.inputs ? (
          <RegionStep
            sidos={rentGuide.sidos}
            getRegions={rentGuide.getRegions}
            getSangkwons={rentGuide.getSangkwons}
            getRent={rentGuide.getRent}
            scale={simulator.inputs.scale}
            businessTypeId={simulator.inputs.business_type.id}
            onSelect={handleRentSelect}
            onNext={effectiveGoNext}
          />
        ) : null;

      case 'set-investment':
        return simulator.inputs ? (
          <InvestmentStep
            businessType={simulator.inputs.business_type}
            scale={simulator.inputs.scale}
            capital={simulator.inputs.capital}
            onChange={simulator.setCapital}
            onNext={effectiveGoNext}
          />
        ) : null;

      case 'set-loan':
        return simulator.inputs ? (
          <LoanStep
            scale={simulator.inputs.scale}
            businessTypeId={simulator.inputs.business_type.id}
            capital={simulator.inputs.capital}
            onChange={simulator.setCapital}
            onNext={effectiveGoNext}
          />
        ) : null;

      case 'transition-operating':
        return (
          <TossTransition
            emoji={UI_ICONS.clap}
            message="수고하셨어요! 이제 장사가 얼마나 잘 될지 예상해볼까요?"
            buttonText="준비됐어요"
            onComplete={effectiveGoNext}
          />
        );

      case 'set-customers':
        return simulator.inputs ? (
          <VisitorEstimationStep
            onComplete={(v, days) => {
              simulator.setOverride('daily_customers_override', v);
              simulator.setOverride('operating_days', days);
              effectiveGoNext();
            }}
            registerBackHandler={h => { customBackRef.current = h; }}
          />
        ) : null;

      case 'set-ticket':
        return simulator.inputs ? (
          <TicketStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={effectiveGoNext} />
        ) : null;

      case 'set-labor':
        return simulator.inputs ? (
          <LaborStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={effectiveGoNext} />
        ) : null;

      case 'set-rent':
        return simulator.inputs ? (
          <RentStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={effectiveGoNext} />
        ) : null;

      case 'confirm':
        return simulator.inputs ? (
          <ConfirmStep
            inputs={simulator.inputs}
            onCalculate={handleCalculate}
            onGoTo={handleConfirmEdit}
          />
        ) : null;

      case 'set-misc':
        return simulator.inputs ? (
          <MiscStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={() => { simulator.calculate(); nav.goTo('result-dcf'); }} registerBackHandler={h => { customBackRef.current = h; }} />
        ) : null;

      case 'business-mbti':
        return simulator.result ? (
          <BusinessMbtiPage
            result={simulator.result}
            onShareSuccess={handleMbtiShareSuccess}
            onSkip={handleMbtiSkip}
          />
        ) : null;

      case 'result-daily':
      case 'result-monthly':
      case 'result-payback':
      case 'result-dcf':
        return simulator.result ? (
          <ResultPage
            result={simulator.result}
            view={nav.currentStep}
            onBack={nav.goBack}
            onNext={nav.goNext}
            onGoTo={nav.goTo}
            ad={ad}
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={styles.root}>
      {isTossWebView && <TossNavBar onHome={handleGoHome} />}
      {editReturnStep && (
        <div className={styles.editBanner} onClick={goBackToConfirm}>
          ← 수정 완료 후 확인으로 돌아가기
        </div>
      )}
      {!nav.isFirstStep && !editReturnStep && (
        <header className={styles.header}>
          {(!nav.isResultStep || nav.currentStep === 'set-misc') && (
            <button className={styles.backBtn} onClick={() => {
              if (customBackRef.current?.()) return;
              nav.goBack();
            }} aria-label="뒤로">
              ←
            </button>
          )}
          {!nav.isResultStep && <StepIndicator progress={nav.progress} />}
          {!isTossWebView && (
            <button className={styles.homeBtn} onClick={handleGoHome} aria-label="처음으로">
              처음으로
            </button>
          )}
        </header>
      )}
      <PageTransition pageKey={nav.currentStep} direction="forward">
        {renderStep()}
      </PageTransition>
    </div>
  );
}
