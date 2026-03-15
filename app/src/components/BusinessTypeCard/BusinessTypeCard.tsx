import styles from './BusinessTypeCard.module.css';
import type { BusinessType } from '../../types';
import { formatKRWShort } from '../../lib/format';
import { getIndustryIcon } from '../../assets/icons';

interface Props {
  business: BusinessType;
  onSelect: (bt: BusinessType) => void;
}

export function BusinessTypeCard({ business, onSelect }: Props) {
  const icon = getIndustryIcon(business.id, business.category);
  const revenueRange = `${formatKRWShort(business.avg_monthly_revenue_min)} ~ ${formatKRWShort(business.avg_monthly_revenue_max)}`;

  return (
    <button
      className={styles.card}
      onClick={() => onSelect(business)}
      aria-label={`${business.name} 선택`}
    >
      <span style={{ fontSize: '28px', lineHeight: 1 }} aria-hidden="true">{icon}</span>
      <span className={styles.name}>{business.name}</span>
      <span className={styles.category}>{business.category}</span>
      <span className={styles.revenue}>{revenueRange}</span>
    </button>
  );
}
