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

type Phase = 'emojiIn' | 'emojiOut' | 'textIn' | 'buttonIn' | 'idle';

export function TossTransition({
  emoji,
  iconSrc,
  message,
  buttonText,
  onComplete,
  subMessage,
}: TossTransitionProps) {
  const [phase, setPhase] = useState<Phase>('emojiIn');
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEmojiInEnd() {
    holdTimer.current = setTimeout(() => {
      setPhase('emojiOut');
    }, 500);
  }

  function handleEmojiOutEnd() {
    setPhase('textIn');
  }

  function handleTextInEnd() {
    setPhase('buttonIn');
  }

  const showEmoji = phase === 'emojiIn' || phase === 'emojiOut';
  const showText = phase === 'textIn' || phase === 'buttonIn' || phase === 'idle';
  const showButton = phase === 'buttonIn' || phase === 'idle';

  return (
    <div className={styles.screen}>
      <div className={styles.content}>

        {showEmoji && (
          <span
            className={
              phase === 'emojiIn'
                ? `${styles.emoji} ${styles.emojiIn}`
                : `${styles.emoji} ${styles.emojiOut}`
            }
            onAnimationEnd={
              phase === 'emojiIn' ? handleEmojiInEnd : handleEmojiOutEnd
            }
            aria-hidden="true"
          >
            {iconSrc ? (
              <img src={iconSrc} alt="" width={64} height={64} draggable={false} />
            ) : (
              emoji
            )}
          </span>
        )}

        {showText && (
          <div
            className={`${styles.textBlock} ${styles.slideUp}`}
            onAnimationEnd={phase === 'textIn' ? handleTextInEnd : undefined}
          >
            <p className={styles.message}>{message}</p>
            {subMessage && (
              <p className={styles.subMessage}>{subMessage}</p>
            )}
          </div>
        )}

        {showButton && (
          <div
            className={`${styles.buttonWrap} ${styles.buttonIn}`}
            onAnimationEnd={
              phase === 'buttonIn' ? () => setPhase('idle') : undefined
            }
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
    </div>
  );
}
