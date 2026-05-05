import type { ChangeEvent } from 'react';
import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';
import amexLogo from '@/shared/assets/card-brands/amex.png';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TerceroOption { label: string; id: string }

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const TARJETAS_DEFAULT = [
  { value: 'visa-default', label: 'Visa **** 0000', logo: visaLogo },
  { value: 'mastercard-default', label: 'Mastercard **** 0000', logo: mastercardLogo },
  { value: 'amex-default', label: 'Amex **** 0000', logo: amexLogo },
  { value: 'diners-default', label: 'Diners **** 0000', logo: dinersLogo },
];

export const OCR_FIELD_BORDER = 'rgba(59, 130, 246, 0.4)';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Allow only digits, dots (thousands) and comma (decimal) */
export function sanitizeNumeric(value: string): string {
  return value.replace(/[^0-9.,]/g, '');
}

export function handleNumericChange(
  setter: (v: string) => void,
) {
  return (e: ChangeEvent<HTMLInputElement>) => {
    setter(sanitizeNumeric(e.target.value));
  };
}
