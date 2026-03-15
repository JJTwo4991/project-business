import styles from './WizardSteps.module.css';
import type { BusinessScale, BusinessType } from '../../types';
import { getScaleDescriptions } from '../../data/scaleDescriptions';
import { formatKRWShort } from '../../lib/format';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline } from '../../data/guidelines';
import { SCALE_ICONS } from '../../assets/icons';

interface Props {
  businessType: BusinessType;
  selected: BusinessScale;
  onSelect: (scale: BusinessScale) => void;
  onNext: () => void;
}

export function ScaleSelectStep({ businessType, selected, onSelect, onNext }: Props) {
  const descriptions = getScaleDescriptions(businessType.id);

  return (
    <div className={styles.step}>
      <div>
        <h2 className={styles.stepTitle}>매장 규모를 선택하세요</h2>
        <p className={styles.stepDesc}>업종 평균 추정치 (사장님께서 직접 조정 가능해요)</p>
      </div>
      <GuidelineBox guideline={getGuideline(businessType.id, selected, 'select-scale')} />
      <div className={styles.scaleList}>
        {descriptions.map(desc => {
          const inv = desc.scale === 'small'
            ? (businessType.initial_investment_small ?? businessType.initial_investment_min)
            : desc.scale === 'large'
            ? (businessType.initial_investment_large ?? businessType.initial_investment_max)
            : (businessType.initial_investment_medium ?? Math.round((businessType.initial_investment_min + businessType.initial_investment_max) / 2));
          const isActive = selected === desc.scale;
          return (
            <button
              key={desc.scale}
              className={`${styles.scaleCard} ${isActive ? styles.scaleCardActive : ''}`}
              onClick={() => onSelect(desc.scale)}
            >
              <span className={`${styles.scaleLabel} ${isActive ? styles.scaleLabelActive : ''}`}>
                {desc.label}
              </span>
              <div className={styles.scaleInfo}>
                <span className={styles.scaleInfoMeta}>
                  {desc.sqm}㎡{desc.seats ? ` / ${desc.seats}석` : ''}
                </span>
                <span className={styles.scaleInfoDesc}>{desc.description}</span>
                <span className={styles.scaleInfoInv}>약 {formatKRWShort(inv)}</span>
              </div>
              <span className={styles.scaleImage} aria-hidden="true" style={{ fontSize: '44px', lineHeight: 1 }}>
                {SCALE_ICONS[desc.scale]}
              </span>
            </button>
          );
        })}
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
