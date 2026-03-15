import styles from './TossNavBar.module.css';

interface Props {
  onHome?: () => void;
}

export function TossNavBar({ onHome }: Props) {
  return (
    <nav className={styles.navbar}>
      <button className={styles.logo} onClick={onHome} aria-label="홈으로">
        💰
      </button>
      <span className={styles.title}>사장 될 결심</span>
    </nav>
  );
}
