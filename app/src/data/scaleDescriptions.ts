import type { ScaleDescription } from '../types';

export const SCALE_DESCRIPTIONS: Record<number, ScaleDescription[]> = {
  // 치킨전문점
  1: [
    { scale: 'small', label: '소형', sqm: 33, seats: 10, description: '배달 위주 소규모 매장' },
    { scale: 'medium', label: '중형', sqm: 50, seats: 25, description: '배달+홀 병행 매장' },
    { scale: 'large', label: '대형', sqm: 82, seats: 50, description: '대형 홀 중심 매장' },
  ],
  // 커피전문점
  2: [
    { scale: 'small', label: '소형', sqm: 33, seats: 15, description: '테이크아웃 위주 카페' },
    { scale: 'medium', label: '중형', sqm: 50, seats: 30, description: '일반 카페' },
    { scale: 'large', label: '대형', sqm: 100, seats: 60, description: '대형 카페/복합매장' },
  ],
  // 편의점
  3: [
    { scale: 'small', label: '소형', sqm: 33, description: '주택가 소형 편의점' },
    { scale: 'medium', label: '중형', sqm: 50, description: '일반 편의점' },
    { scale: 'large', label: '대형', sqm: 66, description: '대형 편의점 (역세권)' },
  ],
  // 미용실
  4: [
    { scale: 'small', label: '소형', sqm: 25, seats: 3, description: '1인 미용실' },
    { scale: 'medium', label: '중형', sqm: 50, seats: 6, description: '일반 미용실' },
    { scale: 'large', label: '대형', sqm: 82, seats: 12, description: '대형 헤어샵' },
  ],
  // 분식점
  5: [
    { scale: 'small', label: '소형', sqm: 25, seats: 12, description: '소규모 분식점' },
    { scale: 'medium', label: '중형', sqm: 40, seats: 24, description: '일반 분식점' },
    { scale: 'large', label: '대형', sqm: 66, seats: 40, description: '대형 분식 프랜차이즈' },
  ],
  // 삼겹살전문점
  6: [
    { scale: 'small', label: '소형', sqm: 40, seats: 20, description: '소규모 고기집' },
    { scale: 'medium', label: '중형', sqm: 66, seats: 40, description: '일반 삼겹살 전문점' },
    { scale: 'large', label: '대형', sqm: 100, seats: 70, description: '대형 고기 전문점' },
  ],
  // 세탁소
  7: [
    { scale: 'small', label: '소형', sqm: 20, description: '소형 세탁소' },
    { scale: 'medium', label: '중형', sqm: 33, description: '일반 세탁소' },
    { scale: 'large', label: '대형', sqm: 50, description: '대형 세탁소/체인' },
  ],
  // 피자전문점
  8: [
    { scale: 'small', label: '소형', sqm: 33, seats: 10, description: '배달 위주 소규모' },
    { scale: 'medium', label: '중형', sqm: 50, seats: 25, description: '배달+홀 병행' },
    { scale: 'large', label: '대형', sqm: 82, seats: 50, description: '대형 다이닝' },
  ],
  // 베이커리
  9: [
    { scale: 'small', label: '소형', sqm: 33, seats: 8, description: '소형 동네 빵집' },
    { scale: 'medium', label: '중형', sqm: 50, seats: 20, description: '일반 베이커리' },
    { scale: 'large', label: '대형', sqm: 100, seats: 40, description: '대형 베이커리 카페' },
  ],
  // 네일샵
  11: [
    { scale: 'small', label: '소형', sqm: 16, seats: 2, description: '1인 네일샵' },
    { scale: 'medium', label: '중형', sqm: 33, seats: 5, description: '일반 네일샵' },
    { scale: 'large', label: '대형', sqm: 50, seats: 10, description: '대형 뷰티샵' },
  ],
  // 반찬가게
  13: [
    { scale: 'small', label: '소형', sqm: 20, description: '소형 반찬가게' },
    { scale: 'medium', label: '중형', sqm: 33, description: '일반 반찬가게' },
    { scale: 'large', label: '대형', sqm: 50, description: '대형 반찬 전문점' },
  ],
  // 무인아이스크림
  14: [
    { scale: 'small', label: '소형', sqm: 16, description: '소형 무인 매장' },
    { scale: 'medium', label: '중형', sqm: 25, description: '일반 무인 매장' },
    { scale: 'large', label: '대형', sqm: 40, description: '대형 무인 매장' },
  ],
};

export function getScaleDescription(businessTypeId: number, scale: 'small' | 'medium' | 'large'): ScaleDescription | undefined {
  return SCALE_DESCRIPTIONS[businessTypeId]?.find(s => s.scale === scale);
}

export function getScaleDescriptions(businessTypeId: number): ScaleDescription[] {
  return SCALE_DESCRIPTIONS[businessTypeId] ?? [
    { scale: 'small', label: '소형', sqm: 33, description: '소규모' },
    { scale: 'medium', label: '중형', sqm: 50, description: '중간 규모' },
    { scale: 'large', label: '대형', sqm: 66, description: '대규모' },
  ];
}
