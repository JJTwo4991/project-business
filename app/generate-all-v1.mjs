/**
 * 전 업종 × v1 카카오톡 카드뉴스 자동 생성 + 렌더링
 *
 * ⚠️ 데이터: businessTypes.ts + calculator.ts 기준. 추측 금지.
 *    getMiscCostRate = flat 0.06
 *    DELIVERY_RATES = {1:0.10, 2:0.01, 5:0.10, 6:0.033, 8:0.10}
 *
 * Usage: cd app && node generate-all-v1.mjs
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE = 'C:/Users/wows2/Project Business/card-news';
const TEMPLATE_V1 = path.join(BASE, 'templates/card-template-v1-kakao.html');

const MISC_RATE = 0.06;
const DELIVERY = {1:0.10, 2:0.01, 5:0.10, 6:0.033, 8:0.10};

const INDUSTRIES = [
  { id:1,  name:'치킨전문점',    short:'치킨집',        tag:'chicken',   emoji:'🍗', ticket:22000, customers:25,  costRatio:0.40, survival:0.454 },
  { id:2,  name:'커피전문점',    short:'카페',          tag:'cafe',      emoji:'☕', ticket:5500,  customers:100, costRatio:0.28, survival:0.532 },
  { id:3,  name:'편의점',        short:'편의점',        tag:'conv',      emoji:'🏪', ticket:8000,  customers:100, costRatio:0.72, survival:0.700 },
  { id:4,  name:'미용실',        short:'미용실',        tag:'hair',      emoji:'💇', ticket:25000, customers:12,  costRatio:0.10, survival:0.734 },
  { id:5,  name:'분식점',        short:'분식집',        tag:'bunsik',    emoji:'🍜', ticket:8000,  customers:55,  costRatio:0.32, survival:0.466 },
  { id:6,  name:'한식전문점',    short:'한식집',        tag:'hansik',    emoji:'🍚', ticket:15000, customers:20,  costRatio:0.45, survival:0.501 },
  { id:7,  name:'세탁소',        short:'세탁소',        tag:'laundry',   emoji:'👔', ticket:12000, customers:25,  costRatio:0.12, survival:0.538 },
  { id:8,  name:'피자전문점',    short:'피자집',        tag:'pizza',     emoji:'🍕', ticket:25000, customers:25,  costRatio:0.35, survival:0.510 },
  { id:9,  name:'베이커리',      short:'빵집',          tag:'bakery',    emoji:'🥐', ticket:8000,  customers:70,  costRatio:0.35, survival:0.585 },
  { id:11, name:'네일샵',        short:'네일샵',        tag:'nail',      emoji:'💅', ticket:35000, customers:10,  costRatio:0.15, survival:0.734 },
  { id:13, name:'반찬가게',      short:'반찬가게',      tag:'banchan',   emoji:'🥘', ticket:15000, customers:35,  costRatio:0.55, survival:0.466 },
  { id:14, name:'무인아이스크림', short:'무인아이스크림', tag:'icecream',  emoji:'🍦', ticket:5000,  customers:50,  costRatio:0.35, survival:0.538 },
  { id:15, name:'주점',          short:'술집',          tag:'pub',       emoji:'🍺', ticket:35000, customers:18,  costRatio:0.40, survival:0.550 },
  { id:16, name:'무인카페',      short:'무인카페',      tag:'unmanned',  emoji:'☕', ticket:3500,  customers:60,  costRatio:0.25, survival:0.650 },
];

const RENT = 150;
const LABOR = 240;
const INTEREST = 44;
const MIN_WAGE = 10450;

function calc(ind) {
  const deliveryRate = DELIVERY[ind.id] ?? 0;
  const revenue = Math.round(ind.customers * ind.ticket * 26 / 10000);
  const material = Math.round(revenue * ind.costRatio);
  const delivery = Math.round(revenue * deliveryRate);
  const misc = Math.round(revenue * MISC_RATE);
  const labor = (ind.id === 14 || ind.id === 16) ? 0 : LABOR;
  const totalCost = material + delivery + RENT + labor + INTEREST + misc;
  const netIncome = revenue - totalCost;
  const hourlyWage = netIncome > 0 ? Math.round(netIncome * 10000 / 26 / 12) : 0;
  const wageRatio = netIncome > 0 ? Math.round(hourlyWage / MIN_WAGE * 100) : 0;
  const closureRate = Math.round((1 - ind.survival) * 1000) / 10;
  return { revenue, material, delivery, misc, totalCost, netIncome, hourlyWage, wageRatio, closureRate, labor,
           costRatioP: Math.round(ind.costRatio * 100), deliveryRateP: Math.round(deliveryRate * 100 * 10) / 10 };
}

function generateV1(templateHtml, ind) {
  const c = calc(ind);
  let html = templateHtml;

  // 업종명 교체
  html = html.replace(/치킨집/g, ind.short);
  html = html.replace(/치킨전문점/g, ind.name);

  // 카드2: 매출
  html = html.replace('1,430만원', `${c.revenue.toLocaleString()}만원`);
  html = html.replace('하루 25명 객단가 22,000원', `하루 ${ind.customers}명 객단가 ${ind.ticket.toLocaleString()}원`);

  // 카드3: 비용 PDF
  html = html.replace('재료비 (40%)</span><span>-572만', `재료비 (${c.costRatioP}%)</span><span>-${c.material}만`);

  // 임대+인건비
  const fixedTotal = RENT + c.labor;
  html = html.replace('임대·인건비</span><span>-390만', `임대·인건비</span><span>-${fixedTotal}만`);

  // 배달수수료
  html = html.replace('배달수수료</span><span>-143만', `배달수수료</span><span>-${c.delivery}만`);

  // 이자+기타
  const interestMisc = INTEREST + c.misc;
  html = html.replace('이자·기타</span><span>-130만', `이자·기타</span><span>-${interestMisc}만`);

  // 합계
  html = html.replace('합계</span><span>-1,235만', `합계</span><span>-${c.totalCost.toLocaleString()}만`);

  // 카드4: 실수령
  if (c.netIncome >= 0) {
    html = html.replace('대충 195만원.', `대충 ${c.netIncome}만원.`);
    html = html.replace('1430만 매출인데 195만??', `${c.revenue}만 매출인데 ${c.netIncome}만??`);
  } else {
    html = html.replace('대충 195만원.', `매달 ${Math.abs(c.netIncome)}만원 적자.`);
    html = html.replace('1430만 매출인데 195만??', `${c.revenue}만 벌어서 적자??`);
  }

  // 카드5: 시급
  if (c.netIncome > 0) {
    html = html.replace('시급 6,250원', `시급 ${c.hourlyWage.toLocaleString()}원`);
  } else {
    html = html.replace('시급 6,250원', '시급 계산 불가 (적자)');
  }
  html = html.replace('최저시급 10,450원', `최저시급 ${MIN_WAGE.toLocaleString()}원`);

  // 실수령 코멘트
  html = html.replace('실수령 195만', `실수령 ${c.netIncome}만`);

  return html;
}

async function main() {
  // 임시 파일 정리
  const tmpFiles = fs.readdirSync(path.join(BASE, 'templates')).filter(f => f.startsWith('_tmp_'));
  tmpFiles.forEach(f => fs.unlinkSync(path.join(BASE, 'templates', f)));

  const templateV1 = fs.readFileSync(TEMPLATE_V1, 'utf-8');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  console.log(`\n═══ ${INDUSTRIES.length}업종 × v1 카카오톡 카드뉴스 생성 ═══\n`);

  for (const ind of INDUSTRIES) {
    const outDir = path.join(BASE, 'output', ind.tag);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const html = generateV1(templateV1, ind);
    const tmpFile = path.join(BASE, 'templates', `_tmp_v1_${ind.tag}.html`);
    fs.writeFileSync(tmpFile, html);

    const url = 'file:///' + tmpFile.split(path.sep).join('/');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    const c = calc(ind);
    console.log(`── ${ind.tag} (${ind.short}) ──`);
    console.log(`   매출:${c.revenue} 비용:${c.totalCost} 실수령:${c.netIncome} 시급:${c.hourlyWage}`);

    for (let i = 1; i <= 7; i++) {
      const el = await page.$(`#card-${i}`);
      if (!el) continue;
      const name = `v1_${ind.tag}_card_${String(i).padStart(2, '0')}.png`;
      await el.screenshot({ path: path.join(outDir, name) });
    }
    console.log(`   📸 7장 → output/${ind.tag}/`);

    fs.unlinkSync(tmpFile);
  }

  await browser.close();
  console.log(`\n✅ ${INDUSTRIES.length}업종 × 7장 = ${INDUSTRIES.length * 7}장 완료`);
}

main().catch(console.error);
