import {
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  IconAlertCircle,
  IconLink,
  IconChevronDown,
  IconFilter,
  IconCoin,
} from '@tabler/icons-react';
import type { PartidaRow } from './extracto-view-types';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EstadoCell({ row }: { row: PartidaRow }) {
  const theme = useTheme();
  if (!row.estado) return <Typography variant="caption" color="text.disabled">-</Typography>;

  if (row.estadoTipo === 'disputa') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconAlertCircle size={14} color={theme.palette.error.main} />
        <Typography variant="caption" color="error.main">{row.estado}</Typography>
      </Box>
    );
  }

  if (row.estadoTipo === 'link') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconLink size={14} color={theme.palette.primary.main} />
        <Typography variant="caption" color="primary.main" noWrap>{row.estado}</Typography>
        {row.estadoExtra && (
          <Typography variant="caption" color="primary.main" fontWeight={500}>
            {row.estadoExtra}
          </Typography>
        )}
      </Box>
    );
  }

  if (row.estadoTipo === 'anticipo') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconCoin size={14} color={theme.palette.warning.main} />
        <Typography variant="caption" color="text.primary">{row.estado}</Typography>
      </Box>
    );
  }

  if (row.estadoTipo === 'devolucion') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconCoin size={14} color={theme.palette.info.main} />
        <Typography variant="caption" color="text.primary">{row.estado}</Typography>
      </Box>
    );
  }

  return <Typography variant="caption" color="text.primary">{row.estado}</Typography>;
}

function MultiLineCell({
  primary,
  secondary,
  hasDistr,
}: {
  primary?: string;
  secondary?: string;
  hasDistr?: boolean;
}) {
  const theme = useTheme();
  if (!primary) return <Typography variant="caption" color="text.disabled">-</Typography>;

  return (
    <Box>
      <Typography variant="caption" color="text.primary">{primary}</Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary" display="block">
          {secondary}
        </Typography>
      )}
      {hasDistr && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <Typography variant="caption" color="text.secondary">
            Distr. Costos:
          </Typography>
          <Typography variant="caption" color="primary.main" fontWeight={500}>+2</Typography>
          <IconChevronDown size={12} color={theme.palette.text.secondary} />
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// PartidasTable
// ---------------------------------------------------------------------------

export function PartidasTable({ partidas = [] }: { partidas?: PartidaRow[] }) {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
        Partidas
      </Typography>

      {/* Header */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '30px 70px 2fr 90px 1fr 1fr 1fr 180px',
          borderBottom: '1px solid',
          borderColor: 'divider',
          py: 0.75,
        }}
      >
        {['No.', 'Código', 'Movimiento', 'Transacción', 'Valor', 'Ajuste diferencia', 'Ajuste tolerancia'].map((h) => (
          <Typography key={h} variant="body3" color="text.secondary" sx={{ px: 0.5 }}>
            {h}
          </Typography>
        ))}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.5 }}>
          <Typography variant="body3" color="text.secondary">Estado</Typography>
          <IconFilter size={12} color={theme.palette.text.secondary} />
        </Box>
      </Box>

      {/* Rows */}
      {partidas.map((row) => (
        <Box
          key={row.no}
          sx={{
            display: 'grid',
            gridTemplateColumns: '30px 70px 2fr 90px 1fr 1fr 1fr 180px',
            alignItems: 'start',
            borderBottom: '0.5px solid',
            borderColor: 'grey.200',
            py: 1,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>{row.no}</Typography>
          <Typography variant="body2" color="text.primary" sx={{ px: 0.5 }} fontWeight={500}>{row.codigo}</Typography>
          <Typography variant="body2" color="text.primary" noWrap sx={{ px: 0.5 }}>{row.movimiento}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>{row.transaccion}</Typography>

          {/* Valor */}
          <Box sx={{ px: 0.5 }}>
            <Typography variant="body2" color="text.primary" fontWeight={500}>{row.valor}</Typography>
            {row.valorSecundario && (
              <Typography variant="caption" color="text.secondary" display="block">
                {row.valorSecundario}
              </Typography>
            )}
            {row.distrCostos && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                <Typography variant="caption" color="text.secondary">Distr. Costos:</Typography>
               
                <IconChevronDown size={12} color={theme.palette.text.secondary} />
              </Box>
            )}
          </Box>

          {/* Ajuste diferencia */}
          <Box sx={{ px: 0.5 }}>
            <MultiLineCell
              primary={row.ajusteDiferencia}
              secondary={row.ajusteDiferenciaDetalle}
              hasDistr={row.ajusteDiferenciaDistr}
            />
          </Box>

          {/* Ajuste tolerancia */}
          <Box sx={{ px: 0.5 }}>
            <MultiLineCell
              primary={row.ajusteTolerancia}
              secondary={row.ajusteToleranciaDetalle}
              hasDistr={row.ajusteToleranciaDistr}
            />
          </Box>

          {/* Estado */}
          <Box sx={{ px: 0.5 }}>
            <EstadoCell row={row} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
