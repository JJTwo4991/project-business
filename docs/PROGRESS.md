# 프로젝트 진행상황 — 사장 될 결심 (자영업 수익 시뮬레이터)

> 최종 업데이트: 2026-03-15

## 프로젝트 개요

예비 자영업자가 14개 한국 업종의 월 손익, 투자회수기간, 사업체가치(DCF)를 시뮬레이션하는 토스 미니앱.

- **앱 이름**: 사장 될 결심 (appName: `be-the-boss`)
- **플랫폼**: 토스 앱인토스 WebView 미니앱
- **Tech**: Vite 7 + React 19 + TypeScript 5.9 + CSS Modules + Recharts 3
- **배포**: Vercel (https://project-business.vercel.app/) + 토스 콘솔 (.ait 번들)

## 앱인토스 연동 상태

| 항목 | 상태 |
|------|------|
| 토스 콘솔 앱 등록 | ✅ 완료 |
| @apps-in-toss/web-framework 2.0.5 | ✅ 설치됨 |
| @toss/tds-mobile | ✅ 설치됨 (--legacy-peer-deps) |
| granite.config.ts | ✅ 설정 완료 |
| .ait 빌드 | ✅ `npx ait build` → `be-the-boss.ait` |
| 샌드박스 테스트 | ✅ 업로드 완료 |
| TDS 컴포넌트 적용 | ❌ 미적용 (심사 필수) |
| 출시 심사 | ❌ 미제출 |

## 최근 변경사항 (2026-03-15)

### 앱인토스 설정
- `displayName: '사장 될 결심'`
- `navigationBar.withBackButton: true`
- TossNavBar: ⋮ 버튼 제거
- Android 뒤로가기: `history.pushState` + `popstate`로 이전 단계 이동

### P&L 계산 로직 개선
- **매출 계산**: 고정 영업일(26일) → 사용자 선택 영업일 × 영업일 평균 방문객
- **배달수수료**: 고정 금액 → 매출 연동 (치킨/분식/피자 10%, 카페 1%, 한식 3.3%)
- **기타비용률**: 외식 5% → 6%, 소매 4% → 6% (소상공인실태조사 2023 기준)
- **공과금 통합**: 별도 항목 제거 → 기타 영업비용(6%)에 포함
- **재료비율**: 기본값에 10% 가산 (소상공인 보수적 추정)
- **직원 수**: 소수점 표시 → 정수 표시

### PnL 화면 기능
- 기타 영업비용: 고정비 → 변동비 분류 변경
- **(+) 비용 추가하기**: 사용자가 직접 추가 비용 입력, 실시간 재계산

### 투자회수기간 차트
- 라벨 겹침 해소 → 범례로 분리 (낙관/기본/보수)
- X축 6개월 단위, 12개월 → "1년" 표시
- 툴팁 크기 축소

### 데이터 정리
- Supabase: `business_types`, `cost_items` → Supabase 우선 사용 (로컬 fallback)
- `api_rent_data`, `api_startup_costs`, `api_regional_sales` 관련 코드 삭제
- `useBenchmarkData` 훅 삭제
- `getRevenueGuideline` 삭제

## 데이터 출처 현황

### 검증된 출처
| 데이터 | 출처 | 비고 |
|--------|------|------|
| 외식업 비용 구조 (기타 7%) | 외식업체 경영실태조사 2024 (KREI) p.2 | 기타영업비용 6% 근거 |
| 소상공인 업종별 매출/비용 | 소상공인실태조사 2023 (중기부) p.89 | 기타 7.3% 교차 검증 |
| 프랜차이즈 비용 | 공정거래위원회 가맹사업정보공개서 2024년 | ftcBrands.ts |
| 세율 | 종합소득세 2025년 구간세율 | tax.ts |
| 배달앱 사용 현황 | 외식업체 경영실태조사 2024 p.2-3 | 업종별 사용률 + 평균비용 |

### 추정치 (공식 출처 미확인)
- 업종별 객단가, 일 방문객 수 → data_sources 필드에 "추정" 표기
- 업종별 원가율 → 외식업 전체 40.4% 기반 + 업종 특성 조정
- 배달수수료율 (치킨 10%, 카페 1%, 한식 3.3%) → 배달의민족·요기요 평균 기반 추정
- costItems 공과금 값 → 사용 안 함 (기타영업비용에 통합)

## 미완료 항목

### 필수 (출시 전)
- [ ] TDS (Toss Design System) 컴포넌트 적용 — 심사 필수
- [ ] 토스 출시 심사 제출

### 데이터 개선
- [ ] 업종별 공과금: 공식 출처 없음, 현재 기타영업비용에 통합
- [ ] businessTypes.ts data_sources를 UI에 노출 (현재 코드 주석에만 존재)
- [ ] franchiseData.ts SOURCE를 UI에 표시

### 기능 개선
- [ ] 삼겹살→한식: businessTypes.ts name 변경 + 데이터 재검토
- [ ] 무인아이스크림 원가율: 0.50 → 0.60~0.70 상향 (현재 10% 가산으로 0.55)
- [ ] 스터디카페 업종 추가 검토

## 빌드 & 테스트

```bash
cd "C:/Users/wows2/Project Business/app"
npm test        # unit tests
npm run build   # tsc -b && vite build
npm run dev     # localhost:5173
npx ait build   # → be-the-boss.ait (토스 콘솔 업로드용)
```

## 문서 구조

```
C:/Users/wows2/Project Business/
├── CLAUDE.md                          # 프로젝트 규칙
├── docs/
│   ├── PROGRESS.md                    # 이 파일
│   └── research/
│       └── government-data-summary.md # 정부 통계 자료 요약 (계산 근거)
└── app/                               # 앱 소스코드
```
