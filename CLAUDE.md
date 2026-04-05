# Project Rules - 자영업 수익 시뮬레이터

## 제1원칙: 데이터 신뢰성

- **출처 없는 숫자를 공식 기관 데이터인 것처럼 표기하지 않는다**
- data_sources에 "통계청", "공정거래위원회" 등을 적으려면 해당 기관의 구체적 자료명과 시기를 명시해야 한다
- 정확한 출처가 없는 값은 "업종 평균 추정치 (공식 출처 미확인)"으로 표기한다
- 추정이 어려운 값은 사용자에게 직접 입력하도록 안내한다. 말도 안 되는 기본값을 넣지 않는다
- 프랜차이즈 정보공개서에서 확인 가능한 값은 "공정거래위원회 가맹사업정보공개서 {연도}년"으로 표기한다
- 값을 변경할 때는 반드시 출처와 시기를 함께 기록한다

## 개발 규칙

- 빌드: `cd app && npm run build`
- 테스트: `cd app && npm test`
- 커밋/푸시: 사용자가 요청할 때만 한다

## 앱인토스 SDK 문서 조회 (필수)

앱인토스 관련 기능을 개발하기 전에 **반드시** ax CLI로 공식 문서를 검색한다.
추측으로 API를 사용하지 않고, 문서에서 확인한 시그니처와 예제를 기반으로 구현한다.

```bash
# 문서 검색 (docs: 개발문서, tds-rn: TDS React Native, tds-web: TDS Web)
/tmp/apps-in-toss/ax/v0.5.1/ax.exe search docs --query "검색어" --limit 5

# 검색 결과 id로 전문 조회
/tmp/apps-in-toss/ax/v0.5.1/ax.exe get doc --id "문서id"

# 예제 목록
/tmp/apps-in-toss/ax/v0.5.1/ax.exe list examples
```

- 바이너리 없으면 재다운로드: `curl -fsSL -o /tmp/ax_windows.tar.gz "https://github.com/toss/apps-in-toss-ax/releases/download/v0.5.1/ax_windows_amd64.tar.gz" && mkdir -p /tmp/apps-in-toss/ax/v0.5.1 && tar -xzf /tmp/ax_windows.tar.gz -C /tmp/apps-in-toss/ax/v0.5.1/`
- 예제 코드: `C:/Users/wows2/Project_Dessert/apps-in-toss-examples/`
- 적용 대상: 공유, 리워드, 광고, 결제, 네비게이션, 이벤트 등 모든 네이티브 SDK 기능

## 캐릭터 일러스트 생성 가이드 (필수)

앱 내 시바견 캐릭터 일러스트를 새로 생성할 때는 일관성 유지를 위해 반드시 아래 가이드를 따릅니다.

1. **마스터 레퍼런스 이미지 사용**: `assets/character_guide/master_shiba_reference.png` 이미지를 반드시 AI의 Reference Image로 설정하여 스타일과 비율을 고정합니다.
2. **고정 프롬프트 템플릿 사용**: `assets/character_guide/prompt_template.md` 파일에 정의된 Base Prompt를 그대로 복사하여 사용하고, 그 뒤에 필요한 동작이나 상황만 추가합니다.
3. **핵심 규칙**: 투명 배경(transparent background), 텍스트 절대 금지(ABSOLUTELY NO TEXT), 특정 업종 소품 금지(범용적 비즈니스 메타포만 사용).
