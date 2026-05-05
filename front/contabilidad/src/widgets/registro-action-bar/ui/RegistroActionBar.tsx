import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconChevronUp,
  IconChevronDown,
  IconInfoCircle,
} from '@tabler/icons-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FiscalItem {
  nombre: string;
  valor: string;
}

export interface RegistroActionBarProps {
  total?: number;
  moneda?: string;
  subtotal?: number;
  impuestos?: FiscalItem[];
  retenciones?: FiscalItem[];
  totalImpuestos?: number;
  totalRetenciones?: number;
  recalculado?: boolean;
  onGuardar?: () => void;
  onDescartar?: () => void;
  guardando?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(value?: number): string {
  if (value == null) return '$ 0,00';
  return `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function SummaryLine({ label, value, bold, highlighted }: { label: string; value: string; bold?: boolean; highlighted?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.125 }}>
      <Typography variant={bold ? 'body2' : 'caption'} color="text.secondary" fontWeight={bold ? 500 : 400}>
        {label}
      </Typography>
      <Typography variant={bold ? 'body2' : 'caption'} color={highlighted ? 'primary.main' : 'text.primary'} fontWeight={bold ? 500 : 400}>
        {value}
      </Typography>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function RegistroActionBar({
  total,
  moneda,
  subtotal,
  impuestos = [],
  retenciones = [],
  totalImpuestos,
  totalRetenciones,
  recalculado,
  onGuardar,
  onDescartar,
  guardando,
}: RegistroActionBarProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(anchorEl);
  const hasDetails = subtotal != null || impuestos.length > 0 || retenciones.length > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderRadius: 1,
        border: '0.5px solid',
        borderColor: 'primary.light',
        background: `linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), ${theme.palette.background.paper}`,
        overflow: 'visible',
      }}
    >
      {/* Left: Total pill */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          pl: 1,
          pr: 0.5,
          py: 0.5,
          height: 24,
        }}
      >
        <Typography variant="caption" color="text.secondary">Total</Typography>
        <Tooltip title={recalculado ? 'Valor recalculado a partir de los conceptos editados' : ''} arrow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {recalculado && <IconInfoCircle size={14} color="#2F43D0" />}
            <Typography variant="subtitle1" color={recalculado ? 'primary.main' : 'text.primary'} fontWeight={500}>
              {fmt(total)}
            </Typography>
          </Box>
        </Tooltip>
        {moneda && (
          <Typography variant="caption" color="text.secondary">{moneda}</Typography>
        )}
        {hasDetails && (
          <IconButton
            size="small"
            sx={{ p: 0.375 }}
            onClick={(e) => setAnchorEl(popoverOpen ? null : e.currentTarget)}
          >
            {popoverOpen
              ? <IconChevronDown size={16} color={theme.palette.text.primary} />
              : <IconChevronUp size={16} color={theme.palette.text.primary} />
            }
          </IconButton>
        )}
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant="text" color="primary" onClick={onDescartar} disabled={guardando}>Descartar</Button>
        <Button data-testid="enviar-confirmacion-button" variant="contained" onClick={onGuardar} disabled={guardando}>
          {guardando ? 'Enviando...' : 'Enviar a confirmación'}
        </Button>
      </Box>

      {/* Popover: Financial summary */}
      {hasDetails && (
        <Popover
          open={popoverOpen}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            paper: { sx: { borderRadius: 2, p: 2, width: 300, mb: 1 } },
            backdrop: { sx: { backgroundColor: 'transparent' } },
          }}
        >
          <Stack spacing={0.75}>
            {subtotal != null && <SummaryLine label="Subtotal" value={fmt(subtotal)} bold highlighted={recalculado} />}

            {impuestos.length > 0 && (
              <>
                <SummaryLine label="Total impuestos" value={fmt(totalImpuestos)} bold highlighted={recalculado} />
                <Box sx={{ pl: 1.5 }}>
                  {impuestos.map((i) => (
                    <SummaryLine key={i.nombre} label={i.nombre} value={i.valor} highlighted={recalculado} />
                  ))}
                </Box>
              </>
            )}

            {retenciones.length > 0 && (
              <>
                <Divider sx={{ my: 0.25 }} />
                <SummaryLine label="Total retenciones" value={fmt(totalRetenciones)} bold />
                <Box sx={{ pl: 1.5 }}>
                  {retenciones.map((r) => (
                    <SummaryLine key={r.nombre} label={r.nombre} value={r.valor} />
                  ))}
                </Box>
              </>
            )}
          </Stack>
        </Popover>
      )}
    </Box>
  );
}
