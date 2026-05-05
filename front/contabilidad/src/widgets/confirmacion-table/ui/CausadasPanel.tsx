import {
  Box,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui';
import type { VistaOxpComercio } from '@/entities/borrador';
import { MONEDA_MAP } from '@/entities/borrador';
import { useCausadasPanel } from '../hooks/useCausadasPanel';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtMonto(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtFecha(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

const columns: GridColDef<VistaOxpComercio>[] = [
  {
    field: 'id',
    headerName: 'ID',
    minWidth: 140,
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="primary.main" noWrap sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
        {(value as string).slice(0, 18)}
      </Typography>
    ),
  },
  {
    field: 'documentoTipo',
    headerName: 'Tipo',
    width: 100,
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="text.secondary">{value || 'Comercio'}</Typography>
    ),
  },
  {
    field: 'documentoFecha',
    headerName: 'Transacción',
    width: 100,
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="text.secondary">{fmtFecha(value as string)}</Typography>
    ),
  },
  {
    field: 'terceroNombre',
    headerName: 'Tercero',
    flex: 1,
    minWidth: 180,
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="text.secondary" noWrap>{value}</Typography>
    ),
  },
  {
    field: 'valor',
    headerName: 'Monto',
    width: 150,
    align: 'right',
    headerAlign: 'right',
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="text.primary" fontWeight={500}>{fmtMonto(value as number)}</Typography>
    ),
  },
  {
    field: 'moneda',
    headerName: 'Moneda',
    width: 70,
    align: 'center',
    headerAlign: 'center',
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="text.secondary">
        {typeof value === 'number' ? (MONEDA_MAP[value] ?? value) : value}
      </Typography>
    ),
  },
  {
    field: 'fechaRadicacion',
    headerName: 'Radicación',
    width: 100,
    renderCell: ({ value }: GridRenderCellParams) => (
      <Typography variant="body2" color="text.secondary">{fmtFecha(value as string)}</Typography>
    ),
  },
];

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export function CausadasPanel() {
  const { theme, navigate, search, setSearch, rows, isPending } = useCausadasPanel();

  if (isPending) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 0.5, bgcolor: 'grey.100' }} />
        ))}
      </Box>
    );
  }

  if (rows.length === 0 && !search) {
    return <EmptyState title="Sin obligaciones causadas" description="No hay compras pendientes de pago." />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pt: 1.5, pb: 1.5 }}>
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

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {rows.length === 0 && search ? (
          <EmptyState title="Sin resultados" description="No se encontraron obligaciones con la búsqueda aplicada." />
        ) : (
          <DataGridPro
            rows={rows}
            columns={columns}
            onCellClick={(params) => {
              if (params.field === 'id') {
                navigate(`/confirmacion-compra/${params.row.id}`);
              }
            }}
            rowHeight={40}
            columnHeaderHeight={24}
            hideFooterPagination
            hideFooterSelectedRowCount
            slots={{
              footer: () => (
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                    gap: '26px', px: 1, py: 0.5, height: 22,
                    borderTop: '1px solid', borderColor: 'grey.200',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">Total registros:</Typography>
                    <Typography variant="caption" color="text.primary">{rows.length}</Typography>
                  </Box>
                </Box>
              ),
            }}
            sx={{
              border: 'none',
              '&.MuiDataGrid-root--densityStandard .MuiDataGrid-columnHeaders': {
                minHeight: '24px !important', maxHeight: '24px !important',
              },
              '&.MuiDataGrid-root--densityStandard .MuiDataGrid-columnHeader': {
                bgcolor: theme.palette.grey[100],
                minHeight: '24px !important', maxHeight: '24px !important',
              },
              '& .MuiDataGrid-columnHeaderTitle': {
                ...theme.typography.body2, color: theme.palette.text.secondary, fontWeight: 400,
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '0.5px solid', borderColor: theme.palette.grey[200],
                display: 'flex', alignItems: 'center',
              },
              '&.MuiDataGrid-root--densityStandard .MuiDataGrid-row': {
                minHeight: '40px !important', maxHeight: '40px !important',
              },
              '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
                minHeight: '40px !important', maxHeight: '40px !important',
              },
              '& .MuiDataGrid-columnSeparator': { display: 'none' },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
