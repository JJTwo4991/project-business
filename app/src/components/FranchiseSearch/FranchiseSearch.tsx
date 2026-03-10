import { useState, useMemo, useEffect } from 'react';
import styles from './FranchiseSearch.module.css';
import { useFranchiseCosts } from '../../hooks/useFranchiseCosts';
import type { FranchiseBrandUnified } from '../../hooks/useFranchiseCosts';
import { formatKRWShort } from '../../lib/format';

export interface FranchiseInvestment {
  franchise_name: string | null;
  initial_fee: number;
  education_fee: number;
  deposit: number;
  interior: number;
  other: number;
  total: number;
}

interface Props {
  businessTypeId: number;
  scaleSqm: number;
  onSelect: (investment: FranchiseInvestment) => void;
  onIndependent: () => void;
}

export function FranchiseSearch({ businessTypeId, scaleSqm, onSelect, onIndependent }: Props) {
  const [query, setQuery] = useState('');
  const { search, loading, hasBrands } = useFranchiseCosts(businessTypeId);

  useEffect(() => {
    if (!loading && !hasBrands) {
      onIndependent();
    }
  }, [loading, hasBrands, onIndependent]);

  const results = useMemo(
    () => search(query),
    [query, search]
  );

  const handleSelect = (brand: FranchiseBrandUnified) => {
    const interior = brand.interior_per_sqm * scaleSqm;
    const total = brand.initial_fee + brand.education_fee + brand.deposit + interior + brand.other_cost;
    onSelect({
      franchise_name: brand.name,
      initial_fee: brand.initial_fee,
      education_fee: brand.education_fee,
      deposit: brand.deposit,
      interior,
      other: brand.other_cost,
      total,
    });
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.emptyMsg}>프랜차이즈 데이터 로딩 중...</p>
      </div>
    );
  }

  if (!hasBrands) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.searchInput}
        type="text"
        placeholder="프랜차이즈 브랜드명 검색"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      <button
        className={styles.independentBtn}
        type="button"
        onClick={onIndependent}
      >
        프랜차이즈가 아니라, 개인 브랜드를 시작할 거에요
      </button>

      {results.length > 0 ? (
        <div className={styles.brandList}>
          {results.map(brand => {
            const estTotal = brand.initial_fee + brand.education_fee + brand.deposit +
              brand.interior_per_sqm * scaleSqm + brand.other_cost;
            return (
              <div
                key={brand.name}
                className={styles.brandItem}
                onClick={() => handleSelect(brand)}
              >
                <div className={styles.brandInfo}>
                  <span className={styles.brandName}>{brand.name}</span>
                  <span className={styles.brandSummary}>
                    인테리어 {brand.interior_per_sqm.toLocaleString('ko-KR')}원/㎡
                  </span>
                </div>
                <span className={styles.brandBadge}>
                  {formatKRWShort(estTotal)}
                </span>
              </div>
            );
          })}
        </div>
      ) : query.trim() ? (
        <div className={styles.emptyMsg}>검색 결과가 없습니다</div>
      ) : null}
    </div>
  );
}
