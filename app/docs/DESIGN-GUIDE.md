# 디자인 작업 가이드 (초보자용)

> 현재 앱 상태를 정리하고, 앞으로 디자인을 어떻게 진행하면 좋을지 안내합니다.

---

## 1. 현재 내 앱의 디자인 설정 상태

### 1.1 스타일링 방식: CSS Modules

현재 앱은 **CSS Modules**을 사용합니다. 이것은:
- 각 컴포넌트마다 `.module.css` 파일이 있음
- 클래스명이 자동으로 고유해져서 충돌이 없음
- 별도의 라이브러리 설치 없이 Vite가 기본 지원

```
BusinessTypeCard/
  BusinessTypeCard.tsx          ← React 컴포넌트
  BusinessTypeCard.module.css   ← 이 컴포넌트 전용 CSS
```

**평가:** CSS Modules은 좋은 선택입니다. Tailwind나 styled-components로 바꿀 필요 없습니다.

### 1.2 디자인 토큰: 직접 만든 CSS 변수

`src/index.css`에 색상, 폰트, 간격 등을 CSS 변수로 정의해둠:
- `--color-primary: #3182f6` (토스 블루)
- `--color-bg: #f2f4f6` (밝은 회색 배경)
- 폰트: "Toss Product Sans" → 토스 앱 안에서만 제대로 보임

**평가:** 토스 색상/폰트를 잘 따라했지만, 이것은 "진짜 TDS"가 아니라 직접 만든 모방입니다.

### 1.3 TDS (Toss Design System)란?

**TDS = 토스 디자인 시스템.** 토스 앱 안에서 동작하는 미니앱들이 일관된 디자인을 갖도록 토스가 제공하는 **React 컴포넌트 라이브러리**입니다.

| 내가 지금 하는 것 | TDS가 하는 것 |
|---|---|
| CSS로 버튼 직접 디자인 | `<Button>` 컴포넌트 import |
| CSS 변수로 색상 정의 | 토스 색상이 자동 적용 |
| 탭바를 직접 HTML로 구현 | `<Tab>` 컴포넌트 사용 |
| 네비게이션바 직접 구현 | `<Navigation>` 컴포넌트 사용 |

**TDS 핵심 컴포넌트 11개:**
Badge, Border, BottomCTA, Button, Asset, ListRow, ListHeader, Navigation, Paragraph, Tab, Top

**⚠️ 중요:** 앱인토스에 출시하려면 TDS 사용이 **필수**입니다. 검수 기준에 포함됩니다.

### 1.4 Storybook 현황

Storybook이 설치되어 있지만:
- 앱의 실제 컴포넌트에 대한 story가 없음 (기본 보일러플레이트만 있음)
- `index.css`의 디자인 토큰이 Storybook에 로드되지 않아, Storybook에서 컴포넌트가 깨져 보임

---

## 2. Figma란? React와의 관계

### 2.1 Figma = 디자인 도구 (코드와 별개)

```
Figma (디자인)          React (개발)
┌─────────────┐        ┌─────────────┐
│ 화면을 그림  │  ──→   │ 코드로 구현  │
│ 색상, 레이아웃│        │ HTML/CSS/JS │
│ 프로토타입   │        │ 실제 동작    │
└─────────────┘        └─────────────┘
     시각 작업              코드 작업
```

- Figma는 포토샵/일러스트레이터 같은 **그래픽 도구**
- React는 **프로그래밍 프레임워크**
- 완전히 다른 프로그램이지만, 디자이너가 Figma로 그린 것을 개발자가 React로 구현

### 2.2 혼자 개발하는 사람에게 Figma가 필요한가?

**결론: 지금 단계에서는 불필요합니다.**

Figma가 유용한 경우:
- 디자이너와 협업할 때
- 복잡한 UI를 미리 설계하고 싶을 때
- 클라이언트에게 시안을 보여줄 때

혼자 개발할 때의 대안:
- **코드에서 직접 수정** (지금 하고 있는 방식)
- **Storybook**으로 컴포넌트를 하나씩 확인하며 조정
- **브라우저 개발자 도구(F12)**로 실시간 CSS 수정 후 코드에 반영

---

## 3. 추천 작업 순서 (가장 편한 방식)

### Phase 1: Storybook 정비 (지금 바로 가능)

Storybook은 이미 설치되어 있으니, 이것부터 활용합니다.

**왜?** 앱 전체를 실행하지 않고도 개별 컴포넌트의 디자인을 확인/수정할 수 있음.

1. `.storybook/preview.ts`에 `import '../src/index.css';` 추가 → 디자인 토큰 로딩
2. 기본 보일러플레이트(`src/stories/`) 삭제
3. 각 컴포넌트에 `.stories.tsx` 파일 작성 (BusinessTypeCard, SliderInput 등)
4. `npm run storybook`으로 확인

### Phase 2: 디자인 다듬기 (CSS만으로)

TDS 전환 전에, 지금의 CSS Modules로 디자인을 다듬습니다.

1. 하드코딩된 색상을 CSS 변수로 통일 (`#eff6ff` 같은 값들)
2. 반응형(375px~430px) 테스트 — Chrome DevTools > Device Toolbar
3. 터치 영역 최소 44px 확보 (모바일 UX 기본)
4. 로딩 상태, 에러 상태의 디자인 일관성 확인

### Phase 3: TDS 전환 (앱인토스 출시 준비 시)

토스 미니앱으로 출시할 때 진행합니다.

1. 패키지 설치:
   ```bash
   npm install @apps-in-toss/web-framework @toss/tds-mobile
   ```
2. `granite.config.ts` 생성 (앱 이름, 브랜드 색상, 빌드 설정)
3. TDS 컴포넌트로 교체:
   - 직접 만든 탭바 → `<Tab>`
   - 직접 만든 버튼 → `<Button>` / `<BottomCTA>`
   - 직접 만든 리스트 → `<ListRow>` / `<ListHeader>`
   - 직접 만든 네비게이션 → `<Navigation>` / `<Top>`
4. TDS 컴포넌트 문서: [tossmini-docs.toss.im/tds-mobile](https://tossmini-docs.toss.im/tds-mobile/)
5. 예제 코드: [github.com/toss/apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples)

---

## 4. 참고 자료

| 자료 | URL | 용도 |
|---|---|---|
| 앱인토스 개발자센터 | [developers-apps-in-toss.toss.im](https://developers-apps-in-toss.toss.im/) | 전체 가이드 |
| TDS 컴포넌트 문서 | [tossmini-docs.toss.im/tds-mobile](https://tossmini-docs.toss.im/tds-mobile/) | 컴포넌트 사용법 |
| TDS 컴포넌트 목록 | [developers-apps-in-toss.toss.im/design/components.html](https://developers-apps-in-toss.toss.im/design/components.html) | 11개 핵심 컴포넌트 |
| WebView 설정 가이드 | [developers-apps-in-toss.toss.im/tutorials/webview.html](https://developers-apps-in-toss.toss.im/tutorials/webview.html) | granite.config.ts 설정 |
| 예제 프로젝트 | [github.com/toss/apps-in-toss-examples](https://github.com/toss/apps-in-toss-examples) | React/Vue/jQuery 예제 |
| Figma (참고만) | [figma.com](https://www.figma.com) | 디자인 도구 (선택사항) |
