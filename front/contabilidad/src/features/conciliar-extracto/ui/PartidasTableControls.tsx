import { useState } from 'react';
import {
  Box,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';
import { IconColumns3, IconFilter } from '@tabler/icons-react';

const COLUMN_OPTIONS = [
  { label: 'Diferencia', defaultChecked: false },
  { label: 'Tolerancia', defaultChecked: false },
  { label: 'Transacción', defaultChecked: true },
  { label: 'Código', defaultChecked: true },
  { label: 'Movimiento', defaultChecked: true },
];

const ESTADO_FILTERS = ['Compra', 'Anticipo', 'Devolución', 'Disputa'];

export function ColumnsToggle({ checked, onToggle }: { checked: string[]; onToggle: (label: string) => void }) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <IconColumns3 size={18} color={theme.palette.text.secondary} />
      </IconButton>
      <Menu
        anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} disableScrollLock
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 180, mt: 0.5 } }, root: { sx: { '& .MuiBackdrop-root': { backgroundColor: 'transparent' } } } }}
      >
        {COLUMN_OPTIONS.map((col) => (
          <MenuItem key={col.label} onClick={() => onToggle(col.label)} sx={{ py: 0.5 }}>
            <Checkbox size="small" checked={checked.includes(col.label)} sx={{ p: 0.5, mr: 1 }} />
            <Typography variant="body2" color="text.primary">{col.label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function EstadoFilterHeader() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [checked, setChecked] = useState<string[]>(ESTADO_FILTERS);
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ px: 0.5 }}>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
        <Typography variant="body3" color="text.secondary">Estado</Typography>
        <IconFilter size={12} color={theme.palette.text.secondary} />
      </Box>
      <Menu
        anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)} disableScrollLock
        slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 180, mt: 0.5 } }, root: { sx: { '& .MuiBackdrop-root': { backgroundColor: 'transparent' } } } }}
      >
        {ESTADO_FILTERS.map((label) => (
          <MenuItem key={label} onClick={() => setChecked((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label])} sx={{ py: 0.5 }}>
            <Checkbox size="small" checked={checked.includes(label)} sx={{ p: 0.5, mr: 1 }} />
            <Typography variant="body2" color="text.primary">{label}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
