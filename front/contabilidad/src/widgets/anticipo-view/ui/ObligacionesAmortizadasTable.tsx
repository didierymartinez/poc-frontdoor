import {
  Box,
  Chip,
  Typography,
} from '@mui/material';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { ObligacionRow } from './anticipo-view-types';

const COL_OBL_TIPO = 140;
const COL_OBL_REF = 220;
const COL_OBL_FECHA = 120;

export function ObligacionesAmortizadasTable({ rows = [] }: { rows?: ObligacionRow[] }) {
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
        <Typography variant="caption" color="text.secondary" sx={{ width: COL_OBL_TIPO, px: 1, py: 0.5 }}>
          Tipo
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: COL_OBL_REF, px: 1, py: 0.5 }}>
          Referencia
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ width: COL_OBL_FECHA, px: 1, py: 0.5 }}>
          Fecha
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, px: 1, py: 0.5, textAlign: 'right' }}>
          Valor regularizado
        </Typography>
      </Box>

      {/* Rows */}
      {rows.map((obl, i) => (
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
          <Box sx={{ width: COL_OBL_TIPO, px: 1 }}>
            <Chip
              label={obl.tipo}
              size="small"
              color={obl.tipoColor ?? 'default'}
              variant="filled"
              sx={{ height: 20 }}
            />
          </Box>
          <Box sx={{ width: COL_OBL_REF, px: 1 }}>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              {obl.referencia}
            </Typography>
          </Box>
          <Box sx={{ width: COL_OBL_FECHA, px: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconCalendarEvent size={14} color="rgba(16,24,64,0.6)" />
            <Typography variant="body2" color="text.secondary">
              {obl.fecha}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, px: 1 }}>
            <Typography variant="body2" color="text.primary" textAlign="right">
              {obl.valor}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
