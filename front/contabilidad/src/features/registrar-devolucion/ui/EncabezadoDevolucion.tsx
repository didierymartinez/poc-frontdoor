import { Box, Link, Tooltip, Typography, useTheme } from '@mui/material';
import { IconPaperclip, IconRefresh } from '@tabler/icons-react';
import type { TipoOrigen } from '@/shared/model';

interface ObligacionFuente {
  numero: string;
  estado: string;
  terceroId: string;
  terceroNombre: string;
  documentoFuente: string;
  fechaRadicacion: string;
  totalCompra: number;
  saldoPorPagar: number;
  moneda: string;
}

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const LABELS: Record<TipoOrigen, { total: string; tercero: string; documento: string; fecha: string }> = {
  compra: { total: 'Total compra', tercero: 'Tercero', documento: 'Documento fuente', fecha: 'Fecha de radicación' },
  extracto: { total: 'Total extracto', tercero: 'Entidad bancaria', documento: 'Medio de pago', fecha: 'Periodo' },
  anticipo: { total: 'Total anticipo', tercero: 'Tercero', documento: 'Documento fuente', fecha: 'Fecha de radicación' },
};

interface EncabezadoDevolucionProps {
  data: ObligacionFuente;
  tipoOrigen?: TipoOrigen | null;
  onCambiarSeleccion?: () => void;
  onDocumentoClick?: () => void;
}

export function EncabezadoDevolucion({ data, tipoOrigen, onCambiarSeleccion, onDocumentoClick }: EncabezadoDevolucionProps) {
  const theme = useTheme();
  const labels = LABELS[tipoOrigen ?? 'compra'];

  return (
    <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, bgcolor: 'rgba(47,67,208,0.04)', borderRadius: 1 }}>
      {/* Left: info */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Número obligación + estado */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Link href="#" underline="hover" variant="h6" color="primary.main" fontWeight={600}>
                {data.numero}
              </Link>
              <Tooltip title="Cambiar selección" arrow>
                <Box
                  component="button"
                  onClick={onCambiarSeleccion}
                  sx={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', p: 0 }}
                >
                  <IconRefresh size={14} color={theme.palette.primary.main} />
                </Box>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              {data.estado}
            </Typography>
          </Box>
        </Box>

        {/* Tercero / Entidad bancaria */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">{labels.tercero}</Typography>
          <Typography variant="body2" color="text.primary">
            {data.terceroId}- {data.terceroNombre}
          </Typography>
        </Box>

        {/* Documento fuente + Fecha radicación */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {data.documentoFuente && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary">{labels.documento}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}>
                <IconPaperclip size={14} color={theme.palette.primary.main} />
                <Link
                  component="button"
                  underline="hover"
                  variant="body2"
                  color="primary.main"
                  onClick={onDocumentoClick}
                  sx={{ textAlign: 'left' }}
                >
                  {data.documentoFuente}
                </Link>
              </Box>
            </Box>
          )}
          {data.fechaRadicacion && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary">{labels.fecha}</Typography>
              <Typography variant="body2" color="text.primary">{data.fechaRadicacion}</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Right: totales card */}
      <Box sx={{
        width: 320, flexShrink: 0,
        height: 64,
        bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200', borderRadius: 1,
        p: 1.5, display: 'flex', flexDirection: 'column', gap: 1,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.primary">{labels.total}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="h6" color="text.primary">{fmt(data.totalCompra)}</Typography>
            <Typography variant="caption" color="text.primary">{data.moneda}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">Saldo por pagar</Typography>
          <Typography variant="body2" color="text.secondary">{fmt(data.saldoPorPagar)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export type { ObligacionFuente };
