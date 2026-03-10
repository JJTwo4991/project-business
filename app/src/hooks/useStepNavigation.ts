import { useState, useCallback, useMemo } from 'react';
import type { StepId } from '../types';

const INPUT_STEPS: StepId[] = [
  'select-industry', 'select-region', 'select-scale',
  'investment-breakdown', 'set-investment', 'set-loan', 'set-customers',
  'set-ticket', 'set-labor', 'set-rent', 'confirm',
];

const RESULT_STEPS: StepId[] = [
  'result-daily', 'result-monthly', 'result-payback', 'set-misc', 'result-dcf',
];

// set-misc is in result area but excluded from progress bar
const PROGRESS_EXCLUDED: StepId[] = ['set-misc'];

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
      setCurrentStep(activeSteps[idx + 1]);
    }
  }, [activeSteps, currentStep]);

  const goBack = useCallback(() => {
    const idx = activeSteps.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(activeSteps[idx - 1]);
    }
  }, [activeSteps, currentStep]);

  const goTo = useCallback((step: StepId) => {
    setCurrentStep(step);
  }, []);

  const reset = useCallback(() => {
    setCurrentStep('select-industry');
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
