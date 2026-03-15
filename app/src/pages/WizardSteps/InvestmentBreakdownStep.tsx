import { useState, useMemo, useCallback } from 'react';
import styles from './WizardSteps.module.css';
import type { InvestmentItem, BusinessScale } from '../../types';
import { getInvestmentBreakdown } from '../../data/costItems';
import { formatKRWShort } from '../../lib/format';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline } from '../../data/guidelines';
import { FranchiseSearch } from '../../components/FranchiseSearch/FranchiseSearch';
import type { FranchiseInvestment } from '../../components/FranchiseSearch/FranchiseSearch';
import { getScaleSqm } from '../../lib/scale';
import { useFranchiseCosts } from '../../hooks/useFranchiseCosts';
import { getIndustryAverages } from '../../data/franchiseData';
import { UI_ICONS } from '../../assets/icons';

type Mode = 'choose' | 'franchise' | 'independent';
type ChooseSubMode = null | 'franchise-search';

interface Props {
  businessTypeId: number;
  scale: BusinessScale;
  breakdown: InvestmentItem[] | undefined;
  onChange: (items: InvestmentItem[]) => void;
  onBrandSelect?: (brand: import('../../types').FranchiseBrand | null) => void;
  onNext: () => void;
}

export function InvestmentBreakdownStep({ businessTypeId, scale, breakdown, onChange, onBrandSelect, onNext }: Props) {
  useFranchiseCosts(businessTypeId);
  const [mode, setMode] = useState<Mode>('choose');
  const [chooseSubMode, setChooseSubMode] = useState<ChooseSubMode>(null);
  const [franchiseName, setFranchiseName] = useState<string | null>(null);
  const startupGuideline = getGuideline(businessTypeId, scale, 'investment-breakdown');

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
    setFranchiseName(investment.franchise_name);
    onBrandSelect?.(investment.brand);
    setMode('franchise');
  }, [onChange, onBrandSelect]);

  const handleIndependent = useCallback(() => {
    const avg = getIndustryAverages(businessTypeId);
    const interiorTotal = avg.interior_per_sqm * scaleSqm;
    const independentItems: InvestmentItem[] = [
      { category: 'franchise', label: '가맹비', amount: 0, editable: false },
      { category: 'franchise', label: '교육비', amount: 0, editable: false },
      { category: 'deposit', label: '보증금', amount: 0, editable: false },
      { category: 'other', label: '기타비용 (집기, 비품)', amount: avg.other_cost, editable: true },
      { category: 'interior', label: '인테리어비', amount: interiorTotal, editable: true },
    ];
    onChange(independentItems);
    onBrandSelect?.(null);
    setMode('independent');
  }, [businessTypeId, scaleSqm, onChange, onBrandSelect]);

  if (mode === 'choose') {
    if (chooseSubMode === 'franchise-search') {
      return (
        <div className={styles.step}>
          <h2 className={styles.stepTitle}>초기투자 비용</h2>
          <p className={styles.stepDesc}>프랜차이즈 브랜드를 선택하면 예상 투자비를 자동 계산해요</p>
          <GuidelineBox guideline={startupGuideline} />
          <button
            className={styles.hint}
            type="button"
            onClick={() => setChooseSubMode(null)}
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
          >
            ← 처음으로 돌아가기
          </button>
          <FranchiseSearch
            businessTypeId={businessTypeId}
            scaleSqm={scaleSqm}
            onSelect={handleFranchiseSelect}
          />
        </div>
      );
    }

    return (
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>초기투자 비용</h2>
        <p className={styles.stepDesc}>창업 방식을 선택해요</p>
        <div className={styles.typeSelectGroup}>
          <button
            className={styles.typeSelectBtn}
            type="button"
            onClick={() => setChooseSubMode('franchise-search')}
          >
            <span className={styles.typeSelectIcon} style={{ fontSize: '36px', lineHeight: 1 }} aria-hidden="true">
              {UI_ICONS.franchise}
            </span>
            <div className={styles.typeSelectText}>
              <span className={styles.typeSelectTitle}>프랜차이즈</span>
              <span className={styles.typeSelectSub}>브랜드 가맹점으로 시작해요</span>
            </div>
          </button>
          <button
            className={styles.typeSelectBtn}
            type="button"
            onClick={handleIndependent}
          >
            <span className={styles.typeSelectIcon} style={{ fontSize: '36px', lineHeight: 1 }} aria-hidden="true">
              {UI_ICONS.individual}
            </span>
            <div className={styles.typeSelectText}>
              <span className={styles.typeSelectTitle}>개인사업</span>
              <span className={styles.typeSelectSub}>나만의 가게를 시작해요</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>초기투자 구성</h2>
      {mode === 'franchise' && franchiseName ? (
        <>
          <p style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px', lineHeight: 1.4 }}>
            {franchiseName} 창업비용 평균 {formatKRWShort(total)}
          </p>
          <p style={{ fontSize: '12px', color: '#999', margin: '0 0 12px' }}>
            (출처: 공정위 프랜차이즈 공시 시스템)
          </p>
        </>
      ) : (
        <p className={styles.stepDesc}>항목별 금액을 조정할 수 있어요</p>
      )}
      {mode !== 'franchise' && <GuidelineBox guideline={startupGuideline} />}
      {mode === 'independent' && (
        <p className={styles.hint} style={{ color: '#888', fontSize: '13px', margin: '0 0 12px' }}>
          개인 사업은 가맹비, 교육비 등이 없어요
        </p>
      )}
      {mode === 'franchise' && (
        <div style={{ background: 'var(--color-primary-light)', borderRadius: '10px', padding: '12px 16px', margin: '0 0 14px', color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>
          선택하신 브랜드가 공시한 창업비용이에요.<br />
          사장님께서 조절할 수 있어요.
        </div>
      )}
      <div className={styles.sliderGroup}>
        {items.map((item, i) => {
          const isOther = item.category === 'other';
          const cap = isOther ? 100_000_000 : 80_000_000;
          return (
          <div key={i}>
            <SliderInput
              label={item.label}
              value={item.amount}
              min={0}
              max={Math.min(Math.max((defaultItems[i]?.amount ?? item.amount) * 2, 5_000_000), cap)}
              step={1_000_000}
              format={formatKRWShort}
              onChange={v => handleItemChange(i, v)}
              disabled={item.editable === false}
              inputUnit={{ divisor: 1_000_000, label: '백만원' }}
            />
            {mode === 'independent' && item.editable && (
              <p style={{ color: '#aaa', fontSize: '12px', margin: '-4px 0 8px 4px' }}>
                같은 업종 평균값이에요. 조정할 수 있어요
              </p>
            )}
          </div>
          );
        })}
      </div>
      <div className={styles.investmentTotal}>
        <span>합계</span>
        <span>{formatKRWShort(total)}</span>
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
