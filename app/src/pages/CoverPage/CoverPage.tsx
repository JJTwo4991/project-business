import styles from './CoverPage.module.css';

interface CoverPageProps {
  onStart: () => void;
}

export function CoverPage({ onStart }: CoverPageProps) {
  return (
    <div className={styles.cover}>
      <div className={styles.paper}>
        <svg
          className={`${styles.decor} ${styles.decorTopRight}`}
          width="52"
          height="52"
          viewBox="0 0 52 52"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M26 4 L29 20 L45 23 L29 26 L26 42 L23 26 L7 23 L23 20 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <svg
          className={`${styles.decor} ${styles.decorBottomLeft}`}
          width="44"
          height="44"
          viewBox="0 0 44 44"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 22 Q 14 6, 22 22 T 38 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M34 17 L38 22 L34 27"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>

        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <h1 className={styles.title}>사장 될 결심</h1>
            <svg
              className={styles.underline}
              viewBox="0 0 300 14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M4 8 Q 60 2, 120 7 T 240 6 T 296 9"
                stroke="#1a1a1a"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
            </svg>
          </div>
          <p className={styles.tagline}>
            14개 업종, <span className={styles.taglineStrong}>5분</span>이면<br />
            내가 사장이 됐을 때의 수익을 그려봐요
          </p>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.startBtn} onClick={onStart}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
