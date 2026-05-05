import {
  Box,
  Chip,
  Typography,
} from '@mui/material';
import {
  IconFileText,
} from '@tabler/icons-react';
import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';
import amexLogo from '@/shared/assets/card-brands/amex.png';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Tipo = 'Compra' | 'Devolución';
export type MedioPago = 'mastercard' | 'visa' | 'diners' | 'amex';

const medioPagoLogos: Record<MedioPago, string> = {
  mastercard: mastercardLogo,
  visa: visaLogo,
  diners: dinersLogo,
  amex: amexLogo,
};

const tipoChipConfig: Record<Tipo, { color: 'primary' | 'default'; variant: 'filled' | 'outlined' }> = {
  Compra: { color: 'primary', variant: 'filled' },
  Devolución: { color: 'primary', variant: 'outlined' },
};

// ---------------------------------------------------------------------------
// Cell components
// ---------------------------------------------------------------------------

export function TipoCell({ tipo }: { tipo: Tipo }) {
  const config = tipoChipConfig[tipo];
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <Chip
        icon={<IconFileText size={14} />}
        label={tipo}
        size="small"
        color={config.color}
        variant='filled'
      />
    </Box>
  );
}

export function MedioPagoCell({ medioPago, numero }: { medioPago: MedioPago; numero: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
      <Box
        sx={{
          width: 23, height: 16, borderRadius: '2.5px', border: '1px solid',
          borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
        }}
      >
        <Box component="img" src={medioPagoLogos[medioPago]} alt={medioPago} sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
      </Box>
      <Typography variant="body2" color="text.secondary" noWrap>{numero}</Typography>
    </Box>
  );
}
