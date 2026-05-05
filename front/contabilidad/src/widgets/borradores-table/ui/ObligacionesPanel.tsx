import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui';
import type { VistaOxpComercio } from '@/entities/borrador';

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function getColumns(): GridColDef<VistaOxpComercio>[] {
  return [
   
    {
      field: 'documentoNumero',
      headerName: 'No. Documento',
      flex: 0.8,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.primary" noWrap>{value || '—'}</Typography>
      ),
    },
    {
      field: 'terceroNombre',
      headerName: 'Tercero',
      flex: 1.2,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.primary" noWrap>{value || '—'}</Typography>
      ),
    },
    {
      field: 'valor',
      headerName: 'Valor',
      width: 140,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.primary">
          {value != null ? `$ ${(value as number).toLocaleString('es-CO')}` : '—'}
        </Typography>
      ),
    },
    {
      field: 'moneda',
      headerName: 'Moneda',
      width: 70,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.secondary">{value || '—'}</Typography>
      ),
    },
    {
      field: 'medioPago',
      headerName: 'Medio pago',
      width: 100,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.secondary" noWrap>{value || '—'}</Typography>
      ),
    },
    {
      field: 'fechaRadicacion',
      headerName: 'Fecha radicación',
      width: 130,
      renderCell: ({ value }) => {
        if (!value) return '—';
        const d = new Date(value as string);
        return (
          <Typography variant="body2" color="text.secondary">
            {d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })}
          </Typography>
        );
      },
    },
  ];
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

interface ObligacionesPanelProps {
  rows: VistaOxpComercio[];
  isPending: boolean;
}

export function ObligacionesPanel({ rows, isPending }: ObligacionesPanelProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const columns = getColumns();

  const filtered = rows.filter((r) => {
    if (search) {
      return [r.terceroNombre, r.documentoNumero, r.id].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return true;
  });

  if (isPending) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={26} sx={{ borderRadius: 0.5, bgcolor: 'grey.100' }} />
        ))}
      </Box>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="Sin borradores" description="No hay obligaciones pendientes de confirmación." />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar: search */}
      <Box sx={{ px: 1, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <TextField
          size="small"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={16} color={theme.palette.action.active} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* DataGrid or empty state */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState title="Sin resultados" description="No se encontraron obligaciones con los filtros aplicados." />
        ) : (
          <DataGridPro
            slotProps={{ 
              root: { 'data-testid': 'datagrid-obligaciones' },
              row:{
                "data-testid": "row-obligacion"
              }
            }}
            rows={filtered}
            columns={columns}
            density="compact"
            disableColumnMenu
            disableRowSelectionOnClick
            hideFooter={filtered.length <= 50}
            onRowClick={(params) => {
              navigate(`/registro-compra/${params.row.id}`, { state: { fromOcr: true } });
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
            }}
          />
        )}
      </Box>
    </Box>
  );
}
