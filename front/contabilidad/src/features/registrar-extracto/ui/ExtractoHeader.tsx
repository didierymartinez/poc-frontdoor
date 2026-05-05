import { Box, Typography } from '@mui/material';
import type { Extracto } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import iaLabelSrc from '@/shared/assets/IA-label.svg';
import { OCR_FIELD_HOVER } from './extracto-helpers';

export function ExtractoHeader({ data }: { data?: Extracto }) {
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);
  const tarjetaUbicacion = data?.tarjeta?.numero?.ubicacion as HighlightSource | undefined;

  const highlight = (src?: HighlightSource) => () => {
    if (src?.pageNumber) setHighlightSource(src);
  };
  const clear = () => setHighlightSource(null);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: '#E1E6FF',
        mx: -3,
        mt: -3,
        px: 3,
        py: 1.5,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          onMouseEnter={highlight(tarjetaUbicacion)}
          onMouseLeave={clear}
          sx={{
            borderRadius: 0.5, px: 0.5, transition: 'background-color 0.15s',
            ...(tarjetaUbicacion && { '&:hover': { bgcolor: OCR_FIELD_HOVER } }),
          }}
        >
          <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
            {data?.tarjeta?.numero?.valor ?? 'Nuevo extracto'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5px' }}>
          <Typography
            sx={{ fontSize: '8.57px', letterSpacing: '0.43px', textTransform: 'uppercase', color: 'action.active', fontWeight: 600, lineHeight: 1 }}
          >
            Extraído con
          </Typography>
          <Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: 19, height: 18 }} />
        </Box>
      </Box>
    </Box>
  );
}
