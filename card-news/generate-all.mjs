/**
 * 14업종 × v2 매거진 카드뉴스 자동 생성 + 렌더링
 * Usage: cd app && node ../card-news/generate-all.mjs
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE = 'C:/Users/wows2/Project Business/card-news';
const TEMPLATE_V2 = path.join(BASE, 'templates/card-template-v2-magazine.html');

// ── 14개 업종 계산 시트 (GUIDELINE 섹션 6 기준) ──
const INDUSTRIES = [
  { id:1,  name:'치킨전문점', short:'치킨집',   tag:'chicken',    emoji:'🍗', ticket:22000, customers:25, costRatio:0.40, deliveryRate:0.10, miscRate:0.06, survival:0.454 },
  { id:2,  name:'커피전문점', short:'카페',      tag:'cafe',       emoji:'☕', ticket:5500,  customers:100,costRatio:0.28, deliveryRate:0,    miscRate:0.05, survival:0.532 },
  { id:3,  name:'편의점',     short:'편의점',    tag:'conv',       emoji:'🏪', ticket:8000,  customers:100,costRatio:0.72, deliveryRate:0,    miscRate:0.03, survival:0.700 },
  { id:4,  name:'미용실',     short:'미용실',    tag:'hair',       emoji:'💇', ticket:25000, customers:12, costRatio:0.10, deliveryRate:0,    miscRate:0.04, survival:0.734 },
  { id:5,  name:'분식점',     short:'분식집',    tag:'bunsik',     emoji:'🍜', ticket:8000,  customers:55, costRatio:0.32, deliveryRate:0.08, miscRate:0.06, survival:0.466 },
  { id:6,  name:'한식전문점', short:'한식집',    tag:'hansik',     emoji:'🍚', ticket:15000, customers:20, costRatio:0.45, deliveryRate:0.05, miscRate:0.06, survival:0.501 },
  { id:7,  name:'세탁소',     short:'세탁소',    tag:'laundry',    emoji:'👔', ticket:12000, customers:25, costRatio:0.12, deliveryRate:0,    miscRate:0.04, survival:0.538 },
  { id:8,  name:'피자전문점', short:'피자집',    tag:'pizza',      emoji:'🍕', ticket:25000, customers:25, costRatio:0.35, deliveryRate:0.10, miscRate:0.06, survival:0.510 },
  { id:9,  name:'삼겹살전문점',short:'삼겹살집', tag:'samgyup',    emoji:'🥩', ticket:18000, customers:20, costRatio:0.42, deliveryRate:0.05, miscRate:0.06, survival:0.523 },
  { id:10, name:'과일가게',   short:'과일가게',  tag:'fruit',      emoji:'🍎', ticket:15000, customers:30, costRatio:0.55, deliveryRate:0,    miscRate:0.03, survival:0.399 },
  { id:11, name:'네일샵',     short:'네일샵',    tag:'nail',       emoji:'💅', ticket:40000, customers:8,  costRatio:0.15, deliveryRate:0,    miscRate:0.04, survival:0.520 },
  { id:12, name:'꽃집',       short:'꽃집',      tag:'flower',     emoji:'🌸', ticket:30000, customers:10, costRatio:0.40, deliveryRate:0,    miscRate:0.03, survival:0.480 },
  { id:13, name:'떡볶이전문점',short:'떡볶이집', tag:'tteok',      emoji:'🌶️', ticket:10000, customers:40, costRatio:0.30, deliveryRate:0.12, miscRate:0.06, survival:0.450 },
  { id:14, name:'필라테스',   short:'필라테스',  tag:'pilates',    emoji:'🧘', ticket:150000,customers:5,  costRatio:0.05, deliveryRate:0,    miscRate:0.04, survival:0.600 },
];

const RENT = 150;      // 만원
const LABOR = 240;     // 만원
const INTEREST = 44;   // 만원
const MIN_WAGE = 10450; // 2026년

function calc(ind) {
  const revenue = Math.round(ind.customers * ind.ticket * 26 / 10000); // 만원
  const material = Math.round(revenue * ind.costRatio);
  const delivery = Math.round(revenue * ind.deliveryRate);
  const misc = Math.round(revenue * ind.miscRate);
  const totalCost = material + delivery + RENT + LABOR + INTEREST + misc;
  const netIncome = revenue - totalCost;
  const hourlyWage = netIncome > 0 ? Math.round(netIncome * 10000 / 26 / 12) : 0;
  const wageRatio = netIncome > 0 ? Math.round(hourlyWage / MIN_WAGE * 100) : 0;
  const closureRate = Math.round((1 - ind.survival) * 1000) / 10;
  const dailyRevenue = Math.round(revenue / 26);
  return { revenue, dailyRevenue, material, delivery, misc, totalCost, netIncome, hourlyWage, wageRatio, closureRate,
           costRatioP: Math.round(ind.costRatio*100), deliveryRateP: Math.round(ind.deliveryRate*100), miscRateP: Math.round(ind.miscRate*100) };
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
  html = html.replace('-143<span class="mega__unit">만</span>', c.delivery > 0 ? `-${c.delivery}<span class="mega__unit">만</span>` : `0<span class="mega__unit">만</span>`);
  html = html.replace(`width:10%;">10%`, `width:${c.deliveryRateP}%;">${c.deliveryRateP}%`);
  html = html.replace(`<strong style="color:#FF6B6B;">10%</strong>`, `<strong style="color:#FF6B6B;">${c.deliveryRateP}%</strong>`);

  // 카드5: 고정비 합계
  const fixedTotal = RENT + LABOR;
  html = html.replace(`<strong style="color:#FF6B6B;">390만원</strong>`, `<strong style="color:#FF6B6B;">${fixedTotal}만원</strong>`);

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
    html = html.replace("60%", `${c.wageRatio}%`);
  } else {
    html = html.replace('195만원', `${c.netIncome}만원 (적자)`);
    html = html.replace(/195<span class="mega__unit">만<\/span>/, `${Math.abs(c.netIncome)}<span class="mega__unit">만 적자</span>`);
    html = html.replace('6,250원', '적자');
    html = html.replace("60%", '-');
  }

  // 카드8: 폐업률 (업종별)
  html = html.replace('54.6<span class="mega__unit">%</span>', `${c.closureRate}<span class="mega__unit">%</span>`);

  // 카드9: 솔루션 배달비
  html = html.replace('수수료 -143→-30만', c.delivery > 0 ? `수수료 -${c.delivery}→-${Math.round(c.delivery*0.2)}만` : '고정비 절감');

  return html;
}

async function main() {
  const templateV2 = fs.readFileSync(TEMPLATE_V2, 'utf-8');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

  for (const ind of INDUSTRIES) {
    const outDir = path.join(BASE, 'output', ind.tag);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // v2 생성
    const html = generateV2(templateV2, ind);
    const tmpFile = path.join(BASE, 'templates', `_tmp_${ind.tag}.html`);
    fs.writeFileSync(tmpFile, html);

    const url = 'file:///' + tmpFile.split(path.sep).join('/');
    await page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 300));

    console.log(`── ${ind.tag} (${ind.short}) ──`);
    const c = calc(ind);
    console.log(`   매출:${c.revenue} 비용:${c.totalCost} 실수령:${c.netIncome} 시급:${c.hourlyWage} 폐업:${c.closureRate}%`);

    for (let i = 1; i <= 10; i++) {
      const el = await page.$(`#card-${i}`);
      if (!el) continue;
      const name = `v2_${ind.tag}_card_${String(i).padStart(2,'0')}.png`;
      await el.screenshot({ path: path.join(outDir, name) });
    }
    console.log(`   📸 10장 저장 → output/${ind.tag}/`);

    // 임시 파일 삭제
    fs.unlinkSync(tmpFile);
  }

  await browser.close();
  console.log('\n✅ 14업종 × v2 매거진 = 140장 완료');
}

main().catch(console.error);
