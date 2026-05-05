import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useEditarValorMonetario,
  useEditarInformacionTercero,
  useEditarConceptos,
  useEditarMedioDePago,
} from '@/features/confirmar-borrador';
import { showToast } from '@/shared/ui';
import { httpClient } from '@/shared/api';
import { useRegistroCompraStore } from '../model/registro-compra.store';
import { useAutoSave } from '@/shared/hooks/useAutoSave';
import { AUTO_SAVE_INTERVAL_MS } from '@/shared/config';
import type { AgregadoOxpComercio } from '@/entities/borrador';
import { buildConceptoPayload, deriveMode } from '../lib/compra-body-builder';

interface OriginalSnapshot {
  monto: number;
  terceroLabel: string;
  tipoDocumento: string;
  numeroDocumento: string;
  medioPago: string;
  conceptosHash: string;
}

interface UseCompraGranularUpdatesOptions {
  borrador?: AgregadoOxpComercio;
  isProcessing: boolean;
}

export function useCompraGranularUpdates({ borrador, isProcessing }: UseCompraGranularUpdatesOptions) {
  const queryClient = useQueryClient();
  const editarValorMutation = useEditarValorMonetario();
  const editarTerceroMutation = useEditarInformacionTercero();
  const editarConceptosMutation = useEditarConceptos();
  const editarMedioPagoMutation = useEditarMedioDePago();

  const mode = deriveMode(borrador?.estado);
  const originalSnapshotRef = useRef<OriginalSnapshot | null>(null);

  // Capture snapshot when borrador loads (only for pendiente/devuelta)
  useEffect(() => {
    if (!borrador || originalSnapshotRef.current) return;
    const m = deriveMode(borrador.estado);
    if (m === 'borrador') return;
    const terceroNombre = borrador.informacionTercero.nombre ?? '';
    const terceroNum = borrador.informacionTercero.identificacion?.numero ?? '';
    const terceroLabel = terceroNum ? `${terceroNum} - ${terceroNombre}` : terceroNombre;
    const medioPagoTipo = borrador.medioPago?.tipo;
    const medioPagoStr = medioPagoTipo === 0 ? 'Credito' : medioPagoTipo === 1 ? 'Debito' : '';
    originalSnapshotRef.current = {
      monto: borrador.valorMonetario.valor,
      terceroLabel,
      tipoDocumento: borrador.informacionTercero.identificacion?.tipo ?? '',
      numeroDocumento: terceroNum,
      medioPago: medioPagoStr,
      conceptosHash: JSON.stringify(borrador.conceptos.map((c) => ({ id: c.id, descripcion: c.descripcion, cantidad: c.cantidad, valor: c.dinero?.valor ?? 0 }))),
    };
  }, [borrador]);

  const sendGranularUpdates = useCallback(async ({ includeFiles = true }: { includeFiles?: boolean } = {}): Promise<boolean> => {
    if (!borrador || !originalSnapshotRef.current) return true;
    const snap = originalSnapshotRef.current;
    const { formulario, conceptos: storeConceptos } = useRegistroCompraStore.getState();
    const monedaNum = borrador.valorMonetario.moneda ?? 0;

    try {
      if (formulario.monto !== snap.monto) {
        await editarValorMutation.mutateAsync({
          id: borrador.id,
          body: { valorMonetario: { valor: formulario.monto, moneda: monedaNum } },
        });
      }

      if (formulario.terceroLabel !== snap.terceroLabel || formulario.tipoDocumento !== snap.tipoDocumento || formulario.numeroDocumento !== snap.numeroDocumento) {
        await editarTerceroMutation.mutateAsync({
          id: borrador.id,
          body: {
            informacionTercero: {
              nombre: formulario.terceroLabel || (borrador.informacionTercero.nombre ?? ''),
              identificacion: {
                tipo: formulario.tipoDocumento || (borrador.informacionTercero.identificacion?.tipo ?? ''),
                numero: formulario.numeroDocumento || (borrador.informacionTercero.identificacion?.numero ?? ''),
              },
            },
          },
        });
      }

      const currentConceptosHash = JSON.stringify(storeConceptos.map((c) => ({ id: c.id, descripcion: c.descripcion, cantidad: c.cantidad, valor: c.valor })));
      if (currentConceptosHash !== snap.conceptosHash) {
        const conceptos = storeConceptos.map((c) => buildConceptoPayload(c, borrador, monedaNum));
        await editarConceptosMutation.mutateAsync({ id: borrador.id, body: { conceptos } });
      }

      if (formulario.medioPago !== snap.medioPago) {
        await editarMedioPagoMutation.mutateAsync({
          id: borrador.id,
          body: {
            medioPago: {
              tipo: formulario.medioPago === 'Credito' ? 0
                : formulario.medioPago === 'Debito' ? 1
                : (borrador.medioPago?.tipo ?? 0),
              numero: borrador.medioPago?.numero ?? '',
              entidadBancaria: borrador.medioPago?.entidadBancaria ?? '',
            },
          },
        });
      }

      if (includeFiles) {
        const { pendingFiles } = useRegistroCompraStore.getState();
        for (const file of pendingFiles) {
          const formData = new FormData();
          formData.append('file', file);
          await httpClient.postForm<void>(
            `/api/radicacion/comandos/ObligacionPorPagar/${borrador.id}/ArchivoSoporte`,
            formData,
          );
        }
        if (pendingFiles.length > 0) {
          useRegistroCompraStore.getState().clearPendingFiles();
        }
      }

      return true;
    } catch (err) {
      showToast((err as Error).message || 'Error al guardar cambios', 'error');
      return false;
    }
  }, [borrador, editarValorMutation, editarTerceroMutation, editarConceptosMutation, editarMedioPagoMutation]);

  // --- Auto-save ---
  const getFormSnapshot = useCallback((): string => {
    const { formulario, conceptos: storeConceptos, pendingFiles } = useRegistroCompraStore.getState();
    return JSON.stringify({
      monto: formulario.monto,
      terceroLabel: formulario.terceroLabel,
      tipoDocumento: formulario.tipoDocumento,
      numeroDocumento: formulario.numeroDocumento,
      medioPago: formulario.medioPago,
      conceptos: storeConceptos.map((c) => ({ id: c.id, descripcion: c.descripcion, cantidad: c.cantidad, valor: c.valor })),
      pendingFiles: pendingFiles.length,
    });
  }, []);

  const { isSaving: isSavingAuto, resetSnapshot: resetAutoSaveSnapshot } = useAutoSave({
    getSnapshot: getFormSnapshot,
    save: () => sendGranularUpdates({ includeFiles: true }),
    enabled: mode === 'pendiente' && !!borrador && !isProcessing,
    intervalMs: AUTO_SAVE_INTERVAL_MS,
  });

  // --- Manual save ---
  const [isSavingManual, setIsSavingManual] = useState(false);
  const handleGuardarDraft = useCallback(async () => {
    if (!borrador) return;
    setIsSavingManual(true);
    const hadFiles = useRegistroCompraStore.getState().pendingFiles.length > 0;
    const ok = await sendGranularUpdates({ includeFiles: true });
    if (ok) {
      const { formulario } = useRegistroCompraStore.getState();
      const terceroLabel = formulario.terceroLabel || (borrador.informacionTercero.nombre ?? '');
      originalSnapshotRef.current = {
        monto: formulario.monto || borrador.valorMonetario.valor,
        terceroLabel,
        tipoDocumento: formulario.tipoDocumento || (borrador.informacionTercero.identificacion?.tipo ?? ''),
        numeroDocumento: formulario.numeroDocumento || (borrador.informacionTercero.identificacion?.numero ?? ''),
        medioPago: formulario.medioPago || '',
        conceptosHash: JSON.stringify(
          useRegistroCompraStore.getState().conceptos.map((c) => ({ id: c.id, descripcion: c.descripcion, cantidad: c.cantidad, valor: c.valor })),
        ),
      };
      resetAutoSaveSnapshot();
      showToast('Cambios guardados', 'success');
      if (hadFiles) {
        await queryClient.invalidateQueries({ queryKey: ['borradores', 'comercio', borrador.id] });
      }
    }
    setIsSavingManual(false);
  }, [borrador, sendGranularUpdates, queryClient, resetAutoSaveSnapshot]);

  return {
    sendGranularUpdates,
    isSavingDraft: isSavingAuto || isSavingManual,
    handleGuardarDraft,
  };
}
