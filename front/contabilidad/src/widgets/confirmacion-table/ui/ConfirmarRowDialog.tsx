import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
} from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import type { InfoLine } from '../lib/info-lines';

interface ConfirmarRowDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirmar: () => void;
  title: string;
  lines: InfoLine[];
  loading?: boolean;
}

export function ConfirmarRowDialog({ open, onClose, onConfirmar, title, lines, loading }: ConfirmarRowDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
        <IconCheck size={20} />
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Confirma que la información es correcta antes de aprobar.
        </Typography>
        <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="text" onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={onConfirmar} disabled={loading}>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
