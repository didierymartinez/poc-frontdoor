import { useState } from 'react';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconChevronDown,
  IconLink,
  IconShoppingCart,
  IconFileText,
  IconArrowBack,
  IconCircleOff,
  IconCircleHalf2,
  IconReportMoney,
  IconArrowBackUpDouble,
  IconUnlink,
  IconRefresh,
  IconTrash,
} from '@tabler/icons-react';
import { VincularObligacionDialog } from './VincularObligacionDialog';
import { DisputaDialog } from './DisputaDialog';
import type { PartidaRow, ConciliacionCallbacks, CrearAnticipoData } from '../model/conciliar-extracto.types';
import type { PartidaContexto, ExtractoContexto } from './CrearAnticipoDialog';
import type { VinculacionExtracto, CoberturaAnticipoExtracto } from '@/entities/borrador';

function VincularMenu({ children, row, callbacks, extractoContexto, onActiveChange, vinculaciones, coberturasAnticipo }: { children: React.ReactNode; row: PartidaRow; callbacks?: ConciliacionCallbacks; extractoContexto?: ExtractoContexto; onActiveChange?: (partidaId: string | null) => void; vinculaciones?: VinculacionExtracto[]; coberturasAnticipo?: CoberturaAnticipoExtracto[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuOpen = Boolean(anchorEl);
  const [dialogTipo, setDialogTipo] = useState<'comercio' | 'anticipo' | 'devolucion' | 'reclasificar' | null>(null);
  const [disputaOpen, setDisputaOpen] = useState(false);

  const isDisputa = row.estadoTipo === 'disputa';

  const handleVincularComercio = async (selectedIds: string[]) => {
    if (callbacks && selectedIds.length > 0) {
      await callbacks.onVincularComercio(row.partidaId, selectedIds, { valor: row.valorRaw, moneda: row.monedaRaw });
    }
  };

  const handleReclasificar = async (selectedIds: string[]) => {
    if (callbacks && selectedIds.length > 0) {
      callbacks.onReclasificar(row.partidaId, selectedIds[0]);
    }
  };

  const handleVincularAnticipo = (selectedIds: string[]) => {
    if (callbacks && selectedIds.length > 0) {
      callbacks.onCubrirConAnticipo(row.partidaId, selectedIds[0], { valor: row.valorRaw, moneda: row.monedaRaw });
    }
  };

  const handleVincularDevolucion = (selectedIds: string[]) => {
    if (callbacks && selectedIds.length > 0) {
      callbacks.onCubrirConDevolucion(row.partidaId, selectedIds[0], { valor: row.valorRaw, moneda: row.monedaRaw });
    }
  };

  const handleCrearAnticipo = (data: CrearAnticipoData) => {
    callbacks?.onCrearYVincularAnticipo(row.partidaId, data);
  };

  const partidaContexto: PartidaContexto = {
    descripcion: row.movimiento,
    fecha: row.transaccion,
    valor: row.valor,
    moneda: row.moneda,
  };

  const handleDisputa = (motivo: number) => {
    callbacks?.onMarcarDisputa(row.partidaId, motivo);
  };

  const defaultMenuItems: { icon: React.ReactNode; label: string; action: () => void; disabled?: boolean; tooltip?: string }[] = [
    { icon: <IconShoppingCart size={16} />, label: 'Vincular compra', action: () => { setAnchorEl(null); setDialogTipo('comercio'); onActiveChange?.(row.partidaId); } },
    { icon: <IconFileText size={16} />, label: 'Vincular anticipo', action: () => { setAnchorEl(null); setDialogTipo('anticipo'); onActiveChange?.(row.partidaId); } },
    { icon: <IconArrowBack size={16} />, label: 'Vincular devolución', action: () => { setAnchorEl(null); setDialogTipo('devolucion'); onActiveChange?.(row.partidaId); } },
    { icon: <IconCircleOff size={16} />, label: 'Marcar partida en disputa', action: () => { setAnchorEl(null); setDisputaOpen(true); onActiveChange?.(row.partidaId); } },
  ];

  const disputaMenuItems: { icon: React.ReactNode; label: string; action: () => void; disabled?: boolean; tooltip?: string }[] = [
    { icon: <IconRefresh size={16} />, label: 'Reclasificar (vincular compra)', action: () => { setAnchorEl(null); setDialogTipo('reclasificar'); onActiveChange?.(row.partidaId); } },
    { icon: <IconTrash size={16} />, label: 'Descartar (reverso bancario)', action: () => setAnchorEl(null), disabled: true, tooltip: 'Requiere seleccionar extracto de reverso' },
  ];

  const menuItems = isDisputa ? disputaMenuItems : defaultMenuItems;

  return (
    <>
      <Box onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ cursor: 'pointer', '&:hover': { opacity: 0.85 } }}>
        {children}
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        disableScrollLock
        slotProps={{
          paper: { sx: { borderRadius: 2, minWidth: 220, mt: 0.5 } },
          root: { sx: { '& .MuiBackdrop-root': { backgroundColor: 'transparent' } } },
        }}
      >
        {menuItems.map((item) => {
          const menuItem = (
            <MenuItem key={item.label} onClick={item.disabled ? undefined : item.action} disabled={item.disabled} sx={{ py: 1 }}>
              <ListItemIcon sx={{ color: 'text.secondary', minWidth: 32 }}>{item.icon}</ListItemIcon>
              <ListItemText><Typography variant="body2" color="text.primary">{item.label}</Typography></ListItemText>
            </MenuItem>
          );
          return item.tooltip ? (
            <Tooltip key={item.label} title={item.tooltip} placement="right">
              <span>{menuItem}</span>
            </Tooltip>
          ) : menuItem;
        })}
      </Menu>
      {dialogTipo === 'comercio' && (
        <VincularObligacionDialog
          open
          tipo="comercio"
          onClose={() => { setDialogTipo(null); onActiveChange?.(null); }}
          onVincular={handleVincularComercio}
          linkedIds={vinculaciones?.filter((v) => v.partidaId === row.partidaId).map((v) => v.referenciaId)}
        />
      )}
      {dialogTipo === 'reclasificar' && (
        <VincularObligacionDialog
          open
          tipo="comercio"
          onClose={() => { setDialogTipo(null); onActiveChange?.(null); }}
          onVincular={handleReclasificar}
          linkedIds={vinculaciones?.filter((v) => v.partidaId === row.partidaId).map((v) => v.referenciaId)}
        />
      )}
      {dialogTipo === 'anticipo' && (
        <VincularObligacionDialog
          open
          tipo="anticipo"
          onClose={() => { setDialogTipo(null); onActiveChange?.(null); }}
          onVincular={handleVincularAnticipo}
          onCrearAnticipo={handleCrearAnticipo}
          partidaContexto={partidaContexto}
          extractoContexto={extractoContexto}
          linkedIds={coberturasAnticipo?.filter((c) => c.partidaId === row.partidaId).map((c) => c.anticipoId)}
        />
      )}
      {dialogTipo === 'devolucion' && (
        <VincularObligacionDialog
          open
          tipo="devolucion"
          onClose={() => { setDialogTipo(null); onActiveChange?.(null); }}
          onVincular={handleVincularDevolucion}
        />
      )}
      <DisputaDialog
        open={disputaOpen}
        onClose={() => { setDisputaOpen(false); onActiveChange?.(null); }}
        onConfirm={handleDisputa}
      />
    </>
  );
}

export function EstadoCell({ row, callbacks, extractoContexto, onActiveChange, vinculaciones, coberturasAnticipo }: { row: PartidaRow; callbacks?: ConciliacionCallbacks; extractoContexto?: ExtractoContexto; onActiveChange?: (partidaId: string | null) => void; vinculaciones?: VinculacionExtracto[]; coberturasAnticipo?: CoberturaAnticipoExtracto[] }) {
  const theme = useTheme();

  if (row.estadoTipo === 'none') {
    return <Typography variant="body2" color="text.disabled" sx={{ textAlign: 'right' }}>-</Typography>;
  }

  if (row.estadoTipo === 'sin_vincular') {
    return (
      <VincularMenu row={row} callbacks={callbacks} extractoContexto={extractoContexto} onActiveChange={onActiveChange} vinculaciones={vinculaciones} coberturasAnticipo={coberturasAnticipo}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'grey.50', borderRadius: 0.5, p: 0.5 }}>
          <IconUnlink size={16} color={theme.palette.text.secondary} />
          <Typography variant="body2" color="text.primary" sx={{ flex: 1 }} noWrap>{row.estado}</Typography>
          <IconChevronDown size={16} color={theme.palette.text.secondary} />
        </Box>
      </VincularMenu>
    );
  }

  if (row.estadoTipo === 'link') {
    return (
      <VincularMenu row={row} callbacks={callbacks} extractoContexto={extractoContexto} onActiveChange={onActiveChange} vinculaciones={vinculaciones} coberturasAnticipo={coberturasAnticipo}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(47,67,208,0.04)', borderRadius: 0.5, p: 0.5 }}>
          <IconLink size={16} color={theme.palette.primary.main} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.primary" noWrap>{row.estado}</Typography>
            {row.vinculadoA && (
              <>
                <Divider orientation="vertical" flexItem sx={{ height: 12, alignSelf: 'center' }} />
                <Typography variant="body2" color="text.secondary" noWrap>{row.vinculadoA}</Typography>
              </>
            )}
          </Box>
          {row.estadoExtra && (
            <Box sx={{ bgcolor: 'grey.50', borderRadius: '100px', px: 0.625, py: '2.5px', flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.6875rem', lineHeight: 1 }}>{row.estadoExtra}</Typography>
            </Box>
          )}
          <IconChevronDown size={16} color={theme.palette.text.secondary} />
        </Box>
      </VincularMenu>
    );
  }

  if (row.estadoTipo === 'anticipo') {
    return (
      <VincularMenu row={row} callbacks={callbacks} extractoContexto={extractoContexto} onActiveChange={onActiveChange} vinculaciones={vinculaciones} coberturasAnticipo={coberturasAnticipo}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(249,104,0,0.04)', borderRadius: 0.5, p: 0.5 }}>
          <IconReportMoney size={16} color={theme.palette.warning.main} />
          <Typography variant="body2" color="text.primary" sx={{ flex: 1 }} noWrap>{row.estado}</Typography>
          <IconChevronDown size={16} color={theme.palette.text.secondary} />
        </Box>
      </VincularMenu>
    );
  }

  if (row.estadoTipo === 'disputa') {
    return (
      <VincularMenu row={row} callbacks={callbacks} extractoContexto={extractoContexto} onActiveChange={onActiveChange} vinculaciones={vinculaciones} coberturasAnticipo={coberturasAnticipo}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(198,52,52,0.04)', borderRadius: 0.5, p: 0.5 }}>
          <IconCircleHalf2 size={16} color={theme.palette.error.main} />
          <Typography variant="body2" color="text.primary" sx={{ flex: 1 }} noWrap>En disputa</Typography>
          <IconChevronDown size={16} color={theme.palette.text.secondary} />
        </Box>
      </VincularMenu>
    );
  }

  if (row.estadoTipo === 'devolucion') {
    return (
      <VincularMenu row={row} callbacks={callbacks} extractoContexto={extractoContexto} onActiveChange={onActiveChange} vinculaciones={vinculaciones} coberturasAnticipo={coberturasAnticipo}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(34,141,184,0.04)', borderRadius: 0.5, p: 0.5 }}>
          <IconArrowBackUpDouble size={16} color={theme.palette.info.main} />
          <Typography variant="body2" color="text.primary" sx={{ flex: 1 }} noWrap>{row.estado}</Typography>
          <IconChevronDown size={16} color={theme.palette.text.secondary} />
        </Box>
      </VincularMenu>
    );
  }

  return null;
}
