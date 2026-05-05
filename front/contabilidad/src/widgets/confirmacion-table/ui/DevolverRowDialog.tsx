import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';

interface InfoLine {
  label: string;
  value: string;
}

interface DevolverRowDialogProps {
  open: boolean;
  onClose: () => void;
  onDevolver: (motivo: string, observaciones: string) => void;
  title: string;
  lines: InfoLine[];
  loading?: boolean;
}

export function DevolverRowDialog({ open, onClose, onDevolver, title, lines, loading }: DevolverRowDialogProps) {
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const handleDevolver = () => {
    onDevolver(motivo, observaciones);
    setMotivo('');
    setObservaciones('');
  };

  const handleClose = () => {
    setMotivo('');
    setObservaciones('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
        <IconAlertTriangle size={20} color="#f96800" />
        {title}
      </DialogTitle>
      <DialogContent>
        {/* Row info summary */}
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, mb: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {lines.map((line, i) => (
            <Box key={i}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">{line.label}</Typography>
                <Typography variant="body2" color="text.primary">{line.value}</Typography>
              </Box>
              {i < lines.length - 1 && <Divider sx={{ mt: 0.75 }} />}
            </Box>
          ))}
        </Box>

        <TextField
          select
          fullWidth
          size="small"
          label="Motivo de devolución"
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{ select: { MenuProps: { slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } } } }}
        >
          <MenuItem value="error_datos">Error en datos</MenuItem>
          <MenuItem value="falta_soporte">Falta soporte</MenuItem>
          <MenuItem value="datos_incorrectos">Datos incorrectos</MenuItem>
          <MenuItem value="otro">Otro</MenuItem>
        </TextField>

        <TextField
          fullWidth
          size="small"
          label="Observaciones"
          required
          multiline
          minRows={2}
          placeholder="Detalle del motivo de devolución..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleDevolver}
          disabled={!motivo || loading}
          sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
        >
          Devolver
        </Button>
      </DialogActions>
    </Dialog>
  );
}
