import type { SavedSimulation } from '../../hooks/useRecentSimulations';
import { formatKRWShort } from '../../lib/format';
import { getIndustryIcon } from '../../assets/icons';
import styles from './RecentSimulations.module.css';

const SCALE_LABEL: Record<string, string> = {
  small: '소형',
  medium: '중형',
  large: '대형',
};

interface Props {
  items: SavedSimulation[];
  onSelect: (item: SavedSimulation) => void;
  onRemove: (id: string) => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export function RecentSimulations({ items, onSelect, onRemove }: Props) {
  if (items.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>최근 시뮬레이션</h3>
      <div className={styles.list}>
        {items.map(item => (
          <button
            key={item.id}
            className={styles.card}
            onClick={() => onSelect(item)}
          >
            <span className={styles.icon} aria-hidden="true">
              {getIndustryIcon(item.businessId)}
            </span>
            <div className={styles.info}>
              <span className={styles.name}>
                {item.businessName}
                <span className={styles.badge}>{SCALE_LABEL[item.scale] ?? item.scale}</span>
              </span>
              {item.region && (
                <span className={styles.region}>{item.region}</span>
              )}
              <span className={styles.profit}>
                월 순이익 {formatKRWShort(item.monthlyNetIncome)}
                {item.paybackMonths != null && (
                  <> · 회수 {item.paybackMonths}개월</>
                )}
              </span>
            </div>
            <div className={styles.right}>
              <span className={styles.time}>{timeAgo(item.savedAt)}</span>
              <button
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                aria-label="삭제"
              >
                ✕
              </button>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
