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
  useTheme,
} from '@mui/material';
import { IconAlertTriangle, IconGripHorizontal, IconX } from '@tabler/icons-react';
import { useDraggableDialog } from '@/shared/hooks/useDraggableDialog';

interface DevolverDialogProps {
  open: boolean;
  onClose: () => void;
  onDevolver?: (motivo: string, observaciones: string) => void;
}

export function DevolverDialog({ open, onClose, onDevolver }: DevolverDialogProps) {
  const theme = useTheme();
  const { paperRef, onMouseDown } = useDraggableDialog(open);
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const handleDevolver = () => {
    onDevolver?.(motivo, observaciones);
    setMotivo('');
    setObservaciones('');
    onClose();
  };

  const handleClose = () => {
    setMotivo('');
    setObservaciones('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      disableScrollLock
      slotProps={{
        paper: { ref: paperRef, sx: { width: 520, borderRadius: 2 } },
        backdrop: { sx: { backgroundColor: 'transparent' } },
      }}
    >
      <DialogTitle
        onMouseDown={onMouseDown}
        sx={{ px: 3, pt: 3, pb: 1, cursor: 'grab', '&:active': { cursor: 'grabbing' }, userSelect: 'none' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconGripHorizontal size={14} color={theme.palette.text.disabled} />
            <IconAlertTriangle size={20} color={theme.palette.warning.main} />
            <Typography variant="h6" fontWeight={600}>
              Devolver extracto conciliado
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <IconX size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Las obligaciones seleccionadas se devolverán a etapa de conciliación para
          corrección. Selecciona un motivo de devolución y registrar observación.
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
          label="Motivo de devolución"
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          sx={{ mb: 2 }}
        >
          <MenuItem value="error_conciliacion">Error en conciliación</MenuItem>
          <MenuItem value="datos_incorrectos">Datos incorrectos</MenuItem>
          <MenuItem value="falta_soporte">Falta soporte</MenuItem>
          <MenuItem value="otro">Otro</MenuItem>
        </TextField>

        <TextField
          fullWidth
          size="small"
          label="Observaciones"
          required
          multiline
          minRows={3}
          placeholder="Escribe un comentario sobre ..."
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="text" onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleDevolver}
          sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
        >
          Devolver
        </Button>
      </DialogActions>
    </Dialog>
  );
}
