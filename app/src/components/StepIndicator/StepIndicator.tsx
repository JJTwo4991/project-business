import styles from './StepIndicator.module.css';

interface Props {
  progress: number; // 0 to 1
  label?: string;
}

export function StepIndicator({ progress, label }: Props) {
  const percent = Math.round(progress * 100);

  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
