import { useState, useRef, useEffect } from 'react';
import styles from './IndustryTransition.module.css';

interface Props {
  emoji: string;
  tagline: string;
  subMessage: string;
  buttonText: string;
  onComplete: () => void;
}

type Phase = 'emojiIn' | 'hold' | 'moveUp' | 'buttonWait' | 'buttonIn' | 'idle';

export function IndustryTransition({ emoji, tagline, subMessage, buttonText, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('emojiIn');
  const msgRef = useRef<HTMLParagraphElement>(null);

  // Auto-shrink font if tagline overflows
  useEffect(() => {
    const el = msgRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      const ratio = el.clientWidth / el.scrollWidth;
      el.style.fontSize = Math.max(14, Math.floor(22 * ratio)) + 'px';
    }
  }, [tagline, phase]);

  function handleEmojiInEnd() {
    setPhase('hold');
    setTimeout(() => setPhase('moveUp'), 800);
  }

  function handleTextInEnd() {
    setPhase('buttonWait');
    setTimeout(() => setPhase('buttonIn'), 1000);
  }

  const showText = phase === 'moveUp' || phase === 'buttonWait' || phase === 'buttonIn' || phase === 'idle';
  const showButton = phase === 'buttonIn' || phase === 'idle';
  const movedUp = phase !== 'emojiIn' && phase !== 'hold';

  return (
    <div className={styles.screen}>
      <span
        className={`${styles.emoji} ${movedUp ? styles.emojiUp : ''} ${phase === 'emojiIn' ? styles.fadeIn : ''}`}
        onAnimationEnd={phase === 'emojiIn' ? handleEmojiInEnd : undefined}
      >
        {emoji}
      </span>

      {showText && (
        <div
          className={`${styles.textBlock} ${styles.slideUpSoft}`}
          onAnimationEnd={phase === 'moveUp' ? handleTextInEnd : undefined}
        >
          <p className={styles.message} ref={msgRef}>{tagline}</p>
          <p className={styles.subMessage}>{subMessage}</p>
        </div>
      )}

      {showButton && (
        <div
          className={`${styles.buttonWrap} ${styles.slideUpSoft}`}
          onAnimationEnd={phase === 'buttonIn' ? () => setPhase('idle') : undefined}
        >
          <button className={styles.button} onClick={onComplete} type="button">
            {buttonText}
          </button>
        </div>
      )}
    </div>
  );
}
