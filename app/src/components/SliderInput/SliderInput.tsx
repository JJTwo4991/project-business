import styles from './SliderInput.module.css';

interface Props {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}

export function SliderInput({ label, value, min, max, step, format, onChange }: Props) {
  const percent = max === min ? 0 : Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{format(value)}</span>
      </div>
      <div className={styles.track}>
        <input
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={step}
          value={value}
          style={{ '--fill-percent': `${percent}%` } as React.CSSProperties}
          onChange={e => onChange(Number(e.target.value))}
          aria-label={label}
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>
      <div className={styles.ticks}>
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}
