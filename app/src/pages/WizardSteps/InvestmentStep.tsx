import styles from './WizardSteps.module.css';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import type { CapitalStructure, BusinessType, BusinessScale } from '../../types';
import { formatKRWShort, formatPercent } from '../../lib/format';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline } from '../../data/guidelines';

interface InvestmentProps {
  businessType: BusinessType;
  scale: BusinessScale;
  capital: CapitalStructure;
  onChange: (capital: CapitalStructure) => void;
  onNext: () => void;
}

export function InvestmentStep({ businessType: bt, scale, capital, onChange, onNext }: InvestmentProps) {
  const debt = Math.max(0, capital.initial_investment - capital.equity);

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>자본 구조를 설정하세요</h2>
      <GuidelineBox guideline={getGuideline(bt.id, scale, 'set-investment')} />
      <div className={styles.sliderGroup}>
        <SliderInput
          label="초기투자금"
          value={capital.initial_investment}
          min={0}
          max={bt.initial_investment_max * 2}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onChange({
            ...capital,
            initial_investment: v,
            equity: Math.min(capital.equity, v),
          })}
        />
        <SliderInput
          label="자기자본"
          value={capital.equity}
          min={0}
          max={capital.initial_investment}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onChange({ ...capital, equity: v })}
        />
        <SliderInput
          label="타인자본 (대출)"
          value={debt}
          min={0}
          max={capital.initial_investment}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onChange({ ...capital, equity: Math.max(0, capital.initial_investment - v) })}
        />
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}

interface LoanProps {
  scale: BusinessScale;
  businessTypeId: number;
  capital: CapitalStructure;
  onChange: (capital: CapitalStructure) => void;
  onNext: () => void;
}

export function LoanStep({ scale, businessTypeId, capital, onChange, onNext }: LoanProps) {
  const debt = Math.max(0, capital.initial_investment - capital.equity);

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>대출 조건을 설정하세요</h2>
      <p className={styles.stepDesc}>대출금: {formatKRWShort(debt)}</p>
      <GuidelineBox guideline={getGuideline(businessTypeId, scale, 'set-loan')} />
      <div className={styles.sliderGroup}>
        <SliderInput
          label="금리"
          value={capital.interest_rate}
          min={0.02}
          max={0.12}
          step={0.005}
          format={v => formatPercent(v)}
          onChange={v => onChange({ ...capital, interest_rate: v })}
        />
        <SliderInput
          label="대출기간"
          value={capital.loan_term_years}
          min={1}
          max={10}
          step={1}
          format={v => `${v}년`}
          onChange={v => onChange({ ...capital, loan_term_years: v })}
        />
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
