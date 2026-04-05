/**
 * 앱인토스 이벤트 로깅 유틸리티
 *
 * - screen: 화면 진입 시 자동 호출 (추가 파라미터 포함)
 * - click: 버튼/요소 클릭 시 호출
 * - impression: 요소 노출 시 호출
 *
 * SDK 0.0.26+ 필요, 라이브 환경에서만 수집, 콘솔 확인은 +1일
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Analytics: {
  screen: (params: any) => void;
  click: (params: any) => void;
  impression: (params: any) => void;
} | null = null;

let initPromise: Promise<void> | null = null;

function ensureAnalytics(): Promise<void> {
  if (!initPromise) {
    initPromise = import('@apps-in-toss/web-framework')
      .then(mod => {
        if (mod.Analytics) {
          Analytics = mod.Analytics;
        }
      })
      .catch(() => {
        // SDK 미지원 환경 (로컬 dev 등) — 무시
      });
  }
  return initPromise;
}

// 앱 시작 시 한 번 호출
ensureAnalytics();

export function trackScreen(logName: string, params?: Record<string, unknown>) {
  ensureAnalytics().then(() => {
    Analytics?.screen({ log_name: logName, ...params });
  });
}

export function trackClick(logName: string, params?: Record<string, unknown>) {
  ensureAnalytics().then(() => {
    Analytics?.click({ log_name: logName, ...params });
  });
}

export function trackImpression(logName: string, params?: Record<string, unknown>) {
  ensureAnalytics().then(() => {
    Analytics?.impression({ log_name: logName, ...params });
  });
}
