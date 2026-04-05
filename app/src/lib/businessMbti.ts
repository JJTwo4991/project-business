import type { SimulationResult } from '../types';

// ── Revenue Level ──
export type RevenueLevel = 'Lv1' | 'Lv2' | 'Lv3';
// ── Margin Grade ──
export type MarginGrade = 'BLEEDING' | 'STAGNANT' | 'CASHCOW';

export interface BossCardResult {
  revenueLevel: RevenueLevel;
  marginGrade: MarginGrade;
  marginEmoji: string;
  marginLabel: string;
  marginPercent: number;
  wlbHours: number;
  wlbText: string;
  personaId: string;
  tagline: string;
  reason: string;
  bgColor: string;
  monthlyRevenue: number;
  monthlyCashflow: number;
  businessName: string;
  shortName: string;
}

// ── 업종 축약명 (바이럴 문구용) ──
const SHORT_NAMES: Record<number, string> = {
  1: '치킨', 2: '커피', 3: '편의점', 4: '미용', 5: '분식',
  6: '한식', 7: '세탁', 8: '피자', 9: '베이커리', 11: '네일',
  13: '반찬', 14: '아이스크림', 15: '주점', 16: '무인카페',
};

// ── Revenue 분류 ──
function classifyRevenue(monthlyRevenue: number): RevenueLevel {
  if (monthlyRevenue < 10_000_000) return 'Lv1';
  if (monthlyRevenue <= 30_000_000) return 'Lv2';
  return 'Lv3';
}

// ── Margin 분류 (FCF 기반) ──
function classifyMargin(fcf: number, revenue: number): { grade: MarginGrade; percent: number } {
  const percent = revenue > 0 ? (fcf / revenue) * 100 : -100;
  if (percent < 0) return { grade: 'BLEEDING', percent };
  if (percent <= 10) return { grade: 'STAGNANT', percent };
  return { grade: 'CASHCOW', percent };
}

const MARGIN_INFO: Record<MarginGrade, { emoji: string; label: string }> = {
  BLEEDING: { emoji: '🔴', label: '적자' },
  STAGNANT: { emoji: '🟡', label: '정체' },
  CASHCOW:  { emoji: '🟢', label: '흑자' },
};

// ── WLB 추정 (주당 노동시간) ──
const MUIN_IDS = new Set([14, 16]);

function estimateWlbHours(result: SimulationResult): number {
  const { inputs, pnl } = result;
  const operatingDays = inputs.operating_days ?? 25;
  const employees = pnl.sga_detail.labor_headcount;
  const isMuin = MUIN_IDS.has(inputs.business_type.id);

  const weeklyDays = operatingDays / 4.33;

  let hoursPerDay: number;
  if (isMuin) {
    hoursPerDay = 2;
  } else if (employees === 0) {
    hoursPerDay = 12;
  } else if (employees === 1) {
    hoursPerDay = 10;
  } else {
    hoursPerDay = 8;
  }

  return Math.round(weeklyDays * hoursPerDay);
}

function getWlbText(hours: number): string {
  if (hours >= 70) return `직장인 주 40시간의 거의 ${Math.round(hours / 40 * 10) / 10}배를 일하시는군요`;
  if (hours >= 50) return '직장인 주 40시간보다 꽤 더 일하시는군요';
  if (hours >= 35) return '직장인 주 40시간만큼 일하시는군요';
  if (hours >= 20) return '직장인 주 40시간보다 덜 일하시는군요';
  return '직장인 주 40시간의 반도 안 되는군요';
}

// ── 9 Personas (업종 무관 — 모든 업종에 적용 가능한 표현만 사용) ──
interface PersonaTemplate {
  tagline: string;       // {name} = 업종 축약명
  reason: string;        // 업종 무관 표현만!
  bgColor: string;
}

const PERSONA_MAP: Record<string, PersonaTemplate> = {
  // ── Lv.3 (대형) ──
  'Lv3_BLEEDING': {
    tagline: '장사 잘 되는 거기 있잖아,\n그거 사실 다 적자보면서 하는거래',
    reason: '직원들 월급 주고 나면\n사장님은 손가락만 빠는 중.\n거대한 통장을 굴리는\n스릴만점 적자 체험기.',
    bgColor: '#FFF0F0',
  },
  'Lv3_STAGNANT': {
    tagline: '알바생 먹여 살리는\n명예로운 자원봉사자',
    reason: '매출은 지역 1등인데 남는 돈은\n알바생 월급보다 적은 미스터리.\n돈이 도는 것만 구경하는\n회전문 비즈니스.',
    bgColor: '#FFFDE7',
  },
  'Lv3_CASHCOW': {
    tagline: '상권을 지배하는\n{name}계의 거물',
    reason: '압도적인 매출과 규모의 경제로\n조용히 금덩이를 연성 중이에요.',
    bgColor: '#E8F5E9',
  },

  // ── Lv.2 (중형) ──
  'Lv2_BLEEDING': {
    tagline: '건물주 벤츠 뽑아주는\n1등 공신',
    reason: '뼈 빠지게 일해서 남들 지갑만\n두둑하게 채워주는 자발적 노예.\n"사장님~" 소리에 속아\n내 돈 내고 일하는 중.',
    bgColor: '#FFEBEE',
  },
  'Lv2_STAGNANT': {
    tagline: '몸 갈아 넣어 배달앱과\n플랫폼을 배불리는 기부천사',
    reason: '쉬는 날 없이 일하는데\n통장 잔고는 항상 제자리걸음.\n남는 건 만성 피로와\n"사장님" 명함뿐.',
    bgColor: '#FFF8E1',
  },
  'Lv2_CASHCOW': {
    tagline: '자본주의가 낳은\n완벽한 현금 복사기',
    reason: '감정 쏙 빼고 철저한 계산으로\n돌아가는 완벽한 시스템.\n최소한의 힘으로 최대한의\n꿀을 빠는 스마트한 사장님.',
    bgColor: '#E0F7FA',
  },

  // ── Lv.1 (소형) ──
  'Lv1_BLEEDING': {
    tagline: '내 돈 내고 노동 체험하는\n열정 페이 예술가',
    reason: '원가 따위 무시하고\n최고급 퀄리티만 추구.\n본인 돈 내고 극한 직업 체험 중인\n낭만파 호구.',
    bgColor: '#FCE4EC',
  },
  'Lv1_STAGNANT': {
    tagline: '최저시급도 못 받는\n{name}계의 고독한 수도승',
    reason: '알바 뛰는 게 더 많이 벌지만\n"내 가게" 뽕에 취해 버티는 중.\n세속적 부 대신\n영혼의 안식을 얻음.',
    bgColor: '#F3E5F5',
  },
  'Lv1_CASHCOW': {
    tagline: '구석에서 쏠쏠하게\n현금 캐는 은둔 고수',
    reason: '허술한 외관은 훼이크!\n극강의 고정비 다이어트로\n남몰래 확실한 현찰을 챙기는\n진정한 실력자.',
    bgColor: '#E8EAF6',
  },
};

// ── Main ──
export function calculateBossCard(result: SimulationResult): BossCardResult {
  const { inputs, pnl } = result;
  const businessName = inputs.business_type.name;
  const shortName = SHORT_NAMES[inputs.business_type.id] ?? businessName;

  const monthlyRevenue = pnl.revenue;
  const monthlyCashflow = pnl.free_cash_flow;

  const revenueLevel = classifyRevenue(monthlyRevenue);
  const { grade: marginGrade, percent: marginPercent } = classifyMargin(monthlyCashflow, monthlyRevenue);
  const wlbHours = estimateWlbHours(result);

  const personaId = `${revenueLevel}_${marginGrade}`;
  const template = PERSONA_MAP[personaId] ?? PERSONA_MAP['Lv2_STAGNANT']!;

  const tagline = template.tagline.replace(/{name}/g, shortName);

  return {
    revenueLevel,
    marginGrade,
    marginEmoji: MARGIN_INFO[marginGrade].emoji,
    marginLabel: MARGIN_INFO[marginGrade].label,
    marginPercent: Math.round(marginPercent * 10) / 10,
    wlbHours,
    wlbText: getWlbText(wlbHours),
    personaId,
    tagline,
    reason: template.reason,
    bgColor: template.bgColor,
    monthlyRevenue,
    monthlyCashflow,
    businessName,
    shortName,
  };
}
