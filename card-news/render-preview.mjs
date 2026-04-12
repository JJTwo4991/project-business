import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'output');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const variants = [
  { file: 'card-template-v1-kakao.html', tag: 'v1_kakao', cards: 7 },
  { file: 'card-template-v2-poll.html',  tag: 'v2_poll',  cards: 1 },
  { file: 'card-template-v3-news.html',  tag: 'v3_news',  cards: 1 },
  { file: 'card-template-v4-label.html', tag: 'v4_label', cards: 1 },
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

for (const v of variants) {
  const url = 'file:///' + path.join(__dirname, 'templates', v.file).replace(/\\/g,'/');
  console.log(`\n── ${v.tag} ──`);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  for (let i = 1; i <= v.cards; i++) {
    const el = await page.$(`#card-${i}`);
    if (!el) { console.log(`  ⚠️ card-${i} not found`); continue; }
    const name = `${v.tag}_card_${String(i).padStart(2,'0')}.png`;
    await el.screenshot({ path: path.join(OUT, name) });
    console.log(`  📸 ${name}`);
  }
}

await browser.close();
console.log(`\n✅ Saved to ${OUT}`);
