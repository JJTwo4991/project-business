import styles from './HomePage.module.css';
import { useBusinessTypes } from '../../hooks/useBusinessTypes';
import { BusinessTypeCard } from '../../components/BusinessTypeCard/BusinessTypeCard';
import type { BusinessType } from '../../types';

interface Props {
  onSelect: (bt: BusinessType) => void;
}

export function HomePage({ onSelect }: Props) {
  const { businessTypes, loading, error } = useBusinessTypes();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>자영업 수익 시뮬레이터</h1>
        <p className={styles.subtitle}>업종을 선택하면 수익성을 분석해드려요</p>
      </header>

      {loading && (
        <div className={styles.center}>
          <span className={styles.spinner} aria-label="로딩 중" />
          <p>데이터 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <p>데이터를 불러오지 못했어요.</p>
          <p className={styles.errorDetail}>{error}</p>
        </div>
      )}

      {!loading && !error && businessTypes.length === 0 && (
        <div className={styles.center}>
          <p>업종 데이터가 없어요.</p>
        </div>
      )}

      {!loading && !error && businessTypes.length > 0 && (
        <div className={styles.grid}>
          {businessTypes.map(bt => (
            <BusinessTypeCard key={bt.id} business={bt} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
