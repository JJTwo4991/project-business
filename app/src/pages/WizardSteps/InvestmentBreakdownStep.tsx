import { useState, useMemo, useCallback, useEffect } from 'react';
import styles from './WizardSteps.module.css';
import type { InvestmentItem, BusinessScale } from '../../types';
import { getInvestmentBreakdown } from '../../data/costItems';
import { formatKRWShort } from '../../lib/format';
import { SliderInput } from '../../components/SliderInput/SliderInput';
import { FranchiseSearch } from '../../components/FranchiseSearch/FranchiseSearch';
import type { FranchiseInvestment } from '../../components/FranchiseSearch/FranchiseSearch';
import { getScaleSqm } from '../../lib/scale';
import { useFranchiseCosts } from '../../hooks/useFranchiseCosts';
import { getIndustryAverages, hasNoFranchise } from '../../data/franchiseData';
import { UI_ICONS } from '../../assets/icons';
import { trackClick } from '../../lib/analytics';

type Mode = 'choose' | 'franchise' | 'independent' | 'no-franchise-msg';
type ChooseSubMode = null | 'franchise-search';

interface Props {
  businessTypeId: number;
  scale: BusinessScale;
  breakdown: InvestmentItem[] | undefined;
  onChange: (items: InvestmentItem[]) => void;
  onBrandSelect?: (brand: import('../../types').FranchiseBrand | null) => void;
  onNext: () => void;
  /** 커스텀 뒤로가기 핸들러 등록 — true 반환 시 내부에서 처리됨 */
  registerBackHandler?: (handler: (() => boolean) | null) => void;
}

export function InvestmentBreakdownStep({ businessTypeId, scale, breakdown, onChange, onBrandSelect, onNext, registerBackHandler }: Props) {
  useFranchiseCosts(businessTypeId);
  const [mode, setMode] = useState<Mode>('choose');
  const [chooseSubMode, setChooseSubMode] = useState<ChooseSubMode>(null);
  const [franchiseName, setFranchiseName] = useState<string | null>(null);

  const scaleSqm = useMemo(() => getScaleSqm(scale, businessTypeId), [scale, businessTypeId]);
  const noFranchise = hasNoFranchise(businessTypeId);

  // 서브모드에서 뒤로가기 시 choose로 돌아가기
  useEffect(() => {
    if (!registerBackHandler) return;
    const handler = () => {
      if (mode === 'franchise' || mode === 'independent' || mode === 'no-franchise-msg') {
        setMode('choose');
        setChooseSubMode(null);
        return true; // 내부에서 처리됨
      }
      if (chooseSubMode === 'franchise-search') {
        setChooseSubMode(null);
        return true;
      }
      return false; // 일반 뒤로가기
    };
    registerBackHandler(handler);
    return () => registerBackHandler(null);
  }, [registerBackHandler, mode, chooseSubMode]);

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

  if (mode === 'no-franchise-msg') {
    return (
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>프랜차이즈를 찾기 어려워요</h2>
        <p className={styles.stepDesc}>개인사업으로 진행해 주세요</p>
        <button className={styles.nextBtn} onClick={() => { setMode('choose'); }}>돌아가기</button>
      </div>
    );
  }

  if (mode === 'choose') {
    if (chooseSubMode === 'franchise-search') {
      return (
        <div className={styles.step}>
          <h2 className={styles.stepTitle}>프랜차이즈 브랜드를 선택하세요</h2>
          <p className={styles.stepDesc}>브랜드를 선택하면 예상 투자비를 자동 계산해요</p>
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
        <h2 className={styles.stepTitle}>창업 방식을 선택하세요</h2>
        <div className={styles.typeSelectGroup}>
          <button
            className={styles.typeSelectBtn}
            type="button"
            onClick={() => { trackClick('창업_방식을_선택하세요', { type: '프랜차이즈' }); noFranchise ? setMode('no-franchise-msg') : setChooseSubMode('franchise-search'); }}
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
            onClick={() => { trackClick('창업_방식을_선택하세요', { type: '개인사업' }); handleIndependent(); }}
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
      <h2 className={styles.stepTitle}>개업 비용을 추정해보세요</h2>
      <div className={styles.disclaimer}>
        {mode === 'franchise' && franchiseName ? (
          <>
            <strong>{franchiseName}</strong> 창업비용 평균 <strong>{formatKRWShort(total)}</strong><br />
            선택하신 브랜드가 공시한 창업비용이에요. 사장님께서 조절할 수 있어요.<br />
            <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>출처: 공정위 프랜차이즈 공시 시스템</span>
          </>
        ) : (
          <>
            항목별 금액을 조정할 수 있어요<br />
            {mode === 'independent' && '개인 사업은 가맹비, 교육비 등이 없어요'}
          </>
        )}
      </div>
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
                {noFranchise ? '임의의 값이에요. 조정할 수 있어요' : '같은 업종 평균값이에요. 조정할 수 있어요'}
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
      <button className={styles.nextBtn} onClick={() => { trackClick('개업_비용을_추정해보세요', { mode, total_investment: total, brand_name: franchiseName }); onNext(); }}>다음</button>
    </div>
  );
}
