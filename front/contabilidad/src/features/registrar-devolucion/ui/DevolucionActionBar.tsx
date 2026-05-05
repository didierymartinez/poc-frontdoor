import { useState } from 'react';
import { Box, Button, Divider, IconButton, Menu, MenuItem, Popover, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { IconChevronDown, IconChevronUp, IconInfoCircle } from '@tabler/icons-react';

function fmt(value?: number): string {
  if (value == null) return '$ 0,00';
  return `$ ${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface FiscalItem {
  nombre: string;
  valor: string;
}

interface DevolucionActionBarProps {
  total?: number;
  subtotal?: number;
  impuestos?: FiscalItem[];
  totalImpuestos?: number;
  retenciones?: FiscalItem[];
  totalRetenciones?: number;
  onRadicar?: () => void;
  onConfirmar?: () => void;
  disabled?: boolean;
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

export function DevolucionActionBar({
  total,
  subtotal,
  impuestos = [],
  totalImpuestos,
  retenciones = [],
  totalRetenciones,
  onRadicar,
  onConfirmar,
  disabled = false,
}: DevolucionActionBarProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
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
          borderRadius: 0.5,
          pl: 1,
          pr: 0.5,
          py: 0.5,
          height: 24,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Total devolución
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
            {fmt(total)}
          </Typography>
          {hasDetails && (
            <IconButton
              size="small"
              sx={{ p: 0.375 }}
              onClick={(e) => setAnchorEl(popoverOpen ? null : e.currentTarget)}
            >
              {popoverOpen
                ? <IconChevronDown size={16} color={theme.palette.text.primary} />
                : <IconChevronUp size={16} color={theme.palette.text.primary} />}
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="contained"
          endIcon={<IconChevronDown size={16} />}
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          disabled={disabled}
        >
          {disabled ? 'Procesando...' : 'Confirmar'}
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
          <MenuItem onClick={() => { setMenuAnchor(null); onRadicar?.(); }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.primary">Registrar</Typography>
              <Tooltip title="Registra la devolución en estado pendiente" arrow>
                <Box sx={{ display: 'flex' }}><IconInfoCircle size={14} color="#5D6D7E" /></Box>
              </Tooltip>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => { setMenuAnchor(null); onConfirmar?.(); }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" color="text.primary">Confirmar</Typography>
              <Tooltip title="Registra y confirma la devolución directamente" arrow>
                <Box sx={{ display: 'flex' }}><IconInfoCircle size={14} color="#5D6D7E" /></Box>
              </Tooltip>
            </Box>
          </MenuItem>
        </Menu>
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
            {subtotal != null && <SummaryLine label="Subtotal" value={fmt(subtotal)} bold />}

            {impuestos.length > 0 && (
              <>
                <SummaryLine label="Total impuestos" value={fmt(totalImpuestos)} bold />
                <Box sx={{ pl: 1.5 }}>
                  {impuestos.map((i) => (
                    <SummaryLine key={i.nombre} label={i.nombre} value={i.valor} />
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
