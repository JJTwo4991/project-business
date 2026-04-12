/**
 * 전 업종 × v2 매거진 카드뉴스 자동 생성 + 렌더링
 *
 * ⚠️ 데이터 정합성: 모든 값은 businessTypes.ts + calculator.ts에서 직접 추출.
 *    추측 금지. misc_fixed_cost_monthly 사용 금지.
 *    getMiscCostRate = flat 0.06 (전 업종 동일)
 *    DELIVERY_RATES = {1:0.10, 2:0.01, 5:0.10, 6:0.033, 8:0.10}, 나머지 0
 *
 * Usage: cd app && node generate-all.mjs
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE = 'C:/Users/wows2/Project Business/card-news';
const TEMPLATE_V2 = path.join(BASE, 'templates/card-template-v2-magazine.html');

// ══════════════════════════════════════════════════════
// 업종 데이터 — businessTypes.ts에서 1:1 복사
// ══════════════════════════════════════════════════════
// DELIVERY_RATES (calculator.ts line 8-13): {1:0.10, 2:0.01, 5:0.10, 6:0.033, 8:0.10}
// getMiscCostRate (calculator.ts line 24-25): flat 0.06 for ALL
const MISC_RATE = 0.06;
const DELIVERY = {1:0.10, 2:0.01, 5:0.10, 6:0.033, 8:0.10};

const INDUSTRIES = [
  // id, name, short (카드용), tag, emoji, avg_ticket_price, avg_daily_customers_medium, material_cost_ratio, survival_rate_3yr
  { id:1,  name:'치킨전문점',   short:'치킨집',       tag:'chicken',   emoji:'🍗', ticket:22000, customers:25,  costRatio:0.40, survival:0.454 },
  { id:2,  name:'커피전문점',   short:'카페',         tag:'cafe',      emoji:'☕', ticket:5500,  customers:100, costRatio:0.28, survival:0.532 },
  { id:3,  name:'편의점',       short:'편의점',       tag:'conv',      emoji:'🏪', ticket:8000,  customers:100, costRatio:0.72, survival:0.700 },
  { id:4,  name:'미용실',       short:'미용실',       tag:'hair',      emoji:'💇', ticket:25000, customers:12,  costRatio:0.10, survival:0.734 },
  { id:5,  name:'분식점',       short:'분식집',       tag:'bunsik',    emoji:'🍜', ticket:8000,  customers:55,  costRatio:0.32, survival:0.466 },
  { id:6,  name:'한식전문점',   short:'한식집',       tag:'hansik',    emoji:'🍚', ticket:15000, customers:20,  costRatio:0.45, survival:0.501 },
  { id:7,  name:'세탁소',       short:'세탁소',       tag:'laundry',   emoji:'👔', ticket:12000, customers:25,  costRatio:0.12, survival:0.538 },
  { id:8,  name:'피자전문점',   short:'피자집',       tag:'pizza',     emoji:'🍕', ticket:25000, customers:25,  costRatio:0.35, survival:0.510 },
  { id:9,  name:'베이커리',     short:'빵집',         tag:'bakery',    emoji:'🥐', ticket:8000,  customers:70,  costRatio:0.35, survival:0.585 },
  { id:11, name:'네일샵',       short:'네일샵',       tag:'nail',      emoji:'💅', ticket:35000, customers:10,  costRatio:0.15, survival:0.734 },
  { id:13, name:'반찬가게',     short:'반찬가게',     tag:'banchan',   emoji:'🥘', ticket:15000, customers:35,  costRatio:0.55, survival:0.466 },
  { id:14, name:'무인아이스크림',short:'무인아이스크림',tag:'icecream',  emoji:'🍦', ticket:5000,  customers:50,  costRatio:0.35, survival:0.538 },
  { id:15, name:'주점',         short:'술집',         tag:'pub',       emoji:'🍺', ticket:35000, customers:18,  costRatio:0.40, survival:0.550 },
  { id:16, name:'무인카페',     short:'무인카페',     tag:'unmanned',  emoji:'☕', ticket:3500,  customers:60,  costRatio:0.25, survival:0.650 },
];

const RENT = 150;      // 만원
const LABOR = 240;     // 만원 (주40시간 최저임금, 4대보험 미포함)
const INTEREST = 44;   // 만원 (1.5억 × 연3.5% ÷ 12)
const MIN_WAGE = 10450; // 2026년 최저시급

function calc(ind) {
  const deliveryRate = DELIVERY[ind.id] ?? 0;
  const revenue = Math.round(ind.customers * ind.ticket * 26 / 10000); // 만원
  const material = Math.round(revenue * ind.costRatio);
  const delivery = Math.round(revenue * deliveryRate);
  const misc = Math.round(revenue * MISC_RATE);
  // 무인 업종 (id=14,16): 인건비 0
  const labor = (ind.id === 14 || ind.id === 16) ? 0 : LABOR;
  const totalCost = material + delivery + RENT + labor + INTEREST + misc;
  const netIncome = revenue - totalCost;
  const hourlyWage = netIncome > 0 ? Math.round(netIncome * 10000 / 26 / 12) : 0;
  const wageRatio = netIncome > 0 ? Math.round(hourlyWage / MIN_WAGE * 100) : 0;
  const closureRate = Math.round((1 - ind.survival) * 1000) / 10;
  const dailyRevenue = Math.round(revenue / 26);
  return {
    revenue, dailyRevenue, material, delivery, misc, totalCost, netIncome,
    hourlyWage, wageRatio, closureRate, labor,
    costRatioP: Math.round(ind.costRatio * 100),
    deliveryRateP: Math.round(deliveryRate * 100 * 10) / 10, // 3.3% 등 소수점
    miscRateP: Math.round(MISC_RATE * 100),
  };
}

function generateV2(templateHtml, ind) {
  const c = calc(ind);
  let html = templateHtml;

  // 업종명
  html = html.replace(/치킨집/g, ind.short);
  html = html.replace(/치킨전문점/g, ind.name);

  // 카드2: 매출
  html = html.replace('1,430<span class="mega__unit">만원</span>', `${c.revenue.toLocaleString()}<span class="mega__unit">만원</span>`);
  html = html.replace('일매출 55만 × 영업일 26일', `일매출 ${c.dailyRevenue}만 × 영업일 26일`);
  html = html.replace('>25명<', `>${ind.customers}명<`);
  html = html.replace('>22,000<', `>${ind.ticket.toLocaleString()}<`);

  // 카드3: 재료비
  html = html.replace('-572<span class="mega__unit">만</span>', `-${c.material}<span class="mega__unit">만</span>`);
  html = html.replace(`width:40%;">40%`, `width:${c.costRatioP}%;">${c.costRatioP}%`);
  html = html.replace(`<strong style="color:#FF6B6B;">40%</strong>`, `<strong style="color:#FF6B6B;">${c.costRatioP}%</strong>`);

  // 카드4: 배달수수료
  const deliveryDisplay = c.deliveryRateP > 0 ? c.deliveryRateP : 0;
  html = html.replace('-143<span class="mega__unit">만</span>', c.delivery > 0 ? `-${c.delivery}<span class="mega__unit">만</span>` : `0<span class="mega__unit">만</span>`);
  html = html.replace(`width:10%;">10%`, `width:${deliveryDisplay}%;">${deliveryDisplay}%`);
  html = html.replace(`<strong style="color:#FF6B6B;">10%</strong>`, `<strong style="color:#FF6B6B;">${deliveryDisplay}%</strong>`);

  // 카드5: 고정비
  const fixedTotal = RENT + c.labor;
  html = html.replace(`<strong style="color:#FF6B6B;">390만원</strong>`, `<strong style="color:#FF6B6B;">${fixedTotal}만원</strong>`);
  // 무인업종: 인건비 0
  html = html.replace('>-240만<', `>-${c.labor}만<`);

  // 카드6: 기타비용
  html = html.replace('-86만', `-${c.misc}만`);
  html = html.replace('수도광열·소모품·매출 6%', `수도광열·소모품·매출 ${c.miscRateP}%`);

  // 카드7: 실수령
  html = html.replace('+1,430만', `+${c.revenue.toLocaleString()}만`);
  html = html.replace('-1,235만', `-${c.totalCost.toLocaleString()}만`);
  if (c.netIncome >= 0) {
    html = html.replace('195만원', `${c.netIncome}만원`);
    html = html.replace(/195<span class="mega__unit">만<\/span>/, `${c.netIncome}<span class="mega__unit">만</span>`);
    html = html.replace('6,250원', `${c.hourlyWage.toLocaleString()}원`);
    // 시급비율 — 정확한 문맥에서만 교체
    html = html.replace(`(10,450원)의 60%`, `(10,450원)의 ${c.wageRatio}%`);
  } else {
    html = html.replace('195만원', `${c.netIncome}만원 (적자)`);
    html = html.replace(/195<span class="mega__unit">만<\/span>/, `${Math.abs(c.netIncome)}<span class="mega__unit">만 적자</span>`);
    html = html.replace('6,250원', '적자');
    html = html.replace(`(10,450원)의 60%`, `(10,450원)의 -`);
  }

  // 카드8: 폐업률 (업종별)
  html = html.replace('54.6<span class="mega__unit">%</span>', `${c.closureRate}<span class="mega__unit">%</span>`);

  // 카드9: 솔루션
  html = html.replace('수수료 -143→-30만', c.delivery > 0 ? `수수료 -${c.delivery}→-${Math.round(c.delivery * 0.2)}만` : '고정비 절감');
  html = html.replace('재료비 36→30%로', `재료비 ${c.costRatioP}→${Math.max(c.costRatioP - 6, 5)}%로`);

  return html;
}

async function main() {
  // 잔여 임시 파일 정리
  const tmpFiles = fs.readdirSync(path.join(BASE, 'templates')).filter(f => f.startsWith('_tmp_'));
  tmpFiles.forEach(f => fs.unlinkSync(path.join(BASE, 'templates', f)));

  const templateV2 = fs.readFileSync(TEMPLATE_V2, 'utf-8');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  console.log(`\n═══ ${INDUSTRIES.length}업종 × v2 매거진 카드뉴스 생성 ═══\n`);

  for (const ind of INDUSTRIES) {
    const outDir = path.join(BASE, 'output', ind.tag);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const html = generateV2(templateV2, ind);
    const tmpFile = path.join(BASE, 'templates', `_tmp_${ind.tag}.html`);
    fs.writeFileSync(tmpFile, html);

    const url = 'file:///' + tmpFile.split(path.sep).join('/');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    const c = calc(ind);
    console.log(`── ${ind.tag} (${ind.short}) ──`);
    console.log(`   매출:${c.revenue} 비용:${c.totalCost} 실수령:${c.netIncome} 시급:${c.hourlyWage} 폐업:${c.closureRate}%`);

    // 검증
    const checkTotal = c.material + c.delivery + RENT + c.labor + INTEREST + c.misc;
    if (checkTotal !== c.totalCost) console.error(`   ⚠️ 총비용 불일치: ${checkTotal} ≠ ${c.totalCost}`);
    if (c.revenue - c.totalCost !== c.netIncome) console.error(`   ⚠️ 실수령 불일치`);

    for (let i = 1; i <= 10; i++) {
      const el = await page.$(`#card-${i}`);
      if (!el) continue;
      const name = `v2_${ind.tag}_card_${String(i).padStart(2, '0')}.png`;
      await el.screenshot({ path: path.join(outDir, name) });
    }
    console.log(`   📸 10장 → output/${ind.tag}/`);

    fs.unlinkSync(tmpFile);
  }

  await browser.close();
  console.log(`\n✅ ${INDUSTRIES.length}업종 × 10장 = ${INDUSTRIES.length * 10}장 완료`);
}

main().catch(console.error);
