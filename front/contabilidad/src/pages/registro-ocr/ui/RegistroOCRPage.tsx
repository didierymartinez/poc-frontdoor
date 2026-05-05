import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { DocumentViewer } from '@/shared/ui';
import { useRegistroOCR } from '../hooks/useRegistroOCR';
import { OCRSkeleton } from './OCRSkeleton';

export const RegistroOCRPage = () => {
  const { status, errorMsg, pendingFile, fileUrl, handleRetry, navigate } = useRegistroOCR();

  if (!pendingFile) return null;

  return (
    <Box sx={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Left: header + skeleton / error / timeout */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box sx={{ px: 3, pt: 3, pb: 1, flexShrink: 0 }}>
          {(status === 'uploading' || status === 'processing') && (
            <>
              <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600 }}>
                Procesando documento...
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
                {status === 'uploading'
                  ? 'Enviando archivo al servidor'
                  : 'Cargando información del borrador'}
              </Typography>
              <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />
            </>
          )}

          {status === 'error' && (
            <>
              <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600 }} color="error">
                Error al procesar documento
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
                {errorMsg || 'No se pudo enviar el archivo. Verifica tu conexión e intenta de nuevo.'}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="outlined" size="small" onClick={handleRetry}>
                  Reintentar
                </Button>
                <Button variant="text" size="small" onClick={() => navigate('/', { replace: true })}>
                  Volver
                </Button>
              </Box>
            </>
          )}

          {status === 'timeout' && (
            <>
              <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 600 }} color="warning.main">
                Procesamiento tardando más de lo esperado
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.5 }}>
                El documento aún se está procesando. Puedes seguir esperando o volver más tarde.
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button variant="text" size="small" onClick={() => navigate('/', { replace: true })}>
                  Volver al inicio
                </Button>
              </Box>
            </>
          )}
        </Box>

        {(status === 'uploading' || status === 'processing') && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <OCRSkeleton />
          </Box>
        )}
      </Box>

      {/* Right: embedded document viewer (50%) */}
      <Box
        sx={{
          width: '50%',
          flexShrink: 0,
          borderLeft: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <DocumentViewer url={fileUrl} name={pendingFile.name} scanAnimation />
      </Box>
    </Box>
  );
};
