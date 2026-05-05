import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { IconAlertTriangle } from '@tabler/icons-react';
import { RegistroForm } from '@/features/registrar-compra';
import { RegistroActionBar } from '@/widgets/registro-action-bar';
import { DescartarDialog } from '@/widgets/descartar-dialog';
import { DevolverDialog } from '@/features/devolver-obligacion';
import { MONEDA_MAP } from '@/entities/borrador';
import { RechazosBanner } from '@/shared/ui';
import { useRadicacionCompra } from '@/features/registrar-compra';
import { PendienteActionBar, DevueltaActionBar } from '@/widgets/compra-action-bar';

function fmt(v?: number) {
  if (v == null) return '$ 0,00';
  return `$ ${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function RadicacionCompraPage() {
  const {
    id, fromOcr, isPending, isProcessing, borrador, obligacion, mode, rechazos, errorFields,
    descartarOpen, setDescartarOpen, devolverOpen, setDevolverOpen,
    barStyle, formRef, totalUbicacion,
    setHighlightSource, openDocument, archivoNombre, highlightsEnabled, setHighlightsEnabled,
    handleGuardar, handleEnviarConfirmacion, handleDescartar, handleConfirmDescartar,
    handleDevolver,
    descartarMutation, liveTotal, setLiveTotal,
    montoMismatchOpen, setMontoMismatchOpen, mismatchInfo,
    handleMismatchUpdate, montoOverride, setLiveMonto,
    liveFiscal, setLiveFiscal,
    causarError, handleCausarErrorClose,
    isSavingDraft, handleGuardarDraft,
  } = useRadicacionCompra();

  const displayTotal = liveTotal ?? borrador?.valorMonetario.valor ?? undefined;
  const ocultarDistribucion = fromOcr && mode === 'borrador';

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      {/* Banner de rechazos (borrador) */}
      {mode === 'borrador' && <RechazosBanner rechazos={rechazos} />}

      {/* Banner de devolución */}
      {mode === 'devuelta' && borrador?.motivoDevolucion && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'warning.50',
            border: '1px solid',
            borderColor: 'warning.200',
            borderRadius: 1,
            px: 2,
            py: 1.5,
            mb: 2,
          }}
        >
          <IconAlertTriangle size={20} color="#f96800" />
          <Box>
            <Typography variant="body2" fontWeight={600} color="warning.dark">
              Esta obligación fue devuelta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Motivo: {borrador.motivoDevolucion}
            </Typography>
          </Box>
        </Box>
      )}

      <Box ref={formRef}>
        <RegistroForm data={obligacion} borradorConceptos={borrador?.conceptos} isPending={!!id && isPending} fromOcr={ocultarDistribucion} errorFields={errorFields} onTotalChange={setLiveTotal} onFiscalChange={setLiveFiscal} montoOverride={montoOverride} onMontoChange={setLiveMonto} mode={mode} oxpId={borrador?.id} archivosVinculados={borrador?.archivosVinculados} archivoNombre={archivoNombre} highlightsEnabled={highlightsEnabled} onOpenDocument={openDocument} onClearHighlights={() => { setHighlightSource(null); setHighlightsEnabled(false); }} onRestoreHighlights={() => setHighlightsEnabled(true)} />
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
        {mode === 'borrador' && (
          <RegistroActionBar
            total={displayTotal}
            subtotal={liveFiscal?.subtotal ?? undefined}
            moneda={borrador ? MONEDA_MAP[borrador.valorMonetario.moneda] : undefined}
            recalculado={liveFiscal?.hasRecalculado}
            impuestos={liveFiscal
              ? liveFiscal.impuestos.map((imp: { nombre: string; valor: number }) => ({
                  nombre: imp.nombre,
                  valor: fmt(imp.valor),
                }))
              : []
            }
            totalImpuestos={liveFiscal?.totalImpuestos ?? undefined}
            retenciones={liveFiscal
              ? liveFiscal.retenciones.map((ret: { nombre: string; valor: number }) => ({
                  nombre: ret.nombre,
                  valor: fmt(ret.valor),
                }))
              : []
            }
            totalRetenciones={liveFiscal?.totalRetenciones ?? undefined}
            onGuardar={handleGuardar}
            onDescartar={handleDescartar}
            guardando={isProcessing}
          />
        )}

        {mode === 'pendiente' && (
          <PendienteActionBar
            total={displayTotal}
            moneda={borrador ? MONEDA_MAP[borrador.valorMonetario.moneda] : undefined}
            subtotal={liveFiscal?.subtotal ?? undefined}
            impuestos={liveFiscal
              ? liveFiscal.impuestos.map((imp: { nombre: string; valor: number }) => ({
                  nombre: imp.nombre,
                  valor: fmt(imp.valor),
                }))
              : []
            }
            totalImpuestos={liveFiscal?.totalImpuestos ?? undefined}
            retenciones={liveFiscal
              ? liveFiscal.retenciones.map((ret: { nombre: string; valor: number }) => ({
                  nombre: ret.nombre,
                  valor: fmt(ret.valor),
                }))
              : []
            }
            totalRetenciones={liveFiscal?.totalRetenciones ?? undefined}
            onEnviarConfirmacion={handleEnviarConfirmacion}
            onConfirmar={handleGuardar}
            onDevolver={() => setDevolverOpen(true)}
            guardando={isProcessing}
            onGuardarDraft={handleGuardarDraft}
            guardandoDraft={isSavingDraft}
          />
        )}

        {mode === 'devuelta' && (
          <DevueltaActionBar
            total={displayTotal}
            moneda={borrador ? MONEDA_MAP[borrador.valorMonetario.moneda] : undefined}
            subtotal={liveFiscal?.subtotal ?? undefined}
            impuestos={liveFiscal
              ? liveFiscal.impuestos.map((imp: { nombre: string; valor: number }) => ({
                  nombre: imp.nombre,
                  valor: fmt(imp.valor),
                }))
              : []
            }
            totalImpuestos={liveFiscal?.totalImpuestos ?? undefined}
            retenciones={liveFiscal
              ? liveFiscal.retenciones.map((ret: { nombre: string; valor: number }) => ({
                  nombre: ret.nombre,
                  valor: fmt(ret.valor),
                }))
              : []
            }
            totalRetenciones={liveFiscal?.totalRetenciones ?? undefined}
            onCorregir={handleGuardar}
            guardando={isProcessing}
          />
        )}
      </Box>

      {/* Dialogs */}
      <DescartarDialog open={descartarOpen} onClose={() => setDescartarOpen(false)} onConfirm={handleConfirmDescartar} loading={descartarMutation.isPending} />

      <DevolverDialog open={devolverOpen} onClose={() => setDevolverOpen(false)} onDevolver={handleDevolver} />

      {/* Monto vs Total mismatch warning */}
      <Dialog open={montoMismatchOpen} onClose={() => setMontoMismatchOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Monto no coincide con el total</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            El monto ingresado no coincide con el total calculado de los conceptos:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Monto ingresado:</Typography>
              <Typography variant="body2" fontWeight={600}>{mismatchInfo ? fmt(mismatchInfo.monto) : ''}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total conceptos:</Typography>
              <Typography variant="body2" fontWeight={600} color="primary.main">{mismatchInfo ? fmt(mismatchInfo.totalConceptos) : ''}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" color="inherit" onClick={() => setMontoMismatchOpen(false)}>
            Cancelar
          </Button>
          <Button size="small" variant="contained" onClick={handleMismatchUpdate}>
            Actualizar monto
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error al causar — confirmar fue exitoso */}
      <Dialog open={!!causarError} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
          <IconAlertTriangle size={20} color="#f96800" />
          Error al causar obligación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            La obligación fue confirmada exitosamente, pero ocurrió un error al causarla:
          </Typography>
          <Typography variant="body2" color="error.main">{causarError}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={handleCausarErrorClose}>Aceptar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


