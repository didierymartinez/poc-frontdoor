import { useRef, useState } from 'react';
import { Box, Chip, CircularProgress, Divider, Typography, useTheme } from '@mui/material';
import { IconCalendarEvent } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { SeleccionarOrigenDialog, BuscarTerceroDialog, BuscarDocumentoDialog } from '@/features/seleccionar-origen-devolucion';
import { FormularioDevolucion, DevolucionActionBar } from '@/features/registrar-devolucion';
import { useRegistroDevolucion } from '../hooks/useRegistroDevolucion';

function DevolucionHeader() {
  const theme = useTheme();
  const fechaRegistro = dayjs().format('DD/MM/YYYY');

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h6" color="text.primary" fontWeight={600}>
          OXP-DEV-01
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 12 }} />
        <Chip
          label="Pendiente"
          size="small"
          variant="outlined"
          color="warning"
          sx={{
            bgcolor: 'warning.50',
            color: theme.palette.warning.main,
            fontWeight: 500,
            height: 22,
            fontSize: '0.75rem',
            border: '1px solid',
            borderColor: theme.palette.warning.main,
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">Fecha de registro</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.primary">{fechaRegistro}</Typography>
          <IconCalendarEvent size={16} color={theme.palette.text.primary} />
        </Box>
      </Box>
    </Box>
  );
}

export function RegistroDevolucionPage() {
  const {
    paso, origen, tercero, haFormulario, formRef, barStyle, obligacion,
    origenAgregado, isLoadingDetail, isSubmitting,
    handleSelectOrigen, handleBackToOrigen, handleCloseDialog,
    handleSelectTercero, handleBackToTercero, handleSelectDocumento,
    handleCambiarSeleccion, handleDescartar, handleRadicar, handleRadicarYConfirmar, handleDocumentoClick,
  } = useRegistroDevolucion();

  const buildPayloadRef = useRef<(() => FormData | null) | null>(null);
  const [liveTotal, setLiveTotal] = useState<number | null>(null);

  const handleRadicarClick = () => {
    const payload = buildPayloadRef.current?.();
    if (payload) handleRadicar(payload);
  };

  const handleConfirmarClick = () => {
    const payload = buildPayloadRef.current?.();
    if (payload) handleRadicarYConfirmar(payload);
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <SeleccionarOrigenDialog
        open={paso === 'origen'}
        onSelect={handleSelectOrigen}
        onClose={haFormulario ? handleCloseDialog : handleDescartar}
        selected={origen}
      />

      {origen && paso === 'tercero' && (
        <BuscarTerceroDialog
          open
          tipo={origen}
          onClose={haFormulario ? handleCloseDialog : handleBackToOrigen}
          onSelect={handleSelectTercero}
        />
      )}

      {origen && tercero && paso === 'documento' && (
        <BuscarDocumentoDialog
          open
          tipo={origen}
          tercero={tercero}
          onClose={haFormulario ? handleCloseDialog : handleBackToOrigen}
          onBack={handleBackToTercero}
          onSelect={handleSelectDocumento}
        />
      )}

      {paso === 'formulario' && (
        <>
          {isLoadingDetail || !obligacion ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box
                ref={formRef}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: '8px',
                  boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)',
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <DevolucionHeader />
                <FormularioDevolucion
                  data={obligacion}
                  tipoOrigen={origen}
                  origenAgregado={origenAgregado}
                  onCambiarSeleccion={handleCambiarSeleccion}
                  onBuildPayload={(fn) => { buildPayloadRef.current = fn; }}
                  onTotalChange={setLiveTotal}
                  onDocumentoClick={handleDocumentoClick}
                />
              </Box>

              <Box
                sx={{
                  position: 'fixed',
                  bottom: 24,
                  left: barStyle.left,
                  width: barStyle.width,
                  zIndex: 10,
                }}
              >
                <DevolucionActionBar
                  total={liveTotal ?? obligacion.totalCompra}
                  onRadicar={handleRadicarClick}
                  onConfirmar={handleConfirmarClick}
                  disabled={isSubmitting}
                />
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
}
