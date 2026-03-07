import { useState } from 'react';
import styles from './RegionSelector.module.css';
import type { RentGuide } from '../../types';
import { formatKRWShort } from '../../lib/format';

interface Props {
  sidos: string[];
  getSigungus: (sido: string) => string[];
  getRent: (sido: string, sigungu: string) => RentGuide | undefined;
  scaleSqm: number;
  onSelect: (rent: { sido: string; sigungu: string; rent_per_sqm: number; monthly: number }) => void;
}

export function RegionSelector({ sidos, getSigungus, getRent, scaleSqm, onSelect }: Props) {
  const [sido, setSido] = useState('');
  const [sigungu, setSigungu] = useState('');

  const sigungus = sido ? getSigungus(sido) : [];
  const rentInfo = sido && sigungu ? getRent(sido, sigungu) : undefined;
  const monthlyRent = rentInfo ? Math.round(rentInfo.rent_per_sqm * scaleSqm) : null;

  const handleSido = (v: string) => {
    setSido(v);
    setSigungu('');
  };

  const handleSigungu = (v: string) => {
    setSigungu(v);
    const info = getRent(sido, v);
    if (info) {
      const monthly = Math.round(info.rent_per_sqm * scaleSqm);
      onSelect({ sido, sigungu: v, rent_per_sqm: info.rent_per_sqm, monthly });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.selects}>
        <select className={styles.select} value={sido} onChange={e => handleSido(e.target.value)}>
          <option value="">시/도 선택</option>
          {sidos.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={styles.select} value={sigungu} onChange={e => handleSigungu(e.target.value)} disabled={!sido}>
          <option value="">시/군/구 선택</option>
          {sigungus.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {monthlyRent !== null && (
        <div className={styles.guide}>
          <span className={styles.guideLabel}>월 임대료 가이던스</span>
          <span className={styles.guideValue}>~{formatKRWShort(monthlyRent)}</span>
          <span className={styles.guideSub}>
            ({scaleSqm}㎡ 기준, {sigungu} 평균 {rentInfo?.rent_per_sqm.toLocaleString() ?? '?'}원/㎡)
          </span>
        </div>
      )}
    </div>
  );
}
