import { Box, Typography } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import type { EntradaRechazo } from '@/entities/borrador';

interface RechazosBannerProps {
  rechazos: EntradaRechazo[] | undefined;
}

export function RechazosBanner({ rechazos }: RechazosBannerProps) {
  if (!rechazos?.length) return null;

  const fechaReciente = rechazos
    .map((e) => e.fecha)
    .sort()
    .pop();

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1.5,
        bgcolor: 'warning.50',
        border: '1px solid',
        borderColor: 'warning.200',
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <IconAlertTriangle size={20} color="#f96800" style={{ flexShrink: 0, marginTop: 2 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          Este documento quedó en borrador
        </Typography>
        {rechazos.flatMap((entrada, i) =>
          entrada.motivos.map((motivo, j) => (
            <Typography key={`${i}-${j}`} variant="body2" color="text.secondary">
              &bull; {motivo}
            </Typography>
          )),
        )}
        {fechaReciente && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {new Date(fechaReciente).toLocaleString('es-CO', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
