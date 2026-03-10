import styles from './GuidelineBox.module.css';
import type { Guideline } from '../../data/guidelines';

interface Props {
  guideline: Guideline | null;
}

export function GuidelineBox({ guideline }: Props) {
  if (!guideline) return null;

  return (
    <div className={styles.box}>
      <p className={styles.text}>{guideline.text}</p>
      <p className={styles.source}>{guideline.source}</p>
    </div>
  );
}
