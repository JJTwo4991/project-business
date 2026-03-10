import styles from './WizardSteps.module.css';
import type { BusinessScale, BusinessType } from '../../types';
import { getScaleDescriptions } from '../../data/scaleDescriptions';
import { formatKRWShort } from '../../lib/format';
import { GuidelineBox } from '../../components/GuidelineBox/GuidelineBox';
import { getGuideline } from '../../data/guidelines';

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
      <h2 className={styles.stepTitle}>매장 규모를 선택하세요</h2>
      <GuidelineBox guideline={getGuideline(businessType.id, selected, 'select-scale')} />
      <div className={styles.scaleCards}>
        {descriptions.map(desc => {
          const inv = desc.scale === 'small' ? businessType.initial_investment_small
            : desc.scale === 'large' ? businessType.initial_investment_large
            : businessType.initial_investment_medium;
          return (
            <button
              key={desc.scale}
              className={`${styles.card} ${selected === desc.scale ? styles.cardActive : ''}`}
              onClick={() => onSelect(desc.scale)}
            >
              <span className={styles.cardName}>{desc.label}</span>
              <span className={styles.cardDetail}>{desc.sqm}㎡{desc.seats ? ` / ${desc.seats}석` : ''}</span>
              <span className={styles.cardDetail}>{desc.description}</span>
              <span className={styles.cardDetail} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                ~{formatKRWShort(inv)}
              </span>
            </button>
          );
        })}
      </div>
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
