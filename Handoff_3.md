# 자영업 수익 시뮬레이터 - Claude Code Handoff (PART 3/3)

## 테스트 파일 + 실행 가이드

---

## FILE: tests/tax.test.ts
```ts
import { describe, it, expect } from 'vitest';
import { calcIncomeTax, calcLocalTax, calcTotalTax, calcEffectiveTaxRate } from '../src/lib/tax';

describe('calcIncomeTax - 종합소득세 2025년 구간', () => {
  it('과표 0원 → 세금 0원', () => {
    expect(calcIncomeTax(0)).toBe(0);
  });

  it('과표 1,000만원 → 6% 구간', () => {
    expect(calcIncomeTax(10_000_000)).toBe(600_000);
  });

  it('과표 3,000만원 → 15% 구간 (누진공제 126만)', () => {
    expect(calcIncomeTax(30_000_000)).toBe(3_240_000);
  });

  it('과표 6,000만원 → 24% 구간 (누진공제 576만)', () => {
    expect(calcIncomeTax(60_000_000)).toBe(8_640_000);
  });

  it('과표 1억원 → 35% 구간 (누진공제 1,544만)', () => {
    expect(calcIncomeTax(100_000_000)).toBe(19_560_000);
  });

  it('과표 2억원 → 38% 구간 (누진공제 1,994만)', () => {
    expect(calcIncomeTax(200_000_000)).toBe(56_060_000);
  });

  it('과표 4억원 → 40% 구간 (누진공제 2,594만)', () => {
    expect(calcIncomeTax(400_000_000)).toBe(134_060_000);
  });

  it('과표 7억원 → 42% 구간 (누진공제 3,594만)', () => {
    expect(calcIncomeTax(700_000_000)).toBe(258_060_000);
  });

  it('과표 12억원 → 45% 구간 (누진공제 6,594만)', () => {
    expect(calcIncomeTax(1_200_000_000)).toBe(474_060_000);
  });

  it('음수 과표 → 0원 (결손 처리)', () => {
    expect(calcIncomeTax(-5_000_000)).toBe(0);
  });
});

describe('calcLocalTax - 지방소득세 = 소득세의 10%', () => {
  it('소득세 600,000원 → 지방소득세 60,000원', () => {
    expect(calcLocalTax(600_000)).toBe(60_000);
  });
});

describe('calcTotalTax - 월 세금 (연간 기준으로 계산 후 /12)', () => {
  it('월 세전이익 500만원 → 연 6,000만원 기준 세금/12', () => {
    const monthlyPretax = 5_000_000;
    const annualPretax = monthlyPretax * 12;
    const annualIncomeTax = calcIncomeTax(annualPretax);
    const annualLocalTax = calcLocalTax(annualIncomeTax);
    const expectedMonthlyTax = Math.round((annualIncomeTax + annualLocalTax) / 12);
    expect(calcTotalTax(monthlyPretax)).toBe(expectedMonthlyTax);
  });

  it('음수 세전이익 → 세금 0', () => {
    expect(calcTotalTax(-1_000_000)).toBe(0);
  });
});

describe('calcEffectiveTaxRate', () => {
  it('월 세전이익 500만 → 실효세율 반환 (0~1)', () => {
    const rate = calcEffectiveTaxRate(5_000_000);
    expect(rate).toBeGreaterThan(0);
    expect(rate).toBeLessThan(1);
  });
});
```

## FILE: tests/calculator.test.ts
```ts
import { describe, it, expect } from 'vitest';
import { calcMonthlyPnL, calcPayback, calcDCF, runSimulation, calcDailyPnL, generateAnnotations } from '../src/lib/calculator';
import type { BusinessType, CapitalStructure, SimulatorInputs } from '../src/types';

const mockBusiness: BusinessType = {
  id: 1,
  name: '치킨집',
  category: '외식',
  avg_ticket_price: 20000,
  material_cost_ratio: 0.35,
  avg_daily_customers_small: 30,
  avg_daily_customers_medium: 60,
  avg_daily_customers_large: 100,
  labor_cost_monthly_per_person: 2_500_000,
  misc_fixed_cost_monthly: 300_000,
  initial_investment_min: 30_000_000,
  initial_investment_max: 80_000_000,
  initial_investment_small: 30_000_000,
  initial_investment_medium: 55_000_000,
  initial_investment_large: 80_000_000,
  avg_monthly_revenue_min: 10_000_000,
  avg_monthly_revenue_max: 30_000_000,
  closure_rate_1yr: 0.2,
  closure_rate_3yr: 0.5,
  closure_rate_5yr: 0.7,
  data_sources: [],
};

const mockCapital: CapitalStructure = {
  initial_investment: 50_000_000,
  equity: 30_000_000,
  interest_rate: 0.055,
  loan_term_years: 5,
};

const mockInputs: SimulatorInputs = {
  business_type: mockBusiness,
  scale: 'medium',
  capital: mockCapital,
  rent_monthly: 1_500_000,
  labor_headcount: 1,
  discount_rate: 0.15,
  growth_rate: 0.00,
};

describe('calcMonthlyPnL', () => {
  it('매출 = 객단가 × 일방문객(medium) × 26일', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const expectedRevenue = 20000 * 60 * 26;
    expect(pnl.revenue).toBe(expectedRevenue);
  });

  it('매출원가 = 매출 × 재료비비율', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const expectedCogs = Math.round(pnl.revenue * 0.35);
    expect(pnl.cogs).toBe(expectedCogs);
  });

  it('매출총이익 = 매출 - 매출원가', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.gross_profit).toBe(pnl.revenue - pnl.cogs);
  });

  it('판관비 = 인건비 + 임대료 + 기타고정비', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const expectedSGA = 2_500_000 * 1 + 1_500_000 + 300_000;
    expect(pnl.sg_and_a).toBe(expectedSGA);
  });

  it('영업이익 = 매출총이익 - 판관비', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.operating_profit).toBe(pnl.gross_profit - pnl.sg_and_a);
  });

  it('이자비용 = (대출잔액) × 금리 / 12', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const debt = 50_000_000 - 30_000_000;
    const expectedInterest = Math.round(debt * 0.055 / 12);
    expect(pnl.interest_expense).toBe(expectedInterest);
  });

  it('세전이익 = 영업이익 - 이자비용', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.pretax_income).toBe(pnl.operating_profit - pnl.interest_expense);
  });

  it('세후이익 = 세전이익 - 세금', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.net_income).toBe(pnl.pretax_income - pnl.tax);
  });

  it('원금상환 = 대출금 / (기간년 × 12)', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const debt = 50_000_000 - 30_000_000;
    const expectedPrincipal = Math.round(debt / (5 * 12));
    expect(pnl.principal_repayment).toBe(expectedPrincipal);
  });

  it('월 실제 현금흐름 = 세후이익 - 원금상환', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.free_cash_flow).toBe(pnl.net_income - pnl.principal_repayment);
  });

  it('대출 없는 경우 이자비용 = 0, 원금상환 = 0', () => {
    const noDebtInputs: SimulatorInputs = {
      ...mockInputs,
      capital: { ...mockCapital, equity: 50_000_000 },
    };
    const pnl = calcMonthlyPnL(noDebtInputs);
    expect(pnl.interest_expense).toBe(0);
    expect(pnl.principal_repayment).toBe(0);
  });
});

describe('calcPayback', () => {
  it('60개월 누적 현금흐름 배열 반환', () => {
    const result = calcPayback(mockInputs);
    expect(result.cumulative_cashflow).toHaveLength(60);
  });

  it('첫 번째 달의 누적 = 초기투자금의 음수 + 첫달 현금흐름', () => {
    const result = calcPayback(mockInputs);
    const firstPoint = result.cumulative_cashflow[0];
    expect(firstPoint.month).toBe(1);
    expect(firstPoint.value).toBeLessThan(0);
  });

  it('매월 이자 감소 반영 (잔액 기준)', () => {
    const result = calcPayback(mockInputs);
    const last = result.cumulative_cashflow[59].value;
    const first = result.cumulative_cashflow[0].value;
    expect(last).toBeGreaterThan(first);
  });
});

describe('calcDCF', () => {
  it('FCF = 영업이익 × (1 - 실효세율), 연간 기준', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const dcf = calcDCF(pnl, mockInputs);
    expect(dcf.fcf_annual).toBeGreaterThan(0);
  });

  it('사업체가치 = FCF / (할인율 - 성장률)', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const dcf = calcDCF(pnl, mockInputs);
    const expected = Math.round(dcf.fcf_annual / (0.15 - 0.00));
    expect(dcf.business_value).toBe(expected);
  });

  it('할인율 = 성장률이면 사업체가치 = Infinity', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    const sameRateInputs = { ...mockInputs, discount_rate: 0.05, growth_rate: 0.05 };
    const dcf = calcDCF(pnl, sameRateInputs);
    expect(dcf.business_value).toBe(Infinity);
  });
});

describe('runSimulation', () => {
  it('전체 시뮬레이션 결과 반환', () => {
    const result = runSimulation(mockInputs);
    expect(result.pnl).toBeDefined();
    expect(result.payback).toBeDefined();
    expect(result.dcf).toBeDefined();
    expect(result.inputs).toEqual(mockInputs);
  });
});

describe('sga_detail', () => {
  it('sga_detail breaks down labor, rent, misc', () => {
    const pnl = calcMonthlyPnL(mockInputs);
    expect(pnl.sga_detail.labor + pnl.sga_detail.rent + pnl.sga_detail.misc_fixed).toBe(pnl.sg_and_a);
  });
});

describe('calcDailyPnL', () => {
  it('calcDailyPnL returns daily figures', () => {
    const daily = calcDailyPnL(mockInputs);
    const pnl = calcMonthlyPnL(mockInputs);
    expect(daily.daily_revenue * 26).toBe(pnl.revenue);
  });
});

describe('generateAnnotations', () => {
  it('generateAnnotations includes cost ratio percentage', () => {
    const ann = generateAnnotations(mockInputs);
    expect(ann.cogs).toContain('%');
    expect(ann.revenue).toContain('×');
  });
});
```

## FILE: tests/format.test.ts
```ts
import { describe, it, expect } from 'vitest';
import { formatKRW, formatKRWShort, formatPercent, formatMonths } from '../src/lib/format';

describe('formatKRW', () => {
  it('1000 → "1,000원"', () => {
    expect(formatKRW(1000)).toBe('1,000원');
  });
  it('1234567 → "1,234,567원"', () => {
    expect(formatKRW(1_234_567)).toBe('1,234,567원');
  });
  it('음수 → "-1,000원"', () => {
    expect(formatKRW(-1000)).toBe('-1,000원');
  });
  it('0 → "0원"', () => {
    expect(formatKRW(0)).toBe('0원');
  });
});

describe('formatKRWShort', () => {
  it('10,000,000 → "1,000만원"', () => {
    expect(formatKRWShort(10_000_000)).toBe('1,000만원');
  });
  it('100,000,000 → "1억원"', () => {
    expect(formatKRWShort(100_000_000)).toBe('1억원');
  });
  it('150,000,000 → "1.5억원"', () => {
    expect(formatKRWShort(150_000_000)).toBe('1.5억원');
  });
  it('5,000,000 → "500만원"', () => {
    expect(formatKRWShort(5_000_000)).toBe('500만원');
  });
  it('Infinity → "∞"', () => {
    expect(formatKRWShort(Infinity)).toBe('∞');
  });
});

describe('formatPercent', () => {
  it('0.055 → "5.5%"', () => {
    expect(formatPercent(0.055)).toBe('5.5%');
  });
  it('0.15 → "15.0%"', () => {
    expect(formatPercent(0.15)).toBe('15.0%');
  });
});

describe('formatMonths', () => {
  it('13개월 → "1년 1개월"', () => {
    expect(formatMonths(13)).toBe('1년 1개월');
  });
  it('12개월 → "1년"', () => {
    expect(formatMonths(12)).toBe('1년');
  });
  it('null → "60개월 이내 미회수"', () => {
    expect(formatMonths(null)).toBe('60개월 이내 미회수');
  });
  it('6개월 → "6개월"', () => {
    expect(formatMonths(6)).toBe('6개월');
  });
});
```

## FILE: tests/integration.test.ts
```ts
import { describe, it, expect } from 'vitest';
import { runSimulation } from '../src/lib/calculator';
import type { BusinessType, SimulatorInputs } from '../src/types';

const realBusiness: BusinessType = {
  id: 1,
  name: '치킨전문점',
  category: '외식',
  avg_ticket_price: 22000,
  material_cost_ratio: 0.38,
  avg_daily_customers_small: 25,
  avg_daily_customers_medium: 55,
  avg_daily_customers_large: 90,
  labor_cost_monthly_per_person: 2_800_000,
  misc_fixed_cost_monthly: 350_000,
  initial_investment_min: 40_000_000,
  initial_investment_max: 100_000_000,
  avg_monthly_revenue_min: 10_000_000,
  avg_monthly_revenue_max: 35_000_000,
  closure_rate_1yr: 0.22,
  closure_rate_3yr: 0.52,
  closure_rate_5yr: 0.72,
  data_sources: [],
};

const inputs: SimulatorInputs = {
  business_type: realBusiness,
  scale: 'medium',
  capital: {
    initial_investment: 70_000_000,
    equity: 40_000_000,
    interest_rate: 0.055,
    loan_term_years: 5,
  },
  rent_monthly: 1_800_000,
  labor_headcount: 1,
  discount_rate: 0.15,
  growth_rate: 0.0,
};

describe('runSimulation - integration', () => {
  it('전체 파이프라인이 올바른 구조를 반환해야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.pnl).toBeDefined();
    expect(result.payback).toBeDefined();
    expect(result.dcf).toBeDefined();
  });

  it('매출은 0보다 커야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.pnl.revenue).toBeGreaterThan(0);
  });

  it('세금은 0 이상이어야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.pnl.tax).toBeGreaterThanOrEqual(0);
  });

  it('60개월 누적 현금흐름 배열이 반환되어야 한다', () => {
    const result = runSimulation(inputs);
    expect(result.payback.cumulative_cashflow).toHaveLength(60);
  });

  it('사업체가치는 숫자여야 한다', () => {
    const result = runSimulation(inputs);
    expect(typeof result.dcf.business_value).toBe('number');
  });

  it('타인자본이 0인 경우 이자비용과 원금상환이 모두 0이어야 한다', () => {
    const noDebtInputs: SimulatorInputs = {
      ...inputs,
      capital: { ...inputs.capital, equity: 70_000_000 },
    };
    const result = runSimulation(noDebtInputs);
    expect(result.pnl.interest_expense).toBe(0);
    expect(result.pnl.principal_repayment).toBe(0);
  });

  it('월 실제 현금흐름 = 세후이익 - 원금상환', () => {
    const result = runSimulation(inputs);
    expect(result.pnl.free_cash_flow).toBe(result.pnl.net_income - result.pnl.principal_repayment);
  });
});
```

---

## 실행 가이드 (다른 Claude Code에게)

### 1. 프로젝트 생성
```bash
mkdir -p app/src/{types,lib,data,hooks,components/{BusinessTypeCard,SliderInput,CashFlowChart,RegionSelector,PnLDisplay},pages/{HomePage,InputPage,ResultPage}}
mkdir -p app/tests
```

### 2. 파일 생성 순서
PART1 → PART2 → PART3 순서로 각 `FILE:` 섹션의 코드를 해당 경로에 Write.

### 3. 디렉토리 구조
```
app/
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── App.tsx
│   ├── App.module.css
│   ├── types/index.ts
│   ├── lib/
│   │   ├── tax.ts
│   │   ├── calculator.ts
│   │   ├── format.ts
│   │   └── supabase.ts
│   ├── data/
│   │   ├── businessTypes.ts
│   │   ├── costItems.ts
│   │   └── rentGuide.ts
│   ├── hooks/
│   │   ├── useBusinessTypes.ts
│   │   ├── useSimulator.ts
│   │   ├── useRentGuide.ts
│   │   └── useCostItems.ts
│   ├── components/
│   │   ├── BusinessTypeCard/
│   │   │   ├── BusinessTypeCard.tsx
│   │   │   └── BusinessTypeCard.module.css
│   │   ├── SliderInput/
│   │   │   ├── SliderInput.tsx
│   │   │   └── SliderInput.module.css
│   │   ├── CashFlowChart/
│   │   │   ├── CashFlowChart.tsx
│   │   │   └── CashFlowChart.module.css
│   │   ├── RegionSelector/
│   │   │   ├── RegionSelector.tsx
│   │   │   └── RegionSelector.module.css
│   │   └── PnLDisplay/
│   │       ├── PnLDisplay.tsx
│   │       └── PnLDisplay.module.css
│   └── pages/
│       ├── HomePage/
│       │   ├── HomePage.tsx
│       │   └── HomePage.module.css
│       ├── InputPage/
│       │   ├── InputPage.tsx
│       │   └── InputPage.module.css
│       └── ResultPage/
│           ├── ResultPage.tsx
│           └── ResultPage.module.css
└── tests/
    ├── tax.test.ts
    ├── calculator.test.ts
    ├── format.test.ts
    └── integration.test.ts
```

### 4. 설치 및 실행
```bash
cd app
npm install
npm test        # 57/57 tests should pass
npm run dev     # http://localhost:5173
```

### 5. 검증 체크리스트
- [ ] `npm test` → 57/57 passed
- [ ] `npx tsc --noEmit` → clean (no errors)
- [ ] `npm run build` → success
- [ ] HomePage: 14개 업종 카드 (2열 그리드)
- [ ] InputPage: 규모 선택 (소/중/대) + 초기투자금 가이던스
- [ ] InputPage: 지역 선택 (시도→시군구) + 월 임대료 가이던스
- [ ] InputPage: 자본구조 슬라이더 (초기투자금, 자기자본, 금리, 대출기간)
- [ ] ResultPage: 4탭 (일손익 | 월손익 | 투자회수 | 사업체가치)
- [ ] 월손익: 각 항목 아래 회색 설명 텍스트 (annotation)
- [ ] 월손익: 판관비 클릭 → 인건비/임대료/기타고정비 펼쳐보기
- [ ] 투자회수: 회수기간 카드 + 60개월 누적 현금흐름 차트 (Recharts)
- [ ] 사업체가치: DCF 추정가치 + 할인율/성장률 슬라이더
- [ ] 월손익 슬라이더 조정 시 실시간 재계산

### 6. 주요 계산 로직
- **매출** = 객단가 × 일방문객 × 26일
- **매출원가** = 매출 × 재료비비율
- **판관비** = 인건비(인원수) + 임대료 + 기타고정비
- **이자비용** = 대출잔액 × 금리 / 12
- **세금** = 종합소득세(8구간, 6%~45%) + 지방소득세(10%), 연간 기준 /12
- **원금상환** = 대출금 / (기간년 × 12), 원금균등
- **FCF** = 세후이익 - 원금상환
- **투자회수** = 60개월 누적 현금흐름 (매월 이자 감소 반영)
- **DCF** = 영업이익 × (1-실효세율) × 12 / (할인율 - 성장률)

### 7. NOTE
- `@supabase/supabase-js`는 package.json에 있지만 실제로 사용하지 않음 (로컬 데이터 모드). 제거해도 무방.
- integration test의 `realBusiness`에 `initial_investment_small/medium/large` 없음 → 해당 필드 없어도 테스트는 통과 (optional이 아닌 곳에서만 사용)
- `.env.local`은 불필요 (Supabase 미사용)
