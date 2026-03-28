import { useState, useCallback, useMemo, useEffect } from 'react';
import type { StepId } from '../types';

const STEP_STORAGE_KEY = 'sim_current_step';

const INPUT_STEPS: StepId[] = [
  'select-industry', 'industry-transition', 'select-region', 'select-scale',
  'investment-breakdown', 'set-investment', 'set-loan',
  'transition-operating', 'set-customers',
  'set-ticket', 'set-labor', 'set-rent', 'confirm',
];

const RESULT_STEPS: StepId[] = [
  'result-daily', 'result-monthly', 'result-payback', 'set-misc', 'result-dcf',
];

// set-misc and transition-operating are excluded from progress bar
const PROGRESS_EXCLUDED: StepId[] = ['set-misc', 'transition-operating', 'industry-transition'];

// 뒤로가기 시 건너뛸 전환 화면 (애니메이션만 있는 화면)
const TRANSITION_STEPS: StepId[] = ['industry-transition', 'transition-operating'];

const ALL_STEPS: StepId[] = [...INPUT_STEPS, ...RESULT_STEPS];

interface UseStepNavigationResult {
  currentStep: StepId;
  stepIndex: number;
  totalSteps: number;
  progress: number;
  isFirstStep: boolean;
  isLastInputStep: boolean;
  isResultStep: boolean;
  goNext: () => void;
  goBack: () => void;
  goTo: (step: StepId) => void;
  reset: () => void;
}

export function useStepNavigation(): UseStepNavigationResult {
  const [currentStep, setCurrentStep] = useState<StepId>('select-industry');

  const activeSteps = useMemo(() => {
    return ALL_STEPS;
  }, []);

  const stepIndex = activeSteps.indexOf(currentStep);
  const inputStepCount = activeSteps.filter(
    s => INPUT_STEPS.includes(s) && !PROGRESS_EXCLUDED.includes(s)
  ).length;

  const goNext = useCallback(() => {
    const idx = activeSteps.indexOf(currentStep);
    if (idx < activeSteps.length - 1) {
      const next = activeSteps[idx + 1];
      history.pushState({ step: next }, '', '');
      setCurrentStep(next);
    }
  }, [activeSteps, currentStep]);

  const goBack = useCallback(() => {
    let idx = activeSteps.indexOf(currentStep);
    if (idx > 0) {
      idx -= 1;
      // 전환 화면(애니메이션만 있는 화면)은 건너뛰기
      while (idx > 0 && TRANSITION_STEPS.includes(activeSteps[idx])) {
        idx -= 1;
      }
      setCurrentStep(activeSteps[idx]);
    }
  }, [activeSteps, currentStep]);

  const goTo = useCallback((step: StepId) => {
    history.pushState({ step }, '', '');
    setCurrentStep(step);
  }, []);

  // 뒤로가기 공통 로직
  const handleBack = useCallback(() => {
    let idx = activeSteps.indexOf(currentStep);
    if (idx <= 0) {
      // 첫 화면 — 미니앱 종료
      import('@apps-in-toss/web-bridge').then(({ closeView }) => {
        closeView();
      }).catch(() => {
        // SDK 미지원 환경 (로컬 dev 등) — 무시
      });
      return;
    }
    idx -= 1;
    while (idx > 0 && TRANSITION_STEPS.includes(activeSteps[idx])) {
      idx -= 1;
    }
    setCurrentStep(activeSteps[idx]);
  }, [activeSteps, currentStep]);

  // 토스 네이티브 backEvent (공식 API) — 토스 앱 환경에서 우선 사용
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function initBackEvent() {
      try {
        const { graniteEvent } = await import('@apps-in-toss/web-framework');
        if (!graniteEvent?.addEventListener) return;

        unsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: () => {
            handleBack();
          },
          onError: (error: unknown) => {
            console.error('backEvent 에러:', error);
          },
        });
      } catch {
        // SDK 미지원 환경 — popstate fallback 사용
      }
    }

    initBackEvent();
    return () => { unsubscribe?.(); };
  }, [handleBack]);

  // 토스 네이티브 homeEvent (공식 API) — 홈 버튼 클릭 시 첫 화면으로
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function initHomeEvent() {
      try {
        const { graniteEvent } = await import('@apps-in-toss/web-framework');
        if (!graniteEvent?.addEventListener) return;

        unsubscribe = graniteEvent.addEventListener('homeEvent', {
          onEvent: () => {
            setCurrentStep('select-industry');
          },
          onError: (error: unknown) => {
            console.error('homeEvent 에러:', error);
          },
        });
      } catch {
        // SDK 미지원 환경
      }
    }

    initHomeEvent();
    return () => { unsubscribe?.(); };
  }, []);

  // popstate fallback — 비토스 환경 (로컬 dev, 일반 브라우저) + 히스토리 스택 보충
  useEffect(() => {
    const handlePopState = () => {
      handleBack();
      // 히스토리 스택 보충 — 다음 뒤로가기에서 앱 종료 방지
      history.pushState({ step: '_guard' }, '', '');
    };
    window.addEventListener('popstate', handlePopState);
    // 초기 히스토리 엔트리 추가 (첫 뒤로가기에서 앱 종료 방지)
    if (history.state?.step == null) {
      history.replaceState({ step: currentStep }, '', '');
      history.pushState({ step: currentStep }, '', '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [handleBack, currentStep]);

  const reset = useCallback(() => {
    setCurrentStep('select-industry');
    try { localStorage.removeItem(STEP_STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  const isResultStep = RESULT_STEPS.includes(currentStep);
  const progress = inputStepCount > 0
    ? Math.min(1, (Math.min(stepIndex, inputStepCount) / inputStepCount))
    : 0;

  return {
    currentStep,
    stepIndex,
    totalSteps: activeSteps.length,
    progress,
    isFirstStep: stepIndex === 0,
    isLastInputStep: currentStep === 'confirm',
    isResultStep,
    goNext,
    goBack,
    goTo,
    reset,
  };
}
