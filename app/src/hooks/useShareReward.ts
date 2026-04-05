import { useCallback, useRef, useState } from 'react';

const MODULE_ID = 'f84ba37c-120d-4ea8-bbd6-411103aac3f6';

interface UseShareRewardReturn {
  triggerShare: (onSuccess: () => void) => void;
  isSharing: boolean;
}

/**
 * 공유 리워드 훅 — contactsViral (토스 앱) / fallback share (비토스)
 */
export function useShareReward(): UseShareRewardReturn {
  const [isSharing, setIsSharing] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const triggerShare = useCallback((onSuccess: () => void) => {
    setIsSharing(true);

    // 이전 cleanup 정리
    cleanupRef.current?.();
    cleanupRef.current = null;

    (async () => {
      try {
        const sdk = await import('@apps-in-toss/web-framework');
        const contactsViral = (sdk as any).contactsViral;

        if (typeof contactsViral === 'function') {
          const cleanup = contactsViral({
            options: { moduleId: MODULE_ID },
            onEvent: (event: { type: string; data?: any }) => {
              if (event.type === 'sendViral') {
                // 공유 성공 → 크레딧 지급
                onSuccess();
              }
              if (event.type === 'close') {
                setIsSharing(false);
                cleanupRef.current?.();
                cleanupRef.current = null;
              }
            },
            onError: () => {
              setIsSharing(false);
              cleanupRef.current?.();
              cleanupRef.current = null;
            },
          });
          cleanupRef.current = typeof cleanup === 'function' ? cleanup : null;
          return;
        }
      } catch {
        // SDK 없음 — fallback
      }

      // Fallback: 기본 share API (비토스 환경)
      try {
        const sdk = await import('@apps-in-toss/web-framework');
        const share = (sdk as any).share;
        if (typeof share === 'function') {
          await share({ message: '나의 자영업 MBTI 결과를 확인해보세요! 🍗' });
          onSuccess();
          setIsSharing(false);
          return;
        }
      } catch {
        // share도 없음
      }

      // 최종 fallback: navigator.share 또는 dev 모드 시뮬레이션
      try {
        if (navigator.share) {
          await navigator.share({
            title: '사장 될 결심',
            text: '나의 자영업 MBTI 결과를 확인해보세요!',
          });
          onSuccess();
        } else {
          // Dev 환경 — 그냥 성공 처리
          onSuccess();
        }
      } catch {
        // 사용자가 공유 취소
      }
      setIsSharing(false);
    })();
  }, []);

  return { triggerShare, isSharing };
}
