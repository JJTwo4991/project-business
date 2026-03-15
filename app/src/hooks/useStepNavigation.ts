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
  const [currentStep, setCurrentStep] = useState<StepId>(() => {
    try {
      const saved = localStorage.getItem(STEP_STORAGE_KEY);
      if (saved && ALL_STEPS.includes(saved as StepId)) {
        return saved as StepId;
      }
    } catch { /* ignore */ }
    return 'select-industry';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STEP_STORAGE_KEY, currentStep);
    } catch { /* ignore */ }
  }, [currentStep]);

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
    const idx = activeSteps.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(activeSteps[idx - 1]);
    }
  }, [activeSteps, currentStep]);

  const goTo = useCallback((step: StepId) => {
    history.pushState({ step }, '', '');
    setCurrentStep(step);
  }, []);

  // Android 뒤로가기 버튼 → 이전 단계로 이동
  useEffect(() => {
    const handlePopState = () => {
      const idx = activeSteps.indexOf(currentStep);
      if (idx > 0) {
        setCurrentStep(activeSteps[idx - 1]);
      }
    };
    window.addEventListener('popstate', handlePopState);
    // 초기 히스토리 엔트리 추가 (첫 뒤로가기에서 앱 종료 방지)
    if (history.state?.step == null) {
      history.replaceState({ step: currentStep }, '', '');
      history.pushState({ step: currentStep }, '', '');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeSteps, currentStep]);

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
