import { useState, useCallback } from 'react';
import styles from './App.module.css';
import { HomePage } from './pages/HomePage/HomePage';
import { InputPage } from './pages/InputPage/InputPage';
import { ResultPage } from './pages/ResultPage/ResultPage';
import { PageTransition } from './components/PageTransition/PageTransition';
import type { BusinessType } from './types';
import { useSimulator } from './hooks/useSimulator';
import { useRentGuide } from './hooks/useRentGuide';
import { useCostItems } from './hooks/useCostItems';

type Page = 'home' | 'input' | 'result';

const PAGE_ORDER: Page[] = ['home', 'input', 'result'];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [direction, setDirection] = useState<'forward' | 'back' | 'none'>('none');
  const simulator = useSimulator();
  const rentGuide = useRentGuide();
  const { costItems } = useCostItems(simulator.inputs?.business_type?.id ?? null);

  const navigate = useCallback((to: Page) => {
    const fromIdx = PAGE_ORDER.indexOf(page);
    const toIdx = PAGE_ORDER.indexOf(to);
    setDirection(toIdx > fromIdx ? 'forward' : 'back');
    setPage(to);
  }, [page]);

  const handleSelectBusiness = (bt: BusinessType) => {
    simulator.setBusinessType(bt);
    navigate('input');
  };

  const handleCalculate = () => {
    const success = simulator.calculate();
    if (success) navigate('result');
  };

  const handleBack = () => {
    navigate(page === 'result' ? 'input' : 'home');
  };

  const handleRentSelect = (rent: { sido: string; sigungu: string; rent_per_sqm: number; monthly: number }) => {
    simulator.setRegion({ sido: rent.sido, sigungu: rent.sigungu, rent_per_sqm: rent.rent_per_sqm });
    simulator.setOverride('rent_monthly', rent.monthly);
  };

  return (
    <div className={styles.root}>
      <PageTransition pageKey={page} direction={direction}>
        {page === 'home' && (
          <HomePage onSelect={handleSelectBusiness} />
        )}
        {page === 'input' && simulator.inputs && (
          <InputPage
            inputs={simulator.inputs}
            rentGuide={rentGuide}
            onBack={handleBack}
            onScale={simulator.setScale}
            onCapital={simulator.setCapital}
            onRentSelect={handleRentSelect}
            onCalculate={handleCalculate}
          />
        )}
        {page === 'result' && simulator.result && (
          <ResultPage
            result={simulator.result}
            costItems={costItems}
            onBack={handleBack}
            onOverride={simulator.setOverride}
            onRecalculate={simulator.calculate}
          />
        )}
      </PageTransition>
    </div>
  );
}
