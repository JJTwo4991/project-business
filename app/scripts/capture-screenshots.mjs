/**
 * 앱 화면 캡처 스크립트 — 제안서/카드뉴스용
 * Usage: node scripts/capture-screenshots.mjs
 *
 * Step order: select-industry → industry-transition → select-region → select-scale
 *   → investment-breakdown → set-investment → set-loan → transition-operating
 *   → set-customers(q1~q5+summary) → set-ticket → set-labor → set-rent → set-sga → confirm
 *   → business-mbti → result-daily → result-monthly
 */
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:5180';
const OUTPUT_DIR = path.resolve('screenshots');
const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 2 };

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${name}.png`), fullPage: false });
  console.log(`  📸 ${name}`);
}

async function clickByText(page, text, timeout = 4000) {
  const el = await page.waitForFunction(
    (t) => {
      const els = [...document.querySelectorAll('button, [role="button"]')];
      return els.find(e => e.textContent?.includes(t) && !e.disabled);
    },
    { timeout },
    text
  );
  await el.click();
  await sleep(600);
}

async function clickNext(page) {
  await clickByText(page, '다음');
}

async function captureFlow(page, industryName, tag) {
  console.log(`\n── ${tag} ──`);

  // 1. Home → select industry
  await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  await sleep(800);
  await screenshot(page, `${tag}_01_업종선택`);

  // 2. Click industry
  await clickByText(page, industryName);
  await sleep(1200);
  await screenshot(page, `${tag}_02_업종소개`);

  // 3. industry-transition → 시작하기
  await clickByText(page, '시작하기');
  await sleep(600);

  // 4. select-region (지역)
  await screenshot(page, `${tag}_03_지역선택`);
  await clickNext(page);
  await sleep(600);

  // 5. select-scale (규모)
  await screenshot(page, `${tag}_04_규모선택`);
  // Click 중형 card then 다음
  try { await clickByText(page, '중형', 2000); } catch {}
  await sleep(300);
  await clickNext(page);
  await sleep(600);

  // 6. investment-breakdown (창업방식 선택 → 투자비 상세)
  await screenshot(page, `${tag}_05_창업방식`);
  await clickByText(page, '개인사업');
  await sleep(800);
  await screenshot(page, `${tag}_06_투자비상세`);
  await clickNext(page);
  await sleep(600);

  // 7. set-investment
  await screenshot(page, `${tag}_07_투자금`);
  await clickNext(page);
  await sleep(600);

  // 8. set-loan
  await screenshot(page, `${tag}_08_대출`);
  await clickNext(page);
  await sleep(2000);

  // 9. transition-operating
  await screenshot(page, `${tag}_09_운영전환`);
  await clickByText(page, '준비됐어요');
  await sleep(600);

  // 10. set-customers Q1 (영업요일)
  await screenshot(page, `${tag}_10_영업요일`);
  await clickNext(page);
  await sleep(600);

  // 11. Q2 (영업시간)
  await screenshot(page, `${tag}_11_영업시간`);
  await clickNext(page);
  await sleep(600);

  // 12. Q3 (바쁜요일)
  await screenshot(page, `${tag}_12_바쁜요일`);
  try {
    await clickByText(page, '모든 요일이 비슷해요', 2000);
  } catch {
    await clickNext(page);
  }
  await sleep(600);

  // 13. Q5 (방문객수)
  await screenshot(page, `${tag}_13_방문객수`);
  await clickNext(page);
  await sleep(3500);

  // 14. Summary
  await screenshot(page, `${tag}_14_방문객요약`);
  await clickByText(page, '다음으로');
  await sleep(600);

  // 15. set-ticket (객단가)
  await screenshot(page, `${tag}_15_객단가`);
  await clickNext(page);
  await sleep(600);

  // 16. set-labor (인건비)
  await screenshot(page, `${tag}_16_인건비`);
  await clickNext(page);
  await sleep(600);

  // 17. set-rent (임대료)
  await screenshot(page, `${tag}_17_임대료`);
  await clickNext(page);
  await sleep(600);

  // 18. set-sga (기타비용)
  await screenshot(page, `${tag}_18_기타비용`);
  await clickNext(page);
  await sleep(600);

  // 19. confirm (확인)
  await screenshot(page, `${tag}_19_확인`);
  // fullPage screenshot for confirm
  await page.screenshot({ path: path.join(OUTPUT_DIR, `${tag}_19_확인_full.png`), fullPage: true });
  await clickByText(page, '시뮬레이션 결과 보기', 3000).catch(() => clickByText(page, '결과'));
  await sleep(1500);

  // 20. BOSS card
  await screenshot(page, `${tag}_20_보스카드`);
  await clickByText(page, '광고 보고 계산내역 확인하기');
  await sleep(1200);

  // 21. result-daily
  await screenshot(page, `${tag}_21_일손익`);

  // Next → result-monthly
  try {
    await clickNext(page);
    await sleep(800);
    await screenshot(page, `${tag}_22_월손익`);
  } catch {}

  console.log(`  ✅ ${tag} 완료`);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  const scenarios = [
    ['치킨', 'chicken'],
    ['카페', 'cafe'],
    ['편의점', 'conv'],
    ['미용실', 'hair'],
    ['분식', 'bunsik'],
  ];

  for (const [name, tag] of scenarios) {
    try {
      await captureFlow(page, name, tag);
    } catch (e) {
      console.error(`  ❌ ${tag} 실패: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\n📁 저장 완료: ${OUTPUT_DIR}`);
}

main().catch(console.error);
