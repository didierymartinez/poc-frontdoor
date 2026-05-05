import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import { CompraView } from '@/widgets/compra-view';
import { ConfirmacionPaginatorBar } from '@/widgets/confirmacion-paginator-bar';
import { DevolverRowDialog } from '@/widgets/confirmacion-table';
import { useConfirmacionCompra } from '../hooks/useConfirmacionCompra';

export function ConfirmacionCompraPage() {
  const {
    compra,
    isPending,
    isProcessing,
    hasSoporte,
    handleOpenSoporte,
    confirmarOpen,
    setConfirmarOpen,
    devolverOpen,
    setDevolverOpen,
    handleConfirmar,
    handleDevolver,
    hasPagination,
    isFirst,
    isLast,
    paginationLabel,
    handleAnterior,
    handleSiguiente,
  } = useConfirmacionCompra();

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <CompraView
        loading={isPending}
        codigo={compra?.id ? `OXP-COM-${compra.id.slice(0, 8)}` : ''}
        estado={compra?.estado}
        estadoColor={compra?.estadoColor}
        tercero={compra?.tercero}
        descripcion={compra?.descripcion}
        documento={compra?.documento}
        moneda={compra?.moneda}
        totalFormatted={compra?.totalFormatted}
        totalBruto={compra?.totalBruto}
        totalImpuestos={compra?.totalImpuestos}
        totalRetenciones={compra?.totalRetenciones}
        funcional={compra?.funcional}
        trm={compra?.trm}
        conceptos={compra?.conceptos}
        distribucion={compra?.distribucion}
        archivos={compra?.archivos}
        onOpenSoporte={hasSoporte ? handleOpenSoporte : undefined}
      />

      {!isPending && compra?.estado !== 'Causada' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 680,
            zIndex: 10,
          }}
        >
          <ConfirmacionPaginatorBar
            onDevolver={() => setDevolverOpen(true)}
            onConfirmar={() => setConfirmarOpen(true)}
            onAnterior={hasPagination ? handleAnterior : undefined}
            onSiguiente={hasPagination ? handleSiguiente : undefined}
            disableAnterior={isFirst}
            disableSiguiente={isLast}
            paginationLabel={paginationLabel}
          />
        </Box>
      )}

      {/* Confirmar (Causar) dialog */}
      <Dialog open={confirmarOpen} onClose={() => setConfirmarOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
          <IconCheck size={20} />
          Confirmar obligación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas causar esta obligación?
          </Typography>
          {compra && (
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Tercero</Typography>
                <Typography variant="body2">{compra.tercero}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">Total {compra.moneda}</Typography>
                <Typography variant="body2" fontWeight={600}>{compra.totalFormatted}</Typography>
              </Box>
              {compra.funcional && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Total COP</Typography>
                  <Typography variant="body2" fontWeight={600}>{compra.funcional}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="text" onClick={() => setConfirmarOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleConfirmar} disabled={isProcessing}>
            {isProcessing ? 'Procesando...' : 'Confirmar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Devolver dialog */}
      <DevolverRowDialog
        open={devolverOpen}
        onClose={() => setDevolverOpen(false)}
        onDevolver={handleDevolver}
        title="Devolver obligación"
        lines={compra ? [
          { label: 'Tercero', value: compra.tercero ?? '—' },
          { label: 'Total', value: `${compra.totalFormatted} ${compra.moneda}` },
        ] : []}
        loading={isProcessing}
      />
    </Box>
  );
}
