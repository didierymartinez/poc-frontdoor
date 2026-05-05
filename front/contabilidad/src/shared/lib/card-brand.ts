import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';
import amexLogo from '@/shared/assets/card-brands/amex.png';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'diners' | 'unknown';

export function detectCardBrand(cardNumber?: string): CardBrand {
  if (!cardNumber) return 'unknown';
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return 'unknown';

  const d1 = parseInt(digits[0], 10);
  const d2 = parseInt(digits.slice(0, 2), 10);
  const d3 = parseInt(digits.slice(0, 3), 10);
  const d4 = parseInt(digits.slice(0, 4), 10);

  if (d1 === 4) return 'visa';
  if ((d2 >= 51 && d2 <= 55) || (d4 >= 2221 && d4 <= 2720)) return 'mastercard';
  if (d2 === 34 || d2 === 37) return 'amex';
  if (d2 === 36 || d2 === 38 || (d3 >= 300 && d3 <= 305)) return 'diners';

  return 'unknown';
}

const BRAND_LOGOS: Record<CardBrand, string | null> = {
  mastercard: mastercardLogo,
  visa: visaLogo,
  diners: dinersLogo,
  amex: amexLogo,
  unknown: null,
};

export function getCardBrandLogo(cardNumber?: string): string | null {
  return BRAND_LOGOS[detectCardBrand(cardNumber)];
}

export function formatCardNumber(value?: string): string {
  if (!value) return '—';
  const digits = value.replace(/\D/g, '');
  if (!digits) return '—';
  const last4 = digits.slice(-4);
  return `•••• ${last4}`;
}
