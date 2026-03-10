import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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

// 주요 브랜드 (우선 표시)
const PRIORITY_BRANDS: Record<number, string[]> = {
  1: ['BBQ', 'BHC', '교촌치킨', '굽네치킨', '네네치킨', '처갓집', '맘스터치', '페리카나', '호식이두마리치킨', '또래오래', '푸라닭', '바르다김선생', '컬투치킨', '멕시카나', '자담치킨', '지코바치킨', '60계치킨'],
  8: ['도미노피자', '피자헛', '미스터피자', '파파존스', '피자알볼로', '피자나라치킨공주', '7번가피자', '피자마루', '반올림피자샵', '오구피자', '피자스쿨'],
};

const PAGE_SIZE = 20;

export function FranchiseSearch({ businessTypeId, scaleSqm, onSelect, onIndependent }: Props) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { search, loading, hasBrands } = useFranchiseCosts(businessTypeId);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !hasBrands) {
      onIndependent();
    }
  }, [loading, hasBrands, onIndependent]);

  // 검색어 바뀌면 보이는 수 초기화
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  const sortedResults = useMemo(() => {
    const results = search(query);
    const priority = PRIORITY_BRANDS[businessTypeId] || [];
    if (priority.length === 0 || query.trim()) return results;

    // 주요 브랜드 우선 정렬
    const prioritySet = new Set(priority.map(n => n.toLowerCase()));
    const top: FranchiseBrandUnified[] = [];
    const rest: FranchiseBrandUnified[] = [];
    for (const brand of results) {
      if (prioritySet.has(brand.name.toLowerCase()) ||
          priority.some(p => brand.name.includes(p))) {
        top.push(brand);
      } else {
        rest.push(brand);
      }
    }
    // 주요 브랜드 내에서도 priority 순서 유지
    top.sort((a, b) => {
      const ai = priority.findIndex(p => a.name.includes(p));
      const bi = priority.findIndex(p => b.name.includes(p));
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
    return [...top, ...rest];
  }, [query, search, businessTypeId]);

  const visibleBrands = sortedResults.slice(0, visibleCount);
  const hasMore = visibleCount < sortedResults.length;

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || !hasMore) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, sortedResults.length));
    }
  }, [hasMore, sortedResults.length]);

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

      {visibleBrands.length > 0 ? (
        <div className={styles.brandList} ref={listRef} onScroll={handleScroll}>
          {visibleBrands.map(brand => {
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
          {hasMore && (
            <p className={styles.emptyMsg} style={{ padding: '8px', fontSize: '12px' }}>
              스크롤하면 더 많은 브랜드를 볼 수 있어요 ({sortedResults.length - visibleCount}개 더)
            </p>
          )}
        </div>
      ) : query.trim() ? (
        <div className={styles.emptyMsg}>검색 결과가 없습니다</div>
      ) : null}
    </div>
  );
}
