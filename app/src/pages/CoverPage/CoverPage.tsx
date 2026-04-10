import styles from './CoverPage.module.css';

interface CoverPageProps {
  onStart: () => void;
}

export function CoverPage({ onStart }: CoverPageProps) {
  return (
    <div className={styles.cover}>
      <div className={styles.paper}>
        <div className={styles.header}>
          <h1 className={styles.title}>사장 될 결심</h1>
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
