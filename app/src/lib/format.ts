export function formatKRW(value: number): string {
  if (Number.isNaN(value)) return '0원';
  if (!isFinite(value)) return '∞';
  const formatted = Math.abs(Math.round(value)).toLocaleString('ko-KR');
  return value < 0 ? `-${formatted}원` : `${formatted}원`;
}

export function formatKRWShort(value: number): string {
  if (Number.isNaN(value)) return '0원';
  if (!isFinite(value)) return '∞';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 100_000_000) {
    const bok = abs / 100_000_000;
    return `${sign}${parseFloat(bok.toFixed(1))}억원`;
  }
  if (abs >= 10_000) {
    const man = Math.round(abs / 10_000);
    return `${sign}${man.toLocaleString('ko-KR')}만원`;
  }
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}

export function formatPercent(rate: number, decimals = 1): string {
  if (!isFinite(rate) || Number.isNaN(rate)) return '-';
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function formatMonths(months: number | null): string {
  if (months === null) return '60개월 이내 미회수';
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  if (years === 0) return `${remaining}개월`;
  if (remaining === 0) return `${years}년`;
  return `${years}년 ${remaining}개월`;
}
