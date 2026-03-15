import { useState, useRef } from 'react';
import styles from './TossTransition.module.css';

export interface TossTransitionProps {
  emoji?: string;
  iconSrc?: string;
  message: string;
  buttonText: string;
  onComplete: () => void;
  subMessage?: string;
}

type Phase = 'emojiIn' | 'hold' | 'moveUp' | 'buttonWait' | 'buttonIn' | 'idle';

export function TossTransition({
  emoji,
  iconSrc,
  message,
  buttonText,
  onComplete,
  subMessage,
}: TossTransitionProps) {
  const [phase, setPhase] = useState<Phase>('emojiIn');
  const btnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEmojiInEnd() {
    setPhase('hold');
    setTimeout(() => setPhase('moveUp'), 800);
  }

  function handleTextInEnd() {
    setPhase('buttonWait');
    btnTimer.current = setTimeout(() => setPhase('buttonIn'), 1000);
  }

  const showText = phase === 'moveUp' || phase === 'buttonWait' || phase === 'buttonIn' || phase === 'idle';
  const showButton = phase === 'buttonIn' || phase === 'idle';
  const movedUp = phase !== 'emojiIn' && phase !== 'hold';

  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <span
          className={`${styles.emoji} ${movedUp ? styles.emojiUp : ''} ${phase === 'emojiIn' ? styles.fadeIn : ''}`}
          onAnimationEnd={phase === 'emojiIn' ? handleEmojiInEnd : undefined}
          aria-hidden="true"
        >
          {iconSrc ? (
            <img src={iconSrc} alt="" width={64} height={64} draggable={false} />
          ) : (
            emoji
          )}
        </span>

        {showText && (
          <div
            className={`${styles.textBlock} ${styles.slideUpSoft}`}
            onAnimationEnd={phase === 'moveUp' ? handleTextInEnd : undefined}
          >
            <p className={styles.message}>{message}</p>
            {subMessage && (
              <p className={styles.subMessage}>{subMessage}</p>
            )}
          </div>
        )}
      </div>

      {showButton && (
        <div
          className={`${styles.buttonWrap} ${styles.slideUpSoft}`}
          onAnimationEnd={phase === 'buttonIn' ? () => setPhase('idle') : undefined}
        >
          <button
            className={styles.button}
            onClick={onComplete}
            type="button"
          >
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
