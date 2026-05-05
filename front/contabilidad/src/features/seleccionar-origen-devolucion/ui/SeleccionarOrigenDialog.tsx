import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, useTheme } from '@mui/material';
import { IconX, IconReceipt, IconLicense, IconReceipt2 } from '@tabler/icons-react';

import type { TipoOrigen } from '@/shared/model';

const ORIGENES: { tipo: TipoOrigen; label: string; icon: typeof IconReceipt }[] = [
  { tipo: 'compra', label: 'Compra', icon: IconReceipt },
  { tipo: 'extracto', label: 'Extracto', icon: IconLicense },
  { tipo: 'anticipo', label: 'Anticipo', icon: IconReceipt2 },
];

function OrigenOption({ label, icon: Icon, selected, onSelect }: { label: string; icon: typeof IconReceipt; selected: boolean; onSelect: () => void }) {
  const theme = useTheme();
  return (
    <Box
      component="button"
      onClick={onSelect}
      sx={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
        width: 70, pt: 0.5, pb: 1, px: 0.5,
        border: '0.75px solid',
        borderColor: selected ? 'primary.main' : 'grey.200',
        borderRadius: 1,
        bgcolor: selected ? 'rgba(47,67,208,0.08)' : 'transparent',
        boxShadow: selected ? '0px 1px 5px 0px rgba(93,109,126,0.08), 0px 2px 2px 0px rgba(93,109,126,0.12), 0px 3px 1px -2px rgba(93,109,126,0.16)' : 'none',
        cursor: 'pointer', background: selected ? 'linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), #fbfbfb' : 'none',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
        '&:hover': {
          borderColor: 'primary.main',
          background: 'linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), #fbfbfb',
        },
      }}
    >
      <Box sx={{ p: 0.5, borderRadius: 1 }}>
        <Icon size={34} color={selected ? theme.palette.primary.main : theme.palette.action.active} stroke={1.5} />
      </Box>
      <Typography variant="subtitle2" color={selected ? 'text.primary' : 'text.secondary'}>
        {label}
      </Typography>
    </Box>
  );
}

interface SeleccionarOrigenDialogProps {
  open: boolean;
  onSelect: (tipo: TipoOrigen) => void;
  onClose?: () => void;
  selected?: TipoOrigen | null;
}

export function SeleccionarOrigenDialog({ open, onSelect, onClose, selected }: SeleccionarOrigenDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth disableEscapeKeyDown={!onClose} hideBackdrop>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, px: 3 }}>
        <Typography variant="body1" color="text.primary">
          Selecciona un origen
        </Typography>
        {onClose && (
          <IconButton size="small" onClick={onClose} sx={{ p: '3px' }}>
            <IconX size={16} />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, py: 3, px: 1, cursor: 'pointer' }}>
          {ORIGENES.map((o) => (
            <OrigenOption
              key={o.tipo}
              label={o.label}
              icon={o.icon}
              selected={selected === o.tipo}
              onSelect={() => onSelect(o.tipo)}
            />
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export type { TipoOrigen };
