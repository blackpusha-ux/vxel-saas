export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'CAD' | 'TND';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateAgainstEUR: number; // 1 EUR = rate * Currency
}

export const currencies: Record<CurrencyCode, Currency> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rateAgainstEUR: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rateAgainstEUR: 1.08,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'Pound Sterling',
    rateAgainstEUR: 0.85,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar',
    rateAgainstEUR: 1.47,
  },
  TND: {
    code: 'TND',
    symbol: 'د.ت',
    name: 'Dinar Tunisien',
    rateAgainstEUR: 3.38,
  },
};

export function getCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'EUR';
  const saved = localStorage.getItem('vxel_currency') as CurrencyCode;
  if (saved && ['EUR', 'USD', 'GBP', 'CAD', 'TND'].includes(saved)) return saved;
  return 'EUR';
}

export function setCurrency(code: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('vxel_currency', code);
  window.dispatchEvent(new Event('vxel-settings-changed'));
}

export function convertPrice(priceInEUR: number, targetCode?: CurrencyCode): number {
  const code = targetCode || getCurrency();
  const currency = currencies[code] || currencies.EUR;
  return priceInEUR * currency.rateAgainstEUR;
}

export function formatPrice(priceInEUR: number, targetCode?: CurrencyCode): string {
  const code = targetCode || getCurrency();
  const currency = currencies[code] || currencies.EUR;
  const converted = priceInEUR * currency.rateAgainstEUR;

  if (code === 'TND') {
    return `${converted.toFixed(2)} د.ت`;
  }
  if (code === 'CAD') {
    return `CA$ ${converted.toFixed(2)}`;
  }
  return `${currency.symbol} ${converted.toFixed(2)}`;
}
