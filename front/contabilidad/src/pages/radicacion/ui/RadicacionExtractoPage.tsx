import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { RegistroExtractoForm } from '@/features/registrar-extracto';
import { RegistroActionBar } from '@/widgets/registro-action-bar';
import { DescartarDialog } from '@/widgets/descartar-dialog';
import { RechazosBanner } from '@/shared/ui';
import { useRadicacionExtracto } from '@/features/registrar-extracto';

function fmt(v: number) {
  return `$ ${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RadicacionExtractoPage() {
  const {
    id, isPending, isProcessing, borrador, obligacion, rechazos, errorFields,
    descartarOpen, setDescartarOpen, barStyle, formRef, totalUbicacion,
    setHighlightSource, handleGuardar, handleConfirmDescartar, rechazarMutation,
    total, subtotal, moneda, impuestos, totalImpuestos, setLiveTotal, setLiveFiscal, handlePeriodoChange, handleMedioPagoChange, handleCargosChange, efectivoPeriodo,
    totalMismatchOpen, setTotalMismatchOpen, mismatchInfo, handleMismatchContinue,
  } = useRadicacionExtracto();

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <RechazosBanner rechazos={rechazos} />
      <Box ref={formRef}>
        <RegistroExtractoForm data={obligacion} isPending={!!id && isPending} errorFields={errorFields} cargos={borrador?.cargosFinancieros} periodo={efectivoPeriodo} onTotalChange={setLiveTotal} onFiscalChange={setLiveFiscal} onPeriodoChange={handlePeriodoChange} onMedioPagoChange={handleMedioPagoChange} onCargosChange={handleCargosChange} />
      </Box>

      <Box
        onMouseEnter={() => { if (totalUbicacion?.pageNumber) setHighlightSource(totalUbicacion); }}
        onMouseLeave={() => setHighlightSource(null)}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: barStyle.left,
          width: barStyle.width,
          zIndex: 10,
        }}
      >
        <RegistroActionBar
          total={total}
          subtotal={subtotal}
          moneda={moneda}
          impuestos={impuestos}
          totalImpuestos={totalImpuestos}
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

      <Dialog open={totalMismatchOpen} onClose={() => setTotalMismatchOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Total no coincide con los movimientos</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            El total original del extracto no coincide con la suma de los movimientos editados:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total original (documento):</Typography>
              <Typography variant="body2" fontWeight={600}>{mismatchInfo ? fmt(mismatchInfo.totalOriginal) : ''}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total movimientos:</Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">{mismatchInfo ? fmt(mismatchInfo.totalMovimientos) : ''}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" color="inherit" onClick={() => setTotalMismatchOpen(false)}>
            Cancelar
          </Button>
          <Button size="small" variant="contained" onClick={handleMismatchContinue}>
            Guardar con total editado
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
