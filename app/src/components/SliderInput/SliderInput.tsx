import { useState, useRef, useEffect } from 'react';
import styles from './SliderInput.module.css';

interface Props {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  disabled?: boolean;
  referenceValue?: number;
}

export function SliderInput({ label, value, min: minProp, max: maxProp, step, format, onChange, disabled, referenceValue }: Props) {
  const [editing, setEditing] = useState(false);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Dynamic range from referenceValue when min/max not explicitly provided
  const min = minProp !== undefined ? minProp : (referenceValue !== undefined ? Math.min(0, Math.floor(referenceValue / 10)) : 0);
  const max = maxProp !== undefined ? maxProp : (referenceValue !== undefined ? referenceValue * 5 : 100);

  const isOverflow = value > max;
  const sliderValue = isOverflow ? max : value;
  const percent = max === min ? 0 : Math.min(100, Math.max(0, ((sliderValue - min) / (max - min)) * 100));

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function startEditing() {
    if (disabled) return;
    setInputText(String(value));
    setEditing(true);
  }

  function commitEdit() {
    const parsed = Number(inputText.replace(/,/g, ''));
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            className={styles.valueInput}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span
            className={`${styles.value} ${isOverflow ? styles.valueOverflow : ''} ${disabled ? '' : styles.valueClickable}`}
            onClick={startEditing}
            title={disabled ? undefined : '클릭하여 직접 입력'}
          >
            {format(value)}
            {isOverflow && <span className={styles.overflowIcon} aria-label="슬라이더 범위 초과">↑</span>}
          </span>
        )}
      </div>
      <div className={styles.track}>
        <input
          type="range"
          className={styles.slider}
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          disabled={disabled}
          style={{ '--fill-percent': `${percent}%`, opacity: disabled ? 0.4 : 1 } as React.CSSProperties}
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
