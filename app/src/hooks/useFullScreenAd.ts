import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * 앱인토스 전면(interstitial) 광고 훅 — 통합 SDK (loadFullScreenAd / showFullScreenAd)
 * 참고: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/광고/IntegratedAd.md
 */

const AD_GROUP_ID = 'ait.v2.live.e3c97d0c81ff4aff';

interface UseFullScreenAdReturn {
  isReady: boolean;
  isSupported: boolean;
  showAd: () => Promise<void>;
}

export function useFullScreenAd(): UseFullScreenAdReturn {
  const [isReady, setIsReady] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const sdkRef = useRef<{ load: any; show: any } | null>(null);

  const loadAd = useCallback(() => {
    const sdk = sdkRef.current;
    if (!sdk) return;

    sdk.load({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event: { type: string }) => {
        if (event.type === 'loaded') {
          setIsReady(true);
        }
      },
      onError: () => {
        setIsReady(false);
      },
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const sdk = await import('@apps-in-toss/web-framework');
        if (cancelled) return;

        const load = (sdk as any).loadFullScreenAd;
        const show = (sdk as any).showFullScreenAd;

        if (load?.isSupported?.() && show?.isSupported?.()) {
          sdkRef.current = { load, show };
          setIsSupported(true);
          sdkRef.current.load({
            options: { adGroupId: AD_GROUP_ID },
            onEvent: (event: { type: string }) => {
              if (!cancelled && event.type === 'loaded') {
                setIsReady(true);
              }
            },
            onError: () => {},
          });
        }
      } catch {
        // SDK 미지원 환경
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const showAd = useCallback((): Promise<void> => {
    const sdk = sdkRef.current;
    if (!sdk || !isReady) return Promise.resolve();

    setIsReady(false);

    return new Promise((resolve) => {
      sdk.show({
        options: { adGroupId: AD_GROUP_ID },
        onEvent: (event: { type: string }) => {
          if (event.type === 'dismissed' || event.type === 'failedToShow') {
            loadAd();
            resolve();
          }
        },
        onError: () => {
          loadAd();
          resolve();
        },
      });
    });
  }, [isReady, loadAd]);

  return { isReady, isSupported, showAd };
}
