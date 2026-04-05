import { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import styles from './BusinessMbtiPage.module.css';
import type { SimulationResult } from '../../types';
import { calculateBossCard } from '../../lib/businessMbti';
import { useShareReward } from '../../hooks/useShareReward';
import { formatKRWShort } from '../../lib/format';
import { trackScreen, trackClick } from '../../lib/analytics';

import bossLv1Bleeding from '../../assets/boss/boss_Lv1_BLEEDING.png';
import bossLv1Stagnant from '../../assets/boss/boss_Lv1_STAGNANT.png';
import bossLv1Cashcow from '../../assets/boss/boss_Lv1_CASHCOW.png';
import bossLv2Bleeding from '../../assets/boss/boss_Lv2_BLEEDING.png';
import bossLv2Stagnant from '../../assets/boss/boss_Lv2_STAGNANT.png';
import bossLv2Cashcow from '../../assets/boss/boss_Lv2_CASHCOW.png';
import bossLv3Bleeding from '../../assets/boss/boss_Lv3_BLEEDING.png';
import bossLv3Stagnant from '../../assets/boss/boss_Lv3_STAGNANT.png';
import bossLv3Cashcow from '../../assets/boss/boss_Lv3_CASHCOW.png';

const BOSS_IMAGES: Record<string, string> = {
  Lv1_BLEEDING: bossLv1Bleeding,
  Lv1_STAGNANT: bossLv1Stagnant,
  Lv1_CASHCOW: bossLv1Cashcow,
  Lv2_BLEEDING: bossLv2Bleeding,
  Lv2_STAGNANT: bossLv2Stagnant,
  Lv2_CASHCOW: bossLv2Cashcow,
  Lv3_BLEEDING: bossLv3Bleeding,
  Lv3_STAGNANT: bossLv3Stagnant,
  Lv3_CASHCOW: bossLv3Cashcow,
};

interface Props {
  result: SimulationResult;
  onShareSuccess: () => void;
  onSkip: () => void;
}

export function BusinessMbtiPage({ result, onShareSuccess, onSkip }: Props) {
  const card = useMemo(() => calculateBossCard(result), [result]);
  const { triggerShare, isSharing } = useShareReward();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    trackScreen('사장님_유형', { mbti_type: card.tagline, business_type: result.inputs.business_type.name });
  }, [card.tagline, result.inputs.business_type.name]);

  const handleShare = useCallback(() => {
    trackClick('사장님_유형_공유', { mbti_type: card.tagline, business_type: result.inputs.business_type.name });
    triggerShare(() => {
      onShareSuccess();
    });
  }, [triggerShare, onShareSuccess, card.tagline, result.inputs.business_type.name]);

  const handleImageShare = useCallback(async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    trackClick('사장님_유형_이미지공유', { mbti_type: card.tagline, business_type: result.inputs.business_type.name });

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) { setIsCapturing(false); return; }

      const file = new File([blob], 'boss-card.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: '사장 될 결심 - 나의 사장님 유형',
          text: card.tagline.replace(/\n/g, ' '),
        });
      } else {
        // Fallback: 이미지 다운로드
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boss-card.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // 사용자가 공유 취소하거나 에러
    }
    setIsCapturing(false);
  }, [card.tagline, result.inputs.business_type.name, isCapturing]);

  return (
    <div className={styles.page}>
      {/* ── 카드 (캡처 영역) ── */}
      <div ref={cardRef} className={styles.card} style={{ background: card.bgColor }}>
        {/* 지역 + 업종 */}
        <div className={styles.cardMeta}>
          {result.inputs.region && (
            <span className={styles.metaTag}>{result.inputs.region.sido} {result.inputs.region.sangkwon}</span>
          )}
          <span className={styles.metaTag}>{card.businessName}</span>
        </div>

        {/* 일러스트 */}
        <div className={styles.illustWrap}>
          <img
            className={styles.illustImg}
            src={BOSS_IMAGES[card.personaId]}
            alt={card.tagline}
            crossOrigin="anonymous"
          />
        </div>

        {/* 바이럴 문구 (하이라이트) */}
        <h2 className={styles.tagline}>{card.tagline}</h2>

        {/* 이유 */}
        <p className={styles.reason}>{card.reason}</p>

        {/* 핵심 수치 박스 */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>월매출</span>
            <span className={styles.statValue}>{formatKRWShort(card.monthlyRevenue)}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>월 현금흐름</span>
            <span className={`${styles.statValue} ${card.monthlyCashflow < 0 ? styles.negative : styles.positive}`}>
              {card.monthlyCashflow >= 0 ? '+' : ''}{formatKRWShort(card.monthlyCashflow)}
            </span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statLabel}>주 근무시간</span>
            <span className={styles.statValue}>{card.wlbHours}시간</span>
          </div>
        </div>

        {/* WLB 한줄 코멘트 */}
        <p className={styles.wlbComment}>⏰ {card.wlbText}</p>
      </div>

      {/* ── 버튼 영역 ── */}
      <button
        className={styles.imageShareBtn}
        onClick={handleImageShare}
        disabled={isCapturing}
      >
        {isCapturing ? '📸 이미지 생성 중...' : '📸 카드 이미지로 공유하기'}
      </button>

      <button
        className={styles.shareBtn}
        onClick={handleShare}
        disabled={isSharing}
      >
        {isSharing ? '🎁 공유 중...' : '🎁 공유하고 광고 없이 손익 확인하기'}
        <span className={styles.shareSub}>친구에게 공유하면 일·월 손익을 바로 볼 수 있어요</span>
      </button>

      <button
        className={styles.skipBtn}
        onClick={onSkip}
      >
        📺 광고 보고 확인하기
      </button>
    </div>
  );
}
