import styles from './StepIndicator.module.css';
import shibaCheering from '../../assets/shiba/shiba_cheering.png';
import shibaRunning from '../../assets/shiba/shiba_running.png';
import shibaWorking from '../../assets/shiba/shiba_working.png';

interface Props {
  progress: number; // 0 to 1
  label?: string;
  currentStepNum?: number;
  totalStepNum?: number;
}

const ENCOURAGEMENTS: { threshold: number; text: string; img: string }[] = [
  { threshold: 0.15, text: '어떤 사장님이 될지 궁금해요!', img: shibaCheering },
  { threshold: 0.35, text: '좋아요, 순조롭게 진행 중!', img: shibaRunning },
  { threshold: 0.6,  text: '벌써 절반이나 왔어요!', img: shibaWorking },
  { threshold: 0.85, text: '거의 다 왔어요, 조금만 더!', img: shibaRunning },
  { threshold: 1.01, text: '마지막 한 걸음!', img: shibaCheering },
];

function getEncouragement(progress: number) {
  for (const e of ENCOURAGEMENTS) {
    if (progress <= e.threshold) return e;
  }
  return ENCOURAGEMENTS[ENCOURAGEMENTS.length - 1];
}

export function StepIndicator({ progress, label, currentStepNum, totalStepNum }: Props) {
  const percent = Math.round(progress * 100);
  const showSteps = currentStepNum != null && totalStepNum != null;
  const enc = getEncouragement(progress);

  return (
    <div className={styles.wrapper}>
      <div className={styles.topRow}>
        <div className={styles.mascotRow}>
          <img className={styles.mascotImg} src={enc.img} alt="사장시바" />
          <span className={styles.encouragement}>{enc.text}</span>
        </div>
        {showSteps && (
          <span className={styles.stepCount}>{currentStepNum}/{totalStepNum}</span>
        )}
      </div>
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
