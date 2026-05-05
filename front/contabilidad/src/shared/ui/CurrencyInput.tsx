import { useState } from 'react';
import { InputBase, type SxProps, type Theme } from '@mui/material';

/** Formats a number to es-CO currency display: 3.500,00 */
function formatDisplay(value: number): string {
  if (!value) return '';
  return value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Parses an es-CO formatted string to number: "3.500,00" → 3500 */
function parseInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.,]/g, '');
  // es-CO: dots are thousands, comma is decimal
  return Math.max(0, parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0);
}

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  max?: number;
  sx?: SxProps<Theme>;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function CurrencyInput({ value, onChange, placeholder = '0,00', max, sx, inputProps }: CurrencyInputProps) {
  const [focused, setFocused] = useState(false);
  const [rawText, setRawText] = useState('');

  const handleFocus = () => {
    setFocused(true);
    setRawText(value ? value.toLocaleString('es-CO', { useGrouping: false, minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace('.', ',') : '');
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseInput(rawText);
    const clamped = max != null ? Math.min(parsed, max) : parsed;
    onChange(clamped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip everything except digits, dots and commas (explicitly excludes minus sign)
    const sanitized = e.target.value.replace(/[^0-9.,]/g, '');
    const parsed = parseInput(sanitized);
    if (max != null && parsed > max) return;
    setRawText(sanitized);
    onChange(parsed);
  };

  return (
    <InputBase
      value={focused ? rawText : formatDisplay(value)}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      inputProps={{ inputMode: 'decimal', ...inputProps }}
      sx={[
        {
          '& .MuiInputBase-input': {
            borderBottom: '1px solid transparent',
            transition: 'border-color 0.15s',
            '&:focus': { borderColor: 'primary.main', borderBottomWidth: 2, marginBottom: '-1px' },
            '&:hover': { borderColor: 'grey.400' },
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}
