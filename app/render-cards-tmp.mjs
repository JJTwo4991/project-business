import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const BASE = 'C:/Users/wows2/Project Business/card-news';
const OUT = path.join(BASE, 'output');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const variants = [
  { file: 'card-template-v2-magazine.html', tag: 'v2_mag', cards: 10 },
];

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

for (const v of variants) {
  const url = 'file:///' + path.join(BASE, 'templates', v.file).split(path.sep).join('/');
  console.log('── ' + v.tag);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  const count = v.cards || 1;
  for (let i = 1; i <= count; i++) {
    const el = await page.$('#card-' + i);
    if (!el) { console.log('  miss ' + i); continue; }
    const name = v.tag + '_card_' + String(i).padStart(2,'0') + '.png';
    await el.screenshot({ path: path.join(OUT, name) });
    console.log('  📸 ' + name);
  }
}

await browser.close();
console.log('✅ done');
