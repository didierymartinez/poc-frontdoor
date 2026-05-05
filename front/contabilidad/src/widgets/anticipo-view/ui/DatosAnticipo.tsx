import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { IconPaperclip } from '@tabler/icons-react';
import type { DestinoNegocio } from '@/entities/borrador';
import { formatCardNumber, getCardBrandLogo } from '@/shared/lib/card-brand';

interface DatosAnticipoProps {
  medioPago?: string;
  medioPagoNumero?: string;
  fecha?: string;
  tercero?: string;
  soporte?: { container: string; key: string } | null;
  onOpenSoporte?: () => void;
  justificacion?: string | null;
  distribucion?: DestinoNegocio[];
}

export function DatosAnticipo({
  medioPago,
  medioPagoNumero,
  fecha,
  tercero,
  soporte,
  onOpenSoporte,
  justificacion,
  distribucion = [],
}: DatosAnticipoProps) {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {/* Medio de pago + Fecha transacción */}
      <Box sx={{ display: 'flex', gap: 4 }}>
        {medioPago && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Medio de pago
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
              {medioPagoNumero && (() => {
                const logo = getCardBrandLogo(medioPagoNumero);
                return logo ? (
                  <Box sx={{ width: 23, height: 16, borderRadius: '2.5px', border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    <Box component="img" src={logo} alt="" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                  </Box>
                ) : null;
              })()}
              <Typography variant="body2" color="text.primary">
                {medioPago}{medioPagoNumero ? ` – ${formatCardNumber(medioPagoNumero)}` : ''}
              </Typography>
            </Box>
          </Box>
        )}
        {fecha && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Fecha transacción
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>
              {fecha}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Tercero */}
      {tercero && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Tercero
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>
            {tercero}
          </Typography>
        </Box>
      )}

      {/* Soporte */}
      <Box>
        <Typography variant="caption" color="text.secondary">
          Soporte
        </Typography>
        {soporte ? (
          <Box
            onClick={onOpenSoporte}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, cursor: onOpenSoporte ? 'pointer' : 'default' }}
          >
            <IconPaperclip size={14} color={theme.palette.primary.main} />
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, '&:hover': onOpenSoporte ? { textDecoration: 'underline' } : {} }}>
              {soporte.key.split('/').pop() ?? 'archivo'}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.25, display: 'block' }}>
            Anticipo sin soporte
          </Typography>
        )}
      </Box>

      {/* Justificación */}
      {justificacion && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Justificación
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>
            {justificacion}
          </Typography>
        </Box>
      )}

      {/* Distribución de costos */}
      {distribucion.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Distribución de costos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
            {distribucion.map((d, i) => (
              <Box key={d.unidadOrganizacional} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {i > 0 && <Typography variant="body2" color="text.secondary">•</Typography>}
                <Typography variant="body2" color="text.primary">
                  {d.unidadOrganizacional}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 8 }} />
                <Typography variant="body2" color="text.secondary">
                  {Math.round(d.porcentaje * 100)}%
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
