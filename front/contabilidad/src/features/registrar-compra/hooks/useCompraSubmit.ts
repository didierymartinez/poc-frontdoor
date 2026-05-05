import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCompletarComercio,
  useDescartarComercio,
  useDevolverOxpComercio,
  useCorregirOxpComercio,
  validarFormulario,
  obtenerWarningsCompra,
} from '@/features/confirmar-borrador';
import { showToast } from '@/shared/ui';
import { httpClient } from '@/shared/api';
import { useRegistroCompraStore } from '../model/registro-compra.store';
import type { AgregadoOxpComercio } from '@/entities/borrador';
import { getFormValues, buildBody } from '../lib/compra-body-builder';
import type { OxpMode } from '../lib/compra-body-builder';

interface UseCompraSubmitOptions {
  borrador?: AgregadoOxpComercio;
  mode: OxpMode;
  sendGranularUpdates: (opts?: { includeFiles?: boolean }) => Promise<boolean>;
  liveTotal: number | null;
  liveMonto: number | null;
  setLiveMonto: (v: number | null) => void;
}

export function useCompraSubmit({ borrador, mode, sendGranularUpdates, liveTotal, liveMonto, setLiveMonto }: UseCompraSubmitOptions) {
  const navigate = useNavigate();
  const completarMutation = useCompletarComercio();
  const descartarMutation = useDescartarComercio();
  const devolverMutation = useDevolverOxpComercio();
  const corregirMutation = useCorregirOxpComercio();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [causarError, setCausarError] = useState<string | null>(null);
  const [descartarOpen, setDescartarOpen] = useState(false);
  const [devolverOpen, setDevolverOpen] = useState(false);
  const [montoMismatchOpen, setMontoMismatchOpen] = useState(false);
  const [mismatchInfo, setMismatchInfo] = useState<{ monto: number; totalConceptos: number } | null>(null);
  const [montoOverride, setMontoOverride] = useState<number | null>(null);

  const isProcessing =
    completarMutation.isPending ||
    descartarMutation.isPending ||
    devolverMutation.isPending ||
    corregirMutation.isPending ||
    isSubmitting;

  const doConfirmarBorrador = () => {
    if (!borrador) return;
    const { formulario, conceptos: storeConceptos } = useRegistroCompraStore.getState();
    completarMutation.mutate(
      { oxpComercioId: borrador.id, body: buildBody(borrador, formulario, storeConceptos) },
      {
        onSuccess: () => {
          setErrorFields([]);
          showToast('Borrador confirmado exitosamente', 'success');
          setTimeout(() => navigate(`/registro-compra/${borrador.id}`, { replace: true }), 1500);
        },
        onError: (err) => { showToast(err.message, 'error'); },
      },
    );
  };

  const doConfirmarPendiente = async () => {
    if (!borrador) return;
    const oxpId = borrador.id;
    setIsSubmitting(true);
    const ok = await sendGranularUpdates();
    if (!ok) { setIsSubmitting(false); return; }
    try {
      await httpClient.post<void>(`/api/radicacion/comandos/ObligacionPorPagar/${oxpId}/Confirmar`);
    } catch (err) {
      setIsSubmitting(false);
      showToast(err instanceof Error ? err.message : 'Error al confirmar', 'error');
      return;
    }
    try {
      await httpClient.post<void>(`/api/radicacion/comandos/ObligacionPorPagar/${oxpId}/Causar`);
      setIsSubmitting(false);
      showToast('Obligación confirmada y causada exitosamente', 'success');
      setTimeout(() => navigate(`/confirmacion-compra/${oxpId}`, { replace: true }), 1500);
    } catch (err) {
      setIsSubmitting(false);
      setCausarError(err instanceof Error ? err.message : 'Error al causar la obligación');
    }
  };

  const doCorregirDevuelta = async () => {
    if (!borrador) return;
    const ok = await sendGranularUpdates();
    if (!ok) return;
    corregirMutation.mutate(borrador.id, {
      onSuccess: () => {
        showToast('Obligación corregida y reenviada', 'success');
        setTimeout(() => navigate(`/registro-compra/${borrador.id}`, { replace: true }), 1500);
      },
      onError: (err) => { showToast(err.message, 'error'); },
    });
  };

  const dispatchByMode = () => {
    if (mode === 'borrador') doConfirmarBorrador();
    else if (mode === 'pendiente') doConfirmarPendiente();
    else if (mode === 'devuelta') doCorregirDevuelta();
  };

  const handleGuardar = () => {
    if (!borrador) return;
    const { formulario, conceptos: storeConceptos } = useRegistroCompraStore.getState();
    const values = getFormValues(formulario, storeConceptos);
    const errors = validarFormulario(1, values);
    setErrorFields(errors.map((e) => e.campo));
    if (errors.length > 0) {
      showToast(`Campos obligatorios sin diligenciar: ${errors.map((e) => e.mensaje).join(', ')}`, 'error');
      return;
    }
    if (values.conceptos?.length) {
      const warnings = obtenerWarningsCompra(values.conceptos);
      for (const w of warnings) showToast(w.mensaje, 'warning');
    }
    const montoActual = liveMonto ?? borrador?.valorMonetario.valor ?? 0;
    if (liveTotal != null && Math.abs(montoActual - liveTotal) > 0.01) {
      setMismatchInfo({ monto: montoActual, totalConceptos: liveTotal });
      setMontoMismatchOpen(true);
      return;
    }
    dispatchByMode();
  };

  const handleMismatchContinue = () => {
    setMontoMismatchOpen(false);
    setMismatchInfo(null);
    dispatchByMode();
  };

  const handleMismatchUpdate = () => {
    setMontoMismatchOpen(false);
    setMismatchInfo(null);
    if (liveTotal != null) {
      setMontoOverride(liveTotal);
      setLiveMonto(liveTotal);
      useRegistroCompraStore.getState().setFormField('monto', liveTotal);
    }
    dispatchByMode();
  };

  const handleEnviarConfirmacion = async () => {
    if (!borrador) return;
    const oxpId = borrador.id;
    setIsSubmitting(true);
    const ok = await sendGranularUpdates();
    if (!ok) { setIsSubmitting(false); return; }
    try {
      await httpClient.post<void>(`/api/radicacion/comandos/ObligacionPorPagar/${oxpId}/Confirmar`);
      setIsSubmitting(false);
      showToast('Obligación enviada a confirmación exitosamente', 'success');
      setTimeout(() => navigate(`/confirmacion-compra/${oxpId}`, { replace: true }), 1500);
    } catch (err) {
      setIsSubmitting(false);
      showToast(err instanceof Error ? err.message : 'Error al confirmar', 'error');
    }
  };

  const handleDescartar = () => setDescartarOpen(true);

  const handleConfirmDescartar = (motivo: string, _observacion: string) => {
    if (!borrador) return;
    descartarMutation.mutate(
      { oxpComercioId: borrador.id, motivo },
      {
        onSuccess: () => {
          setDescartarOpen(false);
          showToast('Borrador descartado', 'success');
          setTimeout(() => navigate('/'), 1500);
        },
        onError: (err) => { showToast(err.message, 'error'); },
      },
    );
  };

  const handleCausarErrorClose = () => {
    setCausarError(null);
    navigate(`/confirmacion-compra/${borrador?.id}`, { replace: true });
  };

  const handleDevolver = (motivo: string, _observaciones: string) => {
    if (!borrador) return;
    devolverMutation.mutate(
      { id: borrador.id, motivo },
      {
        onSuccess: () => {
          setDevolverOpen(false);
          showToast('Obligación devuelta', 'success');
          setTimeout(() => navigate('/'), 1500);
        },
        onError: (err) => { showToast(err.message, 'error'); },
      },
    );
  };

  return {
    isProcessing,
    errorFields,
    causarError, handleCausarErrorClose,
    descartarOpen, setDescartarOpen,
    devolverOpen, setDevolverOpen,
    montoMismatchOpen, setMontoMismatchOpen, mismatchInfo,
    montoOverride,
    descartarMutation, devolverMutation,
    handleGuardar, handleEnviarConfirmacion, handleDescartar, handleConfirmDescartar,
    handleDevolver, handleMismatchContinue, handleMismatchUpdate,
  };
}
