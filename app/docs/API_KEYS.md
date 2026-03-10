# API Keys Registry

> 이 파일은 프로젝트에서 사용하는 모든 외부 API 키를 관리합니다.
> **절대 git에 커밋하지 마세요.** .gitignore에 등록되어야 합니다.

## 1. Supabase (프로젝트 DB)

| 항목 | 값 |
|------|-----|
| Project Ref | `nkxsqbankhmcjimvluac` |
| URL | `https://nkxsqbankhmcjimvluac.supabase.co` |
| Anon Key | `.env.local`에 저장 (VITE_SUPABASE_ANON_KEY) |
| Service Role Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5reHNxYmFua2htY2ppbXZsdWFjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjYxMjgxMCwiZXhwIjoyMDg4MTg4ODEwfQ.NguMOSfMQuYKei0A7AkbQcUkN3SC2Z7gbk_pKMtUNkk` |
| PAT (Management API) | `sbp_93166d2b39ecd0c88a2a9fbdf3f547d11c722d9d` |
| 용도 | 앱 데이터 저장, 테이블 관리 |

## 2. 한국부동산원 R-ONE (임대료)

| 항목 | 값 |
|------|-----|
| API Key | `4ae1a88ba8d142b983056f5b8309d13d` |
| Base URL | `https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do` |
| 용도 | 소규모상가 임대료 (시도별 ㎡당 월세) |

## 3. data.go.kr (공공데이터포털 - FTC 통계)

| 항목 | 값 |
|------|-----|
| Service Key | `886160fc71169712064570ecdca464fd32637299d6feac565b512e70d21639ce` |
| 용도 | FTC 업종별 창업비용 통계, 지역별 매출액 통계, 브랜드별 가맹점 현황 |
| APIs | `getSclaIndutyFntnOutStats`, `getAreaIndutyAvrOutStats`, `getBrandFrcsStats` |

## 4. franchise.ftc.go.kr (공정위 정보공개서)

| 항목 | 값 |
|------|-----|
| Service Key | `m5bPeQQaoknXWhwTEKQAepmx4iCV%2FT4gpIB4SA%2F4` |
| Base URL | `https://franchise.ftc.go.kr/api/search.do` |
| 용도 | **프랜차이즈 정보공개서 본문** - 가맹비, 교육비, 보증금, 인테리어, 기타비용 등 실제 창업비용 |
| APIs | `type=list` (목록), `type=title` (목차), `type=content` (본문) |
| 비고 | **창업비용 데이터의 제1원칙 출처** |

## 사용 원칙

1. **data.go.kr 키**와 **franchise.ftc.go.kr 키**는 완전히 다른 시스템의 키임
2. data.go.kr = FTC 통계 데이터 (업종별 평균, 지역별 매출)
3. franchise.ftc.go.kr = FTC 정보공개서 원본 (브랜드별 상세 창업비용)
4. 창업비용은 반드시 정보공개서(#4)를 제1원칙 출처로 사용
