import styles from './BusinessTypeCard.module.css';
import type { BusinessType } from '../../types';
import { formatKRWShort } from '../../lib/format';
import { Icon } from '../Icon/Icon';
import { getIndustryIcon } from '../../assets/icons';

interface Props {
  business: BusinessType;
  onSelect: (bt: BusinessType) => void;
}

export function BusinessTypeCard({ business, onSelect }: Props) {
  const icon = getIndustryIcon(business.id, business.category);
  const revenueRange = `${formatKRWShort(business.avg_monthly_revenue_min)} ~ ${formatKRWShort(business.avg_monthly_revenue_max)}`;
  const closureLabel = `1년 폐업률 ${Math.round(business.closure_rate_1yr * 100)}%`;

  return (
    <button
      className={styles.card}
      onClick={() => onSelect(business)}
      aria-label={`${business.name} 선택`}
    >
      <Icon src={icon} alt={business.name} size={32} />
      <span className={styles.name}>{business.name}</span>
      <span className={styles.category}>{business.category}</span>
      <span className={styles.revenue}>{revenueRange}</span>
      <span className={styles.closure}>{closureLabel}</span>
    </button>
  );
}
