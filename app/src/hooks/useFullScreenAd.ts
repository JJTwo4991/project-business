import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 앱인토스 리워드 광고 훅
 *
 * - Toss WebView 환경에서만 동작, 그 외에는 skip
 * - GoogleAdMob API 우선, 없으면 loadFullScreenAd fallback
 */

const AD_GROUP_ID_REWARDED = 'ait-ad-test-rewarded-id';

interface AdSDK {
  load: (params: any) => any;
  show: (params: any) => any;
}

interface UseFullScreenAdReturn {
  isReady: boolean;
  isSupported: boolean;
  showAd: () => Promise<{ rewarded: boolean }>;
}

export function useFullScreenAd(): UseFullScreenAdReturn {
  const [isReady, setIsReady] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const sdkRef = useRef<AdSDK | null>(null);
  const readyRef = useRef(false);

  const loadAd = useCallback(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    const cleanup = sdk.load({
      options: { adGroupId: AD_GROUP_ID_REWARDED },
      onEvent: (event: { type: string; data?: any }) => {
        if (event.type === 'loaded') {
          readyRef.current = true;
          setIsReady(true);
          cleanup?.();
        }
      },
      onError: () => {
        readyRef.current = false;
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

        // 방법 1: GoogleAdMob API (공식 문서)
        const gam = (sdk as any).GoogleAdMob;
        if (gam?.loadAppsInTossAdMob?.isSupported?.() && gam?.showAppsInTossAdMob?.isSupported?.()) {
          sdkRef.current = {
            load: gam.loadAppsInTossAdMob.bind(gam),
            show: gam.showAppsInTossAdMob.bind(gam),
          };
          setIsSupported(true);
          loadAd();
          return;
        }

        // 방법 2: 통합 SDK API (loadFullScreenAd/showFullScreenAd)
        const load = (sdk as any).loadFullScreenAd;
        const show = (sdk as any).showFullScreenAd;
        if (load?.isSupported?.() && show?.isSupported?.()) {
          sdkRef.current = { load, show };
          setIsSupported(true);
          loadAd();
          return;
        }
      } catch {
        // SDK 미지원 환경
      }
    }

    init();
    return () => { cancelled = true; };
  }, [loadAd]);

  const showAd = useCallback((): Promise<{ rewarded: boolean }> => {
    const sdk = sdkRef.current;

    if (!sdk || !readyRef.current) {
      return Promise.resolve({ rewarded: false });
    }

    readyRef.current = false;
    setIsReady(false);

    return new Promise((resolve) => {
      let rewarded = false;

      sdk.show({
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
  }, [loadAd]);

  return { isReady, isSupported, showAd };
}
