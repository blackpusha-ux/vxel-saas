export const currencyRates: Record<string, { rate: number; symbol: string; prefix: boolean }> = {
  CAD: { rate: 1.0, symbol: 'CA$', prefix: true },
  USD: { rate: 0.74, symbol: '$', prefix: true },
  EUR: { rate: 0.68, symbol: '€', prefix: false },
  GBP: { rate: 0.58, symbol: '£', prefix: true },
  TND: { rate: 2.30, symbol: 'د.ت', prefix: false },
};

export function getPriceInCurrency(baseCAD: number, currency: string): number {
  const info = currencyRates[currency] || currencyRates.CAD;
  return baseCAD * info.rate;
}

export function formatPrice(amount: number, currency: string): string {
  const info = currencyRates[currency] || currencyRates.CAD;
  const formatted = amount.toFixed(2);
  if (currency === 'TND') {
    return `${formatted} د.ت`;
  }
  if (info.prefix) {
    return `${info.symbol}${formatted}`;
  }
  return `${formatted} ${info.symbol}`;
}
