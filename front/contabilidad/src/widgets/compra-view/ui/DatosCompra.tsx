import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { IconPaperclip } from '@tabler/icons-react';
import type { DestinoNegocio } from '@/entities/borrador';

interface DatosCompraProps {
  tercero?: string;
  descripcion?: string;
  documento?: { numero: string; tipo: number; fecha: string } | null;
  archivos?: { container: string; key: string }[];
  distribucion?: DestinoNegocio[];
  onDistribuir: () => void;
  onOpenSoporte?: () => void;
}

export function DatosCompra({ tercero, descripcion, documento, archivos = [], distribucion = [], onDistribuir, onOpenSoporte }: DatosCompraProps) {
  const theme = useTheme();

  return (
    <Stack spacing={1.5}>
      {/* Documento */}
      {documento && (
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">No. Documento</Typography>
            <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>{documento.numero}</Typography>
          </Box>
          {documento.fecha && (
            <Box>
              <Typography variant="caption" color="text.secondary">Fecha documento</Typography>
              <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>
                {new Date(documento.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Tercero */}
      {tercero && (
        <Box>
          <Typography variant="caption" color="text.secondary">Tercero</Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>{tercero}</Typography>
        </Box>
      )}

      {/* Soporte / Archivos */}
      <Box>
        <Typography variant="caption" color="text.secondary">Soporte</Typography>
        {archivos.length > 0 ? (
          <Box
            onClick={onOpenSoporte}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25, cursor: onOpenSoporte ? 'pointer' : 'default' }}
          >
            <IconPaperclip size={14} color={theme.palette.primary.main} />
            <Typography variant="body2" color="primary.main" fontWeight={500} sx={{ '&:hover': onOpenSoporte ? { textDecoration: 'underline' } : {} }}>
              {archivos[0].key.split('/').pop() ?? 'archivo'}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.25, display: 'block' }}>
            Sin soporte adjunto
          </Typography>
        )}
      </Box>

      {/* Observaciones */}
      {descripcion && (
        <Box>
          <Typography variant="caption" color="text.secondary">Observaciones</Typography>
          <Typography variant="body2" color="text.primary" sx={{ mt: 0.25 }}>{descripcion}</Typography>
        </Box>
      )}

      {/* Distribución de costos */}
      {distribucion.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary">Distribución de costos</Typography>
          <Box
            onClick={onDistribuir}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, cursor: 'pointer', flexWrap: 'wrap', '&:hover': { opacity: 0.8 } }}
          >
            {distribucion.map((d, i) => (
              <Box key={d.unidadOrganizacional} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {i > 0 && <Typography variant="body2" color="text.secondary">•</Typography>}
                <Typography variant="body2" color="text.primary">{d.unidadOrganizacional}</Typography>
                <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 8 }} />
                <Typography variant="body2" color="text.secondary">{Math.round(d.porcentaje * 100)}%</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Stack>
  );
}
