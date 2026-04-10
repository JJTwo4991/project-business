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
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    trackScreen('사장님_유형', { mbti_type: card.tagline, business_type: result.inputs.business_type.name });
  }, [card.tagline, result.inputs.business_type.name]);

  const handleShare = useCallback(() => {
    trackClick('사장님_유형_공유', { mbti_type: card.tagline, business_type: result.inputs.business_type.name });
    triggerShare(() => {
      onShareSuccess();
    });
  }, [triggerShare, onShareSuccess, card.tagline, result.inputs.business_type.name]);

  const SHARE_TEXT = `내가 하고 싶은 사업, 얼마 벌지 미리 알아봐요!\n앱 설치하지 않아도 토스에서 바로 쓸 수 있어요.\n\nhttps://minion.toss.im/xAmiYYG7`;

  const handleImageShare = useCallback(async () => {
    if (!cardRef.current || isCapturing) return;
    setIsCapturing(true);
    trackClick('사장님_유형_이미지공유', { mbti_type: card.tagline, business_type: result.inputs.business_type.name });

    try {
      // 1) 카드 → Canvas
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: card.bgColor,
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: false,
      });

      // 2) navigator.share (파일 공유) — 일반 모바일 브라우저용
      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (blob && navigator.share) {
        try {
          const file = new File([blob], 'boss-card.png', { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: '사장 될 결심',
            text: SHARE_TEXT,
          });
          setIsCapturing(false);
          return;
        } catch (shareErr) {
          if (shareErr instanceof Error && shareErr.name === 'AbortError') {
            setIsCapturing(false);
            return;
          }
          // 파일 공유 미지원 → fallback
        }
      }

      // 3) 토스 WebView: 이미지 갤러리 저장 + 텍스트 공유
      try {
        const sdk = await import('@apps-in-toss/web-framework');
        const b64 = canvas.toDataURL('image/png').split(',')[1];

        const saveFn = (sdk as any).saveBase64Data;
        if (typeof saveFn === 'function') {
          try {
            await saveFn({ data: b64, fileName: 'boss-card.png', mimeType: 'image/png' });
            setToast('갤러리에 사진이 저장되었어요!');
            setTimeout(() => setToast(null), 2500);
          } catch { /* 저장 실패 */ }
        }

        const shareFn = (sdk as any).share;
        if (typeof shareFn === 'function') {
          await shareFn({ message: SHARE_TEXT });
          setIsCapturing(false);
          return;
        }
      } catch { /* SDK 없음 */ }

      // 4) 최종 Fallback: 이미지 다운로드
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'boss-card.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('이미지 공유 실패:', err);
    }
    setIsCapturing(false);
  }, [card.tagline, card.bgColor, result.inputs.business_type.name, isCapturing]);

  return (
    <div className={styles.page}>
      {/* ── 토스트 ── */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* ── 카드 (캡처 영역) ── */}
      <div ref={cardRef} className={styles.card} style={{ background: card.bgColor }}>
        {/* 서비스 헤더 */}
        <div className={styles.cardHeader}>
          <span>사장 될 결심</span>
          <span>토스 미니앱</span>
        </div>

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
      <div className={styles.btnGroup}>
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
          {isSharing ? '🎁 공유 중...' : '🎁 공유하고 광고 없이 계산내역 확인하기'}
          <span className={styles.shareSub}>친구에게 공유하면 계산내역을 바로 볼 수 있어요</span>
        </button>

        <button
          className={styles.skipBtn}
          onClick={onSkip}
        >
          📺 광고 보고 계산내역 확인하기
        </button>
      </div>
    </div>
  );
}
