/**
 * 업종별 대표 메뉴 데이터
 * 객단가 화면에서 참고용으로 표시
 */

export interface MenuItem {
  emoji: string;
  name: string;
  price: number; // 원
}

/** business_type_id → 대표 메뉴 3개 */
export const MENU_ITEMS: Record<number, MenuItem[]> = {
  // 1: 치킨전문점
  1: [
    { emoji: '🍗', name: '후라이드 치킨', price: 20000 },
    { emoji: '🍺', name: '맥주 500ml', price: 5000 },
    { emoji: '🥤', name: '콜라/사이다', price: 2000 },
  ],
  // 2: 커피전문점
  2: [
    { emoji: '☕', name: '아메리카노', price: 4500 },
    { emoji: '🍰', name: '케이크 조각', price: 6000 },
    { emoji: '🧋', name: '카페라떼', price: 5500 },
  ],
  // 3: 편의점
  3: [
    { emoji: '🍱', name: '도시락', price: 5000 },
    { emoji: '🥤', name: '음료', price: 2000 },
    { emoji: '🍜', name: '컵라면', price: 1500 },
  ],
  // 4: 미용실
  4: [
    { emoji: '💇', name: '커트', price: 20000 },
    { emoji: '💆', name: '펌', price: 80000 },
    { emoji: '🎨', name: '염색', price: 60000 },
  ],
  // 5: 분식점
  5: [
    { emoji: '🍢', name: '떡볶이', price: 5000 },
    { emoji: '🥟', name: '만두', price: 4000 },
    { emoji: '🍜', name: '라면', price: 4500 },
  ],
  // 6: 한식전문점
  6: [
    { emoji: '🍚', name: '백반 정식', price: 10000 },
    { emoji: '🥘', name: '찌개/탕', price: 12000 },
    { emoji: '🥩', name: '불고기', price: 15000 },
  ],
  // 7: 세탁소
  7: [
    { emoji: '👔', name: '와이셔츠', price: 3000 },
    { emoji: '🧥', name: '코트/패딩', price: 15000 },
    { emoji: '👗', name: '원피스', price: 8000 },
  ],
  // 8: 피자전문점
  8: [
    { emoji: '🍕', name: '피자 라지', price: 25000 },
    { emoji: '🍝', name: '파스타', price: 12000 },
    { emoji: '🥗', name: '샐러드', price: 8000 },
  ],
  // 9: 베이커리
  9: [
    { emoji: '🍞', name: '식빵', price: 5000 },
    { emoji: '🥐', name: '크로와상', price: 3500 },
    { emoji: '🎂', name: '케이크', price: 30000 },
  ],
  // 11: 네일샵
  11: [
    { emoji: '💅', name: '젤네일', price: 40000 },
    { emoji: '🖌️', name: '네일아트', price: 60000 },
    { emoji: '🦶', name: '페디큐어', price: 35000 },
  ],
  // 13: 반찬가게
  13: [
    { emoji: '🥗', name: '반찬 세트', price: 15000 },
    { emoji: '🍲', name: '국/찌개', price: 8000 },
    { emoji: '🥩', name: '밑반찬 5종', price: 12000 },
  ],
  // 14: 무인아이스크림
  14: [
    { emoji: '🍦', name: '아이스크림', price: 3000 },
    { emoji: '🍧', name: '빙수', price: 5000 },
    { emoji: '🍫', name: '간식', price: 2000 },
  ],
  // 15: 주점
  15: [
    { emoji: '🍶', name: '소주', price: 5000 },
    { emoji: '🍖', name: '삼겹살', price: 15000 },
    { emoji: '🍺', name: '생맥주', price: 5000 },
  ],
  // 16: 무인카페
  16: [
    { emoji: '☕', name: '아메리카노', price: 2000 },
    { emoji: '🧋', name: '카페라떼', price: 2500 },
    { emoji: '🍵', name: '차', price: 2000 },
  ],
};

/** 업종 ID로 메뉴 목록 조회 (없으면 빈 배열) */
export function getMenuItems(businessTypeId: number): MenuItem[] {
  return MENU_ITEMS[businessTypeId] || [];
}
