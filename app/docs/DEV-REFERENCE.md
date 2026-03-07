# 개발 레퍼런스

> 프로젝트 구조, 아키텍처, 엣지케이스, 로드맵을 한 곳에 정리한 개발자용 문서입니다.
> - 데이터 출처/계산식 → `APPENDIX-DATA-SOURCES.md`
> - 디자인 가이드 → `DESIGN-GUIDE.md`
> - 데이터 흐름도 → `DATA-FLOW.md`

---

## 1. 프로젝트 개요

**자영업 수익 시뮬레이터** — 한국 소상공인 창업 예정자가 업종(14개)을 선택하고 규모·지역·자본을 입력하면, 일/월 손익·투자회수·DCF 사업가치를 즉시 계산하는 모바일 웹 앱.

모든 계산은 클라이언트 순수 함수로 실행. 서버 호출 없이 즉각 응답.

---

## 2. 기술 스택

| 기술 | 버전 | 선택 근거 |
|---|---|---|
| Vite | 7.x | ESM-native, 정적 빌드 → 미니앱 번들로 그대로 사용 |
| React | 19.x | 컴포넌트 기반 UI, compiler optimization |
| TypeScript | 5.9.x | 계산 로직 타입 안전성 |
| Recharts | 3.x | React 네이티브 차트, 번들 대비 기능 충분 |
| CSS Modules | built-in | 컴포넌트 스코프, 런타임 없음 |
| Supabase | 2.x | 선택적 BaaS, 환경변수 없으면 로컬 폴백 |

**왜 Vite?** 미니앱은 정적 WebView. SSR 불필요. `dist/` 출력이 그대로 배포 가능.
**왜 React hooks?** 상태가 단일 세션으로 제한적. `useSimulator`가 전체 캡슐화. 외부 상태 관리 불필요.

---

## 3. 프로젝트 구조

```
app/
├── src/
│   ├── App.tsx                   # 루트: 페이지 상태 + 훅 조율
│   ├── main.tsx                  # React 진입점
│   ├── index.css                 # 전역 스타일 (CSS 변수, reset)
│   ├── types/index.ts            # 모든 TypeScript 인터페이스
│   ├── lib/
│   │   ├── calculator.ts         # 핵심 계산 엔진 (순수 함수)
│   │   ├── tax.ts                # 종합소득세 구간세율 계산
│   │   ├── format.ts             # KRW 포매팅, 퍼센트 포매팅
│   │   └── supabase.ts           # Supabase 클라이언트 + fetch + 로컬 폴백
│   ├── data/
│   │   ├── businessTypes.ts      # 14개 업종 하드코딩 데이터
│   │   ├── costItems.ts          # 업종별 비용 항목 (참고용)
│   │   └── rentGuide.ts          # 50개 지역 임대료
│   ├── hooks/
│   │   ├── useSimulator.ts       # 시뮬레이션 상태 관리 (중앙)
│   │   ├── useBusinessTypes.ts   # 업종 데이터 fetch
│   │   ├── useRentGuide.ts       # 임대료 데이터 fetch
│   │   └── useCostItems.ts       # 비용 항목 fetch
│   ├── pages/
│   │   ├── HomePage/             # 업종 선택 그리드
│   │   ├── InputPage/            # 규모/지역/자본 입력
│   │   └── ResultPage/           # 4탭 분석 결과
│   └── components/
│       ├── BusinessTypeCard/     # 업종 카드
│       ├── CashFlowChart/        # 60개월 누적 현금흐름 차트
│       ├── PnLDisplay/           # 손익계산서 표시
│       ├── RegionSelector/       # 시도·시군구 선택
│       ├── SliderInput/          # 범용 슬라이더
│       └── PageTransition/       # 페이지 전환 애니메이션
├── docs/                         # 이 문서들
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 4. 사용자 플로우

```
[HomePage] 업종 카드 14개 표시
  → 카드 클릭
[InputPage] 규모(소/중/대) + 지역(시도/시군구) + 자본(슬라이더 4개)
  → "계산하기" 클릭
[ResultPage] 4개 탭
  탭 1: 일손익 — 일 매출/원가/총이익
  탭 2: 월손익 — 전체 P&L + 실시간 슬라이더 조정
  탭 3: 투자회수 — 60개월 누적 현금흐름 차트
  탭 4: 사업체가치 — DCF + 할인율/성장률 조정
```

**라우팅:** React Router 미사용. `App.tsx`에서 `useState<Page>`로 3단계 관리. 미니앱은 브라우저 히스토리 API 접근이 제한적이므로 단순 상태 전환이 안전.

---

## 5. 핵심 인터페이스

```typescript
// 시뮬레이션 입력
interface SimulatorInputs {
  business_type: BusinessType;
  scale: 'small' | 'medium' | 'large';
  capital: CapitalStructure;  // initial_investment, equity, interest_rate, loan_term_years
  daily_customers_override?: number;
  ticket_price_override?: number;
  rent_monthly?: number;
  labor_headcount?: number;   // 기본 1명
  discount_rate?: number;     // 기본 15%
  growth_rate?: number;       // 기본 0%
  region?: { sido, sigungu, rent_per_sqm };
}

// 월 손익 결과
interface MonthlyPnL {
  revenue, cogs, gross_profit,
  sg_and_a, sga_detail: { labor, rent, misc_fixed },
  operating_profit, interest_expense, pretax_income,
  tax, net_income, principal_repayment, free_cash_flow
}

// 전체 결과
interface SimulationResult {
  inputs, pnl: MonthlyPnL, daily: DailyPnL,
  annotations: PnLAnnotation, payback: PaybackResult, dcf: DCFResult
}
```

---

## 6. 엣지 케이스 & 알려진 이슈

### 6.1 DCF 분모 0 (할인율 = 성장률)
할인율과 성장률이 같으면 `business_value = Infinity`. UI에서 "계산 불가" 처리 필요.
**재현:** DCF 탭 → 두 슬라이더를 같은 값으로 설정.

### 6.2 영업이익 음수 시 DCF
`fcf_annual` 음수 → `business_value` 음수. 의미 없으므로 "수익성 없음"으로 표시 권장.

### 6.3 60개월 내 투자 미회수
`payback_months = null` → "60개월 내 회수 불가" 표시. 차트는 전 구간 음수. 정상 동작.

### 6.4 학원 업종 객단가 단위
`avg_ticket_price = 200,000`(월 수강료)인데 `× 일고객수 × 26일` 공식 적용 → 구독형 모델에 부정확.
낮은 `avg_daily_customers`(5~30명)로 보정되어 있으나 의미상 부정확.

### 6.5 stale closure (ResultPage 슬라이더)
`handleOverrideAndRecalc`에서 `onOverride` 후 바로 `onRecalculate` 호출 시, React 상태 업데이트가 비동기이므로 1프레임 지연 가능.

### 6.6 자기자본 > 초기투자금 방지
`setScale()` 내부에서 `equity: Math.min(c.equity, inv)`로 자동 클리핑.

---

## 7. 보안 고려사항

### 환경변수
- `VITE_*` 변수는 클라이언트 번들에 평문 포함
- `VITE_SUPABASE_ANON_KEY`에 **service_role key 절대 사용 금지**
- `.env` 파일은 `.gitignore`에 포함 확인

### Supabase RLS
```sql
CREATE POLICY "Public read access" ON business_types FOR SELECT TO anon USING (true);
-- cost_items, rent_guides도 동일. INSERT/UPDATE/DELETE 불허.
```

### 입력값 검증
슬라이더로 제한되어 min/max 이탈 불가. 자유 텍스트 입력 추가 시 양측 검증 필수.

---

## 8. 포매팅 유틸 (`src/lib/format.ts`)

```typescript
formatKRW(n)       // 1,234,567원
formatKRWShort(n)  // 1,234만원 / 1.2억원
formatPercent(n)   // 15.0%
formatMonths(n)    // 12개월 / null → "60개월 내 회수 불가"
```

`formatKRWShort`는 억/만 단위 자동 전환. NaN은 '0원' 반환 (Infinity 버그 수정 완료).

---

## 9. Apps in Toss 출시 체크리스트

### 필수 기술
- [ ] `npm install @apps-in-toss/web-framework` + `@toss/tds-mobile`
- [ ] `granite.config.ts` 생성 (appName, primaryColor, port, commands)
- [ ] `initialize()` 호출 (React 렌더링 전, `main.tsx`)
- [ ] TDS 컴포넌트로 UI 교체 (Tab, Button, BottomCTA, ListRow, Navigation 등)

### 필수 디자인
- [ ] 라이트 모드 전용 (`<meta name="color-scheme" content="light">`)
- [ ] 모바일 전용 (375px~430px)
- [ ] 터치 타겟 최소 44px

### 필수 콘텐츠
- [ ] 면책 문구 (시뮬레이션 참고용, 세무사 상담 권장)
- [ ] 데이터 출처 명시
- [ ] 세금 계산 면책

### 네이티브 연동
- [ ] 디바이스 뒤로가기 SDK 핸들링 (현재 `useState<Page>` → 앱 종료 위험)

### 심사 (2~4주 소요)
1. 기술 검토 (SDK, granite.config)
2. 디자인 검토 (TDS 준수)
3. 콘텐츠 검토 (금융정보 정확성, 면책)
4. 최종 승인 (QA + 법무)

---

## 10. 로드맵

### Phase 1 — MVP (완성)
- [x] 14개 업종, 월/일 손익, 투자회수, DCF
- [x] 종합소득세 2025년 구간세율
- [x] 지역별 임대료 + Supabase 연동
- [x] Recharts 차트 + 실시간 재계산

### Phase 2 — Apps in Toss 통합
- [ ] SDK 설치 + granite.config
- [ ] TDS 컴포넌트 전환
- [ ] 라이트 모드 검증 + 네이티브 뒤로가기
- [ ] 4단계 심사 제출

### Phase 3 — 고도화
- [ ] 업종 비교 (2개 나란히)
- [ ] 시나리오 저장/불러오기
- [ ] 프랜차이즈 vs 독립 비교
- [ ] 계절성 반영 (성수기/비수기)

---

## 11. 개발 명령어

```bash
npm install          # 의존성 설치
npm run dev          # localhost:5173
npm run build        # tsc -b && vite build → dist/
npm run preview      # 빌드 결과 미리보기
npm test             # vitest (57 tests)
npx tsc --noEmit     # 타입 체크만
npm run storybook    # Storybook 실행
```

### 환경 변수 (.env.local)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
# 없으면 로컬 데이터 자동 사용. 앱은 정상 동작.
```
