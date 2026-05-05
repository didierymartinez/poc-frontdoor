import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Chip, CircularProgress, InputAdornment, Stack, TextField, Typography, useTheme } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { IconFileText, IconSearch } from '@tabler/icons-react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { EmptyState } from '@/shared/ui';
import type { VistaDevolucion } from '@/entities/borrador';

interface DevolucionRow {
  id: string;
  origen: string;
  descripcion: string;
  monto: number;
  moneda: string;
  tercero: string;
  fechaRadicacion: string;
}

function fmtDate(d?: string | null) {
  if (!d) return '-';
  try { return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch { return '-'; }
}

function mapToRow(item: VistaDevolucion): DevolucionRow {
  return {
    id: item.id,
    origen: item.origen,
    descripcion: item.descripcion ?? '',
    monto: item.valor,
    moneda: item.moneda,
    tercero: item.terceroNombre,
    fechaRadicacion: fmtDate(item.fechaRadicacion),
  };
}

const FILTER_LABELS = ['Todos', 'Comercio', 'Extracto', 'Anticipo'] as const;

const filterBadgeColors: Record<string, { bg: string; text: string }> = {
  Todos: { bg: '#2f43d0', text: '#ffffff' },
  Comercio: { bg: '#8d9bfc', text: '#ffffff' },
  Extracto: { bg: '#96cfe2', text: '#ffffff' },
  Anticipo: { bg: '#c7e49d', text: '#ffffff' },
};

const columns: GridColDef<DevolucionRow>[] = [
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 140,
    renderCell: (params) => (
      <Typography variant="body2" color="text.primary" noWrap>
        {params.value}
      </Typography>
    ),
  },
  {
    field: 'origen',
    headerName: 'Origen',
    width: 110,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <Chip
          icon={<IconFileText size={14} style={{ color: '#8D9BFC' }} />}
          label={params.value}
          size="small"
          color="primary"
          variant="filled"
          sx={{ height: 20 }}
        />
      </Box>
    ),
  },
  {
    field: 'descripcion',
    headerName: 'Descripción',
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" noWrap>
        {params.value}
      </Typography>
    ),
  },
  {
    field: 'monto',
    headerName: 'Monto',
    width: 140,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Typography variant="body2" color="text.primary">
        ${new Intl.NumberFormat('de-DE').format(params.value)},00
      </Typography>
    ),
  },
  {
    field: 'moneda',
    headerName: 'Moneda',
    width: 70,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value}
      </Typography>
    ),
  },
  {
    field: 'tercero',
    headerName: 'Tercero',
    flex: 1,
    minWidth: 160,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" noWrap>
        {params.value}
      </Typography>
    ),
  },
  {
    field: 'fechaRadicacion',
    headerName: 'Radicación',
    width: 100,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value}
      </Typography>
    ),
  },
];

interface DevolucionesPanelProps {
  rows: VistaDevolucion[];
  isPending: boolean;
}

export const DevolucionesPanel = ({ rows: apiRows, isPending }: DevolucionesPanelProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => apiRows.map(mapToRow), [apiRows]);

  const filterCounts = useMemo(() => ({
    Todos: apiRows.length,
    Comercio: apiRows.filter((d) => d.origen === 'Comercio').length,
    Extracto: apiRows.filter((d) => d.origen === 'Extracto').length,
    Anticipo: apiRows.filter((d) => d.origen === 'Anticipo').length,
  }), [apiRows]);

  const filteredRows = useMemo(() => {
    const filterLabel = FILTER_LABELS[activeFilter];
    let result = rows;
    if (filterLabel !== 'Todos') {
      result = result.filter((r) => r.origen === filterLabel);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.id.toLowerCase().includes(q) ||
        r.tercero.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q),
      );
    }
    return result;
  }, [rows, activeFilter, search]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          {FILTER_LABELS.map((label, index) => {
            const isActive = index === activeFilter;
            const badgeColor = filterBadgeColors[label] ?? { bg: '#eaebec', text: 'rgba(16,24,64,0.6)' };
            return (
              <Chip
                key={label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{label}</span>
                    <Box
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '100px',
                        px: '5px',
                        py: '2.5px',
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        lineHeight: 1,
                        minWidth: 16,
                        bgcolor: badgeColor.bg,
                        color: badgeColor.text,
                      }}
                    >
                      {filterCounts[label]}
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
          size="small"
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
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
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <DataGridPro
            rows={filteredRows}
            columns={columns}
            onRowClick={(params) => {
              const ids = filteredRows.map((r) => r.id);
              const index = ids.indexOf(params.row.id);
              navigate(`/devolucion/${params.row.id}`, {
                state: { devolucionIds: ids, currentIndex: Math.max(0, index) },
              });
            }}
            rowHeight={40}
            columnHeaderHeight={24}
            disableRowSelectionOnClick
            hideFooterPagination
            hideFooterSelectedRowCount
            slots={{
              noRowsOverlay: () => (
                <EmptyState
                  title="No hay devoluciones registradas"
                  description="Aquí aparecerán las devoluciones en cuanto se registre la primera."
                />
              ),
              footer: () => (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '26px',
                    px: 1,
                    py: 0.5,
                    height: 22,
                    borderTop: '1px solid',
                    borderColor: 'grey.200',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total registros:
                    </Typography>
                    <Typography variant="caption" color="text.primary" fontWeight={500}>
                      {filteredRows.length}
                    </Typography>
                  </Box>
                </Box>
              ),
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeaders': {
                minHeight: '24px !important',
                maxHeight: '24px !important',
              },
              '& .MuiDataGrid-columnHeader': {
                bgcolor: theme.palette.grey[100],
                minHeight: '24px !important',
                maxHeight: '24px !important',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                ...theme.typography.body2,
                color: theme.palette.text.secondary,
                fontWeight: 400,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '0.5px solid',
                borderColor: theme.palette.grey[200],
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-row': {
                minHeight: '40px !important',
                maxHeight: '40px !important',
              },
              '& .MuiDataGrid-columnSeparator': {
                display: 'none',
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};
