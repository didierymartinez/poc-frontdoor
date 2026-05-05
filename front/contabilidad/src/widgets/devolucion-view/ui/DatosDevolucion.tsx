import {
  Badge,
  Box,
  Divider,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { IconPaperclip, IconReceipt } from '@tabler/icons-react';

interface DistribucionItem {
  codigo: string;
  nombre: string;
  porcentaje: string;
  valor: string;
}

interface DatosDevolucionProps {
  origen: string;
  codigoOrigen: string;
  documentoFuente: string;
  totalCompra: string;
  moneda: string;
  soporte: string;
  distribucion: DistribucionItem[];
  tipoDevolucion: 'total' | 'parcial' | 'por_concepto';
  valorParcial?: string;
}

export function DatosDevolucion({
  origen,
  codigoOrigen,
  documentoFuente,
  totalCompra,
  moneda,
  soporte,
  distribucion,
  tipoDevolucion,
  valorParcial,
}: DatosDevolucionProps) {
  const theme = useTheme();
  const visibleDistribucion = distribucion.slice(0, 2);
  const extraCount = distribucion.length - 2;

  return (
    <Stack spacing={1.5}>
      {/* Origen box */}
      <Box
        sx={{
          bgcolor: 'rgba(47,67,208,0.04)',
          borderRadius: 1,
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconReceipt size={14} color={theme.palette.action.active} />
          <Typography variant="body2" color="text.secondary">
            Origen:
          </Typography>
          <Typography variant="subtitle2" color="text.primary">
            {origen}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 12, mx: 0.5 }} />
          <Typography variant="body2" color="text.primary">
            {codigoOrigen}
          </Typography>
        </Box>

        {/* Documento fuente + Total compra */}
        <Box
          sx={{
            bgcolor: 'grey.50',
            borderRadius: 1,
            p: 0.5,
            display: 'flex',
            gap: 1,
          }}
        >
          {documentoFuente && documentoFuente !== '-' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary">
                Documento fuente
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}>
                <IconPaperclip size={14} color={theme.palette.primary.main} />
                <Link underline="none" sx={{ cursor: 'pointer' }}>
                  <Typography variant="subtitle2" color="primary.main">
                    {documentoFuente}
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Total de la compra
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle2" color="text.primary">
                {totalCompra}
              </Typography>
              <Typography variant="caption" color="text.primary">
                {moneda}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Soporte */}
      {soporte && soporte !== '-' && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            Soporte
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
            <IconPaperclip size={14} color={theme.palette.primary.main} />
            <Link underline="none" sx={{ cursor: 'pointer' }}>
              <Typography variant="body2" color="primary.main">
                {soporte}
              </Typography>
            </Link>
          </Box>
        </Box>
      )}

      {/* Distribución de costos */}
      <Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          Distribución de costos
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          {visibleDistribucion.map((item, i) => (
            <Box key={item.codigo} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {i > 0 && (
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                {item.codigo} {item.nombre}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 8 }} />
              <Typography variant="body2" color="text.secondary">
                {item.porcentaje}
              </Typography>
              <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 8 }} />
              <Typography variant="body2" color="text.secondary">
                {item.valor}
              </Typography>
            </Box>
          ))}
          {extraCount > 0 && (
            <Badge
              badgeContent={`+${extraCount}`}
              sx={{
                '& .MuiBadge-badge': {
                  position: 'static',
                  transform: 'none',
                  bgcolor: 'grey.100',
                  color: 'text.secondary',
                  fontSize: '0.6875rem',
                  fontWeight: 500,
                  height: 20,
                  minWidth: 20,
                  borderRadius: '100px',
                  px: 0.625,
                },
              }}
            />
          )}
        </Box>
      </Box>

      {/* Tipo devolución (solo total y parcial muestran pill) */}
      {tipoDevolucion !== 'por_concepto' && (
        <Box
          sx={{
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'grey.200',
            borderRadius: 1,
            px: 1.5,
            py: 0.5,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            width: 'fit-content',
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {tipoDevolucion === 'total' ? 'Devolución total' : 'Devolución parcial:'}
          </Typography>
          {tipoDevolucion === 'parcial' && valorParcial && (
            <Typography variant="h6" color="text.primary">
              {valorParcial}
            </Typography>
          )}
        </Box>
      )}
    </Stack>
  );
}
