import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, InputAdornment, LinearProgress, Skeleton, Stack, TextField, Typography, useTheme } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { IconArrowRight, IconSearch } from '@tabler/icons-react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { EmptyState } from '@/shared/ui';
import type { VistaOxpExtracto } from '@/entities/borrador';

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const FILTER_CHIPS = [
  { label: 'Todos' },
  { label: 'Sin conciliar' },
  { label: 'Conciliados' },
];

const filterBadgeColors: Record<string, { bg: string; text: string }> = {
  Todos: { bg: '#2f43d0', text: '#ffffff' },
  'Sin conciliar': { bg: '#fdc280', text: '#ffffff' },
  Conciliados: { bg: '#c7e49d', text: '#ffffff' },
};

const columns: GridColDef<VistaOxpExtracto>[] = [
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 140,
    renderCell: (params) => (
      <Typography variant="body2" color="text.primary" noWrap>{params.value?.slice(0, 13) ?? ''}</Typography>
    ),
  },
  {
    field: 'terceroNombre',
    headerName: 'Entidad financiera',
    width: 140,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" noWrap>{params.value}</Typography>
    ),
  },
  {
    field: 'medioPago',
    headerName: 'Medio de pago',
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      // TODO: backend no devuelve brand ni número de tarjeta
      <Typography variant="body2" color="text.secondary" noWrap>{params.value || '—'}</Typography>
    ),
  },
  {
    field: 'valorTotal',
    headerName: 'Valor extracto',
    width: 140,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Typography variant="body2" color="text.primary">{fmt(params.value)}</Typography>
    ),
  },
  {
    field: 'fechaPago',
    headerName: 'Pago extracto',
    width: 100,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">{fmtDate(params.value)}</Typography>
    ),
  },
  {
    field: 'periodo',
    headerName: 'Periodo',
    width: 180,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
        <Typography variant="body2" color="text.secondary">{fmtDate(params.row.periodoDesde)}</Typography>
        <IconArrowRight size={12} color="rgba(16,24,64,0.38)" />
        <Typography variant="body2" color="text.secondary">{fmtDate(params.row.periodoHasta)}</Typography>
      </Box>
    ),
  },
  {
    field: 'conciliacion',
    headerName: 'Conciliación',
    width: 120,
    renderCell: () => {
      // TODO: backend no devuelve porcentaje de conciliación
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', height: '100%' }}>
          <LinearProgress variant="determinate" value={0} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'grey.200' }} />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>—</Typography>
        </Box>
      );
    },
  },
  {
    field: 'fechaRadicacion',
    headerName: 'Radicación',
    width: 100,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">{fmtDate(params.value)}</Typography>
    ),
  },
  {
    field: 'venceEn',
    headerName: 'Vence en',
    width: 80,
    align: 'right',
    headerAlign: 'right',
    renderCell: () => {
      // TODO: backend no devuelve fecha de vencimiento
      return <Typography variant="body2" color="text.secondary">—</Typography>;
    },
  },
];

interface ExtractosPanelProps {
  rows?: VistaOxpExtracto[];
  isPending?: boolean;
}

export const ExtractosPanel = ({ rows = [], isPending }: ExtractosPanelProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = search
    ? rows.filter((r) => `${r.id} ${r.terceroNombre}`.toLowerCase().includes(search.toLowerCase()))
    : rows;

  if (isPending) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={40} />)}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          {FILTER_CHIPS.map((chip, index) => {
            const isActive = index === activeFilter;
            const badgeColor = filterBadgeColors[chip.label] ?? { bg: '#eaebec', text: 'rgba(16,24,64,0.6)' };
            return (
              <Chip
                key={chip.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{chip.label}</span>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '100px', px: '5px', py: '2.5px',
                        fontSize: '0.6875rem', fontWeight: 500, lineHeight: 1, minWidth: 16,
                        bgcolor: isActive ? badgeColor.bg : '#eaebec',
                        color: isActive ? badgeColor.text : 'rgba(16,24,64,0.6)',
                      }}
                    >
                      {filtered.length}
                    </Box>
                  </Box>
                }
                size="small"
                color={isActive ? 'primary' : 'default'}
                variant={isActive ? 'filled' : 'outlined'}
                onClick={() => setActiveFilter(index)}
                sx={{ height: 20 }}
              />
            );
          })}
        </Stack>
        <TextField
          size="small" placeholder="Buscar" value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconSearch size={16} /></InputAdornment> } }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGridPro
          rows={filtered}
          columns={columns}
          onRowClick={(params) => navigate(`/conciliar-extracto/${params.id}`)}
          rowHeight={40}
          columnHeaderHeight={24}
          disableRowSelectionOnClick
          hideFooterPagination
          hideFooterSelectedRowCount
          slots={{
            noRowsOverlay: () => (
              <EmptyState title="No hay extractos registrados" description="Aquí aparecerán los extractos en cuanto se registre el primero." />
            ),
            footer: () => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '26px', px: 1, py: 0.5, height: 22, borderTop: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">Total registros:</Typography>
                  <Typography variant="caption" color="text.primary" fontWeight={500}>{filtered.length}</Typography>
                </Box>
              </Box>
            ),
          }}
          sx={{
            border: 'none',
            '& .MuiDataGrid-columnHeaders': { minHeight: '24px !important', maxHeight: '24px !important' },
            '& .MuiDataGrid-columnHeader': { bgcolor: theme.palette.grey[100], minHeight: '24px !important', maxHeight: '24px !important' },
            '& .MuiDataGrid-columnHeaderTitle': { ...theme.typography.body2, color: theme.palette.text.secondary, fontWeight: 400 },
            '& .MuiDataGrid-cell': { borderBottom: '0.5px solid', borderColor: theme.palette.grey[200], display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-row': { minHeight: '40px !important', maxHeight: '40px !important' },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
          }}
        />
      </Box>
    </Box>
  );
};
