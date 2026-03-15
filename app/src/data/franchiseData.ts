import type { FranchiseBrand } from '../types';
import { FTC_PIZZA, FTC_CHICKEN } from './ftc/ftcBrands';

export type { FranchiseBrand };

const SOURCE = '가맹비·교육비·보증금: 공정위 정보공개서 참고 추정, 인테리어·기타비용: 업계 추정치 (공식 출처 미확인)';
const R0 = { royalty_rate: 0, advertising_rate: 0 } as const;

export const FRANCHISE_BRANDS: FranchiseBrand[] = [
  // 치킨전문점 (id: 1) — FTC 공정위 데이터
  ...FTC_CHICKEN,

  // 커피전문점 (id: 2)
  { name: '이디야커피', business_type_id: 2, initial_fee: 5_000_000, education_fee: 2_000_000, deposit: 3_000_000, interior_per_sqm: 700_000, other_cost: 15_000_000, source: SOURCE, ...R0 },
  { name: '메가MGC커피', business_type_id: 2, initial_fee: 5_000_000, education_fee: 1_000_000, deposit: 3_000_000, interior_per_sqm: 600_000, other_cost: 12_000_000, source: SOURCE, ...R0 },
  { name: '컴포즈커피', business_type_id: 2, initial_fee: 3_000_000, education_fee: 1_000_000, deposit: 2_000_000, interior_per_sqm: 500_000, other_cost: 10_000_000, source: SOURCE, ...R0 },
  { name: '빽다방', business_type_id: 2, initial_fee: 3_000_000, education_fee: 1_000_000, deposit: 2_000_000, interior_per_sqm: 550_000, other_cost: 8_000_000, source: SOURCE, ...R0 },
  { name: '투썸플레이스', business_type_id: 2, initial_fee: 10_000_000, education_fee: 3_000_000, deposit: 5_000_000, interior_per_sqm: 900_000, other_cost: 20_000_000, source: SOURCE, ...R0 },

  // 편의점 (id: 3)
  { name: 'CU', business_type_id: 3, initial_fee: 0, education_fee: 0, deposit: 5_000_000, interior_per_sqm: 500_000, other_cost: 20_000_000, source: SOURCE, ...R0 },
  { name: 'GS25', business_type_id: 3, initial_fee: 0, education_fee: 0, deposit: 5_000_000, interior_per_sqm: 520_000, other_cost: 20_000_000, source: SOURCE, ...R0 },
  { name: '세븐일레븐', business_type_id: 3, initial_fee: 0, education_fee: 0, deposit: 3_000_000, interior_per_sqm: 480_000, other_cost: 18_000_000, source: SOURCE, ...R0 },
  { name: '이마트24', business_type_id: 3, initial_fee: 0, education_fee: 0, deposit: 3_000_000, interior_per_sqm: 450_000, other_cost: 15_000_000, source: SOURCE, ...R0 },

  // 미용실 (id: 4)
  { name: '이가자헤어비스', business_type_id: 4, initial_fee: 5_000_000, education_fee: 3_000_000, deposit: 3_000_000, interior_per_sqm: 600_000, other_cost: 5_000_000, source: SOURCE, ...R0 },
  { name: '준오헤어', business_type_id: 4, initial_fee: 8_000_000, education_fee: 5_000_000, deposit: 5_000_000, interior_per_sqm: 700_000, other_cost: 8_000_000, source: SOURCE, ...R0 },

  // 분식점 (id: 5)
  { name: '신전떡볶이', business_type_id: 5, initial_fee: 5_000_000, education_fee: 2_000_000, deposit: 3_000_000, interior_per_sqm: 550_000, other_cost: 6_000_000, source: SOURCE, ...R0 },
  { name: '죠스떡볶이', business_type_id: 5, initial_fee: 5_000_000, education_fee: 2_000_000, deposit: 3_000_000, interior_per_sqm: 500_000, other_cost: 5_000_000, source: SOURCE, ...R0 },
  { name: '김가네', business_type_id: 5, initial_fee: 5_000_000, education_fee: 2_000_000, deposit: 5_000_000, interior_per_sqm: 600_000, other_cost: 7_000_000, source: SOURCE, ...R0 },

  // 한식전문점 (id: 6)
  { name: '새마을식당', business_type_id: 6, initial_fee: 10_000_000, education_fee: 3_000_000, deposit: 5_000_000, interior_per_sqm: 750_000, other_cost: 15_000_000, source: SOURCE, ...R0 },
  { name: '하남돼지집', business_type_id: 6, initial_fee: 8_000_000, education_fee: 3_000_000, deposit: 5_000_000, interior_per_sqm: 700_000, other_cost: 12_000_000, source: SOURCE, ...R0 },

  // 세탁소 (id: 7)
  { name: '크린토피아', business_type_id: 7, initial_fee: 5_000_000, education_fee: 2_000_000, deposit: 3_000_000, interior_per_sqm: 400_000, other_cost: 20_000_000, source: SOURCE, ...R0 },
  { name: '월드크리닝', business_type_id: 7, initial_fee: 3_000_000, education_fee: 2_000_000, deposit: 2_000_000, interior_per_sqm: 350_000, other_cost: 15_000_000, source: SOURCE, ...R0 },

  // 피자전문점 (id: 8) — FTC 공정위 데이터
  ...FTC_PIZZA,

  // 베이커리 (id: 9)
  { name: '파리바게뜨', business_type_id: 9, initial_fee: 10_000_000, education_fee: 5_000_000, deposit: 10_000_000, interior_per_sqm: 900_000, other_cost: 30_000_000, source: SOURCE, ...R0 },
  { name: '뚜레쥬르', business_type_id: 9, initial_fee: 8_000_000, education_fee: 4_000_000, deposit: 8_000_000, interior_per_sqm: 850_000, other_cost: 25_000_000, source: SOURCE, ...R0 },

  // 무인아이스크림 (id: 14) — Supabase franchise_costs에서 로드 (기타도소매 중 아이스크림 브랜드)

  // 반찬가게 / 한식 (id: 13)
  { name: '본죽', business_type_id: 13, initial_fee: 5_000_000, education_fee: 2_000_000, deposit: 3_000_000, interior_per_sqm: 550_000, other_cost: 6_000_000, source: SOURCE, ...R0 },
  { name: '김밥천국', business_type_id: 13, initial_fee: 0, education_fee: 1_000_000, deposit: 2_000_000, interior_per_sqm: 450_000, other_cost: 5_000_000, source: SOURCE, ...R0 },
];

export function getFranchisesByType(businessTypeId: number): FranchiseBrand[] {
  return FRANCHISE_BRANDS.filter(b => b.business_type_id === businessTypeId);
}

export function searchFranchises(query: string, businessTypeId: number): FranchiseBrand[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return getFranchisesByType(businessTypeId);
  return FRANCHISE_BRANDS.filter(
    b => b.business_type_id === businessTypeId &&
      b.name.toLowerCase().includes(trimmed)
  );
}

/** 업종별 평균값 (개인 가게 디폴트용) */
export interface IndustryAverages {
  other_cost: number;
  interior_per_sqm: number;
}

export function getIndustryAverages(businessTypeId: number): IndustryAverages {
  const brands = getFranchisesByType(businessTypeId);
  if (brands.length === 0) {
    return { other_cost: 10_000_000, interior_per_sqm: 500_000 };
  }
  const avg = (key: 'other_cost' | 'interior_per_sqm') => {
    const vals = brands.map(b => b[key]).filter(v => v > 0);
    return vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };
  return {
    other_cost: avg('other_cost'),
    interior_per_sqm: avg('interior_per_sqm'),
  };
}

/**
 * 업종 평균 총 창업비용 (프랜차이즈 브랜드 기준, 주어진 평수로 계산)
 */
export function getIndustryTotalAvg(businessTypeId: number, sqm: number): number {
  const brands = getFranchisesByType(businessTypeId);
  if (brands.length === 0) return 0;
  const avgField = (key: keyof Pick<FranchiseBrand, 'initial_fee' | 'education_fee' | 'deposit' | 'other_cost' | 'interior_per_sqm'>) => {
    const vals = brands.map(b => b[key] as number);
    return Math.round(vals.reduce((a, v) => a + v, 0) / vals.length);
  };
  return (
    avgField('initial_fee') +
    avgField('education_fee') +
    avgField('deposit') +
    avgField('other_cost') +
    avgField('interior_per_sqm') * sqm
  );
}
