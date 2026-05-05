import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconArrowLeft,
  IconX,
  IconChevronUp,
  IconChevronDown,
  IconGripHorizontal,
  IconLayoutGrid,
  IconLockOpen,
  IconSearch,
} from '@tabler/icons-react';
import { formatCurrency, getCardBrandLogo } from '@/shared/lib';
import { useDraggableDialog } from '@/shared/hooks/useDraggableDialog';
import type { CrearAnticipoData } from '../model/conciliar-extracto.types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnidadNegocio {
  id: string;
  nombre: string;
  porcentaje: number;
  valorAsignado: number;
}

export interface PartidaContexto {
  descripcion: string;
  fecha: string;
  valor: string;
  moneda: string;
  trm?: string;
}

export interface ExtractoContexto {
  entidadFinanciera: string;
  medioPagoNumero: string;
}

export interface CrearAnticipoDialogProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  onCrear?: (data: CrearAnticipoData) => void;
  partida?: PartidaContexto;
  extracto?: ExtractoContexto;
}

// ---------------------------------------------------------------------------
// Mock options (TODO: replace with real unidades de negocio query)
// ---------------------------------------------------------------------------

const mockOptions = [
  { label: '123456 - Arquitectura y mampostería', id: '123456' },
  { label: '123456 - Tech Innovations', id: '123456b' },
  { label: '654321 - Creative Solutions', id: '654321' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CrearAnticipoDialog({ open, onClose, onBack, onCrear, partida, extracto }: CrearAnticipoDialogProps) {
  const theme = useTheme();
  const { paperRef, onMouseDown } = useDraggableDialog(open);
  const [distribucionOpen, setDistribucionOpen] = useState(true);
  const [unidades, setUnidades] = useState<UnidadNegocio[]>([]);

  const totalPorcentaje = unidades.reduce((sum, u) => sum + u.porcentaje, 0);
  const totalValor = unidades.reduce((sum, u) => sum + u.valorAsignado, 0);

  const cardLogo = getCardBrandLogo(extracto?.medioPagoNumero);

  const handleCrear = () => {
    const data: CrearAnticipoData = {
      justificacion: `Anticipo creado desde conciliación — ${partida?.descripcion ?? ''}`,
      instruccionDistribucion: unidades.length > 0
        ? unidades.map((u) => ({ unidadOrganizacional: u.id, porcentaje: u.porcentaje / 100 }))
        : undefined,
    };
    onCrear?.(data);
    setUnidades([]);
    onClose();
  };

  const handleClose = () => {
    setUnidades([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      disableScrollLock
      slotProps={{
        paper: { ref: paperRef, sx: { width: 600, borderRadius: 1 } },
        backdrop: { sx: { backgroundColor: 'transparent' } },
      }}
    >
      <DialogTitle
        onMouseDown={onMouseDown}
        sx={{ px: 3, pt: 2, pb: 1, cursor: 'grab', '&:active': { cursor: 'grabbing' }, userSelect: 'none' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconGripHorizontal size={14} color={theme.palette.text.disabled} />
            {onBack && (
              <IconButton size="small" onClick={onBack}>
                <IconArrowLeft size={16} />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight={600}>Crear anticipo</Typography>
          </Box>
          <IconButton size="small" onClick={handleClose}>
            <IconX size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Encabezado — entidad + medio de pago */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              bgcolor: 'rgba(47,67,208,0.04)',
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <Typography variant="body2" color="text.primary">
              {extracto?.entidadFinanciera ?? '-'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.primary">
                {extracto?.medioPagoNumero || '-'}
              </Typography>
              {cardLogo && (
                <Box sx={{
                  width: 24, height: 24, borderRadius: '2.5px',
                  overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Box component="img" src={cardLogo} alt="card" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </Box>
              )}
            </Box>
          </Box>

          {/* Body — datos de la partida */}
          <Box
            sx={{
              bgcolor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 1.5,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            {/* Descripción + Monto */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="body2" color="text.primary">
                  {partida?.descripcion ?? '-'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {partida?.fecha ?? '-'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <Typography variant="body2" color="text.primary">
                    {partida?.valor ?? '$ 0,00'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {partida?.moneda ?? ''}
                  </Typography>
                </Box>
                {partida?.trm && (
                  <Typography variant="caption" color="text.secondary">
                    TRM {partida.trm}
                  </Typography>
                )}
              </Box>
            </Box>

            <Divider />

            {/* Distribuir unidad de negocio — collapsible */}
            <Box
              onClick={() => setDistribucionOpen(!distribucionOpen)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.5,
                cursor: 'pointer',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Distribuir unidad de negocio
              </Typography>
              {distribucionOpen
                ? <IconChevronUp size={14} color={theme.palette.text.secondary} />
                : <IconChevronDown size={14} color={theme.palette.text.secondary} />
              }
            </Box>

            <Collapse in={distribucionOpen}>
              <Box sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 1, bgcolor: 'background.paper' }}>
                <Autocomplete
                  options={mockOptions}
                  size="small"
                  popupIcon={<IconSearch size={16} />}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Buscar y agregar" />
                  )}
                  onChange={(_e, val) => {
                    if (val) {
                      setUnidades((prev) => [
                        ...prev,
                        { id: val.id + prev.length, nombre: val.label, porcentaje: 0, valorAsignado: 0 },
                      ]);
                    }
                  }}
                  sx={{ mb: 1.5 }}
                />

                {unidades.length === 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3, gap: 1 }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: 'grey.100', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconLayoutGrid size={24} color={theme.palette.text.disabled} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">Agrega Unidad de negocio</Typography>
                  </Box>
                )}

                {unidades.length > 0 && (
                  <Box>
                    {/* Header */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 140px 42px', bgcolor: 'grey.100', borderRadius: 0.5, height: 24, alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Unidad de negocio</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>Porcentaje</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ px: 1, textAlign: 'right' }}>Valor asignado</Typography>
                      <Box />
                    </Box>

                    {/* Rows */}
                    {unidades.map((u, idx) => (
                      <Box key={u.id} sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 140px 42px', alignItems: 'center', height: 28, borderBottom: '0.5px solid', borderColor: 'grey.200', '&:hover': { bgcolor: 'action.hover' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, overflow: 'hidden' }}>
                          <IconLockOpen size={16} color={theme.palette.text.secondary} />
                          <Typography variant="body2" color="text.primary" noWrap>{u.nombre}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.primary" sx={{ px: 1, textAlign: 'right' }}>{u.porcentaje}%</Typography>
                        <Typography variant="body2" color="text.primary" sx={{ px: 1, textAlign: 'right' }}>{formatCurrency(u.valorAsignado)}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton size="small" sx={{ p: 0.125 }} onClick={() => setUnidades((prev) => prev.filter((_, i) => i !== idx))}>
                            <IconX size={14} color={theme.palette.text.secondary} />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}

                    {/* Total */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 140px 42px', alignItems: 'center', height: 28, px: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">Total</Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'right' }}>{totalPorcentaje}%</Typography>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textAlign: 'right' }}>{formatCurrency(totalValor)}</Typography>
                      <Box />
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button variant="text" onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleCrear}>
          Crear y vincular
        </Button>
      </DialogActions>
    </Dialog>
  );
}
