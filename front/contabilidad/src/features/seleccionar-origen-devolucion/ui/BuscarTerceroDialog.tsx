import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconX,
  IconArrowLeft,
  IconReceipt,
  IconLicense,
  IconReceipt2,
  IconBuilding,
} from '@tabler/icons-react';
import { borradorQueries } from '@/entities/borrador';
import { EmptyState } from '@/shared/ui';
import type { TipoOrigen } from '@/shared/model';

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

interface BuscarTerceroDialogProps {
  open: boolean;
  tipo: TipoOrigen;
  onClose: () => void;
  onSelect: (tercero: { id: string; nombre: string }) => void;
}

export function BuscarTerceroDialog({ open, tipo, onClose, onSelect }: BuscarTerceroDialogProps) {
  const theme = useTheme();
  const TipoIcon = ICON_MAP[tipo];
  const [search, setSearch] = useState('');

  const comercioQuery = useQuery({ ...borradorQueries.comerciosDisponiblesDevolucion(), enabled: open && tipo === 'compra' });
  const extractoQuery = useQuery({ ...borradorQueries.extractosDisponiblesDevolucion(), enabled: open && tipo === 'extracto' });
  const anticipoQuery = useQuery({ ...borradorQueries.anticiposDisponiblesDevolucion(), enabled: open && tipo === 'anticipo' });

  const rawData = tipo === 'compra' ? comercioQuery.data : tipo === 'extracto' ? extractoQuery.data : anticipoQuery.data;
  const isLoading = tipo === 'compra' ? comercioQuery.isLoading : tipo === 'extracto' ? extractoQuery.isLoading : anticipoQuery.isLoading;

  const terceros = useMemo(() => {
    if (!rawData) return [];
    const map = new Map<string, { id: string; nombre: string; count: number }>();
    for (const item of rawData) {
      const id = item.terceroIdentificacion;
      const nombre = item.terceroNombre;
      const existing = map.get(id);
      if (existing) {
        existing.count++;
      } else {
        map.set(id, { id, nombre, count: 1 });
      }
    }
    return [...map.values()]
      .sort((a, b) => b.count - a.count)
      .map((t, i) => ({ id: t.id, nombre: t.nombre, frecuente: i === 0 }));
  }, [rawData]);

  const filtered = search
    ? terceros.filter((s) => `${s.id} - ${s.nombre}`.toLowerCase().includes(search.toLowerCase()))
    : terceros;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={onClose} sx={{ p: '3px' }}>
            <IconArrowLeft size={16} />
          </IconButton>
          <Chip
            icon={<TipoIcon size={14} />}
            label={LABEL_MAP[tipo]}
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
          <IconBuilding size={16} color={theme.palette.action.active} />
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 16, alignSelf: 'center' }} />
          <InputBase
            placeholder="Selecciona un tercero"
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
              {filtered.map((s, i) => (
                <ListItemButton
                  key={s.id}
                  onClick={() => onSelect(s)}
                  divider={i < filtered.length - 1}
                  sx={{ px: 1, py: 1 }}
                >
                  <ListItemText
                    primary={`${s.id} - ${s.nombre}`}
                    primaryTypographyProps={{ variant: 'body1' }}
                  />
                  {s.frecuente && (
                    <Typography variant="caption" color="text.secondary">
                      Más frecuente
                    </Typography>
                  )}
                </ListItemButton>
              ))}
            </List>
          </Box>
        ) : terceros.length === 0 ? (
          <EmptyState
            title={`No hay ${LABEL_MAP[tipo].toLowerCase()}s disponibles`}
            description={`No se encontraron ${LABEL_MAP[tipo].toLowerCase()}s con estado válido para registrar una devolución.`}
          />
        ) : (
          <EmptyState
            title="Sin resultados"
            description={`No hay coincidencias para "${search}".`}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
