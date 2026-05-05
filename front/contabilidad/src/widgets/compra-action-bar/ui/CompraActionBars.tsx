import { useState } from 'react';
import { Box, Button, CircularProgress, Divider, IconButton, Menu, MenuItem, Popover, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { IconChevronDown, IconChevronUp, IconInfoCircle } from '@tabler/icons-react';

function fmt(v?: number) {
  if (v == null) return '$ 0,00';
  return `$ ${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Shared fiscal helpers
// ---------------------------------------------------------------------------

interface FiscalItem { nombre: string; valor: string }

interface FiscalProps {
  subtotal?: number;
  impuestos?: FiscalItem[];
  retenciones?: FiscalItem[];
  totalImpuestos?: number;
  totalRetenciones?: number;
}

function SummaryLine({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.125 }}>
      <Typography variant={bold ? 'body2' : 'caption'} color="text.secondary" fontWeight={bold ? 500 : 400}>
        {label}
      </Typography>
      <Typography variant={bold ? 'body2' : 'caption'} color="text.primary" fontWeight={bold ? 500 : 400}>
        {value}
      </Typography>
    </Box>
  );
}

function TotalPill({ total, moneda, fiscal }: { total?: number; moneda?: string; fiscal?: FiscalProps }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const popoverOpen = Boolean(anchorEl);
  const hasDetails = fiscal && (fiscal.subtotal != null || (fiscal.impuestos?.length ?? 0) > 0 || (fiscal.retenciones?.length ?? 0) > 0);

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'background.paper', borderRadius: 1, pl: 1, pr: 0.5, py: 0.5, height: 24 }}>
        <Typography variant="caption" color="text.secondary">Total</Typography>
        <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
          {total != null ? fmt(total) : '$ 0,00'}
        </Typography>
        {moneda && <Typography variant="caption" color="text.secondary">{moneda}</Typography>}
        {hasDetails && (
          <IconButton size="small" sx={{ p: 0.375 }} onClick={(e) => setAnchorEl(popoverOpen ? null : e.currentTarget)}>
            {popoverOpen
              ? <IconChevronDown size={16} color={theme.palette.text.primary} />
              : <IconChevronUp size={16} color={theme.palette.text.primary} />
            }
          </IconButton>
        )}
      </Box>
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
            {fiscal!.subtotal != null && <SummaryLine label="Subtotal" value={fmt(fiscal!.subtotal)} bold />}
            {(fiscal!.impuestos?.length ?? 0) > 0 && (
              <>
                <SummaryLine label="Total impuestos" value={fmt(fiscal!.totalImpuestos)} bold />
                <Box sx={{ pl: 1.5 }}>
                  {fiscal!.impuestos!.map((i) => <SummaryLine key={i.nombre} label={i.nombre} value={i.valor} />)}
                </Box>
              </>
            )}
            {(fiscal!.retenciones?.length ?? 0) > 0 && (
              <>
                <Divider sx={{ my: 0.25 }} />
                <SummaryLine label="Total retenciones" value={fmt(fiscal!.totalRetenciones)} bold />
                <Box sx={{ pl: 1.5 }}>
                  {fiscal!.retenciones!.map((r) => <SummaryLine key={r.nombre} label={r.nombre} value={r.valor} />)}
                </Box>
              </>
            )}
          </Stack>
        </Popover>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Pendiente action bar
// ---------------------------------------------------------------------------

export function PendienteActionBar({ total, moneda, subtotal, impuestos, retenciones, totalImpuestos, totalRetenciones, onEnviarConfirmacion, onConfirmar, onDevolver, guardando, onGuardarDraft, guardandoDraft }: FiscalProps & {
  total?: number;
  moneda?: string;
  onEnviarConfirmacion: () => void;
  onConfirmar: () => void;
  onDevolver: () => void;
  guardando?: boolean;
  onGuardarDraft?: () => void;
  guardandoDraft?: boolean;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

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
        background: (theme) => `linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), ${theme.palette.background.paper}`,
        overflow: 'visible',
      }}
    >
      <TotalPill total={total} moneda={moneda} fiscal={{ subtotal, impuestos, retenciones, totalImpuestos, totalRetenciones }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {onGuardarDraft && (
          <Button
            variant="outlined"
            onClick={onGuardarDraft}
            disabled={guardando || guardandoDraft}
            startIcon={guardandoDraft ? <CircularProgress size={14} /> : undefined}
          >
            {guardandoDraft ? 'Guardando...' : 'Guardar'}
          </Button>
        )}
        <Button variant="text" color="primary" onClick={onDevolver} disabled={guardando}>Devolver</Button>
        <Button
          variant="contained"
          endIcon={<IconChevronDown size={16} />}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={guardando}
        >
          {guardando ? 'Procesando...' : 'Acciones'}
        </Button>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          slotProps={{
            paper: { elevation: 8, sx: { borderRadius: 1, mt: -1 } },
            backdrop: { sx: { backgroundColor: 'transparent' } },
          }}
        >
          <MenuItem
            onClick={() => { setMenuAnchor(null); onEnviarConfirmacion(); }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.primary">Enviar a confirmación</Typography>
              <Tooltip title="Guarda los cambios y requiere confirmación para causar" arrow>
                <Box sx={{ display: 'flex' }}><IconInfoCircle size={14} color="#5D6D7E" /></Box>
              </Tooltip>
            </Box>
          </MenuItem>
          <MenuItem
            onClick={() => { setMenuAnchor(null); onConfirmar(); }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.primary">Confirmar</Typography>
              <Tooltip title="Confirma la obligación y la envía a causación" arrow>
                <Box sx={{ display: 'flex' }}><IconInfoCircle size={14} color="#5D6D7E" /></Box>
              </Tooltip>
            </Box>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Devuelta action bar
// ---------------------------------------------------------------------------

export function DevueltaActionBar({ total, moneda, subtotal, impuestos, retenciones, totalImpuestos, totalRetenciones, onCorregir, guardando }: FiscalProps & {
  total?: number;
  moneda?: string;
  onCorregir: () => void;
  guardando?: boolean;
}) {
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
        borderColor: 'warning.light',
        background: (theme) => `linear-gradient(90deg, rgba(249,104,0,0.08) 0%, rgba(249,104,0,0.08) 100%), ${theme.palette.background.paper}`,
        overflow: 'visible',
      }}
    >
      <TotalPill total={total} moneda={moneda} fiscal={{ subtotal, impuestos, retenciones, totalImpuestos, totalRetenciones }} />
      <Button variant="contained" onClick={onCorregir} disabled={guardando}>
        {guardando ? 'Enviando...' : 'Corregir y reenviar'}
      </Button>
    </Box>
  );
}
