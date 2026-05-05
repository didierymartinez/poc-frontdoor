import { useState } from 'react';
import {
  Box,
  Divider,
  Popover,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { IconChevronDown } from '@tabler/icons-react';
import type { Extracto } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import { formatCurrency, resolveMoneda } from './extracto-helpers';

// ---------------------------------------------------------------------------
// SummaryLine (private helper — only used inside TotalResumen)
// ---------------------------------------------------------------------------

function SummaryLine({ label, value, variant = 'caption' }: { label: string; value: string; variant?: 'body2' | 'caption' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.125 }}>
      <Typography variant={variant} color="text.secondary">{label}</Typography>
      <Typography variant={variant} color="text.primary">{value}</Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// TotalResumen
// ---------------------------------------------------------------------------

export function TotalResumen({ data }: { data?: Extracto }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const total = data?.totales?.[0];
  const totalVal = total?.totalAPagar?.valor ?? 0;
  const moneda = resolveMoneda(total?.moneda);

  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);
  const totalUbicacion = total?.totalAPagar?.ubicacion as HighlightSource | undefined;

  return (
    <Box
      sx={{ ml: 'auto' }}
      onMouseEnter={() => { if (totalUbicacion?.pageNumber) setHighlightSource(totalUbicacion); }}
      onMouseLeave={() => setHighlightSource(null)}
    >
      <Box
        onClick={(e) => setAnchorEl(open ? null : e.currentTarget)}
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5,
          bgcolor: 'rgba(47,67,208,0.04)', border: '1px solid', borderColor: 'rgba(47,67,208,0.08)',
          borderRadius: 0.5, px: 1, py: 0.5, cursor: 'pointer',
        }}
      >
        <Typography variant="body2" color="text.secondary">Total</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="subtitle2" color="primary.main" fontWeight={500}>
            $ {formatCurrency(totalVal)}
          </Typography>
          <Typography variant="body2" color="primary.main">{moneda}</Typography>
          <IconChevronDown
            size={16} color={theme.palette.primary.main}
            style={{ transform: open ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
          />
        </Box>
      </Box>

      <Popover
        open={open} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 2, p: 2, width: 300, mt: 0.5 } }, backdrop: { sx: { backgroundColor: 'transparent' } } }}
      >
        <Stack spacing={0.75}>
          <SummaryLine label="Total transacciones" value={String(data?.movimientos?.length ?? 0)} variant="body2" />
          <Divider sx={{ my: 0.25 }} />
          <SummaryLine label="Total a pagar" value={`$ ${formatCurrency(totalVal)}`} variant="body2" />
        </Stack>
      </Popover>
    </Box>
  );
}
