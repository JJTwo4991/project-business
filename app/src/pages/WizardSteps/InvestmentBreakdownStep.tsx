import { useState, useMemo, useCallback } from 'react';
import styles from './WizardSteps.module.css';
import type { InvestmentItem, BusinessScale } from '../../types';
import { getInvestmentBreakdown } from '../../data/costItems';
import { formatKRWShort } from '../../lib/format';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline } from '../../data/guidelines';
import { useBenchmarkData } from '../../hooks/useBenchmarkData';
import { FranchiseSearch } from '../../components/FranchiseSearch/FranchiseSearch';
import type { FranchiseInvestment } from '../../components/FranchiseSearch/FranchiseSearch';
import { getScaleSqm } from '../../lib/scale';
import { useFranchiseCosts } from '../../hooks/useFranchiseCosts';

type Mode = 'choose' | 'franchise' | 'independent';

interface Props {
  businessTypeId: number;
  scale: BusinessScale;
  breakdown: InvestmentItem[] | undefined;
  onChange: (items: InvestmentItem[]) => void;
  onNext: () => void;
}

export function InvestmentBreakdownStep({ businessTypeId, scale, breakdown, onChange, onNext }: Props) {
  const { hasBrands: hasFranchises } = useFranchiseCosts(businessTypeId);
  const [mode, setMode] = useState<Mode>('choose');
  const benchmark = useBenchmarkData(businessTypeId, null);
  const startupGuideline = benchmark.startupCost ? {
    text: `이 업종 프랜차이즈 평균 창업비용 약 ${formatKRWShort(benchmark.startupCost.totalCost)}`,
    source: benchmark.startupCost.source,
  } : getGuideline(businessTypeId, scale, 'investment-breakdown');

  const scaleSqm = useMemo(() => getScaleSqm(scale, businessTypeId), [scale, businessTypeId]);

  const defaultItems = useMemo(
    () => getInvestmentBreakdown(businessTypeId, scale),
    [businessTypeId, scale]
  );
  const items = breakdown ?? defaultItems;
  const total = items.reduce((s, i) => s + i.amount, 0);

  const handleItemChange = (index: number, amount: number) => {
    const updated = items.map((item, i) => i === index ? { ...item, amount } : item);
    onChange(updated);
  };

  const handleFranchiseSelect = useCallback((investment: FranchiseInvestment) => {
    const franchiseItems: InvestmentItem[] = [
      { category: 'franchise', label: '가맹비', amount: investment.initial_fee, editable: true },
      { category: 'franchise', label: '교육비', amount: investment.education_fee, editable: true },
      { category: 'deposit', label: '보증금', amount: investment.deposit, editable: true },
      { category: 'interior', label: '인테리어비', amount: investment.interior, editable: true },
      { category: 'other', label: '기타비용', amount: investment.other, editable: true },
    ];
    onChange(franchiseItems);
    setMode('franchise');
  }, [onChange]);

  const handleIndependent = useCallback(() => {
    setMode('independent');
  }, []);

  const handleResetChoice = useCallback(() => {
    setMode('choose');
  }, []);

  if (mode === 'choose') {
    return (
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>초기투자 비용</h2>
        <p className={styles.stepDesc}>프랜차이즈 브랜드를 선택하면 예상 투자비를 자동 계산해요</p>
        <GuidelineBox guideline={startupGuideline} />
        <FranchiseSearch
          businessTypeId={businessTypeId}
          scaleSqm={scaleSqm}
          onSelect={handleFranchiseSelect}
          onIndependent={handleIndependent}
        />
      </div>
    );
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>초기투자 항목별 분해</h2>
      <p className={styles.stepDesc}>항목별 금액을 조정할 수 있어요</p>
      <GuidelineBox guideline={startupGuideline} />
      {hasFranchises && (
        <button
          className={styles.hint}
          type="button"
          onClick={handleResetChoice}
          style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
        >
          ← 프랜차이즈 선택으로 돌아가기
        </button>
      )}
      <div className={styles.sliderGroup}>
        {items.map((item, i) => (
          <SliderInput
            key={i}
            label={item.label}
            value={item.amount}
            min={0}
            max={Math.max((defaultItems[i]?.amount ?? item.amount) * 2, 5_000_000)}
            step={1_000_000}
            format={formatKRWShort}
            onChange={v => handleItemChange(i, v)}
          />
        ))}
      </div>
      <div className={styles.investmentTotal}>
        <span>합계</span>
        <span>{formatKRWShort(total)}</span>
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
