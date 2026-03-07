import styles from './BusinessTypeCard.module.css';
import type { BusinessType } from '../../types';
import { formatKRWShort } from '../../lib/format';

const CATEGORY_EMOJI: Record<string, string> = {
  '외식': '🍜',
  '카페': '☕',
  '소매': '🛍️',
  '서비스': '✂️',
  '교육': '📚',
  '운동': '💪',
  '기타': '🏪',
};

interface Props {
  business: BusinessType;
  onSelect: (bt: BusinessType) => void;
}

export function BusinessTypeCard({ business, onSelect }: Props) {
  const emoji = CATEGORY_EMOJI[business.category] ?? '🏪';
  const revenueRange = `${formatKRWShort(business.avg_monthly_revenue_min)} ~ ${formatKRWShort(business.avg_monthly_revenue_max)}`;
  const closureLabel = `1년 폐업률 ${Math.round(business.closure_rate_1yr * 100)}%`;

  return (
    <button
      className={styles.card}
      onClick={() => onSelect(business)}
      aria-label={`${business.name} 선택`}
    >
      <span className={styles.emoji}>{emoji}</span>
      <span className={styles.name}>{business.name}</span>
      <span className={styles.category}>{business.category}</span>
      <span className={styles.revenue}>{revenueRange}</span>
      <span className={styles.closure}>{closureLabel}</span>
    </button>
  );
}
