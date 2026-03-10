import type { BusinessScale } from '../types';
import { formatKRWShort } from '../lib/format';

export interface Guideline {
  text: string;
  source: string;
}

export type GuidelineStep =
  | 'select-scale'
  | 'investment-breakdown'
  | 'set-investment'
  | 'set-loan'
  | 'set-customers'
  | 'set-ticket'
  | 'set-labor'
  | 'set-rent'
  | 'select-region';

interface ScaleInvestment {
  small: string;
  medium: string;
  large: string;
}

interface BusinessGuideline {
  scaleInvestment: ScaleInvestment;
  scaleSource: string;
  franchiseCost?: string;
  franchiseSource?: string;
  customers: { small: string; medium: string; large: string };
  customersSource: string;
  ticket: string;
  ticketSource: string;
}

const HONEST_ESTIMATE = '업종 평균 추정치 (공식 출처 미확인, 사용자 직접 조정 권장)';


const GUIDELINES: Record<number, BusinessGuideline> = {
  // 치킨전문점
  1: {
    scaleInvestment: {
      small: '소규모 치킨전문점 (33㎡/10평) 기준 초기투자 약 3,000만원',
      medium: '중규모 치킨전문점 (50㎡/15평) 기준 초기투자 약 5,000만원',
      large: '대규모 치킨전문점 (82㎡/25평) 기준 초기투자 약 8,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    franchiseCost: '치킨전문점 프랜차이즈 평균 창업비용 약 5,852만원 (가맹비·교육비·보증금 등, 인테리어 별도)',
    franchiseSource: '공정위 정보공개서 기반 추정 (총 창업비용은 미공시, 가맹비 항목만 공시)',
    customers: {
      small: '소규모 치킨전문점은 평균 일 25건 주문이 들어와요',
      medium: '중규모 치킨전문점은 평균 일 55건 주문이 들어와요',
      large: '대규모 치킨전문점은 평균 일 90건 주문이 들어와요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '치킨전문점 1건당 평균 주문금액 약 22,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 커피전문점
  2: {
    scaleInvestment: {
      small: '소규모 카페 (33㎡/10평) 기준 초기투자 약 2,500만원',
      medium: '중규모 카페 (50㎡/15평) 기준 초기투자 약 5,000만원',
      large: '대규모 카페 (100㎡/30평) 기준 초기투자 약 1억원',
    },
    scaleSource: HONEST_ESTIMATE,
    franchiseCost: '커피 업종 프랜차이즈 평균 창업비용 약 1억 2,179만원 (가맹비·교육비·보증금 등, 인테리어 별도)',
    franchiseSource: '공정위 정보공개서 기반 추정 (총 창업비용은 미공시, 가맹비 항목만 공시)',
    customers: {
      small: '소규모 개인카페는 평균 일 80명이 방문해요',
      medium: '중규모 카페는 평균 일 180명이 방문해요',
      large: '대규모 카페는 평균 일 350명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '커피전문점 아메리카노 기준 4,000~5,000원, 디저트 포함 시 8,000~12,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 편의점
  3: {
    scaleInvestment: {
      small: '소규모 편의점 (33㎡/10평) 기준 초기투자 약 4,000만원',
      medium: '중규모 편의점 (50㎡/15평) 기준 초기투자 약 7,000만원',
      large: '대규모 편의점 (66㎡/20평) 기준 초기투자 약 1억 2,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    franchiseCost: '편의점 프랜차이즈 평균 창업비용 약 5,000~7,000만원 (본사 지원 제외)',
    franchiseSource: '공정위 정보공개서 기반 추정 (총 창업비용은 미공시, 가맹비 항목만 공시)',
    customers: {
      small: '소규모 편의점은 평균 일 100명이 방문해요',
      medium: '중규모 편의점은 평균 일 250명이 방문해요',
      large: '대규모 편의점은 평균 일 500명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '편의점 1회 구매 평균 약 8,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 미용실
  4: {
    scaleInvestment: {
      small: '1인 미용실 (25㎡/8평) 기준 초기투자 약 1,500만원',
      medium: '일반 미용실 (50㎡/15평) 기준 초기투자 약 3,000만원',
      large: '대형 헤어샵 (82㎡/25평) 기준 초기투자 약 6,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    customers: {
      small: '1인 미용실은 평균 일 8명이 방문해요',
      medium: '일반 미용실은 평균 일 15명이 방문해요',
      large: '대형 헤어샵은 평균 일 30명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '미용실 커트 기준 12,000~25,000원, 펌/염색은 50,000~150,000원',
    ticketSource: '한국소비자원 참가격 서비스 2024년 기준 (미용업 항목)',
  },
  // 분식점
  5: {
    scaleInvestment: {
      small: '소규모 분식점 (25㎡/8평) 기준 초기투자 약 2,000만원',
      medium: '중규모 분식점 (40㎡/12평) 기준 초기투자 약 3,500만원',
      large: '대규모 분식점 (66㎡/20평) 기준 초기투자 약 6,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    franchiseCost: '분식 프랜차이즈 평균 창업비용 약 8,500만~1억 3,000만원 (인테리어 포함 추정)',
    franchiseSource: '공정위 정보공개서 기반 추정 (총 창업비용은 미공시, 가맹비 항목만 공시)',
    customers: {
      small: '소규모 분식점은 평균 일 40명이 방문해요',
      medium: '중규모 분식점은 평균 일 80명이 방문해요',
      large: '대규모 분식점은 평균 일 150명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '분식점 1인 평균 결제금액 약 6,000~8,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 삼겹살전문점
  6: {
    scaleInvestment: {
      small: '소규모 고기집 (40㎡/12평) 기준 초기투자 약 3,500만원',
      medium: '중규모 삼겹살집 (66㎡/20평) 기준 초기투자 약 6,000만원',
      large: '대규모 고기 전문점 (100㎡/30평) 기준 초기투자 약 1억원',
    },
    scaleSource: HONEST_ESTIMATE,
    customers: {
      small: '소규모 고기집은 평균 일 20명이 방문해요',
      medium: '중규모 삼겹살집은 평균 일 45명이 방문해요',
      large: '대규모 고기 전문점은 평균 일 80명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '삼겹살 1인 평균 결제금액 약 20,000~30,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 세탁소
  7: {
    scaleInvestment: {
      small: '소형 세탁소 (20㎡/6평) 기준 초기투자 약 1,500만원',
      medium: '일반 세탁소 (33㎡/10평) 기준 초기투자 약 3,000만원',
      large: '대형 세탁소 (50㎡/15평) 기준 초기투자 약 5,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    customers: {
      small: '소형 세탁소는 평균 일 15명이 방문해요',
      medium: '일반 세탁소는 평균 일 30명이 방문해요',
      large: '대형 세탁소는 평균 일 50명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '세탁 1건당 평균 결제금액 약 10,000~15,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 피자전문점
  8: {
    scaleInvestment: {
      small: '소규모 피자집 (33㎡/10평) 기준 초기투자 약 3,000만원',
      medium: '중규모 피자집 (50㎡/15평) 기준 초기투자 약 5,500만원',
      large: '대규모 피자 레스토랑 (82㎡/25평) 기준 초기투자 약 9,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    franchiseCost: '피자 프랜차이즈 평균 창업비용 약 1억 5,000만~5억원 (인테리어·설비 포함 추정)',
    franchiseSource: '언론보도 종합 추정치 (공정위 정보공개서에는 가맹비·교육비만 공시, 총 창업비용은 미공시)',
    customers: {
      small: '소규모 피자집은 평균 일 20건 주문이 들어와요',
      medium: '중규모 피자집은 평균 일 45건 주문이 들어와요',
      large: '대규모 피자 레스토랑은 평균 일 80건 주문이 들어와요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '피자 1건당 평균 주문금액 약 25,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 베이커리
  9: {
    scaleInvestment: {
      small: '소형 동네빵집 (33㎡/10평) 기준 초기투자 약 2,500만원',
      medium: '일반 베이커리 (50㎡/15평) 기준 초기투자 약 5,000만원',
      large: '대형 베이커리카페 (100㎡/30평) 기준 초기투자 약 9,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    franchiseCost: '베이커리 프랜차이즈 평균 창업비용 약 2억 3,000~3억 3,000만원 (인테리어·설비 포함 추정)',
    franchiseSource: '언론보도 종합 추정치 (공정위 정보공개서에는 가맹비·교육비만 공시, 총 창업비용은 미공시)',
    customers: {
      small: '소형 빵집은 평균 일 50명이 방문해요',
      medium: '일반 베이커리는 평균 일 120명이 방문해요',
      large: '대형 베이커리카페는 평균 일 250명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '베이커리 1인 평균 결제금액 약 8,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 네일샵
  11: {
    scaleInvestment: {
      small: '1인 네일샵 (16㎡/5평) 기준 초기투자 약 1,000만원',
      medium: '일반 네일샵 (33㎡/10평) 기준 초기투자 약 2,000만원',
      large: '대형 뷰티샵 (50㎡/15평) 기준 초기투자 약 3,500만원',
    },
    scaleSource: HONEST_ESTIMATE,
    customers: {
      small: '1인 네일샵은 평균 일 6명이 방문해요',
      medium: '일반 네일샵은 평균 일 12명이 방문해요',
      large: '대형 뷰티샵은 평균 일 25명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '네일샵 젤네일 기본 기준 약 35,000~50,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 반찬가게
  13: {
    scaleInvestment: {
      small: '소형 반찬가게 (20㎡/6평) 기준 초기투자 약 1,500만원',
      medium: '일반 반찬가게 (33㎡/10평) 기준 초기투자 약 2,500만원',
      large: '대형 반찬 전문점 (50㎡/15평) 기준 초기투자 약 4,000만원',
    },
    scaleSource: HONEST_ESTIMATE,
    customers: {
      small: '소형 반찬가게는 평균 일 20명이 방문해요',
      medium: '일반 반찬가게는 평균 일 45명이 방문해요',
      large: '대형 반찬 전문점은 평균 일 80명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '반찬가게 1인 평균 결제금액 약 15,000원',
    ticketSource: HONEST_ESTIMATE,
  },
  // 무인아이스크림
  14: {
    scaleInvestment: {
      small: '소형 무인매장 (16㎡/5평) 기준 초기투자 약 2,000만원',
      medium: '일반 무인매장 (25㎡/8평) 기준 초기투자 약 3,500만원',
      large: '대형 무인매장 (40㎡/12평) 기준 초기투자 약 5,500만원',
    },
    scaleSource: HONEST_ESTIMATE,
    customers: {
      small: '소형 무인매장은 평균 일 30명이 방문해요',
      medium: '일반 무인매장은 평균 일 70명이 방문해요',
      large: '대형 무인매장은 평균 일 150명이 방문해요',
    },
    customersSource: HONEST_ESTIMATE,
    ticket: '무인아이스크림 1인 평균 결제금액 약 5,000원',
    ticketSource: HONEST_ESTIMATE,
  },
};

// Common guidelines used across all business types
const COMMON_LABOR: Guideline = {
  text: '풀타임 직원 1명 월 평균 인건비 약 250~280만원 (최저임금+수당+4대보험 포함)',
  source: '고용노동부 2025년 최저임금 고시 (시급 10,030원) 기준, 주 40시간+주휴수당+4대보험 포함',
};

const COMMON_LOAN: Guideline = {
  text: '소상공인 정책자금: 연 3.5~4.5%, 시중은행 사업자대출: 연 4.5~7.0%',
  source: '소상공인시장진흥공단 2025년 정책자금 융자계획 및 한국은행 기준금리 동향',
};

export function getGuideline(
  businessTypeId: number,
  scale: BusinessScale,
  step: GuidelineStep,
): Guideline | null {
  const bg = GUIDELINES[businessTypeId];
  if (!bg) return null;

  switch (step) {
    case 'select-scale':
      return {
        text: bg.scaleInvestment[scale],
        source: bg.scaleSource,
      };

    case 'investment-breakdown':
      if (bg.franchiseCost && bg.franchiseSource) {
        return {
          text: bg.franchiseCost,
          source: bg.franchiseSource,
        };
      }
      return {
        text: bg.scaleInvestment[scale],
        source: bg.scaleSource,
      };

    case 'set-investment':
      return COMMON_LOAN;

    case 'set-loan':
      return COMMON_LOAN;

    case 'set-customers':
      return {
        text: bg.customers[scale],
        source: bg.customersSource,
      };

    case 'set-ticket':
      return {
        text: bg.ticket,
        source: bg.ticketSource,
      };

    case 'set-labor':
      return COMMON_LABOR;

    case 'set-rent':
      return null; // Handled by region data in the component

    case 'select-region':
      return null; // Region selector has its own rent display

    default:
      return null;
  }
}

export function getRevenueGuideline(
  benchmarkMonthlyRevenue: number | null,
  businessTypeName: string,
  region: string | null
): Guideline | null {
  if (!benchmarkMonthlyRevenue || !region) return null;
  const formatted = formatKRWShort(benchmarkMonthlyRevenue);
  return {
    text: `${region} 지역 ${businessTypeName} 프랜차이즈 평균 월매출 약 ${formatted}`,
    source: '공정거래위원회 2024',
  };
}
