// Korean government data API clients
// All calls are client-side; responses cached 24h in memory

const TTL_MS = 86400000; // 24 hours

const cache = new Map<string, { data: unknown; expiry: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// ---------------------------------------------------------------------------
// API 1: 한국부동산원 R-ONE — 소규모상가 임대료
// ---------------------------------------------------------------------------

const RONE_BASE = 'https://www.reb.or.kr/r-one/openapi/SttsApiTblData.do';
const RONE_KEY =
  (import.meta.env.VITE_RONE_API_KEY as string | undefined) ??
  '4ae1a88ba8d142b983056f5b8309d13d';

interface ROneRow {
  WRTTIME_IDTFR_ID: string;
  CLS_NM: string;
  CLS_FULLNM: string;
  ITM_NM: string;
  DTA_VAL: number;
  UI_NM: string;
}

interface ROneResponse {
  SttsApiTblData: [
    { head: [{ list_total_count: number }, { RESULT: { CODE: string } }] },
    { row: ROneRow[] },
  ];
}

export async function fetchRentFromRONE(): Promise<Map<string, number> | null> {
  const CACHE_KEY = 'rone_rent';
  const cached = getCached<Map<string, number>>(CACHE_KEY);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      KEY: RONE_KEY,
      Type: 'json',
      STATBL_ID: 'T248223134698125',
      DTACYCLE_CD: 'QY',
      pIndex: '1',
      pSize: '500',
    });

    const res = await fetch(`${RONE_BASE}?${params}`);
    if (!res.ok) return null;

    const json: ROneResponse = await res.json();
    const rows: ROneRow[] = json.SttsApiTblData[1].row;

    // Filter: 임대료 only, no ">" in CLS_FULLNM (시도 aggregates only)
    const filtered = rows.filter(
      (r) => r.ITM_NM === '임대료' && !r.CLS_FULLNM.includes('>'),
    );

    if (filtered.length === 0) return null;

    // Get latest quarter
    const latestQuarter = filtered
      .map((r) => r.WRTTIME_IDTFR_ID)
      .sort()
      .at(-1)!;

    const latestRows = filtered.filter(
      (r) => r.WRTTIME_IDTFR_ID === latestQuarter,
    );

    const result = new Map<string, number>();
    for (const row of latestRows) {
      // DTA_VAL is in 천원/㎡ → multiply by 1000 for KRW/㎡
      result.set(row.CLS_NM, row.DTA_VAL * 1000);
    }

    setCache(CACHE_KEY, result, TTL_MS);
    return result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// API 2: FTC 업종별 창업비용
// ---------------------------------------------------------------------------

const DATA_GO_KEY =
  (import.meta.env.VITE_DATA_GO_KR_KEY as string | undefined) ??
  '886160fc71169712064570ecdca464fd32637299d6feac565b512e70d21639ce';

export interface FTCStartupCost {
  industry: string;
  totalCost: number;
  franchiseFee: number;
  setupCost: number;
  otherCost: number;
  brandCount: number;
  storeCount: number;
}

interface FTCStartupRaw {
  indutyMlsfcNm: string;
  smtnAmt: number;
  avrgFrcsAmt: number;
  avrgFntnAmt: number;
  avrgJngEtcAmt: number;
  jnghdqrtrsCnt: number;
  frcsCnt: number;
}

interface FTCStartupResponse {
  response: {
    body: {
      totalCount: number;
      items: FTCStartupRaw[];
    };
  };
}

export async function fetchFTCStartupCosts(): Promise<FTCStartupCost[] | null> {
  const CACHE_KEY = 'ftc_startup_costs';
  const cached = getCached<FTCStartupCost[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      serviceKey: DATA_GO_KEY,
      pageNo: '1',
      numOfRows: '100',
      resultType: 'json',
      yr: '2023',
    });

    const endpoint =
      'https://apis.data.go.kr/1130000/FftcSclasIndutyFntnStatsService/getSclaIndutyFntnOutStats';
    const res = await fetch(`${endpoint}?${params}`);
    if (!res.ok) return null;

    const json: FTCStartupResponse = await res.json();
    const items = json.response.body.items;

    const result: FTCStartupCost[] = items.map((item) => ({
      industry: item.indutyMlsfcNm,
      totalCost: item.smtnAmt * 1000,
      franchiseFee: item.avrgFrcsAmt * 1000,
      setupCost: item.avrgFntnAmt * 1000,
      otherCost: item.avrgJngEtcAmt * 1000,
      brandCount: item.jnghdqrtrsCnt,
      storeCount: item.frcsCnt,
    }));

    setCache(CACHE_KEY, result, TTL_MS);
    return result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// API 3: FTC 지역별 매출액
// ---------------------------------------------------------------------------

export interface FTCRegionalSales {
  industry: string;
  region: string;
  avgSalesPerArea: number;
  storeCount: number;
}

interface FTCRegionalRaw {
  indutyMlsfcNm: string;
  areaNm: string;
  arUnitAvrgSlsAmt: number;
  frcsCnt: number;
}

interface FTCRegionalResponse {
  response: {
    body: {
      totalCount: number;
      items: FTCRegionalRaw[];
    };
  };
}

export async function fetchFTCRegionalSales(): Promise<FTCRegionalSales[] | null> {
  const CACHE_KEY = 'ftc_regional_sales';
  const cached = getCached<FTCRegionalSales[]>(CACHE_KEY);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      serviceKey: DATA_GO_KEY,
      pageNo: '1',
      numOfRows: '300',
      resultType: 'json',
      yr: '2023',
    });

    const endpoint =
      'https://apis.data.go.kr/1130000/FftcAreaIndutyAvrStatsService/getAreaIndutyAvrOutStats';
    const res = await fetch(`${endpoint}?${params}`);
    if (!res.ok) return null;

    const json: FTCRegionalResponse = await res.json();
    const items = json.response.body.items;

    const result: FTCRegionalSales[] = items.map((item) => ({
      industry: item.indutyMlsfcNm,
      region: item.areaNm,
      avgSalesPerArea: item.arUnitAvrgSlsAmt * 1000,
      storeCount: item.frcsCnt,
    }));

    setCache(CACHE_KEY, result, TTL_MS);
    return result;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

// Maps local business type name → FTC industry name
export const FTC_INDUSTRY_MAP: Record<string, number> = {
  치킨: 1,
  커피: 2,
  편의점: 3, // no direct FTC match, skip
  한식: 5,
  분식: 6,
  피자: 8,
  제과제빵: 9,
  '아이스크림/빙수': 14,
};
// Note: 미용실(4), 세탁소(7), 삼겹살(11), 네일샵(13), 반찬가게(15) have no FTC match

// Reverse mapping: local business type ID → FTC industry name
export const BUSINESS_TYPE_TO_FTC: Record<number, string> = Object.fromEntries(
  Object.entries(FTC_INDUSTRY_MAP).map(([name, id]) => [id, name]),
);
