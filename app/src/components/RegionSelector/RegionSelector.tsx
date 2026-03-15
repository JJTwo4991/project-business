import { useState, useEffect } from 'react';
import styles from './RegionSelector.module.css';
import type { RentGuide } from '../../types';
import { formatKRWShort } from '../../lib/format';

interface Props {
  sidos: string[];
  getRegions: (sido: string) => string[];
  getSangkwons: (sido: string, region: string) => string[];
  getRent: (sido: string, sangkwon: string) => RentGuide | undefined;
  scaleSqm: number;
  onSelect: (rent: { sido: string; sangkwon: string; rent_per_sqm: number; monthly: number }) => void;
}

export function RegionSelector({ sidos, getRegions, getSangkwons, getRent, scaleSqm, onSelect }: Props) {
  const [sido, setSido] = useState('');
  const [region, setRegion] = useState('');
  const [sangkwon, setSangkwon] = useState('');

  const regions = sido ? getRegions(sido) : [];
  const sangkwons = sido && region ? getSangkwons(sido, region) : [];
  const rentInfo = sido && sangkwon ? getRent(sido, sangkwon) : undefined;
  const monthlyRent = rentInfo ? Math.round(rentInfo.rent_per_sqm * scaleSqm) : null;

  // 권역에 상권이 1개뿐이면 자동 선택
  useEffect(() => {
    if (sangkwons.length === 1) {
      const auto = sangkwons[0];
      setSangkwon(auto);
      const info = getRent(sido, auto);
      if (info) {
        onSelect({ sido, sangkwon: auto, rent_per_sqm: info.rent_per_sqm, monthly: Math.round(info.rent_per_sqm * scaleSqm) });
      }
    }
  }, [sangkwons, sido, getRent, scaleSqm, onSelect]);

  const handleSido = (v: string) => {
    setSido(v);
    setRegion('');
    setSangkwon('');
  };

  const handleRegion = (v: string) => {
    setRegion(v);
    setSangkwon('');
  };

  const handleSangkwon = (v: string) => {
    setSangkwon(v);
    const info = getRent(sido, v);
    if (info) {
      const monthly = Math.round(info.rent_per_sqm * scaleSqm);
      onSelect({ sido, sangkwon: v, rent_per_sqm: info.rent_per_sqm, monthly });
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.selects}>
        <select className={styles.select} value={sido} onChange={e => handleSido(e.target.value)}>
          <option value="">시/도</option>
          {sidos.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={styles.select} value={region} onChange={e => handleRegion(e.target.value)} disabled={!sido}>
          <option value="">권역</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className={styles.select} value={sangkwon} onChange={e => handleSangkwon(e.target.value)} disabled={!region || sangkwons.length <= 1}>
          <option value="">상권</option>
          {sangkwons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {monthlyRent !== null && (
        <div className={styles.guide}>
          <span className={styles.guideLabel}>월 임대료 가이던스</span>
          <span className={styles.guideValue}>~{formatKRWShort(monthlyRent)}</span>
          <span className={styles.guideSub}>
            ({scaleSqm}㎡ 기준, {sangkwon} 평균 {rentInfo?.rent_per_sqm.toLocaleString() ?? '?'}원/㎡)
          </span>
          <span className={styles.guideSource}>
            한국부동산원 상업용부동산 임대동향조사 {rentInfo?.data_quarter ?? ''}
          </span>
        </div>
      )}
    </div>
  );
}
