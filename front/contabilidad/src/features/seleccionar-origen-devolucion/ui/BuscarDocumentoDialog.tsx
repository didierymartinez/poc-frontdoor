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
  Divider,
  IconButton,
  InputBase,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconX,
  IconArrowLeft,
  IconReceipt,
  IconLicense,
  IconReceipt2,
  IconFileDescription,
  IconChevronRight,
  IconFileSymlink,
} from '@tabler/icons-react';
import type { TipoOrigen } from '@/shared/model';
import { EmptyState } from '@/shared/ui';
import { useBuscarDocumento } from '../hooks/useBuscarDocumento';

import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';

const ICON_MAP: Record<TipoOrigen, typeof IconReceipt> = {
  compra: IconReceipt,
  extracto: IconLicense,
  anticipo: IconReceipt2,
};

const LABEL_MAP: Record<TipoOrigen, string> = {
  compra: 'Compra',
  extracto: 'Extracto',
  anticipo: 'Anticipo',
};

const CARD_LOGOS: Record<string, string> = {
  mastercard: mastercardLogo,
  visa: visaLogo,
  diners: dinersLogo,
};

function CardLogo({ brand }: { brand: string }) {
  const logo = CARD_LOGOS[brand];
  if (!logo) return null;
  return (
    <Box sx={{ width: 23, height: 16, borderRadius: '2.5px', border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
      <Box component="img" src={logo} alt="" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
    </Box>
  );
}

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface BuscarDocumentoDialogProps {
  open: boolean;
  tipo: TipoOrigen;
  tercero: { id: string; nombre: string };
  onClose: () => void;
  onBack: () => void;
  onSelect: (documentoId: string) => void;
}

export function BuscarDocumentoDialog({ open, tipo, tercero, onClose, onBack, onSelect }: BuscarDocumentoDialogProps) {
  const theme = useTheme();
  const TipoIcon = ICON_MAP[tipo];
  const {
    selectedId, search, setSearch, filtered, isLoading,
    popperAnchor, popperDoc,
    handleItemClick, handleItemMouseEnter, handleItemMouseLeave,
  } = useBuscarDocumento(tipo, tercero.id, open);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={onBack} sx={{ p: '3px' }}>
            <IconArrowLeft size={16} />
          </IconButton>
          <Chip
            icon={<TipoIcon size={14} />}
            label={LABEL_MAP[tipo]}
            color="primary"
            size="small"
            deleteIcon={<IconChevronRight size={16} style={{ opacity: 0.26 }} />}
            onDelete={() => {}}
          />
          <Chip
            icon={<IconFileDescription size={14} />}
            label={`${tercero.id} - ${tercero.nombre}`}
            color="primary"
            size="small"
          />
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ p: '3px' }}>
          <IconX size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 2, py: 1 }}>
        {/* Search bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, borderBottom: '1px solid', borderColor: 'grey.200', pb: 1 }}>
          <IconFileDescription size={16} color={theme.palette.action.active} />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, alignSelf: 'center' }} />
          <InputBase
            placeholder="No. Documento fuente"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ ...theme.typography.body2 }}
          />
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : filtered.length > 0 ? (
          <Box sx={{ px: 1, py: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
              Sugerencias
            </Typography>
            <List dense sx={{ py: 0.5 }}>
              {filtered.map((doc, i) => (
                <ListItemButton
                  key={doc.id}
                  selected={!doc.disabled && selectedId === doc.id}
                  onClick={() => handleItemClick(doc)}
                  onMouseEnter={(e) => handleItemMouseEnter(e, doc)}
                  onMouseLeave={() => handleItemMouseLeave(doc)}
                  divider={i < filtered.length - 1}
                  sx={{
                    px: 1, py: 1, borderRadius: 0.5,
                    ...(doc.disabled && {
                      opacity: 0.5,
                      cursor: 'default',
                      '&:hover': { bgcolor: 'transparent' },
                    }),
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={!doc.disabled && selectedId === doc.id}
                    disabled={doc.disabled}
                    sx={{ p: 0, mr: 1 }}
                  />
                  <ListItemText
                    primary={doc.id}
                    secondary={`${doc.obligacion} | ${doc.radicador}`}
                    primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CardLogo brand={doc.tarjeta} />
                      <Typography variant="caption" color="text.secondary">{doc.numTarjeta}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={500}>
                      {fmt(doc.monto)} {doc.moneda}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </List>

            {/* Popover para items disabled */}
            <Popper
              open={Boolean(popperAnchor)}
              anchorEl={popperAnchor}
              placement="bottom-start"
              sx={{ zIndex: theme.zIndex.modal + 1 }}
            >
              <Paper elevation={8} sx={{ p: 2, maxWidth: 320, borderRadius: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <IconFileSymlink size={20} color={theme.palette.action.active} style={{ flexShrink: 0, marginTop: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" color="text.primary">
                      {popperDoc?.disabledReason}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {popperDoc?.disabledDetail}
                    </Typography>
                    <Link
                      component="button"
                      underline="none"
                      sx={{ color: 'primary.main', mt: 0.25, textAlign: 'left' }}
                    >
                      <Typography variant="caption" color="primary.main">
                        Ver detalle del anticipo
                      </Typography>
                    </Link>
                  </Box>
                </Box>
              </Paper>
            </Popper>
          </Box>
        ) : (
          <EmptyState
            title="No hay documentos disponibles"
            description={search
              ? `No hay coincidencias para "${search}".`
              : `No se encontraron documentos de ${LABEL_MAP[tipo].toLowerCase()} para este tercero disponibles para devolución.`
            }
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" color="inherit" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="small" variant="contained" disabled={!selectedId} onClick={() => selectedId && onSelect(selectedId)}>
          Seleccionar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
