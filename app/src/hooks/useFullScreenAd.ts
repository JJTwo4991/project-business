import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 앱인토스 리워드 광고 훅
 *
 * - Toss WebView 환경에서만 동작, 그 외에는 skip
 * - 사전 로딩 → 유저 액션 시 show → dismissed 후 콜백
 * - 공식 API: GoogleAdMob.loadAppsInTossAdMob / GoogleAdMob.showAppsInTossAdMob
 */

// 테스트용 adGroupId (개발 중에만 사용, 프로덕션 배포 시 콘솔에서 발급받은 ID로 교체)
const AD_GROUP_ID_REWARDED = 'ait-ad-test-rewarded-id';

interface UseFullScreenAdReturn {
  /** 광고가 로드되어 보여줄 준비가 됐는지 */
  isReady: boolean;
  /** 광고 SDK를 지원하는 환경인지 */
  isSupported: boolean;
  /** 광고 표시. dismissed 되면 resolve, 실패/미지원 시에도 resolve (never reject) */
  showAd: () => Promise<{ rewarded: boolean }>;
}

export function useFullScreenAd(): UseFullScreenAdReturn {
  const [isReady, setIsReady] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const admobRef = useRef<any>(null);

  const loadAd = useCallback(() => {
    const GoogleAdMob = admobRef.current;
    if (!GoogleAdMob) return;

    const cleanup = GoogleAdMob.loadAppsInTossAdMob({
      options: { adGroupId: AD_GROUP_ID_REWARDED },
      onEvent: (event: { type: string; data?: any }) => {
        switch (event.type) {
          case 'loaded':
            setIsReady(true);
            cleanup?.();
            break;
        }
      },
      onError: () => {
        setIsReady(false);
        cleanup?.();
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const sdk = await import('@apps-in-toss/web-framework');
        if (cancelled) return;

        const GoogleAdMob = sdk.GoogleAdMob;
        if (!GoogleAdMob?.loadAppsInTossAdMob?.isSupported?.()) return;
        if (!GoogleAdMob?.showAppsInTossAdMob?.isSupported?.()) return;

        admobRef.current = GoogleAdMob;
        setIsSupported(true);
        loadAd();
      } catch {
        // SDK 미지원 환경
      }
    }

    init();
    return () => { cancelled = true; };
  }, [loadAd]);

  const showAd = useCallback((): Promise<{ rewarded: boolean }> => {
    const GoogleAdMob = admobRef.current;

    if (!GoogleAdMob || !isReady) {
      return Promise.resolve({ rewarded: false });
    }

    setIsReady(false);

    return new Promise((resolve) => {
      let rewarded = false;

      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId: AD_GROUP_ID_REWARDED },
        onEvent: (event: { type: string; data?: any }) => {
          switch (event.type) {
            case 'userEarnedReward':
              rewarded = true;
              break;
            case 'dismissed':
              loadAd();
              resolve({ rewarded });
              break;
            case 'failedToShow':
              loadAd();
              resolve({ rewarded: false });
              break;
          }
        },
        onError: () => {
          loadAd();
          resolve({ rewarded: false });
        },
      });
    });
  }, [loadAd, isReady]);

  return { isReady, isSupported, showAd };
}
