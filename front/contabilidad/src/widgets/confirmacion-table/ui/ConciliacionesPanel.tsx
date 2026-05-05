import {
  Box,
  InputAdornment,
  LinearProgress,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';
import { type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { IconSearch } from '@tabler/icons-react';
import { EmptyState } from '@/shared/ui';
import type { VistaExtractoConciliacion } from '@/entities/borrador';
import { formatCardNumber, getCardBrandLogo } from '@/shared/lib';
import { useConciliacionesPanel } from '../hooks/useConciliacionesPanel';

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

function getColumns(): GridColDef<VistaExtractoConciliacion>[] {
  return [
    {
      field: 'terceroNombre',
      headerName: 'Entidad financiera',
      width: 180,
      renderCell: ({ value }: GridRenderCellParams) => (
        <Typography variant="body2" color="text.primary" noWrap>{value}</Typography>
      ),
    },
    {
      field: 'medioPagoNumero',
      headerName: 'Medio de pago',
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }: GridRenderCellParams<VistaExtractoConciliacion>) => {
        const logo = getCardBrandLogo(row.medioPagoNumero);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {logo && (
              <Box sx={{
                width: 23, height: 16, borderRadius: '2.5px', border: '1px solid',
                borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
              }}>
                <Box component="img" src={logo} alt="" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
              </Box>
            )}
            <Typography variant="body2" color="text.secondary" noWrap>
              {formatCardNumber(row.medioPagoNumero)}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'periodoDesde',
      headerName: 'Periodo',
      width: 170,
      renderCell: ({ row }: GridRenderCellParams<VistaExtractoConciliacion>) => (
        <Typography variant="body2" color="text.secondary">
          {fmtFecha(row.periodoDesde)} — {fmtFecha(row.periodoHasta)}
        </Typography>
      ),
    },
    {
      field: 'valorPartidas',
      headerName: 'Valor',
      width: 200,
      align: 'right',
      headerAlign: 'right',
      renderCell: ({ row }: GridRenderCellParams<VistaExtractoConciliacion>) => (
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            {fmtMonto(row.valorPartidas)}
          </Typography>
          <Typography variant="caption" color="text.secondary">{row.moneda}</Typography>
        </Box>
      ),
    },
    {
      field: 'porcentajeConciliacion',
      headerName: 'Conciliación',
      width: 160,
      renderCell: ({ row }: GridRenderCellParams<VistaExtractoConciliacion>) => {
        const pct = row.porcentajeConciliacion;
        const color = pct === 100 ? 'success' : pct >= 50 ? 'primary' : 'warning';
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', gap: 0.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {row.partidasResueltas}/{row.totalPartidas}
              </Typography>
              <Typography variant="caption" color="text.primary" fontWeight={500}>
                {pct.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              color={color}
              sx={{ height: 4, borderRadius: 2 }}
            />
          </Box>
        );
      },
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
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

export function ConciliacionesPanel() {
  const {
    theme,
    navigate,
    search,
    setSearch,
    rows,
    isPending,
    containerRef,
  } = useConciliacionesPanel();

  const columns = getColumns();

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
    return <EmptyState title="Sin conciliaciones" description="No hay extractos en proceso de conciliación." />;
  }

  return (
    <Box ref={containerRef} sx={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          <EmptyState title="Sin resultados" description="No se encontraron extractos con la búsqueda aplicada." />
        ) : (
          <DataGridPro
            rows={rows}
            columns={columns}
            onRowClick={(params) => {
              navigate(`/conciliar-extracto/${params.row.id}`);
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
              cursor: 'pointer',
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
