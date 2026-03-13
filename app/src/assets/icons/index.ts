import chickenIcon from './industries/chicken.svg';
import coffeeIcon from './industries/coffee.svg';
import convenienceIcon from './industries/convenience.svg';
import hairSalonIcon from './industries/hairSalon.svg';
import snackBarIcon from './industries/snackBar.svg';
import koreanIcon from './industries/korean.svg';
import laundryIcon from './industries/laundry.svg';
import pizzaIcon from './industries/pizza.svg';
import bakeryIcon from './industries/bakery.svg';
import nailShopIcon from './industries/nailShop.svg';
import sideDishIcon from './industries/sideDish.svg';
import iceCreamIcon from './industries/iceCream.svg';
import barIcon from './industries/bar.svg';
import unmannedCafeIcon from './industries/unmannedCafe.svg';

import smallIcon from './scale/small.svg';
import mediumIcon from './scale/medium.svg';
import largeIcon from './scale/large.svg';

import clapIcon from './ui/clap.svg';
import confettiIcon from './ui/confetti.svg';
import franchiseIcon from './ui/franchise.svg';
import individualIcon from './ui/individual.svg';

import friedChickenMenu from './menu/friedChicken.svg';
import beerMenu from './menu/beer.svg';
import softDrinkMenu from './menu/softDrink.svg';
import hotCoffeeMenu from './menu/hotCoffee.svg';
import cakeSliceMenu from './menu/cakeSlice.svg';
import latteMenu from './menu/latte.svg';
import lunchBoxMenu from './menu/lunchBox.svg';
import noodleMenu from './menu/noodle.svg';
import haircutMenu from './menu/haircut.svg';
import permMenu from './menu/perm.svg';
import dyeingMenu from './menu/dyeing.svg';
import skewerMenu from './menu/skewer.svg';
import dumplingMenu from './menu/dumpling.svg';
import riceMenu from './menu/rice.svg';
import stewMenu from './menu/stew.svg';
import meatMenu from './menu/meat.svg';
import shirtMenu from './menu/shirt.svg';
import coatMenu from './menu/coat.svg';
import dressMenu from './menu/dress.svg';
import pizzaSliceMenu from './menu/pizzaSlice.svg';
import pastaMenu from './menu/pasta.svg';
import saladMenu from './menu/salad.svg';
import breadMenu from './menu/bread.svg';
import croissantMenu from './menu/croissant.svg';
import cakeMenu from './menu/cake.svg';
import nailPolishMenu from './menu/nailPolish.svg';
import nailArtMenu from './menu/nailArt.svg';
import pedicureMenu from './menu/pedicure.svg';
import hotpotMenu from './menu/hotpot.svg';
import iceCreamConeMenu from './menu/iceCreamCone.svg';
import shavedIceMenu from './menu/shavedIce.svg';
import chocolateMenu from './menu/chocolate.svg';
import sojuMenu from './menu/soju.svg';
import meatBoneMenu from './menu/meatBone.svg';
import teaMenu from './menu/tea.svg';

/** business_type.id → SVG 아이콘 URL */
export const INDUSTRY_ICONS: Record<number, string> = {
  1: chickenIcon,
  2: coffeeIcon,
  3: convenienceIcon,
  4: hairSalonIcon,
  5: snackBarIcon,
  6: koreanIcon,
  7: laundryIcon,
  8: pizzaIcon,
  9: bakeryIcon,
  11: nailShopIcon,
  13: sideDishIcon,
  14: iceCreamIcon,
  15: barIcon,
  16: unmannedCafeIcon,
};

/** 카테고리명 → SVG 아이콘 URL (폴백용) */
export const CATEGORY_ICONS: Record<string, string> = {
  '외식': koreanIcon,
  '카페': coffeeIcon,
  '소매': convenienceIcon,
  '서비스': hairSalonIcon,
  '교육': convenienceIcon,
  '운동': convenienceIcon,
  '기타': convenienceIcon,
};

/** 규모 → SVG 아이콘 URL */
export const SCALE_ICONS: Record<string, string> = {
  small: smallIcon,
  medium: mediumIcon,
  large: largeIcon,
};

/** UI 아이콘 */
export const UI_ICONS = {
  clap: clapIcon,
  confetti: confettiIcon,
  franchise: franchiseIcon,
  individual: individualIcon,
} as const;

/** 이모지 문자 → 메뉴 SVG 아이콘 URL 매핑 */
export const MENU_EMOJI_ICONS: Record<string, string> = {
  '🍗': friedChickenMenu,
  '🍺': beerMenu,
  '🥤': softDrinkMenu,
  '☕': hotCoffeeMenu,
  '🍰': cakeSliceMenu,
  '🧋': latteMenu,
  '🍱': lunchBoxMenu,
  '🍜': noodleMenu,
  '💇': haircutMenu,
  '💆': permMenu,
  '🎨': dyeingMenu,
  '🍢': skewerMenu,
  '🥟': dumplingMenu,
  '🍚': riceMenu,
  '🥘': stewMenu,
  '🥩': meatMenu,
  '👔': shirtMenu,
  '🧥': coatMenu,
  '👗': dressMenu,
  '🍕': pizzaSliceMenu,
  '🍝': pastaMenu,
  '🥗': saladMenu,
  '🍞': breadMenu,
  '🥐': croissantMenu,
  '🎂': cakeMenu,
  '💅': nailPolishMenu,
  '🖌️': nailArtMenu,
  '🦶': pedicureMenu,
  '🍲': hotpotMenu,
  '🍦': iceCreamConeMenu,
  '🍧': shavedIceMenu,
  '🍫': chocolateMenu,
  '🍶': sojuMenu,
  '🍖': meatBoneMenu,
  '🍵': teaMenu,
};

/** 업종 ID로 아이콘 가져오기 (없으면 카테고리 폴백) */
export function getIndustryIcon(id: number, category?: string): string {
  return INDUSTRY_ICONS[id] ?? (category ? CATEGORY_ICONS[category] : convenienceIcon) ?? convenienceIcon;
}

/** 이모지 문자를 SVG 아이콘 URL로 변환 (매핑 없으면 undefined) */
export function getMenuIcon(emoji: string): string | undefined {
  return MENU_EMOJI_ICONS[emoji];
}
