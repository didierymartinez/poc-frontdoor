import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import { MOTIVO_DISPUTA } from '@/entities/borrador';

const MOTIVOS = [
  { value: MOTIVO_DISPUTA.ErrorBancario, label: 'Error bancario' },
  { value: MOTIVO_DISPUTA.FraudePotencial, label: 'Fraude potencial' },
  { value: MOTIVO_DISPUTA.NoReconocida, label: 'Transacción no reconocida' },
] as const;

interface DisputaDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: number) => void;
}

export function DisputaDialog({ open, onClose, onConfirm }: DisputaDialogProps) {
  const [motivo, setMotivo] = useState<number | ''>('');

  const handleConfirm = () => {
    if (motivo !== '') {
      onConfirm(motivo);
      setMotivo('');
      onClose();
    }
  };

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Marcar partida en disputa
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selecciona el motivo por el cual esta partida se marca en disputa.
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Motivo</InputLabel>
          <Select
            value={motivo}
            label="Motivo"
            onChange={(e) => setMotivo(e.target.value as number)}
          >
            {MOTIVOS.map((m) => (
              <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="text" onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" disabled={motivo === ''} onClick={handleConfirm}>Confirmar</Button>
      </DialogActions>
    </Dialog>
  );
}
