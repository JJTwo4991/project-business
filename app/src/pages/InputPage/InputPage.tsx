import styles from './InputPage.module.css';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import { RegionSelector } from '../../components/RegionSelector/RegionSelector';
import type { SimulatorInputs, BusinessScale, CapitalStructure, RentGuide } from '../../types';
import { formatKRWShort, formatPercent } from '../../lib/format';
import { getScaleSqm } from '../../lib/scale';

interface Props {
  inputs: SimulatorInputs;
  rentGuide: {
    sidos: string[];
    getRegions: (sido: string) => string[];
    getSangkwons: (sido: string, region: string) => string[];
    getRent: (sido: string, sangkwon: string) => RentGuide | undefined;
    loading: boolean;
  };
  onBack: () => void;
  onScale: (scale: BusinessScale) => void;
  onCapital: (capital: CapitalStructure) => void;
  onRentSelect: (rent: { sido: string; sangkwon: string; rent_per_sqm: number; monthly: number }) => void;
  onCalculate: () => void;
}

const SCALE_LABELS: Record<BusinessScale, string> = {
  small: '소규모',
  medium: '중간',
  large: '대형',
};

export function InputPage({ inputs, rentGuide, onBack, onScale, onCapital, onRentSelect, onCalculate }: Props) {
  const { business_type: bt, scale, capital } = inputs;
  const debt = Math.max(0, capital.initial_investment - capital.equity);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack} aria-label="뒤로">
          ←
        </button>
        <h2 className={styles.title}>{bt.name}</h2>
      </header>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>규모 선택</h3>
        <div className={styles.scaleGroup}>
          {(['small', 'medium', 'large'] as BusinessScale[]).map(s => {
            const inv = s === 'small' ? bt.initial_investment_small
              : s === 'large' ? bt.initial_investment_large
              : bt.initial_investment_medium;
            const customers = s === 'small' ? bt.avg_daily_customers_small
              : s === 'large' ? bt.avg_daily_customers_large
              : bt.avg_daily_customers_medium;
            return (
              <button
                key={s}
                className={`${styles.scaleBtn} ${scale === s ? styles.scaleBtnActive : ''}`}
                onClick={() => onScale(s)}
              >
                <span className={styles.scaleName}>{SCALE_LABELS[s]}</span>
                <span className={styles.scaleDetail}>일 {customers}명</span>
                <span className={styles.scaleInvestment}>~{formatKRWShort(inv)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>지역 선택</h3>
        <RegionSelector
          sidos={rentGuide.sidos}
          getRegions={rentGuide.getRegions}
          getSangkwons={rentGuide.getSangkwons}
          getRent={rentGuide.getRent}
          scaleSqm={getScaleSqm(scale)}
          onSelect={onRentSelect}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>자본 구조</h3>

        <SliderInput
          label="초기투자금"
          value={capital.initial_investment}
          min={bt.initial_investment_min}
          max={bt.initial_investment_max}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onCapital({ ...capital, initial_investment: v, equity: Math.min(capital.equity, v) })}
        />

        <SliderInput
          label="자기자본"
          value={capital.equity}
          min={0}
          max={capital.initial_investment}
          step={1_000_000}
          format={formatKRWShort}
          onChange={v => onCapital({ ...capital, equity: v })}
        />

        <div className={styles.debtInfo}>
          <span className={styles.debtLabel}>타인자본 (대출)</span>
          <span className={styles.debtValue}>{formatKRWShort(debt)}</span>
        </div>

        <SliderInput
          label="금리"
          value={capital.interest_rate}
          min={0.02}
          max={0.12}
          step={0.005}
          format={v => formatPercent(v)}
          onChange={v => onCapital({ ...capital, interest_rate: v })}
        />

        <SliderInput
          label="대출기간"
          value={capital.loan_term_years}
          min={1}
          max={10}
          step={1}
          format={v => `${v}년`}
          onChange={v => onCapital({ ...capital, loan_term_years: v })}
        />
      </section>

      <div className={styles.footer}>
        <button className={styles.calcBtn} onClick={onCalculate}>
          계산하기
        </button>
      </div>
    </div>
  );
}
