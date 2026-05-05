import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { IconX, IconSearch, IconPlus, IconGripHorizontal } from '@tabler/icons-react';
import { CrearAnticipoDialog } from './CrearAnticipoDialog';
import { useDraggableDialog } from '@/shared/hooks/useDraggableDialog';
import { useVincularObligacion } from '../hooks/useVincularObligacion';

import type { PartidaContexto, ExtractoContexto } from './CrearAnticipoDialog';

interface VincularObligacionDialogProps {
  open: boolean;
  onClose: () => void;
  onVincular?: (selected: string[]) => Promise<void> | void;
  onCrearAnticipo?: (data: import('../model/conciliar-extracto.types').CrearAnticipoData) => void;
  tipo: 'comercio' | 'anticipo' | 'devolucion';
  partidaContexto?: PartidaContexto;
  extractoContexto?: ExtractoContexto;
  linkedIds?: string[];
}

const tipoLabels: Record<string, string> = {
  comercio: 'obligación de comercio',
  anticipo: 'un anticipo',
  devolucion: 'una devolución',
};

const tipoConfig: Record<string, { multiSelect: boolean; showSubtitle: boolean; createLabel?: string }> = {
  comercio: { multiSelect: true, showSubtitle: true },
  anticipo: { multiSelect: false, showSubtitle: false, createLabel: 'Crear anticipo' },
  devolucion: { multiSelect: false, showSubtitle: false },
};

export function VincularObligacionDialog({ open, onClose, onVincular, onCrearAnticipo, tipo, partidaContexto, extractoContexto, linkedIds }: VincularObligacionDialogProps) {
  const theme = useTheme();
  const { paperRef, onMouseDown } = useDraggableDialog(open);
  const config = tipoConfig[tipo];

  const {
    search, setSearch, selected, crearAnticipoOpen, setCrearAnticipoOpen,
    toggleSelect, handleVincular, handleClose,
    obligaciones, isPending, isSubmitting,
  } = useVincularObligacion(config, tipo, open, onVincular, onClose, linkedIds);

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : handleClose}
      maxWidth={false}
      disableScrollLock
      slotProps={{
        paper: { ref: paperRef, sx: { width: 600, borderRadius: 2 } },
        backdrop: { sx: { backgroundColor: 'transparent' } },
      }}
    >
      <DialogTitle
        onMouseDown={onMouseDown}
        sx={{ px: 3, pt: 3, pb: 1, cursor: 'grab', '&:active': { cursor: 'grabbing' }, userSelect: 'none' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconGripHorizontal size={14} color={theme.palette.text.disabled} />
              <Typography variant="h6" fontWeight={600}>
                Buscar y vincular {tipoLabels[tipo]}
              </Typography>
            </Box>
            {config.showSubtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ pl: 2.5 }}>
                Seleccionar una o varios obligaciones disponibles para vincular
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={handleClose} disabled={isSubmitting}>
            <IconX size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={`Buscar ${tipoLabels[tipo]}`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1.5 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={16} />
                </InputAdornment>
              ),
            },
          }}
        />

        {isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : obligaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
            No se encontraron {tipo === 'comercio' ? 'obligaciones' : 'anticipos'} disponibles
          </Typography>
        ) : (
          <Box>
            {obligaciones.map((ob) => {
              const isLinked = linkedIds?.includes(ob.id) ?? false;
              const isDisabled = isLinked && tipo === 'comercio';
              return (
                <Box
                  key={ob.id}
                  onClick={isDisabled ? undefined : () => toggleSelect(ob.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    px: 0.5,
                    borderBottom: '0.5px solid',
                    borderColor: 'grey.200',
                    cursor: isDisabled ? 'default' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                    '&:hover': isDisabled ? {} : { bgcolor: 'action.hover' },
                  }}
                >
                  {config.multiSelect && (
                    <Checkbox
                      size="small"
                      checked={isLinked || selected.includes(ob.id)}
                      disabled={isDisabled}
                      sx={{ p: 0.5, mr: 1 }}
                    />
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.primary" fontWeight={500}>
                      {ob.codigo}
                    </Typography>
                    {ob.tercero && (
                      <Typography variant="caption" color="text.secondary">
                        {ob.tercero}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isLinked && tipo === 'anticipo' && (
                      <Chip label="Ya vinculado" size="small" color="warning" variant="outlined" sx={{ height: 20, fontSize: '0.6875rem' }} />
                    )}
                    <Typography variant="body2" color="text.primary">
                      {ob.monto}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ob.moneda}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {config.createLabel && (
          <Box
            onClick={() => setCrearAnticipoOpen(true)}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pt: 2, pb: 1, cursor: 'pointer' }}
          >
            <IconPlus size={16} color={theme.palette.primary.main} />
            <Typography variant="body2" color="primary.main" fontWeight={500}>
              {config.createLabel}
            </Typography>
          </Box>
        )}
      </DialogContent>

      {config.multiSelect && (
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button variant="text" onClick={handleClose} disabled={isSubmitting}>Cancelar</Button>
          <Button variant="contained" disabled={selected.length === 0 || isSubmitting} onClick={handleVincular}>
            {isSubmitting ? <CircularProgress size={18} color="inherit" /> : 'Vincular'}
          </Button>
        </DialogActions>
      )}

      <CrearAnticipoDialog
        open={crearAnticipoOpen}
        onClose={() => { setCrearAnticipoOpen(false); handleClose(); }}
        onBack={() => setCrearAnticipoOpen(false)}
        onCrear={(data) => { onCrearAnticipo?.(data); handleClose(); }}
        partida={partidaContexto}
        extracto={extractoContexto}
      />
    </Dialog>
  );
}
