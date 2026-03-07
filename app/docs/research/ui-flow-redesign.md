# UI 플로우 전면 재설계 - 아키텍처 리서치

> 작성일: 2026-03-07
> 범위: 현재 3페이지 구조 -> 14스텝 위저드 구조로의 전환 설계

---

## 1. 새로운 플로우 전체 스텝 목록 (확정)

| # | 스텝 ID | 제목 | 유형 | 핵심 인풋 |
|---|---------|------|------|-----------|
| 1 | `select-business` | "어떤 업종을 창업해볼까요?" | 선택 (카드 그리드) | `business_type` |
| 2 | `select-scale` | "규모는 어떻게 할까요?" | 선택 (옵션 카드) | `scale` |
| 3 | `initial-investment` | "초기 투자금은 어떻게 예상하세요?" | 슬라이더 | `capital.initial_investment` |
| 3.5 | `select-region` | "어디에서 창업하실 건가요?" | 드롭다운 (시/도, 시/군/구) | `region` + `rent_monthly` |
| 4 | `equity` | "현재 자본금은 얼마인가요?" | 슬라이더 | `capital.equity` (대출 자동 계산) |
| 5 | `loan-terms` | "이자는 몇 %? 언제까지 갚으실 예정?" | 슬라이더 2개 | `capital.interest_rate`, `capital.loan_term_years` |
| 6 | `transition-ops` | "이제 운영에 대해 생각해볼게요" | 전환 화면 (인풋 없음) | - |
| 7 | `daily-customers` | "하루에 손님이 몇 명?" | 슬라이더 | `daily_customers_override` |
| 8 | `ticket-price` | "손님 한 명당 얼마의 매출?" | 슬라이더 | `ticket_price_override` |
| 9 | `ready-to-calc` | "계산 준비가 완료되었어요!" | 전환 화면 + CTA | - (계산 트리거) |
| 10 | `result-daily` | 일 손익 결과 | 결과 표시 | - (수정하기/다음 버튼) |
| 11 | `edit-inputs` | 인풋 수정 화면 | 슬라이더 다수 | 손님, 객단가, 원가율, 판관비, 기타 |
| 12 | `result-monthly` | 월 손익 결과 | 결과 표시 | - |
| 13 | `result-payback` | 투자회수 시점 | 결과 + 차트 | - |
| 14 | `result-dcf` | 권리금/사업가치 | 결과 표시 | - |

### 스텝 3.5 추가 근거: 지역 선택 누락 문제

원래 요청에 지역 선택이 빠져 있다. 그러나 지역은 다음 이유로 반드시 필요하다:

1. **임대료 계산의 핵심 입력**: `RegionSelector`가 `rent_per_sqm * scaleSqm`으로 월 임대료를 산출하며, 이것이 판관비(SGA)에 직결된다 (`calculator.ts:44`)
2. **초기투자금 가이드라인에 영향**: "이 지역에서는 보통 ~~ 정도가 투자돼요" 텍스트를 표시하려면 지역이 먼저 정해져야 한다
3. **배치 위치**: 스텝 3(초기투자금) 직전 또는 직후가 적절. 규모(스텝 2)가 면적(sqm)을 결정하고, 지역이 sqm당 임대료를 결정하므로, 규모 -> 지역 -> 투자금 순이 논리적이다. 그러나 투자금 가이드라인에 지역 임대료를 포함시키려면 지역이 먼저 와야 하므로 **스텝 3과 4 사이(스텝 3.5)**로 배치한다.

**대안**: 지역 선택 없이 "기본 임대료"를 사용하고, 스텝 11(수정하기)에서만 임대료를 조정하게 할 수도 있다. 그러나 이 경우 임대료 0원으로 계산이 시작되어 결과의 정확도가 크게 떨어진다.

**권장**: 스텝 2(규모) 다음, 스텝 3(투자금) 직전에 지역 선택을 삽입한다. 실제 스텝 번호를 재정렬하면:

```
1. 업종 -> 2. 규모 -> 3. 지역 -> 4. 초기투자금 -> 5. 자기자본 -> 6. 대출조건 -> ...
```

---

## 2. 각 스텝별 컴포넌트 분석

### 범례
- **재사용**: 현재 컴포넌트를 그대로 또는 props만 바꿔서 사용
- **수정**: 현재 컴포넌트의 인터페이스나 내부 로직 변경 필요
- **신규**: 새로 만들어야 하는 컴포넌트

### 스텝별 상세

#### 스텝 1: 업종 선택 (`select-business`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `BusinessTypeCard` | **재사용** | 현재 HomePage의 카드 그리드를 그대로 사용. `src/components/BusinessTypeCard/BusinessTypeCard.tsx` |
| `useBusinessTypes` | **재사용** | 데이터 페칭 훅 그대로 사용 |
| `StepLayout` | **신규** | 스텝 공통 레이아웃 (제목, 부제, 프로그레스바, 뒤로가기) |

#### 스텝 2: 규모 선택 (`select-scale`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `ScaleSelector` | **신규** | 현재 InputPage의 규모 선택 버튼 그룹을 독립 컴포넌트로 추출. 업종별 친근한 설명 텍스트 추가 ("처음엔 작게 시작하고 싶어요" 등) |
| 규모 버튼 로직 | **수정** | 현재 `InputPage.tsx:44-63`의 인라인 로직을 `ScaleSelector`로 이동 |

현재 규모 버튼 코드 (`InputPage.tsx:44-63`):
```tsx
{(['small', 'medium', 'large'] as BusinessScale[]).map(s => {
  const inv = s === 'small' ? bt.initial_investment_small : ...;
  const customers = s === 'small' ? bt.avg_daily_customers_small : ...;
  return (
    <button key={s} className={...} onClick={() => onScale(s)}>
      <span>{SCALE_LABELS[s]}</span>
      <span>일 {customers}명</span>
      <span>~{formatKRWShort(inv)}</span>
    </button>
  );
})}
```

이 로직을 추출하되, 친근한 설명 텍스트와 더 큰 카드 형태의 UI로 재설계한다.

#### 스텝 3 (권장 스텝 3): 지역 선택 (`select-region`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `RegionSelector` | **수정** | 현재 `src/components/RegionSelector/RegionSelector.tsx`를 재사용하되, 스텝 전용 레이아웃에 맞게 스타일 조정. `scaleSqm`은 스텝 2에서 결정된 scale 기반으로 전달 |
| `useRentGuide` | **재사용** | 그대로 사용 |

수정 포인트: 현재 `RegionSelector`는 InputPage 내 section으로 들어가는 크기인데, 풀스크린 스텝에서는 더 큰 레이아웃이 필요할 수 있다. Props 인터페이스는 변경 불필요.

#### 스텝 4: 초기투자금 (`initial-investment`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `SliderInput` | **재사용** | `src/components/SliderInput/SliderInput.tsx` 그대로 사용 |
| `GuidelineText` | **신규** | 가이드라인 텍스트 컴포넌트 ("이 지역에서는 보통 ~~") |

슬라이더 범위: 현재 `bt.initial_investment_min` ~ `bt.initial_investment_max` 그대로 사용 (`InputPage.tsx:81-84`).

#### 스텝 5: 자기자본 (`equity`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `SliderInput` | **재사용** | |
| `DebtDisplay` | **신규** | "그럼 ~~원을 은행에서 대출할게요" 자동 계산 표시. 현재 `InputPage.tsx:100-103`의 debtInfo를 독립 컴포넌트로 |

현재 대출 표시 코드 (`InputPage.tsx:100-103`):
```tsx
<div className={styles.debtInfo}>
  <span>{formatKRWShort(debt)}</span>
</div>
```

#### 스텝 6: 대출 조건 (`loan-terms`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `SliderInput` x 2 | **재사용** | 금리 + 상환기간 슬라이더. `InputPage.tsx:105-123` 그대로 |
| `LoanNote` | **신규** (간단) | "원리금 균등상환을 가정합니다" 작은 글씨 |

#### 스텝 7: 전환 화면 (`transition-ops`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `TransitionScreen` | **신규** | 박수 이모티콘 + 메시지 + 자동 또는 수동 진행 |

#### 스텝 8: 일 방문객 수 (`daily-customers`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `SliderInput` | **재사용** | |
| `GuidelineText` | **재사용** (스텝 4에서 만든 것) | "소규모 커피전문점에서는 보통 하루에 80명" |

기본값 로직: 현재 `calculator.ts:13-18`의 `getDailyCustomers()` 로직 참조.
```ts
scale === 'small' ? bt.avg_daily_customers_small :
scale === 'large' ? bt.avg_daily_customers_large :
bt.avg_daily_customers_medium
```

#### 스텝 9: 객단가 (`ticket-price`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `SliderInput` | **재사용** | |
| `GuidelineText` | **재사용** | "커피전문점 평균 객단가는 5,500원" |

기본값: `bt.avg_ticket_price` (`calculator.ts:21-22`).

#### 스텝 10: 계산 준비 (`ready-to-calc`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `TransitionScreen` | **재사용** (스텝 7과 동일 컴포넌트) | "계산하기" CTA 버튼 |
| `AdPlaceholder` | **신규** | 미래 광고 위치 표시 (MVP에서는 빈 영역 또는 스킵) |

#### 스텝 11: 일 손익 결과 (`result-daily`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `PnLDisplay` (mode="daily") | **수정** | 현재 `src/components/PnLDisplay/PnLDisplay.tsx:81-93`의 daily 모드를 재사용. 대출이자를 "??원"으로 표시하는 로직 추가 필요 |
| `ResultFooter` | **신규** | "수정하기" / "월 손익 계산하기" 2버튼 레이아웃 |

수정 포인트:
- `PnLDisplay`의 daily 모드에 대출이자 "??원" 행 추가
- "대출이자를 포함한 총 현금흐름은 월 손익에서만 계산돼요" 안내 문구

#### 스텝 12: 인풋 수정 (`edit-inputs`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `EditPanel` | **신규** | 예상 손님, 객단가, 매출원가율, 판관비, 기타비용 슬라이더 모음 |
| `SliderInput` x N | **재사용** | |

현재 ResultPage의 월손익 탭 슬라이더(`ResultPage.tsx:82-114`)와 유사하지만, 수정 항목이 더 많다:
- 일 방문객 수 (기존)
- 객단가 (기존)
- 월 임대료 (기존)
- **매출원가율** (신규 override 필요)
- **기타 고정비** (신규 override 필요)

#### 스텝 13: 월 손익 (`result-monthly`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `PnLDisplay` (mode="monthly") | **재사용** | `PnLDisplay.tsx:96-118` 그대로 |
| `AdPlaceholder` | **재사용** | |
| `ResultFooter` | **재사용** | "투자회수 기간 알아볼까요?" CTA |

#### 스텝 14: 투자회수 (`result-payback`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| `CashFlowChart` | **재사용** | `src/components/CashFlowChart/CashFlowChart.tsx` 그대로 |
| summaryCard | **재사용** | 현재 `ResultPage.tsx:120-126`의 카드 로직 |
| `AdPlaceholder` | **재사용** | |
| `ResultFooter` | **재사용** | "권리금은 얼마나 받을 수 있을까요?" CTA |

#### 스텝 15: 사업가치/DCF (`result-dcf`)

| 컴포넌트 | 상태 | 설명 |
|----------|------|------|
| DCF 카드 | **재사용** | `ResultPage.tsx:129-167` 로직 |
| `SliderInput` x 2 | **재사용** | 할인율 + 성장률 슬라이더 |

### 컴포넌트 요약

| 구분 | 컴포넌트 | 개수 |
|------|----------|------|
| **신규** | `StepLayout`, `ScaleSelector`, `GuidelineText`, `DebtDisplay`, `LoanNote`, `TransitionScreen`, `AdPlaceholder`, `ResultFooter`, `EditPanel` | 9개 |
| **수정** | `PnLDisplay` (대출이자 "??원" 표시 추가) | 1개 |
| **재사용** | `BusinessTypeCard`, `SliderInput`, `RegionSelector`, `CashFlowChart`, `PageTransition` | 5개 |

---

## 3. 상태 관리 변경 사항

### 현재 상태 구조 (`useSimulator.ts`)

```
useSimulator
├── businessType: BusinessType | null
├── scale: BusinessScale ('medium')
├── capital: CapitalStructure
│   ├── initial_investment: 50_000_000
│   ├── equity: 30_000_000
│   ├── interest_rate: 0.055
│   └── loan_term_years: 5
├── region?: { sido, sigungu, rent_per_sqm }
├── overrides: { discount_rate, growth_rate, ... }
└── result: SimulationResult | null
```

### 필요한 변경

#### 3.1 신규 override 필드 추가

`SimulatorInputs` 타입에 추가해야 할 필드 (`src/types/index.ts:54-65`):

```typescript
// 현재
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
}

// 추가 필요
export interface SimulatorInputs {
  // ... 기존 필드 ...
  material_cost_ratio_override?: number;   // 스텝 11 수정화면용
  misc_fixed_cost_override?: number;       // 스텝 11 수정화면용
}
```

`calculator.ts`에서도 이 override를 반영해야 한다:
- `calcDailyPnL` (`calculator.ts:29`): `inputs.material_cost_ratio_override ?? inputs.business_type.material_cost_ratio`
- `calcMonthlyPnL` (`calculator.ts:44`): `inputs.misc_fixed_cost_override ?? bt.misc_fixed_cost_monthly`

#### 3.2 계산 시점 변경

현재: "계산하기" 버튼 클릭 시 한 번만 `calculate()` 호출 (`App.tsx:35-38`)
새로운: 스텝 10("계산하기" CTA)에서 최초 계산, 이후 수정하기/재계산 시 반복 호출

`useSimulator`의 `calculate()` 함수는 변경 불필요. 호출 시점만 App에서 조정하면 된다.

#### 3.3 현재 페이지 상태 -> 스텝 상태

현재 (`App.tsx:12-17`):
```typescript
type Page = 'home' | 'input' | 'result';
const [page, setPage] = useState<Page>('home');
```

새로운:
```typescript
type StepId =
  | 'select-business' | 'select-scale' | 'select-region'
  | 'initial-investment' | 'equity' | 'loan-terms'
  | 'transition-ops'
  | 'daily-customers' | 'ticket-price' | 'ready-to-calc'
  | 'result-daily' | 'edit-inputs' | 'result-monthly'
  | 'result-payback' | 'result-dcf';

const [currentStep, setCurrentStep] = useState<StepId>('select-business');
```

#### 3.4 useSimulator 자체는 대부분 유지

`useSimulator`의 핵심 인터페이스(`useSimulator.ts:6-14`)는 변경 불필요:
- `setBusinessType` -- 스텝 1에서 호출
- `setScale` -- 스텝 2에서 호출
- `setCapital` -- 스텝 4, 5, 6에서 각각 부분 호출
- `setRegion` + `setOverride('rent_monthly', ...)` -- 스텝 3에서 호출
- `setOverride` -- 스텝 8, 9, 12에서 호출
- `calculate` -- 스텝 10에서 호출, 스텝 12에서 재호출

유일한 추가: `setOverride`의 key 타입에 `material_cost_ratio_override`, `misc_fixed_cost_override` 추가.

---

## 4. 네비게이션 설계

### 4.1 스텝 순서 정의

```typescript
const STEP_ORDER: StepId[] = [
  'select-business',
  'select-scale',
  'select-region',
  'initial-investment',
  'equity',
  'loan-terms',
  'transition-ops',
  'daily-customers',
  'ticket-price',
  'ready-to-calc',
  'result-daily',
  // 'edit-inputs'는 선형 순서에 포함하지 않음 (분기)
  'result-monthly',
  'result-payback',
  'result-dcf',
];
```

### 4.2 네비게이션 함수

```typescript
function goNext() {
  const idx = STEP_ORDER.indexOf(currentStep);
  if (idx < STEP_ORDER.length - 1) {
    setCurrentStep(STEP_ORDER[idx + 1]);
  }
}

function goBack() {
  const idx = STEP_ORDER.indexOf(currentStep);
  if (idx > 0) {
    setCurrentStep(STEP_ORDER[idx - 1]);
  }
}

// 특수 분기
function goToEdit() { setCurrentStep('edit-inputs'); }
function goBackFromEdit() { setCurrentStep('result-daily'); }
```

### 4.3 프로그레스 바

스텝을 3개 구간으로 나누어 시각적 진행률 표시:

| 구간 | 스텝 | 프로그레스 |
|------|------|-----------|
| 기본 정보 | 1~6 (업종~대출조건) | 0% ~ 40% |
| 운영 정보 | 7~10 (전환~계산준비) | 40% ~ 70% |
| 결과 확인 | 11~15 (일손익~DCF) | 70% ~ 100% |

전환 화면(스텝 7, 10)과 수정 화면(스텝 12)에서는 프로그레스 바 숨김.

```typescript
function getProgress(step: StepId): number {
  const idx = STEP_ORDER.indexOf(step);
  if (idx === -1) return 0; // edit-inputs 등
  return Math.round((idx / (STEP_ORDER.length - 1)) * 100);
}
```

### 4.4 뒤로가기 처리

- 각 스텝에서 뒤로가기 = 이전 스텝으로 이동
- 스텝 1에서 뒤로가기 = 없음 (버튼 숨김)
- `edit-inputs`에서 뒤로가기 = `result-daily`로 복귀
- 결과 스텝(11~15)에서 뒤로가기는 이전 결과 스텝으로 (재계산 불필요, 결과는 state에 유지)

### 4.5 PageTransition 재활용

현재 `PageTransition` (`src/components/PageTransition/PageTransition.tsx`)은 `pageKey`와 `direction`으로 슬라이드 애니메이션을 처리한다. `pageKey`를 `StepId`로 바꾸면 그대로 동작한다.

```tsx
<PageTransition pageKey={currentStep} direction={direction}>
  {renderStep(currentStep)}
</PageTransition>
```

---

## 5. 광고 플레이스홀더 설계

### 5.1 광고 삽입 위치

요청에 명시된 광고 위치:
1. **스텝 10 (계산 준비)**: "광고를 보면 계산할 수 있어요" -- MVP에서 미구현
2. **스텝 13 (월 손익) 진입 전**: "(광고 후) 이자비용 포함 현금흐름"
3. **스텝 14 (투자회수) 진입 전**: "(광고 후) 60개월 차트"

### 5.2 AdPlaceholder 컴포넌트

```typescript
interface AdPlaceholderProps {
  placement: 'pre-calc' | 'pre-monthly' | 'pre-payback';
  onComplete: () => void;  // 광고 완료(또는 스킵) 시 다음 스텝으로
}
```

MVP 동작: 광고 없이 즉시 `onComplete()` 호출 (빈 UI 또는 "준비 중" 텍스트).

미래 연동: `onComplete`를 광고 SDK의 `onAdClosed` 콜백에 연결하면 된다. 토스 미니앱에서 리워드 광고를 사용할 경우 `@apps-in-toss/web-framework`의 광고 API와 연동.

### 5.3 광고 게이트 패턴

```typescript
// 광고가 필요한 스텝 진입 시
function handleNextWithAd(nextStep: StepId) {
  if (AD_GATES.includes(nextStep) && !adWatched[nextStep]) {
    showAd(nextStep, () => {
      setAdWatched(prev => ({ ...prev, [nextStep]: true }));
      setCurrentStep(nextStep);
    });
  } else {
    setCurrentStep(nextStep);
  }
}
```

---

## 6. 가이드라인 데이터 표시 방식

### 6.1 가이드라인이 필요한 스텝

| 스텝 | 가이드라인 내용 | 데이터 소스 |
|------|----------------|-------------|
| 2 (규모) | "배달전문점 / 소규모 / 중규모 / 대규모" + 친근한 설명 | **신규 데이터** (업종별 규모 설명) |
| 4 (투자금) | "이 지역에서는 보통 ~~ 정도가 투자돼요" | `bt.initial_investment_{scale}` |
| 5 (자본금) | "그럼 ~~원을 은행에서 대출할게요" | 런타임 계산 (investment - equity) |
| 6 (대출조건) | "원리금 균등상환을 가정합니다" | 정적 텍스트 |
| 8 (일 고객) | "소규모 커피전문점에서는 보통 하루에 80명" | `bt.avg_daily_customers_{scale}` |
| 9 (객단가) | "커피전문점 평균 객단가는 5,500원" | `bt.avg_ticket_price` |

### 6.2 데이터 구조

대부분의 가이드라인 텍스트는 기존 `BusinessType` 데이터에서 파생 가능. 신규 데이터가 필요한 것은 **스텝 2의 규모별 친근한 설명**뿐이다.

#### 규모 설명 데이터 (신규)

```typescript
// src/data/scaleDescriptions.ts (신규 파일)
export interface ScaleDescription {
  business_type_id: number;
  scale: BusinessScale;
  label: string;          // "배달전문점", "소규모 매장", ...
  friendly_text: string;  // "처음엔 작게 시작하고 싶어요"
}

export const SCALE_DESCRIPTIONS: ScaleDescription[] = [
  { business_type_id: 1, scale: 'small', label: '배달전문점',
    friendly_text: '처음엔 작게 시작하고 싶어요' },
  { business_type_id: 1, scale: 'medium', label: '소규모 매장',
    friendly_text: '어느 정도 경험이 있어요' },
  { business_type_id: 1, scale: 'large', label: '대형 매장',
    friendly_text: '자신 있어요! 크게 해볼게요' },
  // ... 14업종 x 3규모 = 42개 항목
];
```

#### GuidelineText 컴포넌트

```typescript
interface GuidelineTextProps {
  text: string;         // 메인 가이드라인 텍스트
  source?: string;      // 출처 (작은 회색 글씨)
}
```

출처 데이터: `bt.data_sources` 배열 (예: `["통계청", "소상공인시장진흥공단"]`)을 활용.

---

## 7. 기존 컴포넌트 호환성 상세 분석

### 7.1 SliderInput -- 완전 재사용

`src/components/SliderInput/SliderInput.tsx`

- Props: `{ label, value, min, max, step, format, onChange }` -- 범용적이므로 어떤 스텝에서든 사용 가능
- 변경 불필요
- 단, 가이드라인 텍스트를 슬라이더 옆에 표시하려면 `SliderInput` 내부에 추가하기보다 **외부에서 `GuidelineText`를 조합**하는 것이 낫다. SliderInput의 단일 책임을 유지하기 위함.

### 7.2 PnLDisplay -- 소규모 수정 필요

`src/components/PnLDisplay/PnLDisplay.tsx`

스텝 11(일 손익) 요구사항:
- 대출이자를 "??원"으로 표시
- "대출이자를 포함한 총 현금흐름은 월 손익에서만 계산돼요" 안내

수정 방법: `mode="daily"` 분기(`PnLDisplay.tsx:81-93`)에 optional prop 추가.

```typescript
interface Props {
  // ... 기존 ...
  showInterestPlaceholder?: boolean;  // 신규
}
```

daily 모드 렌더링에서:
```tsx
{showInterestPlaceholder && (
  <>
    <PnLRow label="대출이자" value={0} annotation="대출이자를 포함한 총 현금흐름은 월 손익에서만 계산돼요" />
    {/* value 대신 "??원"으로 표시하는 커스텀 렌더링 */}
  </>
)}
```

### 7.3 CashFlowChart -- 완전 재사용

`src/components/CashFlowChart/CashFlowChart.tsx`

- Props: `{ payback: PaybackResult }` -- 변경 불필요
- 스텝 14(투자회수)에서 그대로 사용

### 7.4 RegionSelector -- 재사용 (스타일 조정만)

`src/components/RegionSelector/RegionSelector.tsx`

- Props 인터페이스 변경 불필요
- 풀스크린 스텝에서 사용 시 CSS만 조정 (더 큰 드롭다운, 여백 등)
- `scaleSqm` 계산: 현재 `InputPage.tsx:72`에서 `scale === 'small' ? 33 : scale === 'large' ? 66 : 50`으로 하드코딩. 이 로직을 유틸 함수로 추출하는 것이 좋다.

```typescript
// src/lib/scale.ts (신규 유틸)
export function getScaleSqm(scale: BusinessScale): number {
  return scale === 'small' ? 33 : scale === 'large' ? 66 : 50;
}
```

### 7.5 BusinessTypeCard -- 완전 재사용

`src/components/BusinessTypeCard/BusinessTypeCard.tsx`

변경 불필요. 스텝 1의 카드 그리드에서 그대로 사용.

### 7.6 PageTransition -- 재사용 (키만 변경)

`src/components/PageTransition/PageTransition.tsx`

`pageKey`를 `StepId`로 전달하면 자동으로 슬라이드 애니메이션 적용.

---

## 8. App.tsx 리팩터링 설계

### 현재 App.tsx 구조 (78줄)

```
App
├── page state ('home' | 'input' | 'result')
├── useSimulator()
├── useRentGuide()
├── useCostItems()
├── navigate(), handleSelectBusiness(), handleCalculate(), handleBack()
└── 렌더링: PageTransition > {HomePage | InputPage | ResultPage}
```

### 새로운 App.tsx 구조

```
App
├── currentStep state (StepId)
├── direction state
├── useSimulator()
├── useRentGuide()
├── useCostItems()
├── useStepNavigation(currentStep)  // 신규 훅
├── 광고 상태 (adWatched)
└── 렌더링: PageTransition > StepLayout > {renderStep()}
```

#### renderStep 함수

```typescript
function renderStep(step: StepId): ReactNode {
  switch (step) {
    case 'select-business':
      return <SelectBusinessStep onSelect={handleSelectBusiness} />;
    case 'select-scale':
      return <SelectScaleStep bt={inputs.business_type} scale={inputs.scale} onSelect={...} onNext={goNext} />;
    // ... 각 스텝
  }
}
```

### 신규 커스텀 훅: useStepNavigation

```typescript
function useStepNavigation() {
  const [currentStep, setCurrentStep] = useState<StepId>('select-business');
  const [direction, setDirection] = useState<'forward' | 'back' | 'none'>('none');
  const [history, setHistory] = useState<StepId[]>(['select-business']);

  const goNext = () => { ... };
  const goBack = () => { ... };
  const goTo = (step: StepId) => { ... };

  return { currentStep, direction, goNext, goBack, goTo, progress };
}
```

---

## 9. 현재 플로우 대비 장단점

### 장점

| 항목 | 설명 |
|------|------|
| **인지 부하 감소** | 한 화면에 하나의 질문만 표시. 현재 InputPage는 규모+지역+투자금+자본금+금리+기간이 한 화면에 있어 압도적 |
| **가이드라인 강화** | 각 입력마다 맥락 정보 제공 ("보통 ~~입니다"). 현재는 슬라이더만 있고 가이드 없음 |
| **이탈 감소** | 스텝별로 작은 커밋먼트. 현재는 전체 입력을 완료해야 결과를 볼 수 있음 |
| **광고 수익화 구조** | 결과 단계별 광고 삽입이 자연스러움. 현재 탭 구조에서는 광고 삽입 지점이 애매함 |
| **결과 순차 공개** | 일손익 -> 월손익 -> 투자회수 -> DCF 순서가 스토리텔링 형태. 현재 탭은 비선형 |

### 단점

| 항목 | 설명 |
|------|------|
| **스텝 수 과다** | 14~15스텝은 이탈을 유발할 수 있음. 특히 모바일에서 "끝이 안 보이는" 느낌 |
| **반복 수정 비효율** | 파라미터 하나를 바꾸려면 해당 스텝까지 돌아가야 함. 현재는 InputPage에서 한 번에 수정 가능 |
| **코드 복잡도 증가** | 3페이지 -> 15스텝으로 라우팅 복잡도 5배 증가. 유지보수 비용 상승 |
| **기존 테스트 영향** | 57개 테스트 중 페이지 단위 테스트가 있다면 전면 재작성 필요 |
| **전환 화면 피로** | 스텝 7, 10은 인풋 없는 전환 화면. 일부 사용자에겐 불필요한 딜레이 |

### 완화 방안

- **프로그레스 바**: 전체 진행도를 항상 표시해 "끝이 보이게" 한다
- **빠른 수정**: 결과 화면에서 "수정하기" 누르면 전체 입력 요약 + 수정 화면을 한 번에 보여준다 (개별 스텝으로 돌아가지 않음)
- **전환 화면 자동 진행**: 스텝 7은 1.5초 후 자동 진행 옵션 (탭하면 즉시 진행)

---

## 10. 구현 순서 제안

### Phase 1: 인프라 (1~2일)

1. **`StepLayout` 컴포넌트** -- 모든 스텝의 공통 골격 (제목, 프로그레스바, 뒤로가기)
2. **`useStepNavigation` 훅** -- 스텝 상태, 전환 방향, 히스토리 관리
3. **App.tsx 리팩터링** -- `page` state를 `currentStep`으로 교체, `renderStep()` 스위치 추가
4. **`getScaleSqm` 유틸 추출** -- `InputPage.tsx:72`의 하드코딩 제거

### Phase 2: 입력 스텝 (2~3일)

5. **스텝 1 (업종 선택)** -- 기존 HomePage 로직을 StepLayout 안에 배치. 가장 변경이 적음.
6. **스텝 2 (규모 선택)** -- `ScaleSelector` 신규 컴포넌트 + `scaleDescriptions` 데이터
7. **스텝 3 (지역 선택)** -- `RegionSelector` 재배치 + 스타일 조정
8. **스텝 4~6 (투자금/자본금/대출)** -- `SliderInput` 재사용, `GuidelineText` 신규, `DebtDisplay` 신규
9. **스텝 7 (전환 화면)** -- `TransitionScreen` 신규

### Phase 3: 운영 입력 + 계산 (1~2일)

10. **스텝 8~9 (고객수/객단가)** -- `SliderInput` + `GuidelineText` 재사용
11. **스텝 10 (계산 준비)** -- `TransitionScreen` 재사용 + `AdPlaceholder`
12. **`SimulatorInputs` 타입 확장** -- `material_cost_ratio_override`, `misc_fixed_cost_override` 추가
13. **`calculator.ts` 수정** -- 새 override 반영

### Phase 4: 결과 스텝 (2~3일)

14. **스텝 11 (일 손익)** -- `PnLDisplay` 수정 (대출이자 "??원") + `ResultFooter`
15. **스텝 12 (수정하기)** -- `EditPanel` 신규
16. **스텝 13 (월 손익)** -- `PnLDisplay` 재사용 + `ResultFooter`
17. **스텝 14 (투자회수)** -- `CashFlowChart` 재사용 + `ResultFooter`
18. **스텝 15 (DCF)** -- 기존 DCF 섹션 재사용

### Phase 5: 마무리 (1~2일)

19. **PageTransition 연동** -- 모든 스텝 전환에 슬라이드 애니메이션 확인
20. **`AdPlaceholder` 삽입** -- 스텝 13, 14 진입 전 광고 게이트
21. **테스트 업데이트** -- 기존 57개 테스트 중 페이지 단위 테스트 수정
22. **반응형 스타일** -- 모바일 최적화, 토스 WebView 확인

**총 예상: 7~12일** (1인 기준)

---

## 11. 파일 구조 제안

```
src/
├── components/
│   ├── BusinessTypeCard/        (유지)
│   ├── CashFlowChart/           (유지)
│   ├── PageTransition/          (유지)
│   ├── PnLDisplay/              (수정)
│   ├── RegionSelector/          (유지)
│   ├── SliderInput/             (유지)
│   ├── StepLayout/              (신규) -- 공통 스텝 레이아웃
│   ├── GuidelineText/           (신규) -- 가이드라인 텍스트
│   ├── TransitionScreen/        (신규) -- 전환 화면
│   ├── AdPlaceholder/           (신규) -- 광고 자리
│   └── ResultFooter/            (신규) -- 결과 하단 CTA
│
├── steps/                       (신규 디렉터리)
│   ├── SelectBusinessStep.tsx
│   ├── SelectScaleStep.tsx
│   ├── SelectRegionStep.tsx
│   ├── InitialInvestmentStep.tsx
│   ├── EquityStep.tsx
│   ├── LoanTermsStep.tsx
│   ├── TransitionOpsStep.tsx
│   ├── DailyCustomersStep.tsx
│   ├── TicketPriceStep.tsx
│   ├── ReadyToCalcStep.tsx
│   ├── ResultDailyStep.tsx
│   ├── EditInputsStep.tsx
│   ├── ResultMonthlyStep.tsx
│   ├── ResultPaybackStep.tsx
│   └── ResultDcfStep.tsx
│
├── hooks/
│   ├── useSimulator.ts          (소규모 수정)
│   ├── useStepNavigation.ts     (신규)
│   └── ... (기존 유지)
│
├── data/
│   ├── scaleDescriptions.ts     (신규)
│   └── ... (기존 유지)
│
├── lib/
│   ├── scale.ts                 (신규 유틸)
│   └── ... (기존 유지)
│
├── pages/                       (deprecated, Phase 완료 후 삭제)
│   ├── HomePage/
│   ├── InputPage/
│   └── ResultPage/
│
└── App.tsx                      (대규모 수정)
```

---

## 12. 참조 코드 위치

| 현재 코드 | 파일:라인 | 새 플로우에서의 역할 |
|-----------|----------|---------------------|
| 업종 카드 그리드 | `HomePage.tsx:40-46` | 스텝 1에서 재사용 |
| 규모 선택 버튼 | `InputPage.tsx:44-63` | 스텝 2 ScaleSelector로 추출 |
| 지역 선택 드롭다운 | `InputPage.tsx:66-75` + `RegionSelector.tsx` | 스텝 3에서 재사용 |
| 투자금 슬라이더 | `InputPage.tsx:80-88` | 스텝 4에서 재사용 |
| 자기자본 슬라이더 | `InputPage.tsx:90-98` | 스텝 5에서 재사용 |
| 대출 표시 | `InputPage.tsx:100-103` | 스텝 5 DebtDisplay로 추출 |
| 금리/기간 슬라이더 | `InputPage.tsx:105-123` | 스텝 6에서 재사용 |
| 고객수 슬라이더 | `ResultPage.tsx:83-95` | 스텝 8에서 재사용 |
| 객단가 슬라이더 | `ResultPage.tsx:96-104` | 스텝 9에서 재사용 |
| 일 손익 표시 | `PnLDisplay.tsx:81-93` | 스텝 11에서 수정 사용 |
| 월 손익 표시 | `PnLDisplay.tsx:96-118` | 스텝 13에서 재사용 |
| 투자회수 차트 | `ResultPage.tsx:118-127` + `CashFlowChart.tsx` | 스텝 14에서 재사용 |
| DCF 섹션 | `ResultPage.tsx:129-167` | 스텝 15에서 재사용 |
| 페이지 전환 | `PageTransition.tsx` | 스텝 전환에서 재사용 |
| 네비게이션 로직 | `App.tsx:23-28` | useStepNavigation으로 대체 |
| 시뮬레이터 상태 | `useSimulator.ts` | 소규모 확장 (override 2개 추가) |
| 계산 엔진 | `calculator.ts` | 소규모 수정 (override 반영) |
| scaleSqm 하드코딩 | `InputPage.tsx:72` | `lib/scale.ts`로 추출 |
