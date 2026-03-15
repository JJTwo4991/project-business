import styles from './WizardSteps.module.css';
import { RegionSelector } from '../../components/RegionSelector/RegionSelector';
import type { RentGuide, BusinessScale } from '../../types';
import { getScaleSqm } from '../../lib/scale';

interface Props {
  sidos: string[];
  getRegions: (sido: string) => string[];
  getSangkwons: (sido: string, region: string) => string[];
  getRent: (sido: string, sangkwon: string) => RentGuide | undefined;
  scale: BusinessScale;
  businessTypeId: number;
  onSelect: (rent: { sido: string; sangkwon: string; rent_per_sqm: number; monthly: number }) => void;
  onNext: () => void;
}

export function RegionStep({ sidos, getRegions, getSangkwons, getRent, scale, businessTypeId, onSelect, onNext }: Props) {
  return (
    <div className={styles.step}>
      <h2 className={styles.stepTitle}>지역을 선택하세요</h2>
      <p className={styles.stepDesc}>상권별 임대료 가이던스를 제공해요</p>
      <RegionSelector
        sidos={sidos}
        getRegions={getRegions}
        getSangkwons={getSangkwons}
        getRent={getRent}
        scaleSqm={getScaleSqm(scale, businessTypeId)}
        onSelect={onSelect}
      />
      <button className={styles.nextBtn} onClick={onNext}>다음</button>
    </div>
  );
}
