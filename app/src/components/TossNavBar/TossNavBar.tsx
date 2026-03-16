import styles from './TossNavBar.module.css';

interface Props {
  onHome?: () => void;
}

export function TossNavBar({ onHome }: Props) {
  return (
    <nav className={styles.navbar}>
      <span className={styles.title}>사장 될 결심</span>
      <button className={styles.homeBtn} onClick={onHome} aria-label="처음으로">
        💰 처음으로
      </button>
    </nav>
  );
}
