import { Box, Chip, Typography, useTheme } from '@mui/material';
import type { AgregadoOxpExtracto } from '@/entities/borrador';

const ESTADO_LABEL: Record<number, string> = {
  0: 'Borrador',
  1: 'Pendiente',
  2: 'Conciliado',
  3: 'Parcialmente conciliado',
  4: 'Confirmado',
  5: 'Causado',
  6: 'Pagado',
  7: 'Descartado',
};

const ESTADO_COLOR: Record<number, 'default' | 'warning' | 'success' | 'info' | 'error'> = {
  0: 'default',
  1: 'warning',
  2: 'success',
  3: 'info',
  4: 'success',
  5: 'info',
  6: 'success',
  7: 'error',
};

export function ConciliarViewHeader({ borrador }: { borrador?: AgregadoOxpExtracto }) {
  const theme = useTheme();
  const estado = borrador?.estado ?? 0;
  const color = ESTADO_COLOR[estado] ?? 'default';
  const label = ESTADO_LABEL[estado] ?? 'Desconocido';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#E1E6FF',
        mx: -3,
        mt: -3,
        px: 3,
        py: 1.5,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          {borrador?.id ? `OXP-EXT-${borrador.id.slice(0, 8).toUpperCase()}` : '—'}
        </Typography>
        <Chip
          label={label}
          variant="outlined"
          size="small"
          color={color}
          sx={{
            bgcolor: color === 'default' ? 'grey.100' : `${color}.50`,
            color: color === 'default' ? theme.palette.text.secondary : theme.palette[color].main,
            fontWeight: 500,
            height: 22,
            fontSize: '0.75rem',
          }}
        />
      </Box>
    </Box>
  );
}
