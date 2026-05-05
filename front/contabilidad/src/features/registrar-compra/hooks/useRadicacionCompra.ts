import { useRef, useState } from 'react';
import { useParams, useOutletContext, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries, agregadoComercioToComercio } from '@/entities/borrador';
import type { MainLayoutContext } from '@/shared/model';
import { buildOcrHighlightMap } from '@/shared/lib';
import type { FiscalSummary } from './useConceptosTable';
import { useFloatingBarStyle } from '@/shared/hooks/useFloatingBarStyle';
import { useDocumentSetup } from '@/shared/hooks/useDocumentSetup';
import { useCompraGranularUpdates } from './useCompraGranularUpdates';
import { useCompraSubmit } from './useCompraSubmit';
import { deriveMode } from '../lib/compra-body-builder';
export type { OxpMode } from '../lib/compra-body-builder';

export function useRadicacionCompra() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const fromOcr = !!(location.state as { fromOcr?: boolean } | null)?.fromOcr;

  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [liveMonto, setLiveMonto] = useState<number | null>(null);
  const [liveFiscal, setLiveFiscal] = useState<FiscalSummary | null>({
    subtotal: 34_600_000,
    impuestos: [
      { nombre: 'IVA 19%', valor: 6_574_000 },
      { nombre: 'ICA 0.8%', valor: 276_800 },
    ],
    totalImpuestos: 6_850_800,
    retenciones: [
      { nombre: 'Retefuente 2.5%', valor: 865_000 },
      { nombre: 'ReteIVA 15%', valor: 986_100 },
      { nombre: 'ReteICA 0.8%', valor: 276_800 },
    ],
    totalRetenciones: 2_127_900,
    hasRecalculado: false,
  });
  const [highlightsEnabled, setHighlightsEnabled] = useState(true);

  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleComercio(id ?? ''),
    enabled: !!id,
  });
  const borrador = detalle?.comercio;
  const ocr = detalle?.ocr;
  const rechazos = borrador?.estado === 0 ? borrador.historialRechazos : undefined;
  const getHighlight = buildOcrHighlightMap(ocr);
  const obligacion = agregadoComercioToComercio(borrador, ocr);
  const mode = deriveMode(borrador?.estado);

  // Initialize liveMonto from API when borrador loads.
  // Patrón "adjust state during render" en vez de useEffect.
  if (borrador?.valorMonetario.valor != null && liveMonto == null) {
    setLiveMonto(borrador.valorMonetario.valor);
  }

  const { openDocument } = useOutletContext<MainLayoutContext>();
  const formRef = useRef<HTMLDivElement>(null);

  // Shared hooks
  const barStyle = useFloatingBarStyle(formRef);
  const { setHighlightSource } = useDocumentSetup({
    id, isPending, archivo: detalle?.archivo, ocr, openDocument,
  });

  // Granular updates + auto-save
  const granular = useCompraGranularUpdates({ borrador, isProcessing: false });

  // Submission handlers
  const submit = useCompraSubmit({
    borrador, mode, sendGranularUpdates: granular.sendGranularUpdates,
    liveTotal, liveMonto, setLiveMonto,
  });

  return {
    id, fromOcr, isPending, borrador, obligacion, ocr, getHighlight, mode, rechazos,
    barStyle, formRef,
    totalUbicacion: getHighlight('Total.TotalAPagar'),
    setHighlightSource, openDocument, archivoNombre: detalle?.archivo?.nombre,
    highlightsEnabled, setHighlightsEnabled,
    liveTotal, setLiveTotal, setLiveMonto, liveFiscal, setLiveFiscal,
    isSavingDraft: granular.isSavingDraft, handleGuardarDraft: granular.handleGuardarDraft,
    // From submit hook
    isProcessing: submit.isProcessing,
    errorFields: submit.errorFields,
    descartarOpen: submit.descartarOpen, setDescartarOpen: submit.setDescartarOpen,
    devolverOpen: submit.devolverOpen, setDevolverOpen: submit.setDevolverOpen,
    montoMismatchOpen: submit.montoMismatchOpen, setMontoMismatchOpen: submit.setMontoMismatchOpen,
    mismatchInfo: submit.mismatchInfo,
    montoOverride: submit.montoOverride,
    descartarMutation: submit.descartarMutation, devolverMutation: submit.devolverMutation,
    causarError: submit.causarError, handleCausarErrorClose: submit.handleCausarErrorClose,
    handleGuardar: submit.handleGuardar, handleEnviarConfirmacion: submit.handleEnviarConfirmacion,
    handleDescartar: submit.handleDescartar, handleConfirmDescartar: submit.handleConfirmDescartar,
    handleDevolver: submit.handleDevolver,
    handleMismatchContinue: submit.handleMismatchContinue, handleMismatchUpdate: submit.handleMismatchUpdate,
  };
}
