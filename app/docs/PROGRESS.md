# 프로젝트 진행상황 (2026-03-08 세션 종료 기준)

> **이 문서만 보면 다음 세션에서 바로 이어서 작업할 수 있도록 상세히 기록합니다.**

---

## 현재 상태 요약

```
1차 리디자인 (위자드 UI + 계산엔진)  ✅ 완료
FTC 데이터 수집 파이프라인           ✅ 완료 (PDF 파서 v2 작동)
P&L 프랜차이즈 수수료 설계          ✅ 설계 완료 (코드 미반영)
2차 리디자인 Phase A~F              ⬜ 미착수 (계획서 완성)
사용자 PDF 다운로드                  ⏳ 대기 중
```

---

## 1. 완료된 작업

### 1-1. 1차 리디자인 (완료)
- [x] 위자드 UI (14스텝 순차 진행)
- [x] 업종 세분류 (sub_types) 도입
- [x] 규모 선택 (소/중/대) with 면적/인원 기준
- [x] 계산 엔진 리팩토링 (calculator.ts)
- [x] 결과 4탭 (일손익/월손익/투자회수/DCF)
- [x] 52개 테스트 전체 통과

### 1-2. FTC 데이터 수집 파이프라인 (완료)

| 수집 방법 | 상태 | 결과 |
|-----------|------|------|
| FTC 웹 스크래핑 | ❌ CAPTCHA 차단 | 피자 5개만 수집 |
| FTC OPEN API | ✅ 완료 | 857개 소규모 브랜드 (주요 브랜드 없음) |
| **PDF 파서 v2** | ✅ 작동 | 한글 정확 추출, 전체 섹션 IV 파싱 |

#### PDF 파서 v2 (`scripts/parse-ftc-pdf.mjs`) 상세
- **한글 인코딩**: pymupdf + pdfplumber 사용. Windows cp949 콘솔 이슈 해결 (`PYTHONIOENCODING=utf-8`)
- **추출 항목**:
  - 영업개시 이전 비용: 가맹비, 교육비, 보증금, 감리비, 인테리어(평수별 15/20/25평)
  - 영업 중 비용: **상표사용료(%)**, **광고분담금(%)**, 기타 수수료
- **도미노피자 테스트 통과** ✅ (가맹비 300만, 교육비 275만, 보증금 200만, 인테리어 25평 기준 7,620만/3.3㎡)
- **사용법**:
  ```bash
  # 단일 파일
  node scripts/parse-ftc-pdf.mjs "경로/브랜드명.pdf" 업종명

  # 폴더 일괄
  node scripts/parse-ftc-pdf.mjs --dir "경로/폴더" 업종명

  # Supabase 업로드
  node scripts/parse-ftc-pdf.mjs --upload
  ```
- **Python 경로**: `C:/Users/wows2/AppData/Local/Programs/Python/Python39/python.exe`

#### 브랜드 선정 기준
- **가맹점 수** (공정거래위원회 2023 정보공개서, 2024.04 발표) 기준으로 업종별 상위 10개
- 상세 리스트: `docs/research/brand-selection.md`
- PDF 다운로드 방법도 해당 문서에 기재

### 1-3. P&L 프랜차이즈 수수료 통합 설계 (설계 완료, 코드 미반영)

**설계 문서**: `docs/research/pnl-franchise-fees.md`

**핵심 설계 결정**:
1. `SGADetail.marketing` → `royalty` + `advertising_fund` + `other_franchise_fees`로 분리
2. `SimulatorInputs`에 `selected_brand?: FranchiseBrand` 객체 전체 보관
3. 비프랜차이즈 선택 시 자동으로 0% (기존 동작 무변화)
4. `calculator.ts:40`의 `franchise_royalty_rate = 0` 하드코딩 → `selected_brand`에서 읽어옴

**구현 순서** (미착수):
```
1. types/index.ts — FranchiseBrand 필드 추가, SimulatorInputs.selected_brand, SGADetail 분리
2. franchiseData.ts — royalty_rate, advertising_rate 필드 추가
3. calculator.ts — resolveBusinessParams, calcMonthlyPnL, generateAnnotations 수정
4. useSimulator.ts — selectedBrand 상태/setter 추가
5. InputPage — 브랜드 선택 → setSelectedBrand 연결
6. ResultPage — SGADetail 행 렌더링, 조건부 callout
7. 테스트 — selected_brand 케이스 추가
```

### 1-4. 무한대(∞) 표시 버그 수정 (완료)
- `formatKRWShort`: `undefined` 입력 시 `isFinite(undefined)=false` → '∞' 반환
- 수정: `Number.isNaN()` 가드 추가 → '0원' 반환
- `SliderInput`: `max === min` 시 division by zero 방지

---

## 2. 진행 중 / 대기 중 작업

### 2-1. 사용자 PDF 다운로드 대기
- **필요**: 업종별 상위 10개 브랜드의 FTC 정보공개서 PDF
- **다운로드 위치**: `c:\Users\wows2\Downloads\franchise\`
- **대상 브랜드**: `docs/research/brand-selection.md` 참조
- **파싱 후**: `--upload` 옵션으로 Supabase에 자동 업로드

### 2-2. 삼겹살 → 한식 변경 (미착수)
- `src/data/businessTypes.ts:14` — `name: "삼겹살전문점"` → `"한식전문점"`
- **주의**: 이름만 변경할지 데이터까지 조정할지 결정 필요
  - `avg_ticket_price: 30000` — 삼겹살 특화값. 한식 평균은 15,000~25,000원
  - `material_cost_ratio: 0.45` — 삼겹살(육류) 특화값. 한식 일반은 0.38~0.42
  - 한식 프랜차이즈(본죽, 한솥도시락 등) PDF 파싱 후 실데이터로 교체 권장
- 참조: `docs/research/brand-selection.md` §6 한식 브랜드 리스트

### 2-3. 재료비(material_cost_ratio) 현황
- **현재 상태**: 전 업종 "추정치 (공식 출처 미확인)"으로 data_sources에 표기됨
- **현재 데이터**:
  | 업종 | 현재 원가율 | 비고 |
  |------|-----------|------|
  | 치킨 | 0.40 | 업계 통설 35~42% |
  | 커피 | 0.28 | 원두+부자재 25~32% |
  | 편의점 | 0.72 | 본사 공급가 기반 |
  | 미용실 | 0.10 | 재료비 비중 낮음 |
  | 분식 | 0.28 | 저원가 구조 |
  | 삼겹살/한식 | 0.45 | 육류 원가 높음 |
  | 세탁소 | 0.12 | 세제+용제 |
  | 피자 | 0.35 | 치즈+도우 |
  | 베이커리 | 0.35 | 밀가루+버터 |
  | 네일샵 | 0.15 | 재료비 낮음 |
  | 반찬가게 | 0.55 | 식재료 원가 높음 |
  | 무인아이스크림 | 0.50 | 제품 매입 원가 |
- **리서치 완료**: `docs/research/input-guidelines.md` §7에 업종별 매출원가율 가이드라인 데이터 수집 완료
- **남은 작업**: 리서치 데이터 기반으로 businessTypes.ts의 값 검증/수정 + data_sources 출처 업데이트
- **핵심 출처**: 통계청 서비스업조사, 소상공인시장진흥공단 경영분석, 업종별 프랜차이즈 정보공개서

### 2-4. 신규 업종 추가 검토

#### 스터디카페 (추가 권장 — 리서치 완료)
- **공정위 등록**: **90개 이상 브랜드** 정보공개서 등록됨 ✅
- **국세청 업종코드**: `923100` (독서실 운영업, 2023.07 전용 코드 지정)
- **시장 현황**: 2024년 기준 전국 약 **6,944개** 가맹점
- **주요 브랜드** (가맹점 수 기준):
  | 브랜드 | 가맹점 수 | 월평균 매출 |
  |--------|----------|-----------|
  | 르하임스터디카페 | 225 | 793만원 |
  | 토즈스터디센터 | 217 | 미공개 |
  | 초심스터디카페 | 184 | 미공개 |
  | 작심스터디카페 | 168 | 1,122만원 |
  | 멘토즈스터디카페 | 137 | 992만원 |
- **창업비용**: 50평 기준 **1.7억~2억원** (인테리어 8천만~1억, 키오스크/IoT 2천만)
- **원가 구조**: 재료비 해당 없음 (좌석 시간 이용료 모델). 주요 비용 = 임대료 + 전기/공과금
- **순수익률**: 약 50~60% (무인 운영 시)
- **BusinessType 추가 시 예상값**:
  ```
  avg_ticket_price: 5000~8000 (1회 이용 평균)
  material_cost_ratio: 0.05~0.10 (전기/수도/소모품 정도)
  labor_cost: 0 (무인)
  misc_fixed: 높음 (관리비 월 100~200만)
  initial_investment: 1.7억~2억원
  ```
- **주의**: 2024년 경쟁 심화, 시간당 800원까지 출혈경쟁 발생
- **결정 필요**: 시간제 과금 모델이 현재 P&L 구조(일 고객수 × 객단가)와 맞는지 검토

#### 무인카페 (추가 검토 — 리서치 완료)
- **공정위 등록**: 주요 브랜드 등록됨 ✅ (일부 소규모 미등록)
- **주요 브랜드**: 나우커피(600+개), 카페만월경(402개), 데이롱카페(300개)
- **창업비용**: 4,700만~2억원 (브랜드별 편차 큼)
- **원가율**: **20~25%** (아메리카노 1,500원 기준 원두/컵 300~370원)
- **월평균 매출**: 250만~500만원 (소규모, 나우커피 기준 월 258만)
- **순수익률**: ~50% (단, 절대 금액 낮음 — 월 100~150만원 수준)
- **판단**: 커피전문점(id:2) 내 sub_type "무인카페"로 추가하는 방안이 적절
  - 독립 업종으로 하기엔 매출 규모가 작고 구조가 커피전문점과 유사

#### 무인아이스크림 (이미 추가됨 — 데이터 보강 필요)
- `businessTypes.ts`에 **id:14 "무인아이스크림"** 이미 존재
- `labor_cost_monthly_per_person: 0` (무인)
- **공정위 등록**: **일부만 등록** (픽미픽미아이스 625개, 도깨비냉장고 59개 등)
  - 대다수 브랜드가 "3무(가맹비/로열티/교육비 없음)" 방식으로 가맹사업법 등록 없이 운영
- **현재 데이터 검증**:
  - `material_cost_ratio: 0.50` → 실제 **60~70%** (할인점 매입원가 높음) → **상향 조정 필요**
  - `avg_ticket_price: 5000` → 적절 (600~1,500원 × 여러 개)
  - `initial_investment: 2,000만~3,000만` → 현재 min 2천만/max 6천만 적절
- **주의**: 2024년 과당경쟁, 아이스크림 단품 → 세계과자/음료/라면 복합 전환 트렌드

---

## 3. Supabase 데이터 현황

| 테이블 | 레코드 수 | 출처 | 비고 |
|--------|----------|------|------|
| franchise_costs | 5 (피자) | 웹 스크래핑 | royalty_rate, advertising_rate 컬럼 추가 필요 |
| franchise_costs | ~200 (기타) | FTC API 공개본 | 소규모 브랜드만 |
| business_types | 14 | 로컬 데이터 | |
| cost_items | 89 | 로컬 데이터 | 표시용만, 계산 미사용 |
| rent_guides | 50 | 로컬 데이터 | 80+ 확충 필요 (Phase A-1) |

**Supabase 스키마 변경 필요**:
- `franchise_costs` 테이블에 `royalty_rate FLOAT`, `advertising_rate FLOAT` 컬럼 추가
- PDF 파서 v2는 이미 이 필드를 추출하므로, 컬럼만 추가하면 `--upload` 시 자동 반영

---

## 4. 2차 리디자인 계획

**상세 계획서**: `~/.claude/plans/quiet-zooming-gosling.md` (Claude Code plan mode)

### Phase 요약

| Phase | 작업 | 상태 | 의존성 |
|-------|------|------|--------|
| **A-1** | 임대료 데이터 확충 (50→80+지역) | 미착수 | 없음 |
| **A-2** | ∞ 표시 버그 수정 | ✅ 완료 | 없음 |
| **A-3** | 슬라이더 바 안 보이는 버그 | 미착수 | 없음 |
| **A-4** | 매출원가→재료비 라벨 변경 | 미착수 | 없음 |
| **B-1** | 가이드라인 데이터 + 룰북 (`guidelines.ts`) | 미착수 | 없음 |
| **B-2** | GuidelineBox 컴포넌트 | 미착수 | B-1 |
| **B-3** | 모든 스텝에 가이드라인 적용 | 미착수 | B-2 |
| **C-1** | InvestmentStep 분리 (자본구조/대출) | 미착수 | 없음 |
| **C-2** | 스텝 순서 변경 + `set-loan` StepId 추가 | 미착수 | C-1 |
| **D-1** | ResultPage 탭→별도 화면 | 미착수 | 없음 |
| **D-2** | 월손익 슬라이더 제거 + 수정하기 버튼 | 미착수 | D-1 |
| **D-3** | DCF/권리금 UX 개선 | 미착수 | 없음 |
| **E-1** | ConfirmStep 수정 버튼 제거 | 미착수 | 없음 |
| **E-2** | App.tsx 라우팅 업데이트 | 미착수 | C-2, D-1, E-1 |
| **F-1** | 테스트 업데이트 | 미착수 | 전체 |
| **F-2** | 전체 빌드 + 검증 | 미착수 | F-1 |

### 병렬화 맵

```
Phase A: [A-1] [A-3] [A-4]  ← 3개 병렬 (A-2 완료)
Phase B: [B-1] → [B-2] → [B-3]  ← 순차
Phase C: [C-1] → [C-2]
Phase D: [D-1] [D-2] [D-3]  ← 3개 병렬
Phase E: [E-1] → [E-2]
Phase F: [F-1] → [F-2]
```

### 가이드라인 시스템 핵심 (Phase B)

사용자 요구: "정확하지 않아도 되니까 '대충' 얼마나 드는지 가이드라인을 줘. 어떤 금액을 선택하는 곳에서는 거의 무조건."
- 리서치 완료: `docs/research/input-guidelines.md` (임대료/투자금/고객수/객단가/인건비/금리/원가율)
- 프랜차이즈 비용: `docs/research/franchise-costs.md`
- 구현: `src/data/guidelines.ts` 새로 생성 → `GuidelineBox` 컴포넌트 → 모든 위자드 스텝에 적용

---

## 5. 핵심 스크립트

| 스크립트 | 용도 | 상태 |
|----------|------|------|
| `scripts/parse-ftc-pdf.mjs` | FTC 정보공개서 PDF → 비용데이터 추출 (v2) | ✅ 작동 |
| `scripts/scrape-ftc-api.mjs` | FTC OPEN API 수집 (857개 완료) | ✅ 완료 |
| `scripts/scrape-ftc-costs.mjs` | FTC 웹 스크래핑 | ❌ CAPTCHA 차단 |
| `scripts/quick-test.mjs` | CAPTCHA 차단 상태 확인 | ✅ 작동 |

---

## 6. 리서치 문서 목록

| 문서 | 경로 | 내용 | 상태 |
|------|------|------|------|
| 입력 가이드라인 | `docs/research/input-guidelines.md` | 임대료/투자금/고객수/객단가/인건비/금리/원가율 | ✅ 완료 |
| 프랜차이즈 비용 | `docs/research/franchise-costs.md` | 업종별 FTC 평균 창업비용 | ✅ 완료 |
| 브랜드 선정 | `docs/research/brand-selection.md` | 가맹점 수 기반 업종별 TOP10 | ✅ 완료 |
| P&L 수수료 설계 | `docs/research/pnl-franchise-fees.md` | 로열티/광고분담금 P&L 통합 설계 | ✅ 설계 완료 |
| UI 플로우 | `docs/research/ui-flow-redesign.md` | 결과화면 분리 설계 | ✅ 완료 |
| 오케스트레이션 피드백 | `docs/research/orchestration-feedback.md` | 전체 앱 분석 리스크 평가 | ✅ 완료 |

---

## 7. 데이터 수집 전략

```
[1순위] PDF 수동 다운로드 + 파서 → 업종당 10개 주요 브랜드 (가맹점 수 기준)
        → franchise.ftc.go.kr 에서 직접 다운로드
        → parse-ftc-pdf.mjs로 파싱 → --upload로 Supabase 업로드

[2순위] FTC OPEN API → 857개 소규모 브랜드 (이미 완료, Supabase 저장 완료)

[3순위] FTC 웹 스크래핑 → CAPTCHA 해제 후 재시도 (우선순위 낮음)
```

---

## 8. 다음 세션에서 할 일 (우선순위순)

### 즉시 실행 가능 (코드 변경)
1. **삼겹살→한식 이름 변경** — `businessTypes.ts:14` name 수정 (데이터 조정 여부 결정 후)
2. **Phase A 버그 수정** — A-3 슬라이더 바, A-4 재료비 라벨 (각 1줄 수정)
3. **P&L 프랜차이즈 수수료 구현** — `pnl-franchise-fees.md` 설계대로 7단계 순차

### 사용자 액션 필요
4. **PDF 다운로드** — `brand-selection.md` 브랜드 리스트대로 FTC 사이트에서 다운로드
5. **Supabase 스키마** — `franchise_costs`에 `royalty_rate`, `advertising_rate` 컬럼 추가

### 중장기
6. **2차 리디자인 Phase B~F** — 가이드라인 시스템, 화면 분리, 테스트
7. **스터디카페 업종 추가** — P&L 모델 적합성 검토 후 (무인/시간제 구조)
8. **재료비 데이터 검증** — input-guidelines.md 리서치 기반으로 businessTypes.ts 값 갱신

---

## 9. 빌드/테스트 명령어

```bash
cd "C:/Users/wows2/Project Business/app"
npm test              # 52/52 테스트 (vitest)
npm run build         # tsc -b && vite build
npm run dev           # localhost:5173
npx tsc --noEmit      # 타입 체크만
```

---

## 10. 알려진 이슈

| 이슈 | 영향도 | 비고 |
|------|--------|------|
| Recharts 번들 크기 경고 | 낮음 | Vite 빌드 시 chunk warning (정상) |
| `.bashrc` line 1 BOM 경고 | 없음 | Windows shell init 이슈 |
| costItems 89개 미활용 | 낮음 | 표시용만, 계산에 사용 안 됨 |
| deposit_per_sqm 미사용 | 낮음 | rentGuide에 있으나 계산 미반영 |
| 라우터 부재 | 중간 | useState로 페이지 관리, 뒤로가기 불가 |
