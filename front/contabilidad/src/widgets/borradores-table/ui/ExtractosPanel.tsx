import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, InputAdornment, Skeleton, TextField, Typography, useTheme } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui';
import type { VistaOxpExtracto } from '@/entities/borrador';

// ---------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------

function getColumns(): GridColDef<VistaOxpExtracto>[] {
  return [
    {
      field: 'terceroNombre',
      headerName: 'Entidad financiera',
      flex: 1.2,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.primary" noWrap>{value || '—'}</Typography>
      ),
    },
    {
      field: 'medioPago',
      headerName: 'Medio pago',
      width: 120,
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.secondary" noWrap>{value || '—'}</Typography>
      ),
    },
    {
      field: 'periodoDesde',
      headerName: 'Periodo',
      width: 160,
      renderCell: ({ row }) => {
        if (!row.periodoDesde && !row.periodoHasta) return <Typography variant="body2" color="text.disabled">—</Typography>;
        const fmt = (v?: string) => v ? new Date(v).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—';
        return <Typography variant="body2" color="text.secondary">{fmt(row.periodoDesde ?? undefined)} – {fmt(row.periodoHasta ?? undefined)}</Typography>;
      },
    },
    {
      field: 'valorTotal',
      headerName: 'Total',
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
      field: 'numeroPartidas',
      headerName: 'Partidas',
      width: 80,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ value }) => (
        <Typography variant="body2" color="text.secondary">{value ?? '—'}</Typography>
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

interface ExtractosPanelProps {
  rows: VistaOxpExtracto[];
  isPending: boolean;
}

export function ExtractosPanel({ rows, isPending }: ExtractosPanelProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const columns = getColumns();

  const filtered = search
    ? rows.filter((r) =>
        [r.terceroNombre, r.id].some((v) => v?.toLowerCase().includes(search.toLowerCase())),
      )
    : rows;

  if (isPending) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: 1, bgcolor: 'grey.100' }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={26} sx={{ borderRadius: 0.5, bgcolor: 'grey.100' }} />
        ))}
      </Box>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="Sin extractos" description="No hay extractos pendientes de confirmación." />;
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 1, py: 1 }}>
        <TextField
          size="small"
          placeholder="Buscar por entidad financiera..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={16} color={theme.palette.action.active} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ flex: 1, minHeight: 0 }}>
        {filtered.length === 0 ? (
          <EmptyState title="Sin resultados" description="No se encontraron extractos con la búsqueda aplicada." />
        ) : (
          <DataGridPro
            rows={filtered}
            columns={columns}
            density="compact"
            disableColumnMenu
            disableRowSelectionOnClick
            hideFooter={filtered.length <= 50}
            onRowClick={(params) => {
              navigate(`/registro-extracto/${params.row.id}`, { state: { fromOcr: true } });
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
