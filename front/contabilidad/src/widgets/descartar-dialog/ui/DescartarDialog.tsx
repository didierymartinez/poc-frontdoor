import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { IconAlertTriangle, IconX } from '@tabler/icons-react';

const MOTIVOS = [
  'Información incorrecta',
  'Documento ilegible',
  'Falta información',
  'Duplicado',
  'Otro',
];

interface DescartarDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo: string, observacion: string) => void;
  loading?: boolean;
  titulo?: string;
}

export function DescartarDialog({ open, onClose, onConfirm, loading, titulo }: DescartarDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [observacion, setObservacion] = useState('');

  const handleConfirm = () => {
    onConfirm(motivo, observacion);
  };

  const handleClose = () => {
    if (loading) return;
    setMotivo('');
    setObservacion('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              bgcolor: 'warning.100',
              borderRadius: '50px',
              p: 0.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconAlertTriangle size={20} color="#f96800" />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            {titulo ?? 'Descartar borrador'}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} disabled={loading}>
          <IconX size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, px: 2, py: 1 }}>
        <Typography variant="body2" color="text.primary">
          El borrador será descartado y no podrá ser recuperado.
          <br />
          Selecciona un motivo y registra una observación.
        </Typography>

        <TextField
          select
          label="Motivo de descarte"
          required
          size="small"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          fullWidth
        >
          {MOTIVOS.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>

        <TextField
          label="Observaciones"
          required
          size="small"
          multiline
          rows={3}
          placeholder="Escribe un comentario sobre ..."
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          fullWidth
        />
      </DialogContent>

      <DialogActions sx={{ p: 1, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} sx={{ color: 'text.primary' }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!motivo || !observacion || loading}
          sx={{
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            '&:hover': { bgcolor: 'warning.dark' },
          }}
        >
          {loading ? 'Descartando...' : 'Descartar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
