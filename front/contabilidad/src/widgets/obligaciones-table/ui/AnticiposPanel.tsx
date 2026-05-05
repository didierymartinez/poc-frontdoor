import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Box, Chip, IconButton, InputAdornment, Stack, TextField, Typography, useTheme } from '@mui/material';
import { type GridColDef } from '@mui/x-data-grid';
import { IconFileDescription, IconSearch } from '@tabler/icons-react';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { EmptyState } from '@/shared/ui';
import type { MainLayoutContext } from '@/shared/model';
import { formatCardNumber } from '@/shared/lib';
import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';
import amexLogo from '@/shared/assets/card-brands/amex.png';

type Estado = 'Pagado' | 'Vigente' | 'Regularizado' | 'Cerrado' | 'Reversado';
type MedioPago = 'mastercard' | 'visa' | 'diners' | 'amex';

interface AnticipoRow {
  id: string;
  fechaTransaccion: string;
  medioPago: MedioPago;
  medioPagoNumero: string;
  monto: number;
  moneda: string;
  tercero: string;
  fechaRadicacion: string;
  estado: Estado;
  venceEn: string;
}

const medioPagoLogos: Record<MedioPago, string> = {
  mastercard: mastercardLogo,
  visa: visaLogo,
  diners: dinersLogo,
  amex: amexLogo,
};

const estadoChipProps: Record<Estado, { color: 'success' | 'info' | 'primary' | 'default' | 'error'; variant: 'outlined' | 'filled' }> = {
  Pagado: { color: 'success', variant: 'outlined' },
  Vigente: { color: 'primary', variant: 'outlined' },
  Regularizado: { color: 'info', variant: 'outlined' },
  Cerrado: { color: 'error', variant: 'outlined' },
  Reversado: { color: 'default', variant: 'outlined' },
};

const filterBadgeColors: Record<string, { bg: string; text: string }> = {
  Todos: { bg: '#2f43d0', text: '#ffffff' },
  Vigente: { bg: '#8d9bfc', text: '#ffffff' },
  Pagado: { bg: '#c7e49d', text: '#ffffff' },
  Regularizado: { bg: '#96cfe2', text: '#ffffff' },
  Cerrado: { bg: '#e8a1a1', text: '#ffffff' },
  Reversado: { bg: '#eaebec', text: 'rgba(16,24,64,0.6)' },
};

const FILTER_LABELS: Estado[] = ['Vigente', 'Pagado', 'Regularizado', 'Cerrado', 'Reversado'];

function buildFilterChips(rows: AnticipoRow[]) {
  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.estado] = (counts[r.estado] ?? 0) + 1;
  return [
    { label: 'Todos', count: rows.length },
    ...FILTER_LABELS.map((label) => ({ label, count: counts[label] ?? 0 })),
  ];
}

function MedioPagoCell({ medioPago, numero }: { medioPago: MedioPago; numero: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, height: '100%' }}>
      <Box
        sx={{
          width: 23,
          height: 16,
          borderRadius: '2.5px',
          border: '1px solid',
          borderColor: 'grey.300',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={medioPagoLogos[medioPago]}
          alt={medioPago}
          sx={{ width: '70%', height: '70%', objectFit: 'contain' }}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" noWrap>
        {formatCardNumber(numero)}
      </Typography>
    </Box>
  );
}

const getColumns = (openDocument: (url: string, name: string) => void): GridColDef<AnticipoRow>[] => [
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
    field: 'fechaTransaccion',
    headerName: 'Transacción',
    width: 100,
    renderCell: (params) => (
      <Typography variant="body2" color="text.secondary">
        {params.value}
      </Typography>
    ),
  },
  {
    field: 'medioPago',
    headerName: 'Medio de pago',
    flex: 1,
    minWidth: 180,
    renderCell: (params) => (
      <MedioPagoCell
        medioPago={params.row.medioPago}
        numero={params.row.medioPagoNumero}
      />
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
    minWidth: 140,
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
  {
    field: 'estado',
    headerName: 'Estado',
    width: 110,
    renderCell: (params) => {
      const props = estadoChipProps[params.value as Estado];
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Chip
            label={params.value}
            size="small"
            color={props.color}
            variant={props.variant}
            sx={{ height: 20 }}
          />
        </Box>
      );
    },
  },
  {
    field: 'venceEn',
    headerName: 'Vence en',
    width: 90,
    align: 'right',
    headerAlign: 'right',
    renderCell: (params) => {
      const value = params.value as string;
      const isHace = value.startsWith('Hace');
      const isToday = value === 'Hoy';
      const days = parseInt(value);
      const isUrgent = isHace || isToday || (days <= 3 && !isNaN(days));
      return (
        <Typography
          variant="body2"
          color={isUrgent ? 'error.main' : 'text.secondary'}
          fontWeight={isToday || isHace ? 700 : 400}
        >
          {value}
        </Typography>
      );
    },
  },
  {
    field: 'soporte',
    headerName: 'Soporte',
    width: 60,
    sortable: false,
    disableColumnMenu: true,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <IconButton
          size="small"
          onClick={() => {
            const isPdf = params.id.toString().endsWith('2');
            openDocument(
              isPdf
                ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
                : 'https://www.w3.org/Graphics/PNG/nurbcup2si.png',
              isPdf ? `ANT-${params.row.id}.pdf` : `ANT-${params.row.id}.png`,
            );
          }}
        >
          <IconFileDescription size={16} />
        </IconButton>
      </Box>
    ),
  },
];

const ESTADO_LABEL: Record<number, Estado> = {
  0: 'Vigente',   // Borrador maps to Vigente in display
  1: 'Vigente',
  2: 'Pagado',
  3: 'Regularizado',
  4: 'Cerrado',
  5: 'Reversado',
};

function mapApiToRows(apiRows: import('@/entities/borrador').VistaAnticipo[]): AnticipoRow[] {
  return apiRows.map((r) => ({
    id: r.id,
    fechaTransaccion: new Date(r.fechaRegistro).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    medioPago: 'mastercard' as MedioPago,
    medioPagoNumero: r.medioPago || '—',
    monto: r.valor,
    moneda: r.moneda || 'COP',
    tercero: r.terceroNombre,
    fechaRadicacion: new Date(r.fechaRegistro).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    estado: ESTADO_LABEL[r.estado] ?? 'Vigente',
    venceEn: '—',
  }));
}

interface AnticiposPanelProps {
  apiRows?: import('@/entities/borrador').VistaAnticipo[];
  isPendingApi?: boolean;
}

export const AnticiposPanel = ({ apiRows, isPendingApi }: AnticiposPanelProps) => {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { openDocument } = useOutletContext<MainLayoutContext>();
  const columns = getColumns(openDocument);

  if (isPendingApi) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Box key={i} sx={{ height: 26, bgcolor: 'grey.100', borderRadius: 0.5 }} />
        ))}
      </Box>
    );
  }
  const rows: AnticipoRow[] = apiRows ? mapApiToRows(apiRows) : [];
  const filterChips = buildFilterChips(rows);
  const activeLabel = filterChips[activeFilter]?.label ?? 'Todos';
  const filteredRows = activeLabel === 'Todos' ? rows : rows.filter((r) => r.estado === activeLabel);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1.5, pb: 1.5 }}>
        <Stack direction="row" spacing={1}>
          {filterChips.map((chip, index) => {
            const isActive = index === activeFilter;
            const badgeColor = filterBadgeColors[chip.label] ?? filterBadgeColors.Reversado;
            return (
              <Chip
                key={chip.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{chip.label}</span>
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
                      {chip.count}
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
        <DataGridPro
          rows={filteredRows}
          columns={columns}
          onRowClick={(params) => navigate(`/anticipo/${params.id}`)}
          rowHeight={40}
          columnHeaderHeight={24}
          disableRowSelectionOnClick
          hideFooterPagination
          hideFooterSelectedRowCount
          slots={{
            noRowsOverlay: () => (
              <EmptyState
                title="No hay anticipos registrados"
                description="Aquí aparecerán los anticipos en cuanto se registre el primero."
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
      </Box>
    </Box>
  );
};
