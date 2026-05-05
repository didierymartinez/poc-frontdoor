import { useRef } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { IconCalendarEvent, IconPaperclip, IconX } from '@tabler/icons-react';
import { AnticipoForm, useRegistroAnticipoStore } from '@/features/registrar-anticipo';
import { RechazosBanner } from '@/shared/ui';
import { DescartarDialog } from '@/widgets/descartar-dialog';
import { AnticipoFormSkeleton } from './AnticipoFormSkeleton';
import { AnticipoActionBar } from '@/widgets/anticipo-action-bar';
import { useRadicacionAnticipo } from '@/features/registrar-anticipo';

const ANTICIPO_ESTADO_LABEL: Record<number, string> = {
  0: 'Borrador', 1: 'Vigente', 2: 'Pagado', 3: 'Regularizado', 4: 'Cerrado', 5: 'Reversado', 6: 'Descartado',
};
const ANTICIPO_ESTADO_COLOR: Record<number, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  0: 'default', 1: 'primary', 2: 'success', 3: 'info', 4: 'success', 5: 'warning', 6: 'error',
};

export function RadicacionAnticipoPage() {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const archivoSoporte = useRegistroAnticipoStore((s) => s.formulario.archivoSoporte);
  const setFormField = useRegistroAnticipoStore((s) => s.setFormField);
  const {
    id, fromOcr, loading, isProcessing, anticipo, obligacion, rechazos, errorFields,
    descartarOpen, setDescartarOpen, barStyle, formRef,
    descripcion, setDescripcion,
    handleGuardar, handleConfirmDescartar, rechazarMutation,
    moneda, total, setLiveTotal,
    montoMismatchOpen, setMontoMismatchOpen, mismatchInfo,
    handleMismatchContinue, handleMismatchRevert,
  } = useRadicacionAnticipo();
  const fechaRegistro = dayjs().format('DD/MM/YYYY');

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box
        ref={formRef}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
        }}
      >
        {loading ? (
          <AnticipoFormSkeleton />
        ) : (
          <>
            <RechazosBanner rechazos={rechazos} />

            {/* Header: código + estado + fecha registro */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h6" color="text.primary" fontWeight={600}>
                  {id ? `OXP-ANT-${id.slice(0, 8)}` : 'Nuevo anticipo'}
                </Typography>
                <Divider orientation="vertical" flexItem sx={{ height: 12, alignSelf: 'center' }} />
                <Chip
                  label={ANTICIPO_ESTADO_LABEL[anticipo?.estado ?? 0] ?? 'Borrador'}
                  size="small"
                  color={ANTICIPO_ESTADO_COLOR[anticipo?.estado ?? 0] ?? 'default'}
                  variant="outlined"
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

            <AnticipoForm variant="complete" data={obligacion} agregado={anticipo} hideDistribucion={fromOcr && anticipo?.estado !== 1} errorFields={errorFields} onMontoChange={setLiveTotal} />

            {/* Descripción */}
            <Box>
              <TextField
                label="Descripción"
                required
                size="small"
                placeholder="Motivo del anticipo"
                multiline
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                sx={{
                  width: '100%',
                  ...(errorFields.includes('descripcion') && {
                    '& .MuiOutlinedInput-root': { bgcolor: 'error.50' },
                  }),
                }}
              />
            </Box>

            {/* Barra adjuntar inferior */}
            {(!fromOcr || anticipo?.estado === 1) && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 0.5,
                  px: 1.5,
                  py: 1,
                  height: 48,
                }}
              >
                {archivoSoporte ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconPaperclip size={14} color={theme.palette.primary.main} />
                    <Typography variant="body2" color="primary.main">
                      {archivoSoporte.name}
                    </Typography>
                    <IconButton size="small" onClick={() => setFormField('archivoSoporte', null)} sx={{ p: '2px' }}>
                      <IconX size={14} />
                    </IconButton>
                  </Box>
                ) : (
                  <Box />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setFormField('archivoSoporte', file);
                    e.target.value = '';
                  }}
                />
                <Button
                  variant="text"
                  startIcon={<IconPaperclip size={16} />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ color: 'primary.main' }}
                >
                  Adjuntar
                </Button>
              </Box>
            )}
          </>
        )}
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
        <AnticipoActionBar
          total={total}
          moneda={moneda}
          onGuardar={handleGuardar}
          onDescartar={() => setDescartarOpen(true)}
          guardando={isProcessing}
        />
      </Box>

      <DescartarDialog
        open={descartarOpen}
        onClose={() => setDescartarOpen(false)}
        onConfirm={handleConfirmDescartar}
        loading={rechazarMutation.isPending}
      />

      <Dialog open={montoMismatchOpen} onClose={() => setMontoMismatchOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Monto modificado</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            El monto fue modificado y no coincide con el valor original del documento:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Monto editado:</Typography>
              <Typography variant="body2" fontWeight={600}>
                {mismatchInfo ? `$ ${mismatchInfo.monto.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Monto original:</Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">
                {mismatchInfo ? `$ ${mismatchInfo.montoOriginal.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : ''}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" color="inherit" onClick={() => setMontoMismatchOpen(false)}>
            Cancelar
          </Button>
          <Button size="small" onClick={handleMismatchRevert}>
            Restaurar original
          </Button>
          <Button size="small" variant="contained" onClick={handleMismatchContinue}>
            Guardar con monto editado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
