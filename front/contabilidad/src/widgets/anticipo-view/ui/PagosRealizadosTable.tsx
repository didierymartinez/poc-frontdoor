import {
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { PagoRow } from './anticipo-view-types';

const COL_TIPO = 120;
const COL_REF = 220;
const COL_FECHA = 120;

export function PagosRealizadosTable({ rows = [] }: { rows?: PagoRow[] }) {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'grey.50',
          borderRadius: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ width: COL_TIPO, px: 1, py: 0.5 }}>
          Tipo
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: COL_REF, px: 1, py: 0.5 }}>
          Referencia
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: COL_FECHA, px: 1, py: 0.5 }}>
          Fecha
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, px: 1, py: 0.5, textAlign: 'right' }}>
          Valor aplicado
        </Typography>
      </Box>

      {/* Rows */}
      {rows.map((pago, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            py: 1.5,
            borderBottom: '0.5px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box sx={{ width: COL_TIPO, px: 1 }}>
            <Chip
              label={pago.tipo}
              size="small"
              color={pago.tipoColor ?? 'default'}
              variant="filled"
              sx={{ height: 20 }}
            />
          </Box>
          <Box sx={{ width: COL_REF, px: 1 }}>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {pago.referencia}
            </Typography>
          </Box>
          <Box sx={{ width: COL_FECHA, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconCalendarEvent size={14} color="rgba(16,24,64,0.6)" />
            <Typography variant="body2" color="text.secondary">
              {pago.fecha}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, px: 1 }}>
            <Typography variant="body2" color="text.primary" textAlign="right">
              {pago.valor}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
