import { useCallback } from 'react';
import styles from './App.module.css';
import { PageTransition } from './components/PageTransition/PageTransition';
import { StepIndicator } from './components/StepIndicator/StepIndicator';
import type { BusinessType, InvestmentItem } from './types';
import { useSimulator } from './hooks/useSimulator';
import { useBusinessTypes } from './hooks/useBusinessTypes';
import { useRentGuide } from './hooks/useRentGuide';
import { useStepNavigation } from './hooks/useStepNavigation';
import { ResultPage } from './pages/ResultPage/ResultPage';
import { IndustrySelectStep } from './pages/WizardSteps/IndustrySelectStep';
import { ScaleSelectStep } from './pages/WizardSteps/ScaleSelectStep';
import { RegionStep } from './pages/WizardSteps/RegionStep';
import { InvestmentStep, LoanStep } from './pages/WizardSteps/InvestmentStep';
import { InvestmentBreakdownStep } from './pages/WizardSteps/InvestmentBreakdownStep';
import { TicketStep, LaborStep, RentStep, MiscStep } from './pages/WizardSteps/OperatingParamsSteps';
import { VisitorEstimationStep } from './pages/WizardSteps/VisitorEstimationStep';
import { TossTransition } from './components/TossTransition/TossTransition';
import { ConfirmStep } from './pages/WizardSteps/ConfirmStep';

export default function App() {
  const simulator = useSimulator();
  const { businessTypes } = useBusinessTypes();
  const rentGuide = useRentGuide();
  const nav = useStepNavigation();

  const handleSelectBusiness = useCallback((bt: BusinessType) => {
    simulator.setBusinessType(bt);
    nav.goTo('select-region');
  }, [simulator, nav]);

  const handleScaleSelect = useCallback((scale: 'small' | 'medium' | 'large') => {
    simulator.setScale(scale);
  }, [simulator]);

  const handleRentSelect = useCallback((rent: { sido: string; sigungu: string; rent_per_sqm: number; monthly: number }) => {
    simulator.setRegion({ sido: rent.sido, sigungu: rent.sigungu, rent_per_sqm: rent.rent_per_sqm });
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

  const handleCalculate = useCallback(() => {
    simulator.calculate();
    nav.goTo('result-daily');
  }, [simulator, nav]);

  const handleGoHome = useCallback(() => {
    simulator.reset();
    nav.goTo('select-industry');
  }, [simulator, nav]);

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
          />
        );

      case 'select-scale':
        return simulator.inputs ? (
          <ScaleSelectStep
            businessType={simulator.inputs.business_type}
            selected={simulator.inputs.scale}
            onSelect={handleScaleSelect}
            onNext={nav.goNext}
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
            onNext={nav.goNext}
          />
        ) : null;

      case 'select-region':
        return simulator.inputs ? (
          <RegionStep
            sidos={rentGuide.sidos}
            getSigungus={rentGuide.getSigungus}
            getRent={rentGuide.getRent}
            scale={simulator.inputs.scale}
            businessTypeId={simulator.inputs.business_type.id}
            onSelect={handleRentSelect}
            onNext={nav.goNext}
          />
        ) : null;

      case 'set-investment':
        return simulator.inputs ? (
          <InvestmentStep
            businessType={simulator.inputs.business_type}
            scale={simulator.inputs.scale}
            capital={simulator.inputs.capital}
            onChange={simulator.setCapital}
            onNext={nav.goNext}
          />
        ) : null;

      case 'set-loan':
        return simulator.inputs ? (
          <LoanStep
            scale={simulator.inputs.scale}
            businessTypeId={simulator.inputs.business_type.id}
            capital={simulator.inputs.capital}
            onChange={simulator.setCapital}
            onNext={nav.goNext}
          />
        ) : null;

      case 'transition-operating':
        return (
          <TossTransition
            emoji="👏"
            message="수고하셨어요! 이제 장사가 얼마나 잘 될지 예상해볼까요?"
            buttonText="준비됐어요"
            onComplete={nav.goNext}
          />
        );

      case 'set-customers':
        return simulator.inputs ? (
          <VisitorEstimationStep
            onComplete={v => {
              simulator.setOverride('daily_customers_override', v);
              nav.goNext();
            }}
          />
        ) : null;

      case 'set-ticket':
        return simulator.inputs ? (
          <TicketStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={nav.goNext} />
        ) : null;

      case 'set-labor':
        return simulator.inputs ? (
          <LaborStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={nav.goNext} />
        ) : null;

      case 'set-rent':
        return simulator.inputs ? (
          <RentStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={nav.goNext} />
        ) : null;

      case 'confirm':
        return simulator.inputs ? (
          <ConfirmStep
            inputs={simulator.inputs}
            onCalculate={handleCalculate}
          />
        ) : null;

      case 'set-misc':
        return simulator.inputs ? (
          <MiscStep inputs={simulator.inputs} onOverride={simulator.setOverride} onNext={nav.goNext} />
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
          />
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={styles.root}>
      {!nav.isFirstStep && (
        <header className={styles.header}>
          {!nav.isResultStep && (
            <button className={styles.backBtn} onClick={nav.goBack} aria-label="뒤로">
              ←
            </button>
          )}
          {!nav.isResultStep && <StepIndicator progress={nav.progress} />}
          <button className={styles.homeBtn} onClick={handleGoHome} aria-label="처음으로">
            처음으로
          </button>
        </header>
      )}
      <PageTransition pageKey={nav.currentStep} direction="forward">
        {renderStep()}
      </PageTransition>
    </div>
  );
}
