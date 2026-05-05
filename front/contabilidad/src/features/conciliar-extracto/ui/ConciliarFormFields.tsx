import { Box, Typography, useTheme } from '@mui/material';
import { IconCalendarEvent } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { AgregadoOxpExtracto } from '@/entities/borrador';
import { MONEDA_MAP } from '@/entities/borrador';
import { detectCardBrand, getCardBrandLogo } from '@/shared/lib';
import { ConciliarTotalResumen } from './ConciliarTotalResumen';

function maskCard(numero?: string): string {
  if (!numero) return '—';
  const last4 = numero.slice(-4);
  return `XXXX - XXXX - XXXX - ${last4}`;
}

function fmtDate(iso?: string | null): string {
  if (!iso) return '—';
  return dayjs(iso).format('DD/MM/YYYY');
}

export function ConciliarFormFields({ borrador }: { borrador?: AgregadoOxpExtracto }) {
  const theme = useTheme();
  const cardNum = borrador?.medioPago?.numero ?? '';
  const brand = detectCardBrand(cardNum);
  const logo = getCardBrandLogo(cardNum);
  const moneda = borrador?.partidas[0]?.valor.moneda;
  const monedaLabel = moneda != null ? (MONEDA_MAP[moneda] ?? '') : '';
  const total = borrador?.partidas.reduce((sum, p) => sum + p.valor.valor, 0) ?? 0;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 3, alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="caption" color="text.secondary">Entidad bancaria</Typography>
        <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ mt: 0.25 }}>
          {borrador?.informacionTercero.nombre || '—'}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">Medio de pago</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          {logo && (
            <Box sx={{ width: 23, height: 16, borderRadius: '2.5px', border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              <Box component="img" src={logo} alt={brand} sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
            </Box>
          )}
          <Typography variant="body2" color="text.primary" noWrap>{maskCard(cardNum)}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">Periodo facturado</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
          <IconCalendarEvent size={14} color={theme.palette.action.active} />
          <Typography variant="body2" color="text.primary">{fmtDate(borrador?.periodo?.desde)}</Typography>
          <Typography variant="body2" color="text.secondary">→</Typography>
          <Typography variant="body2" color="text.primary">{fmtDate(borrador?.periodo?.hasta)}</Typography>
        </Box>
      </Box>
      <ConciliarTotalResumen total={total} moneda={monedaLabel} partidasCount={borrador?.partidas.length ?? 0} totalCargos={0} />
    </Box>
  );
}
