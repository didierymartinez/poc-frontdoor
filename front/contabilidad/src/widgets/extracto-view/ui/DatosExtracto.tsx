import { Box, Link, Stack, Typography, useTheme } from '@mui/material';
import { IconCalendarEvent, IconPaperclip } from '@tabler/icons-react';
import { getCardBrandLogo } from '@/shared/lib/card-brand';

interface DatosExtractoProps {
  periodo?: { desde?: string; hasta?: string };
  entidadBancaria?: string;
  medioPago?: { tipo: number; numero: string; entidadBancaria: string } | null;
  onOpenSoporte?: () => void;
}

export function DatosExtracto({ periodo, entidadBancaria, medioPago, onOpenSoporte }: DatosExtractoProps) {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {/* Periodo facturado */}
      {periodo && (
        <Box>
          <Typography variant="caption" color="text.secondary">Periodo facturado</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
            <IconCalendarEvent size={14} color={theme.palette.action.active} />
            <Typography variant="body2" color="text.primary">{periodo.desde ?? '—'}</Typography>
            <Typography variant="body2" color="text.secondary">→</Typography>
            <Typography variant="body2" color="text.primary">{periodo.hasta ?? '—'}</Typography>
          </Box>
        </Box>
      )}

      {/* Entidad bancaria */}
      {entidadBancaria && (
        <Box>
          <Typography variant="caption" color="text.secondary">Entidad bancaria</Typography>
          <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ mt: 0.25 }}>
            {entidadBancaria}
          </Typography>
        </Box>
      )}

      {/* Medio de pago */}
      {medioPago && (
        <Box>
          <Typography variant="caption" color="text.secondary">Medio de pago</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
            {medioPago.numero && (() => {
              const logo = getCardBrandLogo(medioPago.numero);
              return logo ? (
                <Box sx={{ width: 23, height: 16, borderRadius: '2.5px', border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <Box component="img" src={logo} alt="" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </Box>
              ) : null;
            })()}
            <Typography variant="body2" color="text.primary">
              {medioPago.tipo === 0 ? 'Tarjeta de crédito' : 'Tarjeta de débito'}
              {medioPago.numero ? ` – **** ${medioPago.numero.slice(-4)}` : ''}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Soporte */}
      <Box>
        <Typography variant="caption" color="text.secondary">Extracto</Typography>
        {onOpenSoporte ? (
          <Box onClick={onOpenSoporte} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, cursor: 'pointer' }}>
            <IconPaperclip size={14} color={theme.palette.primary.main} />
            <Link component="button" underline="hover" variant="body2" sx={{ fontWeight: 500 }}>
              Ver documento
            </Link>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.25, display: 'block' }}>
            Sin documento adjunto
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
