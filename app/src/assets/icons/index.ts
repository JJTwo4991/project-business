/** business_type.id → 이모지 */
export const INDUSTRY_ICONS: Record<number, string> = {
  1: '🍗',   // 치킨
  2: '☕',   // 커피
  3: '🏪',   // 편의점
  4: '💇',   // 미용실
  5: '🍜',   // 분식
  6: '🍚',   // 한식
  7: '👔',   // 세탁소
  8: '🍕',   // 피자
  9: '🍞',   // 베이커리
  11: '💅',  // 네일샵
  13: '🥗',  // 반찬가게
  14: '🍦',  // 무인아이스크림
  15: '🍺',  // 주점
  16: '☕',  // 무인카페
};

/** 카테고리명 → 이모지 (폴백용) */
export const CATEGORY_ICONS: Record<string, string> = {
  '외식': '🍽️',
  '카페': '☕',
  '소매': '🛒',
  '서비스': '✂️',
  '교육': '📚',
  '운동': '🏃',
  '기타': '🏪',
};

/** 규모 → 이모지 */
export const SCALE_ICONS: Record<string, string> = {
  small: '🏠',
  medium: '🏢',
  large: '🏬',
};

/** UI 이모지 */
export const UI_ICONS = {
  clap: '👏',
  confetti: '🎉',
  franchise: '🏪',
  individual: '🛍️',
} as const;

/** 이모지 문자 → 이모지 (항상 입력값을 그대로 반환) */
export const MENU_EMOJI_ICONS: Record<string, string> = {
  '🍗': '🍗', '🍺': '🍺', '🥤': '🥤', '☕': '☕',
  '🍰': '🍰', '🧋': '🧋', '🍱': '🍱', '🍜': '🍜',
  '💇': '💇', '💆': '💆', '🎨': '🎨', '🍢': '🍢',
  '🥟': '🥟', '🍚': '🍚', '🥘': '🥘', '🥩': '🥩',
  '👔': '👔', '🧥': '🧥', '👗': '👗', '🍕': '🍕',
  '🍝': '🍝', '🥗': '🥗', '🍞': '🍞', '🥐': '🥐',
  '🎂': '🎂', '💅': '💅', '🖌️': '🖌️', '🦶': '🦶',
  '🍲': '🍲', '🍦': '🍦', '🍧': '🍧', '🍫': '🍫',
  '🍶': '🍶', '🍖': '🍖', '🍵': '🍵',
};

/** 업종 ID로 이모지 가져오기 (없으면 카테고리 폴백) */
export function getIndustryIcon(id: number, category?: string): string {
  return INDUSTRY_ICONS[id] ?? (category ? CATEGORY_ICONS[category] : undefined) ?? '🏪';
}

/** 이모지 문자 반환 (항상 입력값을 그대로 돌려줌) */
export function getMenuIcon(emoji: string): string {
  return emoji;
}
