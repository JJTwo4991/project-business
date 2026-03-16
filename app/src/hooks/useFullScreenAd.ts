import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 앱인토스 리워드 광고 훅 (GoogleAdMob)
 *
 * - Toss WebView 환경에서만 동작, 그 외에는 skip
 * - 사전 로딩 → 유저 액션 시 show → dismissed 후 콜백
 * - 공식 API: GoogleAdMob.loadAppsInTossAdMob / showAppsInTossAdMob
 */

// 테스트용 adGroupId (개발 중에만 사용, 프로덕션 배포 시 콘솔에서 발급받은 ID로 교체)
const AD_GROUP_ID_REWARDED = 'ait-ad-test-rewarded-id';

interface UseFullScreenAdOptions {
  /** 광고를 사전 로딩할지 여부 (기본: true) */
  preload?: boolean;
}

interface UseFullScreenAdReturn {
  /** 광고가 로드되어 보여줄 준비가 됐는지 */
  isReady: boolean;
  /** 광고 SDK를 지원하는 환경인지 */
  isSupported: boolean;
  /** 광고 표시. dismissed 되면 resolve, 실패/미지원 시에도 resolve (never reject) */
  showAd: () => Promise<{ rewarded: boolean }>;
}

export function useFullScreenAd(options: UseFullScreenAdOptions = {}): UseFullScreenAdReturn {
  const { preload = true } = options;
  const [isReady, setIsReady] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const loadedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // GoogleAdMob 네임스페이스 참조
  const admobRef = useRef<{
    loadAppsInTossAdMob: any;
    showAppsInTossAdMob: any;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const sdk = await import('@apps-in-toss/web-framework');
        if (cancelled) return;

        const admob = sdk.GoogleAdMob;
        const load = admob?.loadAppsInTossAdMob;
        const show = admob?.showAppsInTossAdMob;

        if (!load?.isSupported?.() || !show?.isSupported?.()) {
          return;
        }

        admobRef.current = { loadAppsInTossAdMob: load, showAppsInTossAdMob: show };
        setIsSupported(true);

        if (preload && !loadedRef.current) {
          loadAd();
        }
      } catch {
        // SDK 미지원 환경 (로컬 dev 등)
      }
    }

    init();
    return () => {
      cancelled = true;
      // 컴포넌트 언마운트 시 cleanup
      cleanupRef.current?.();
    };
  }, [preload]);

  const loadAd = useCallback(() => {
    const admob = admobRef.current;
    if (!admob) return;

    // 이전 로딩 cleanup
    cleanupRef.current?.();

    const cleanup = admob.loadAppsInTossAdMob({
      options: { adGroupId: AD_GROUP_ID_REWARDED },
      onEvent: (event: { type: string; data?: any }) => {
        if (event.type === 'loaded') {
          loadedRef.current = true;
          setIsReady(true);
          // 공식 문서: loaded 후 cleanup 호출
          cleanup?.();
          cleanupRef.current = null;
        }
      },
      onError: () => {
        loadedRef.current = false;
        setIsReady(false);
        cleanup?.();
        cleanupRef.current = null;
      },
    });

    cleanupRef.current = cleanup;
  }, []);

  const showAd = useCallback((): Promise<{ rewarded: boolean }> => {
    const admob = admobRef.current;

    // 미지원이거나 로드 안 됐으면 바로 skip
    if (!admob || !loadedRef.current) {
      return Promise.resolve({ rewarded: false });
    }

    setIsReady(false);
    loadedRef.current = false;

    return new Promise((resolve) => {
      let rewarded = false;

      admob.showAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID_REWARDED },
        onEvent: (event: { type: string; data?: any }) => {
          if (event.type === 'userEarnedReward') {
            rewarded = true;
          }
          if (event.type === 'dismissed') {
            // 다음 광고 사전 로딩
            loadAd();
            resolve({ rewarded });
          }
          if (event.type === 'failedToShow') {
            // 광고 보여주기 실패 — promise hang 방지
            loadAd();
            resolve({ rewarded: false });
          }
        },
        onError: () => {
          loadAd();
          resolve({ rewarded: false });
        },
      });
    });
  }, [loadAd]);

  return { isReady, isSupported, showAd };
}
