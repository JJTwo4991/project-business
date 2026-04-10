import styles from './CoverPage.module.css';

interface CoverPageProps {
  onStart: () => void;
}

export function CoverPage({ onStart }: CoverPageProps) {
  return (
    <div className={styles.cover}>
      <div className={styles.paper}>
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
