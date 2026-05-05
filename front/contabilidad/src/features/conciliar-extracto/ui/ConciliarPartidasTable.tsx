import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IconSearch, IconDotsVertical } from '@tabler/icons-react';
import { DistribucionPopover, EmptyState } from '@/shared/ui';
import { mockDistribucionUnidades, mockDistribucionOptions } from '@/entities/concepto';
import type { AgregadoOxpExtracto } from '@/entities/borrador';
import { EstadoCell } from './EstadoCell';
import { ColumnsToggle, EstadoFilterHeader } from './PartidasTableControls';
import type { ConciliacionCallbacks } from '../model/conciliar-extracto.types';
import { filterBadgeColors } from '../config/conciliar-extracto.constants';
import { useConciliarPartidasTable } from '../hooks/useConciliarPartidasTable';

interface ConciliarPartidasTableProps {
  borrador?: AgregadoOxpExtracto;
  callbacks?: ConciliacionCallbacks;
  sinConciliarCount?: number;
  conciliadosCount?: number;
}

export function ConciliarPartidasTable({ borrador, callbacks, sinConciliarCount, conciliadosCount }: ConciliarPartidasTableProps) {
  const {
    theme,
    activeFilter, setActiveFilter,
    search, setSearch,
    activePartidaId, setActivePartidaId,
    visibleColumns,
    showDiferencia, showTolerancia,
    difDistAnchor, setDifDistAnchor,
    tolDistAnchor, setTolDistAnchor,
    gridCols, toggleColumn,
    filteredRows, filterChips,
    extractoCtx, vinculaciones, coberturasAnticipo,
  } = useConciliarPartidasTable({ borrador, sinConciliarCount, conciliadosCount });

  return (
    <Box>
      <Typography variant="subtitle2" color="text.primary" fontWeight={600} sx={{ mb: 1.5 }}>Partidas</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          {filterChips.map((chip, index) => {
            const isActive = index === activeFilter;
            const colors = filterBadgeColors[chip.label];
            const badgeStyle = isActive ? colors.active : colors.inactive;
            return (
              <Chip
                key={chip.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{chip.label}</span>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '100px', px: '5px', py: '2.5px', fontSize: '0.6875rem', fontWeight: 500, lineHeight: 1, minWidth: 16, bgcolor: badgeStyle.bg, color: badgeStyle.text }}>
                      {chip.count}
                    </Box>
                  </Box>
                }
                size="small" color={isActive ? 'primary' : 'default'} variant={isActive ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(index)} sx={{ height: 20 }}
              />
            );
          })}
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} sx={{ width: 200 }}
            slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconSearch size={16} /></InputAdornment> } }}
          />
          <ColumnsToggle checked={visibleColumns} onToggle={toggleColumn} />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, borderBottom: '1px solid', borderColor: 'divider', py: 0.75 }}>
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>No.</Typography>
        {visibleColumns.includes('Código') && <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Código</Typography>}
        {visibleColumns.includes('Movimiento') && <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Movimiento</Typography>}
        {visibleColumns.includes('Transacción') && <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Transacción</Typography>}
        <Typography variant="body3" color="text.secondary" sx={{ px: 0.5, textAlign: 'right' }}>Valor</Typography>
        {showDiferencia && <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Ajuste diferencia</Typography>}
        {showTolerancia && <Typography variant="body3" color="text.secondary" sx={{ px: 0.5 }}>Ajuste tolerancia</Typography>}
        <EstadoFilterHeader />
      </Box>

      {filteredRows.length === 0 && (
        <EmptyState title="No hay partidas para mostrar" description="No se encontraron partidas con el filtro seleccionado" />
      )}

      {filteredRows.map((row) => (
        <Box
          key={row.no} data-row-id={row.no}
          sx={{ display: 'grid', gridTemplateColumns: gridCols, alignItems: 'start', borderBottom: '0.5px solid', borderColor: 'grey.200', py: 1, transition: 'background-color 0.15s', bgcolor: row.partidaId === activePartidaId ? 'rgba(47,67,208,0.04)' : undefined, '&:hover': { bgcolor: 'action.hover' } }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>{row.no}</Typography>
          {visibleColumns.includes('Código') && <Typography variant="body2" color="text.primary" sx={{ px: 0.5 }}>{row.codigo}</Typography>}
          {visibleColumns.includes('Movimiento') && <Typography variant="body2" color="text.primary" sx={{ px: 0.5 }}>{row.movimiento}</Typography>}
          {visibleColumns.includes('Transacción') && <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>{row.transaccion}</Typography>}
          <Box sx={{ px: 0.5, textAlign: 'right' }}>
            <Typography variant="body2" color="text.primary" fontWeight={500}>{row.valor} {row.moneda}</Typography>
            {row.valorSecundario && <Typography variant="caption" color="text.secondary" display="block">{row.valorSecundario}</Typography>}
          </Box>
          {showDiferencia && (
            <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {row.ajusteDiferencia ? (
                  <Box>
                    <Typography variant="caption" color="text.primary">{row.ajusteDiferencia}</Typography>
                    {row.ajusteDiferenciaDetalle && <Typography variant="caption" color="text.secondary" display="block">{row.ajusteDiferenciaDetalle}</Typography>}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled">-</Typography>
                )}
              </Box>
              {row.ajusteDiferencia && <IconButton size="small" sx={{ p: 0.25, flexShrink: 0 }} onClick={(e) => setDifDistAnchor(e.currentTarget)}><IconDotsVertical size={14} color={theme.palette.text.secondary} /></IconButton>}
            </Box>
          )}
          {showTolerancia && (
            <Box sx={{ px: 0.5, display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {row.ajusteTolerancia ? (
                  <Box>
                    <Typography variant="caption" color="text.primary">{row.ajusteTolerancia}</Typography>
                    {row.ajusteToleranciaDetalle && <Typography variant="caption" color="text.secondary" display="block">{row.ajusteToleranciaDetalle}</Typography>}
                  </Box>
                ) : (
                  <Typography variant="caption" color="text.disabled">-</Typography>
                )}
              </Box>
              {row.ajusteTolerancia && <IconButton size="small" sx={{ p: 0.25, flexShrink: 0 }} onClick={(e) => setTolDistAnchor(e.currentTarget)}><IconDotsVertical size={14} color={theme.palette.text.secondary} /></IconButton>}
            </Box>
          )}
          <Box sx={{ px: 0.5 }}><EstadoCell row={row} callbacks={callbacks} extractoContexto={extractoCtx} onActiveChange={setActivePartidaId} vinculaciones={vinculaciones} coberturasAnticipo={coberturasAnticipo} /></Box>
        </Box>
      ))}

      <DistribucionPopover anchorEl={difDistAnchor} onClose={() => setDifDistAnchor(null)} options={mockDistribucionOptions} initialItems={mockDistribucionUnidades} width={440} />
      <DistribucionPopover anchorEl={tolDistAnchor} onClose={() => setTolDistAnchor(null)} options={mockDistribucionOptions} initialItems={mockDistribucionUnidades} width={440} />
    </Box>
  );
}
