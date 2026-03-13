# TossTransition Pattern

A full-screen sequential reveal component that mimics Toss app transition screens.
Used to punctuate major wizard steps with a celebratory or informative interstitial.

---

## Component API

```typescript
import { TossTransition } from '../components/TossTransition/TossTransition';

interface TossTransitionProps {
  emoji: string;        // Large centered emoji (64px)
  message: string;      // Bold headline, max 280px wide, centered
  buttonText: string;   // CTA label on the primary button
  onComplete: () => void; // Called when user taps the button
  subMessage?: string;  // Optional secondary text below message
}
```

---

## Animation Sequence

All sequencing is driven by CSS `animationEnd` events — no `setTimeout` for frame logic.

| Step | Duration | What happens |
|------|----------|--------------|
| 1 — `emojiIn` | 400ms | Emoji scales up from 0.8 → 1.0 and fades in |
| 2 — hold | 500ms | `setTimeout` holds emoji visible (only timer in the component) |
| 3 — `emojiOut` | 250ms | Emoji scales down to 0.9 and fades out |
| 4 — `slideUp` (text) | 450ms | Message (+ optional subMessage) slides up 20px and fades in |
| 5 — `buttonIn` | 400ms + 80ms delay | Button slides up 20px and fades in |
| 6 — `idle` | — | All animations done; button is interactive |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like, consistent with Toss design language)
Emoji-out uses `cubic-bezier(0.4, 0, 1, 1)` (ease-in, feels like it's "leaving")

---

## CSS Animation Approach

Uses CSS `@keyframes` for all motion. React state (`Phase`) drives which class is applied;
`onAnimationEnd` handlers advance the phase.

```
Phase enum: 'emojiIn' → 'emojiOut' → 'textIn' → 'buttonIn' → 'idle'
```

- `emojiIn` / `emojiOut` — the emoji element is mounted only during these two phases, unmounted after
- `slideUp` — applied once on mount of the text block
- `buttonIn` — applied once on mount of the button wrapper, with an 80ms delay

All animated elements use `will-change: transform, opacity` for GPU compositing.

---

## Usage Examples

### Between wizard steps (congratulation screen)

```tsx
<TossTransition
  emoji="👏"
  message="수고하셨어요! 이제 장사가 얼마나 잘 될지 예상해볼까요?"
  buttonText="준비됐어요"
  onComplete={() => goToStep('result')}
/>
```

### Before result page (suspense build-up)

```tsx
<TossTransition
  emoji="📊"
  message="예상 수익을 계산하고 있어요"
  subMessage="입력하신 정보를 바탕으로 월별 손익을 분석했어요."
  buttonText="결과 보기"
  onComplete={() => setShowResult(true)}
/>
```

### After franchise selection

```tsx
<TossTransition
  emoji="🏪"
  message="좋은 선택이에요!"
  subMessage="브랜드 평균 창업비용과 로열티를 반영했어요."
  buttonText="다음으로"
  onComplete={handleNext}
/>
```

---

## Design Tokens Used

All values reference the global CSS variables from `src/index.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#3182F6` | Button background |
| `--color-primary-dark` | `#1B64DA` | Button active state |
| `--color-surface` | `#FFFFFF` | Screen background |
| `--color-text` | `#191F28` | Message text |
| `--color-text-secondary` | `#8B95A1` | Sub-message text |
| `--radius-md` | `12px` | Button border-radius |
| `--font-family` | Pretendard Variable | Inherited from body |

---

## Accessibility

- Emoji is wrapped in `<span aria-hidden="true">` — decorative, not read by screen readers
- Button uses `type="button"` to prevent accidental form submission
- `-webkit-tap-highlight-color: transparent` removes the default mobile tap flash
- Button has `:active` state for tactile feedback on touch devices
- `word-break: keep-all` keeps Korean text from breaking mid-word

---

## File Locations

- Component: `src/components/TossTransition/TossTransition.tsx`
- Styles: `src/components/TossTransition/TossTransition.module.css`
