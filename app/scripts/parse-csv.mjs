import { readFileSync, writeFileSync, mkdirSync } from 'fs';

function parseTSV(path) {
  const text = readFileSync(path, 'utf-8').replace(/^\ufeff/, '');
  const lines = text.trim().split('\n');
  const headers = lines[0].split('\t');
  return lines.slice(1).map(line => {
    const vals = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || '').trim());
    return obj;
  });
}

function toFranchiseBrand(row, businessTypeId) {
  const num = s => {
    const n = parseInt(s, 10);
    return isNaN(n) ? 0 : n * 1000; // 천원 → 원
  };
  const per33 = parseInt(row['인테리어_3.3m2당'], 10);
  const interiorPerSqm = isNaN(per33) ? 0 : Math.round(per33 * 1000 / 3.3); // 천원/3.3㎡ → 원/㎡

  return {
    name: row['브랜드명'],
    business_type_id: businessTypeId,
    initial_fee: num(row['가입비_가맹비']),
    education_fee: num(row['교육비']),
    deposit: num(row['보증금']),
    interior_per_sqm: interiorPerSqm,
    other_cost: num(row['기타비용']),
    source: '공정거래위원회 가맹사업정보공개서 2024년',
    royalty_rate: 0,
    advertising_rate: 0,
  };
}

const pizza = parseTSV('C:/Users/wows2/Downloads/ftc_pizza_costs_final.csv');
const chicken = parseTSV('C:/Users/wows2/Downloads/ftc_chicken_costs_final.csv');

const validPizza = pizza.filter(r => r['합계'] && r['합계'] !== '' && r['에러'] === '');
const validChicken = chicken.filter(r => r['합계'] && r['합계'] !== '' && r['에러'] === '');

console.log(`Pizza: ${pizza.length} total, ${validPizza.length} valid`);
console.log(`Chicken: ${chicken.length} total, ${validChicken.length} valid`);

// Convert
const pizzaBrands = validPizza.map(r => toFranchiseBrand(r, 8));   // 피자전문점 id: 8
const chickenBrands = validChicken.map(r => toFranchiseBrand(r, 1)); // 치킨전문점 id: 1

// Print samples
console.log('\nSample pizza:', JSON.stringify(pizzaBrands[0], null, 2));
console.log('Sample chicken:', JSON.stringify(chickenBrands[0], null, 2));

// Compute averages for "개인 가게" defaults
function avg(brands, key) {
  const vals = brands.map(b => b[key]).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

console.log('\n--- Pizza averages ---');
console.log('other_cost:', avg(pizzaBrands, 'other_cost'));
console.log('interior_per_sqm:', avg(pizzaBrands, 'interior_per_sqm'));

console.log('\n--- Chicken averages ---');
console.log('other_cost:', avg(chickenBrands, 'other_cost'));
console.log('interior_per_sqm:', avg(chickenBrands, 'interior_per_sqm'));

// Save raw data
mkdirSync('src/data/ftc', { recursive: true });
writeFileSync('src/data/ftc/pizza.json', JSON.stringify(pizzaBrands, null, 2));
writeFileSync('src/data/ftc/chicken.json', JSON.stringify(chickenBrands, null, 2));
console.log('\nSaved to src/data/ftc/pizza.json and chicken.json');
