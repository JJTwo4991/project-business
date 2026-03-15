import styles from './WizardSteps.module.css';
import type { BusinessType } from '../../types';
import { getIndustryIcon } from '../../assets/icons';
import { formatKRWShort } from '../../lib/format';
import { RecentSimulations } from '../../components/RecentSimulations/RecentSimulations';
import type { SavedSimulation } from '../../hooks/useRecentSimulations';

const INDUSTRY_TAGLINES: Record<number, string> = {
  1: '치킨! 싫어하는 사람은 없는 거 아시죠?',
  2: '한 잔의 커피가 만드는 일상 속 행복',
  3: '24시간 돌아가는 동네 필수 인프라',
  4: '손끝에서 시작되는 변신의 마법',
  5: '떡볶이·김밥, 누구나 사랑하는 국민 간식',
  6: '따뜻한 밥 한 끼의 힘, 한식의 저력',
  7: '깔끔한 옷이 주는 자신감, 세탁의 가치',
  8: '도우 위에 펼쳐지는 맛의 조합',
  9: '갓 구운 빵 냄새, 그 유혹을 이길 수 있나요?',
  11: '작은 손톱 위에 피어나는 나만의 개성',
  13: '바쁜 현대인의 식탁을 책임지는 든든한 한 끼',
  14: '무인으로 돌아가는 달콤한 수익 모델',
  15: '하루의 끝, 한 잔의 위로가 되는 공간',
  16: '사장 없이도 커피는 내려집니다',
};

interface Props {
  businessTypes: BusinessType[];
  onSelect: (bt: BusinessType) => void;
  recentSimulations?: SavedSimulation[];
  onRestoreSimulation?: (item: SavedSimulation) => void;
  onRemoveSimulation?: (id: string) => void;
}

export function IndustrySelectStep({ businessTypes, onSelect, recentSimulations, onRestoreSimulation, onRemoveSimulation }: Props) {
  return (
    <div className={styles.step}>
      {recentSimulations && recentSimulations.length > 0 && onRestoreSimulation && onRemoveSimulation && (
        <RecentSimulations
          items={recentSimulations}
          onSelect={onRestoreSimulation}
          onRemove={onRemoveSimulation}
        />
      )}
      <h2 className={styles.stepTitle}>어떤 업종을 알아볼까요?</h2>
      <p className={styles.stepDesc}>업종을 선택하면 수익성을 분석해드려요</p>
      <div className={styles.grid}>
        {businessTypes.map(bt => (
          <button key={bt.id} className={styles.card} onClick={() => onSelect(bt)}>
            <span style={{ fontSize: '34px', lineHeight: 1, flexShrink: 0 }} aria-hidden="true">
              {getIndustryIcon(bt.id, bt.category)}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
              <span className={styles.cardName}>{bt.name}</span>
              <span className={styles.cardDetail}>
                {INDUSTRY_TAGLINES[bt.id] ?? ''}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '2px' }}>
                평균 창업비용 (추정) {formatKRWShort(bt.initial_investment_small ?? bt.initial_investment_min)} ~ {formatKRWShort(bt.initial_investment_large ?? bt.initial_investment_max)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
