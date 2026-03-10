# P&L 프랜차이즈 수수료 통합 설계

> 작성일: 2026-03-08
> 상태: 설계안 (코드 미반영)
> 관련 이슈: FTC 정보공개서 "영업 중의 부담" 데이터 통합, 삼겹살→한식 업종명 변경

---

## 1. 현황 분석

### 1-1. 기존 P&L 흐름 (`src/lib/calculator.ts`)

```
일매출   = avg_ticket_price × daily_customers
월매출   = 일매출 × operating_days (26일 또는 30일)
매출원가 = 월매출 × material_cost_ratio
매출총이익 = 월매출 - 매출원가
판관비   = 인건비 + 임대료 + 공과금 + 배달앱수수료 + 기타고정비 + marketing + 예비비
영업이익 = 매출총이익 - 판관비
```

`marketing` 항목은 `calcMonthlyPnL` 93-96행에 이미 자리가 마련되어 있으나,
`resolveBusinessParams`(40행)에서 `franchise_royalty_rate = 0`으로 하드코딩되어 항상 0이다.

### 1-2. 기존 프랜차이즈 데이터 (`src/data/franchiseData.ts`)

`FranchiseBrand` 인터페이스는 **초기 투자비** 항목(가맹비, 교육비, 보증금, 인테리어)만 담고 있다.
영업 중 변동비인 **로열티율·광고분담금율**은 필드 자체가 없다.

### 1-3. SimulatorInputs (`src/types/index.ts:65-78`)

사용자가 선택한 프랜차이즈 브랜드를 저장하는 필드가 없다.
`franchise_royalty_rate`는 `ResolvedParams` (calculator.ts 내부 인터페이스)에만 있고,
외부에서 주입할 경로가 없다.

### 1-4. useSimulator (`src/hooks/useSimulator.ts`)

`setOverride`(96-100행)는 `SimulatorInputs`의 optional 숫자 필드만 덮어쓸 수 있다.
브랜드 객체(FranchiseBrand) 전달 경로가 없다.

---

## 2. 설계 목표

| 목표 | 설명 |
|------|------|
| 변동비 분리 | 로열티·광고분담금은 매출 연동 변동비이므로 고정비와 구분 |
| 비프랜차이즈 호환 | 브랜드 미선택 시 자동으로 0% 적용, 기존 동작 무변화 |
| P&L 가시성 | 결과 화면에서 "프랜차이즈 수수료" 항목을 별도 행으로 표시 |
| 데이터 확장성 | FranchiseBrand에 율(rate) 필드를 추가해 향후 브랜드 데이터 보강 용이 |

---

## 3. 변경 대상 파일 목록

| 파일 | 변경 종류 | 우선순위 |
|------|-----------|----------|
| `src/types/index.ts` | 타입 추가/수정 | 1 (선행 필요) |
| `src/data/franchiseData.ts` | 필드 추가 + 데이터 입력 | 2 |
| `src/lib/calculator.ts` | 계산 로직 수정 | 3 |
| `src/hooks/useSimulator.ts` | 상태·setter 추가 | 4 |
| `src/pages/ResultPage/ResultPage.tsx` | UI 표시 | 5 |
| `src/pages/InputPage/` (해당 컴포넌트) | 브랜드 선택 UI 연결 | 6 |

---

## 4. 타입 변경사항 (`src/types/index.ts`)

### 4-1. `FranchiseBrand` 확장

현재 `FranchiseBrand`는 `src/data/franchiseData.ts`에 로컬 인터페이스로 정의되어 있다.
이를 `src/types/index.ts`로 이동하거나, 아래 필드를 `franchiseData.ts`에 추가한다.

```ts
// src/data/franchiseData.ts (또는 src/types/index.ts로 이동)
export interface FranchiseBrand {
  name: string;
  business_type_id: number;
  initial_fee: number;
  education_fee: number;
  deposit: number;
  interior_per_sqm: number;
  other_cost: number;
  source: string;

  // 신규 필드: FTC 정보공개서 "영업 중의 부담"
  royalty_rate: number;        // 상표사용료 (매출 대비 소수, 예: 0.06)
  advertising_rate: number;    // 광고분담금 (매출 대비 소수, 예: 0.045)
  other_fees_rate?: number;    // 콜수수료·온라인수수료 등 기타 (기본값 0)
  fees_source?: string;        // 출처 명시 (예: "공정위 정보공개서 2024")
}
```

**주의**: 기존 브랜드 데이터에 율 정보가 없으면 `royalty_rate: 0, advertising_rate: 0`으로
초기화하고, 데이터 확보 순서대로 채운다.

### 4-2. `SimulatorInputs` 확장

```ts
// src/types/index.ts:65-78
export interface SimulatorInputs {
  business_type: BusinessType;
  scale: BusinessScale;
  capital: CapitalStructure;
  daily_customers_override?: number;
  ticket_price_override?: number;
  rent_monthly?: number;
  labor_headcount?: number;
  discount_rate?: number;
  growth_rate?: number;
  region?: { sido: string; sigungu: string; rent_per_sqm: number };
  material_cost_ratio_override?: number;
  misc_fixed_cost_override?: number;

  // 신규 필드
  selected_brand?: FranchiseBrand;  // 선택된 프랜차이즈 브랜드 (없으면 개인창업)
}
```

### 4-3. `SGADetail` 확장

현재 `marketing` 단일 필드가 로열티를 담당한다. 항목을 분리해 가시성을 높인다.

```ts
// src/types/index.ts:86-95
export interface SGADetail {
  labor: number;
  labor_headcount: number;
  rent: number;
  utilities: number;
  delivery_commission: number;
  other_fixed: number;
  // 기존 marketing 필드를 아래 세 항목으로 대체
  royalty: number;           // 상표사용료
  advertising_fund: number;  // 광고분담금
  other_franchise_fees: number; // 기타 수수료
  contingency: number;
}
```

**하위 호환 주의**: `marketing` 필드를 삭제하면 ResultPage 등에서 `sga_detail.marketing`을
참조하는 코드가 모두 깨진다. 삭제 전 Grep으로 참조처 확인 필요.

---

## 5. `calculator.ts` 수정 방향

### 5-1. `resolveBusinessParams` (현재 40행)

```ts
// 현재: franchise_royalty_rate = 0 하드코딩
// 수정: SimulatorInputs.selected_brand에서 읽어온다
const brand = inputs.selected_brand;
const franchise_royalty_rate  = brand?.royalty_rate       ?? 0;
const franchise_ad_rate       = brand?.advertising_rate   ?? 0;
const franchise_other_rate    = brand?.other_fees_rate    ?? 0;
```

`ResolvedParams` 인터페이스에도 `franchise_ad_rate`, `franchise_other_rate` 추가.

### 5-2. `calcMonthlyPnL` (현재 93-101행)

```ts
// 현재 (93-96행):
const marketing = params.franchise_royalty_rate > 0
  ? Math.round(revenue * params.franchise_royalty_rate)
  : 0;

// 수정: 세 항목으로 분리
const royalty          = Math.round(revenue * params.franchise_royalty_rate);
const advertising_fund = Math.round(revenue * params.franchise_ad_rate);
const other_franchise_fees = Math.round(revenue * params.franchise_other_rate);
const total_franchise_fees = royalty + advertising_fund + other_franchise_fees;

// sg_and_a 합산 (101행):
const sg_and_a = labor + rent + utilities + delivery_commission
  + other_fixed + royalty + advertising_fund + other_franchise_fees + contingency;

// sga_detail (102행):
const sga_detail: SGADetail = {
  labor, labor_headcount: laborHeadcount, rent, utilities,
  delivery_commission, other_fixed,
  royalty, advertising_fund, other_franchise_fees,
  contingency,
};
```

### 5-3. `generateAnnotations` (현재 121-143행)

`sga` 주석 문자열에 프랜차이즈 수수료 항목 추가:

```ts
// brand가 있을 때만 로열티 설명 추가
const royaltyNote = brand
  ? ` + 상표사용료 ${(params.franchise_royalty_rate * 100).toFixed(1)}%`
    + ` + 광고분담금 ${(params.franchise_ad_rate * 100).toFixed(1)}%`
  : '';
```

---

## 6. `useSimulator.ts` 수정 방향

### 6-1. 상태 추가

```ts
// useSimulator 내부
const [selectedBrand, setSelectedBrand] = useState<FranchiseBrand | null>(null);
```

### 6-2. inputs useMemo 확장 (현재 70-73행)

```ts
return {
  business_type: businessType,
  scale,
  capital,
  region,
  selected_brand: selectedBrand ?? undefined,
  ...overrides,
};
```

### 6-3. 공개 API 추가

```ts
interface UseSimulatorResult {
  // 기존 ...
  setSelectedBrand: (brand: FranchiseBrand | null) => void;
  selectedBrand: FranchiseBrand | null;
}
```

브랜드 선택 시 `setBusinessType` 이후 `setSelectedBrand`를 호출하는 순서를 InputPage에서 보장해야 한다.

---

## 7. ResultPage UI 표시 방안

### 7-1. 월손익 탭 — 판관비 명세 테이블

현재 판관비 행 순서 (추정):
```
인건비 / 임대료 / 공과금 / 배달앱수수료 / 기타고정비 / 마케팅 / 예비비
```

변경 후:
```
인건비 / 임대료 / 공과금 / 배달앱수수료 / 기타고정비
└── [프랜차이즈 선택 시에만 표시]
    상표사용료   N원  (매출의 X%)
    광고분담금   N원  (매출의 X%)
    기타수수료   N원  (매출의 X%)   ← other_fees_rate > 0 일 때만
예비비
```

프랜차이즈 수수료 행은 `selected_brand`가 있을 때만 조건부 렌더링.

### 7-2. 일손익 탭 — 주석(annotation)

`sga` annotation 문자열이 이미 판관비 구성 설명을 담고 있으므로,
`generateAnnotations`에서 위 5-3의 `royaltyNote`를 붙여주면 자동 반영된다.

### 7-3. 투자회수·DCF 탭

프랜차이즈 수수료는 `sg_and_a` 안에 포함되어 `operating_profit`에 영향을 주므로
별도 UI 수정 없이 자동 반영된다.

### 7-4. 비교 callout (선택적 개선)

브랜드를 선택했을 때 상단에 다음과 같은 callout을 표시하는 방안:

```
[도미노피자] 상표사용료 6.0% + 광고분담금 4.5% → 월 수수료 합계 N만원
```

이는 ResultPage 상단 또는 월손익 탭 내 별도 `<aside>` 블록으로 구현.

---

## 8. 데이터 입력 계획 (`src/data/franchiseData.ts`)

우선순위별 브랜드 데이터 보강 순서 (FTC 정보공개서 기준):

| 브랜드 | royalty_rate | advertising_rate | 출처 |
|--------|-------------|-----------------|------|
| 도미노피자 | 0.060 | 0.045 | 공정위 정보공개서 (요청 제공) |
| BBQ | 미확인 | 미확인 | 공정위 정보공개서 확인 필요 |
| 교촌치킨 | 미확인 | 미확인 | 공정위 정보공개서 확인 필요 |
| 이디야커피 | 미확인 | 미확인 | 공정위 정보공개서 확인 필요 |
| 파리바게뜨 | 미확인 | 미확인 | 공정위 정보공개서 확인 필요 |

미확인 브랜드는 `royalty_rate: 0, advertising_rate: 0`으로 유지하고,
`fees_source: '미확인 — 공정위 정보공개서 확인 필요'`로 표기한다.

---

## 9. 삼겹살→한식 업종명 변경 메모

`src/data/businessTypes.ts:14` 에 `{id:6, name:"삼겹살전문점", ...}` 으로 정의되어 있다.

### 변경 필요 범위

| 변경 내용 | 위치 |
|-----------|------|
| `name: "삼겹살전문점"` → `"한식전문점"` | `businessTypes.ts:14` |
| `franchiseData.ts:44` 주석 `// 삼겹살전문점 (id: 6)` | `franchiseData.ts:44` |
| `src/data/costItems.ts` 내 업종명 참조 주석 | 해당 행 |
| UI 표시는 `name` 필드에서 읽어오므로 자동 반영 | — |

### 고려사항

- id:6의 `data_sources`에 `"생존율: 추정 (한식 기준 적용)"`이 이미 한식 기준임을 명시.
- `material_cost_ratio: 0.45`는 삼겹살 특유의 육류 원가율이므로, 한식 전반으로 일반화 시
  0.38~0.42 범위로 재검토 여지 있음 (데이터 보강 시 함께 검토).
- `avg_ticket_price: 30000`도 삼겹살 기준이므로 한식 평균(15,000~25,000원)과 괴리가 있음.
  업종명만 변경할지, 데이터까지 조정할지 별도 결정 필요.

---

## 10. 구현 순서 권고

```
1. types/index.ts — FranchiseBrand 필드 추가, SimulatorInputs.selected_brand 추가,
                    SGADetail 분리 (marketing → royalty + advertising_fund + other_franchise_fees)
2. franchiseData.ts — royalty_rate, advertising_rate 필드 추가 (기존 브랜드는 0으로 초기화,
                       도미노피자만 실데이터 입력)
3. calculator.ts — resolveBusinessParams, calcMonthlyPnL, generateAnnotations 수정
4. useSimulator.ts — selectedBrand 상태·setter 추가
5. InputPage — 브랜드 선택 후 setSelectedBrand 호출 연결 (기존 브랜드 선택 UI 활용)
6. ResultPage — SGADetail 행 렌더링 수정, 조건부 callout 추가
7. businessTypes.ts — id:6 name 변경 (삼겹살→한식)
8. 테스트 — calcMonthlyPnL 단위 테스트에 selected_brand 케이스 추가
```

---

## 11. 트레이드오프

| 방안 | 장점 | 단점 |
|------|------|------|
| `SGADetail.marketing` 유지 + 내부 합산 | 하위 호환, ResultPage 수정 최소 | 로열티/광고비 구분 불가, 데이터 불투명 |
| `marketing` → 세 필드로 분리 (권고) | P&L 항목 명확, 출처별 설명 가능 | ResultPage 렌더링 수정 필요 |
| `SimulatorInputs`에 율만 추가 (브랜드 객체 없이) | 단순 | 브랜드명 표시 불가, 초기 투자비 연동 끊어짐 |
| `selected_brand` 객체 전체 보관 (권고) | 브랜드명·출처·초기비용 한 곳에서 참조 | 상태 크기 증가 (무시할 수준) |

---

## 참조

- `src/lib/calculator.ts:40` — `franchise_royalty_rate = 0` 하드코딩 위치
- `src/lib/calculator.ts:93-101` — marketing 계산 및 sg_and_a 합산
- `src/types/index.ts:86-95` — SGADetail 인터페이스
- `src/types/index.ts:65-78` — SimulatorInputs 인터페이스
- `src/data/franchiseData.ts:1-10` — FranchiseBrand 인터페이스 (율 필드 없음)
- `src/data/businessTypes.ts:14` — id:6 삼겹살전문점 정의
