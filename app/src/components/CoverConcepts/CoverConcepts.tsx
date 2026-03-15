import styles from './CoverConcepts.module.css';
import { Icon } from '../Icon/Icon';
import { UI_ICONS, SCALE_ICONS, INDUSTRY_ICONS } from '../../assets/icons';

interface CoverProps {
  onStart: () => void;
}

// 1-A: 미니멀 & 프로페셔널 (제목만)
export function Cover1A({ onStart }: CoverProps) {
  return (
    <div className={`${styles.cover} ${styles.cover1A}`}>
      <div className={styles.content}>
        <div className={styles.iconWrap1A}>
          <Icon src={SCALE_ICONS.large} size={100} />
        </div>
        <h1 className={styles.title1A}>사장 될 결심</h1>
      </div>
      <button className={styles.btn1A} onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}

// 1-B: 직관적 & 분석적 (제목만)
export function Cover1B({ onStart }: CoverProps) {
  return (
    <div className={`${styles.cover} ${styles.cover1B}`}>
      <div className={styles.content}>
        <h1 className={styles.title1B}>사장 될 결심</h1>
        <div className={styles.graphMock}>
          <div className={styles.bar1}></div>
          <div className={styles.bar2}></div>
          <div className={styles.bar3}></div>
        </div>
      </div>
      <button className={styles.btn1B} onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}

// 2-A: 대화형 & 공감 (제목만)
export function Cover2A({ onStart }: CoverProps) {
  return (
    <div className={`${styles.cover} ${styles.cover2A}`}>
      <div className={styles.content}>
        <div className={styles.iconWrap2A}>
          <Icon src={INDUSTRY_ICONS[2]} size={100} /> {/* 커피 아이콘 */}
        </div>
        <h1 className={styles.title2A}>사장 될 결심</h1>
      </div>
      <button className={styles.btn2A} onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}

// 2-B: 감성 & 응원 (제목만)
export function Cover2B({ onStart }: CoverProps) {
  return (
    <div className={`${styles.cover} ${styles.cover2B}`}>
      <div className={styles.content}>
        <div className={styles.floatingIcons}>
          <Icon src={UI_ICONS.clap} size={100} className={styles.float1} />
        </div>
        <h1 className={styles.title2B}>사장 될 결심</h1>
      </div>
      <button className={styles.btn2B} onClick={onStart}>
        시작하기
      </button>
    </div>
  );
}
