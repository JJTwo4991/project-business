import styles from './WizardSteps.module.css';
import type { BusinessType } from '../../types';
import { formatKRWShort } from '../../lib/format';
import { Icon } from '../../components/Icon/Icon';
import { getIndustryIcon } from '../../assets/icons';

interface Props {
  businessTypes: BusinessType[];
  onSelect: (bt: BusinessType) => void;
}

export function IndustrySelectStep({ businessTypes, onSelect }: Props) {
  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>어떤 업종을 알아볼까요?</h2>
      <p className={styles.stepDesc}>업종을 선택하면 수익성을 분석해드려요</p>
      <div className={styles.grid}>
        {businessTypes.map(bt => (
          <button key={bt.id} className={styles.card} onClick={() => onSelect(bt)}>
            <Icon src={getIndustryIcon(bt.id, bt.category)} alt={bt.name} size={34} />
            <span className={styles.cardName}>{bt.name}</span>
            <span className={styles.cardDetail}>
              {formatKRWShort(bt.avg_monthly_revenue_min)}~{formatKRWShort(bt.avg_monthly_revenue_max)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
