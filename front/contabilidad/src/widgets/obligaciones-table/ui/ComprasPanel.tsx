import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { IconSearch } from '@tabler/icons-react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { EmptyState } from '@/shared/ui';
import type { VistaOxpComercio } from '@/entities/borrador';

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(v?: string | null) {
  if (!v) return '—';
  return new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

const columns: GridColDef<VistaOxpComercio>[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 126,
    renderCell: (params) => (
      <Typography variant="body2" color="text.primary" noWrap>{params.value?.slice(0, 13) ?? ''}</Typography>
    ),
  },
  {
    field: 'medioPago',
    headerName: 'Medio',
    flex: 1,
    minWidth: 120,
    renderCell: (params) => (
      // TODO: backend no devuelve brand ni número de tarjeta
      <Typography variant="body2" color="text.secondary" noWrap>{params.value || '—'}</Typography>
    ),
  },
  {
    field: 'documentoFecha',
    headerName: 'Transac.',
    width: 80,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">{fmtDate(params.value)}</Typography>
    ),
  },
  {
    field: 'valor',
    headerName: 'Monto',
    flex: 1,
    minWidth: 120,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => (
      <Typography variant="body2" color="text.primary">{fmt(params.value)}</Typography>
    ),
  },
  {
    field: 'moneda',
    headerName: 'Moneda',
    width: 60,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">{params.value}</Typography>
    ),
  },
  {
    field: 'terceroNombre',
    headerName: 'Tercero',
    flex: 1,
    minWidth: 140,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary" noWrap>{params.value}</Typography>
    ),
  },
  {
    field: 'fechaRadicacion',
    headerName: 'Radica.',
    width: 80,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">{fmtDate(params.value)}</Typography>
    ),
  },
];

interface ComprasPanelProps {
  rows?: VistaOxpComercio[];
  isPending?: boolean;
}

export const ComprasPanel = ({ rows = [], isPending }: ComprasPanelProps) => {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = search
    ? rows.filter((r) => `${r.id} ${r.terceroNombre} ${r.descripcion}`.toLowerCase().includes(search.toLowerCase()))
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1.5, pb: 1.5 }}>
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
        <DataGridPro
          rows={filtered}
          columns={columns}
          onRowClick={(params) => navigate(`/registro-compra/${params.id}`)}
          rowHeight={40}
          columnHeaderHeight={24}
          disableRowSelectionOnClick
          hideFooterPagination
          hideFooterSelectedRowCount
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                title="Tu historial de compras está vacío"
                description="Aquí aparecerán todas tus compras en cuanto se registre la primera."
              />
            ),
            footer: () => (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '26px', px: 1, py: 0.5, height: 22, borderTop: '1px solid', borderColor: 'grey.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">Total registros:</Typography>
                  <Typography variant="caption" color="text.primary">{filtered.length}</Typography>
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
