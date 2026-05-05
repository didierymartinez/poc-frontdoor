import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  MenuItem,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import type { FiscalItem } from './FiscalSubTable';

interface FiscalOption {
  tipo: string;
  tarifas: number[];
  defaultTarifa: number;
}

interface AgregarFiscalPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onAdd: (item: FiscalItem) => void;
  base: number;
  existingTipos: string[];
  opciones: FiscalOption[];
  titulo?: string;
}

export function AgregarFiscalPopover({ anchorEl, onClose, onAdd, base, existingTipos, opciones, titulo = 'Agregar impuesto' }: AgregarFiscalPopoverProps) {
  const availableOptions = opciones.filter((o) => !existingTipos.includes(o.tipo));
  const [tipo, setTipo] = useState('');
  const [tarifa, setTarifa] = useState(0);

  const selectedOption = opciones.find((o) => o.tipo === tipo);
  const valorCalculado = base * (tarifa / 100);

  // Reset when popover opens
  useEffect(() => {
    if (anchorEl) {
      const first = availableOptions[0];
      setTipo(first?.tipo ?? '');
      setTarifa(first?.defaultTarifa ?? 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorEl]);

  // Update tarifa when tipo changes
  useEffect(() => {
    if (selectedOption) setTarifa(selectedOption.defaultTarifa);
  }, [tipo, selectedOption]);

  const handleAdd = () => {
    if (!tipo || !tarifa) return;
    onAdd({
      tipo,
      base,
      tarifa: `${tarifa}%`,
      valor: Math.round(valorCalculado * 100) / 100,
      distri: 0,
    });
    onClose();
  };

  const fmt = (v: number) => v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: { sx: { borderRadius: 2, p: 2, width: 280 } },
        backdrop: { sx: { backgroundColor: 'transparent' } },
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>{titulo}</Typography>

      {availableOptions.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Ya se agregaron todos los tipos disponibles.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              select
              label="Tipo"
              size="small"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              fullWidth
            >
              {availableOptions.map((o) => (
                <MenuItem key={o.tipo} value={o.tipo}>{o.tipo}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Tarifa"
              size="small"
              value={tarifa}
              onChange={(e) => setTarifa(Number(e.target.value))}
              fullWidth
            >
              {(selectedOption?.tarifas ?? []).map((t) => (
                <MenuItem key={t} value={t}>{t}%</MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', bgcolor: 'grey.50', borderRadius: 0.5, px: 1.5, py: 1 }}>
              <Typography variant="body2" color="text.secondary">Valor</Typography>
              <Typography variant="body2" fontWeight={500}>$ {fmt(valorCalculado)}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button size="small" color="inherit" onClick={onClose}>Cancelar</Button>
            <Button size="small" variant="contained" onClick={handleAdd} disabled={!tipo}>Agregar</Button>
          </Box>
        </>
      )}
    </Popover>
  );
}
