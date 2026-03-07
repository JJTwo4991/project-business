interface TaxBracket {
  limit: number;
  rate: number;
  deduction: number;
}

const TAX_BRACKETS: TaxBracket[] = [
  { limit: 14_000_000,    rate: 0.06, deduction: 0 },
  { limit: 50_000_000,    rate: 0.15, deduction: 1_260_000 },
  { limit: 88_000_000,    rate: 0.24, deduction: 5_760_000 },
  { limit: 150_000_000,   rate: 0.35, deduction: 15_440_000 },
  { limit: 300_000_000,   rate: 0.38, deduction: 19_940_000 },
  { limit: 500_000_000,   rate: 0.40, deduction: 25_940_000 },
  { limit: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { limit: Infinity,      rate: 0.45, deduction: 65_940_000 },
];

export function calcIncomeTax(annualTaxableIncome: number): number {
  if (annualTaxableIncome <= 0) return 0;
  const bracket = TAX_BRACKETS.find(b => annualTaxableIncome <= b.limit) ?? TAX_BRACKETS[TAX_BRACKETS.length - 1];
  return Math.round(annualTaxableIncome * bracket.rate - bracket.deduction);
}

export function calcLocalTax(incomeTax: number): number {
  return Math.round(incomeTax * 0.1);
}

export function calcTotalTax(monthlyPretaxIncome: number): number {
  if (monthlyPretaxIncome <= 0) return 0;
  const annual = monthlyPretaxIncome * 12;
  const incomeTax = calcIncomeTax(annual);
  const localTax = calcLocalTax(incomeTax);
  return Math.round((incomeTax + localTax) / 12);
}

export function calcEffectiveTaxRate(monthlyPretaxIncome: number): number {
  if (monthlyPretaxIncome <= 0) return 0;
  const tax = calcTotalTax(monthlyPretaxIncome);
  return tax / monthlyPretaxIncome;
}
