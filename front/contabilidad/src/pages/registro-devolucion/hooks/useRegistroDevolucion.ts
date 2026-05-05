import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { TipoOrigen } from '@/shared/model';
import type { MainLayoutContext } from '@/shared/model';
import type { ObligacionFuente } from '@/features/registrar-devolucion';
import { useRadicarDevolucion, useConfirmarDevolucion } from '@/features/registrar-devolucion';
import { borradorQueries, MONEDA_MAP } from '@/entities/borrador';
import { showToast } from '@/shared/ui';
import type { AgregadoOxpComercio, AgregadoAnticipo, AgregadoOxpExtracto } from '@/entities/borrador';
import { base64ToBlobUrl } from '@/shared/lib';

type Paso = 'origen' | 'tercero' | 'documento' | 'formulario';

interface SelectionSnapshot {
  origen: TipoOrigen;
  tercero: { id: string; nombre: string };
  docId: string;
}

function mapComercioToObligacion(agg: AgregadoOxpComercio): ObligacionFuente {
  const totalPagado = agg.pagosAplicados.reduce((sum, p) => sum + p.valorCubierto.valor, 0);
  return {
    numero: agg.id,
    estado: agg.estado === 2 ? 'Confirmada' : agg.estado === 3 ? 'Causada' : 'Pendiente',
    terceroId: agg.informacionTercero.identificacion?.numero ?? '',
    terceroNombre: agg.informacionTercero.nombre,
    documentoFuente: agg.documento ? `${agg.documento.numero}` : '',
    fechaRadicacion: '',
    totalCompra: agg.valorMonetario.valor,
    saldoPorPagar: agg.valorMonetario.valor - totalPagado,
    moneda: MONEDA_MAP[agg.valorMonetario.moneda] ?? 'COP',
  };
}

function mapExtractoToObligacion(agg: AgregadoOxpExtracto): ObligacionFuente {
  const total = agg.cargosFinancieros.reduce((sum, c) => sum + c.valor.valor, 0) +
    agg.partidas.reduce((sum, p) => sum + p.valor.valor, 0);
  const totalPagado = agg.crucesPagoAplicados.reduce((sum, p) => sum + p.valorCubierto.valor, 0);
  const medioPago = agg.medioPago;
  const tarjetaLabel = medioPago
    ? `${medioPago.entidadBancaria} - ${medioPago.tipo === 0 ? 'TC' : 'TD'} **** ${medioPago.numero.slice(-4)}`
    : '';
  const periodo = agg.periodo;
  const periodoLabel = periodo?.desde || periodo?.hasta
    ? `${periodo.desde ?? '—'} → ${periodo.hasta ?? '—'}`
    : '';
  return {
    numero: agg.id,
    estado: 'Confirmado',
    terceroId: agg.informacionTercero.identificacion?.numero ?? '',
    terceroNombre: agg.informacionTercero.nombre,
    documentoFuente: tarjetaLabel,
    fechaRadicacion: periodoLabel,
    totalCompra: total,
    saldoPorPagar: total - totalPagado,
    moneda: MONEDA_MAP[agg.partidas[0]?.valor.moneda ?? 0] ?? 'COP',
  };
}

function mapAnticipoToObligacion(agg: AgregadoAnticipo): ObligacionFuente {
  return {
    numero: agg.id,
    estado: 'Vigente',
    terceroId: agg.informacionTercero.identificacion?.numero ?? '',
    terceroNombre: agg.informacionTercero.nombre,
    documentoFuente: '',
    fechaRadicacion: agg.fecha,
    totalCompra: agg.valorMonetario.valor,
    saldoPorPagar: agg.valorMonetario.valor,
    moneda: MONEDA_MAP[agg.valorMonetario.moneda] ?? 'COP',
  };
}

export function useRegistroDevolucion() {
  const navigate = useNavigate();
  const { openDocument } = useOutletContext<MainLayoutContext>();
  const [paso, setPaso] = useState<Paso>('origen');
  const [origen, setOrigen] = useState<TipoOrigen | null>(null);
  const [tercero, setTercero] = useState<{ id: string; nombre: string } | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [haFormulario, setHaFormulario] = useState(false);

  // Snapshot of last committed selection — to restore on cancel during re-selection
  const prevSelectionRef = useRef<SelectionSnapshot | null>(null);

  // ActionBar positioning — callback ref to measure when form mounts
  const formElRef = useRef<HTMLDivElement | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const [barStyle, setBarStyle] = useState<{ left: number; width: number }>({ left: 0, width: 680 });

  const formRef = useCallback((el: HTMLDivElement | null) => {
    // Cleanup previous observer
    if (roRef.current) {
      roRef.current.disconnect();
      roRef.current = null;
    }
    formElRef.current = el;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const barWidth = rect.width * 0.8;
      setBarStyle({ left: rect.left + (rect.width - barWidth) / 2, width: barWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    roRef.current = ro;
    window.addEventListener('scroll', measure);
  }, []);

  // Cleanup scroll listener on unmount
  useEffect(() => {
    return () => {
      roRef.current?.disconnect();
    };
  }, []);

  // Fetch origin aggregate detail when document is selected
  const comercioQuery = useQuery({
    ...borradorQueries.detalleComercio(selectedDocId ?? ''),
    enabled: origen === 'compra' && !!selectedDocId,
  });
  const extractoQuery = useQuery({
    ...borradorQueries.detalleExtracto(selectedDocId ?? ''),
    enabled: origen === 'extracto' && !!selectedDocId,
  });
  const anticipoQuery = useQuery({
    ...borradorQueries.detalleAnticipo(selectedDocId ?? ''),
    enabled: origen === 'anticipo' && !!selectedDocId,
  });

  // Derive ObligacionFuente from fetched aggregate
  let obligacion: ObligacionFuente | null = null;
  let origenAgregado: AgregadoOxpComercio | AgregadoOxpExtracto | AgregadoAnticipo | null = null;

  if (origen === 'compra' && comercioQuery.data) {
    origenAgregado = comercioQuery.data.comercio;
    obligacion = mapComercioToObligacion(comercioQuery.data.comercio);
  } else if (origen === 'extracto' && extractoQuery.data) {
    origenAgregado = extractoQuery.data.extracto;
    obligacion = mapExtractoToObligacion(extractoQuery.data.extracto);
  } else if (origen === 'anticipo' && anticipoQuery.data) {
    origenAgregado = anticipoQuery.data.anticipo;
    obligacion = mapAnticipoToObligacion(anticipoQuery.data.anticipo);
  }

  // Get archivo from the origin detail for document viewer
  const archivo = origen === 'compra' ? comercioQuery.data?.archivo
    : origen === 'extracto' ? extractoQuery.data?.archivo
    : origen === 'anticipo' ? anticipoQuery.data?.archivo
    : undefined;

  const isLoadingDetail = (origen === 'compra' && comercioQuery.isLoading)
    || (origen === 'extracto' && extractoQuery.isLoading)
    || (origen === 'anticipo' && anticipoQuery.isLoading);

  const handleDocumentoClick = () => {
    if (archivo?.base64 && archivo.nombre) {
      const mime = archivo.tipo || 'application/pdf';
      const url = base64ToBlobUrl(archivo.base64, mime);
      openDocument(url, archivo.nombre);
    }
  };

  // Radicar + Confirmar mutations
  const radicar = useRadicarDevolucion();
  const confirmar = useConfirmarDevolucion();

  // --- Wizard handlers ---

  const handleSelectOrigen = (tipo: TipoOrigen) => {
    setOrigen(tipo);
    setPaso('tercero');
  };

  const handleBackToOrigen = () => {
    setOrigen(null);
    setTercero(null);
    setSelectedDocId(null);
    setPaso('origen');
  };

  const handleCloseDialog = () => {
    // Restore previous selection if user cancels re-selection
    const prev = prevSelectionRef.current;
    if (prev) {
      setOrigen(prev.origen);
      setTercero(prev.tercero);
      setSelectedDocId(prev.docId);
      prevSelectionRef.current = null;
    }
    setPaso('formulario');
  };

  const handleSelectTercero = (t: { id: string; nombre: string }) => {
    setTercero(t);
    setPaso('documento');
  };

  const handleBackToTercero = () => {
    setTercero(null);
    setPaso('tercero');
  };

  const handleSelectDocumento = (documentoId: string) => {
    setSelectedDocId(documentoId);
    setHaFormulario(true);
    setPaso('formulario');
    // New selection committed — clear snapshot
    prevSelectionRef.current = null;
  };

  const handleCambiarSeleccion = () => {
    // Save current selection before re-selection flow
    if (origen && tercero && selectedDocId) {
      prevSelectionRef.current = { origen, tercero, docId: selectedDocId };
    }
    setPaso('origen');
  };

  const handleDescartar = () => {
    navigate('/obligaciones-pendientes', { replace: true });
  };

  const handleRadicar = (formData: FormData) => {
    radicar.mutate(formData, {
      onSuccess: (devolucionId) => {
        showToast('Devolución radicada exitosamente', 'success');
        navigate(`/devolucion/${devolucionId}`);
      },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  const handleRadicarYConfirmar = (formData: FormData) => {
    radicar.mutate(formData, {
      onSuccess: (devolucionId) => {
        showToast('Devolución radicada exitosamente', 'success');
        confirmar.mutate(devolucionId, {
          onSuccess: () => {
            showToast('Devolución confirmada exitosamente', 'success');
            navigate(`/devolucion/${devolucionId}`);
          },
          onError: (err) => showToast(err.message, 'error'),
        });
      },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  return {
    paso,
    origen,
    tercero,
    haFormulario,
    formRef,
    barStyle,
    obligacion,
    origenAgregado,
    isLoadingDetail,
    isSubmitting: radicar.isPending || confirmar.isPending,
    handleSelectOrigen,
    handleBackToOrigen,
    handleCloseDialog,
    handleSelectTercero,
    handleBackToTercero,
    handleSelectDocumento,
    handleCambiarSeleccion,
    handleDescartar,
    handleRadicar,
    handleRadicarYConfirmar,
    handleDocumentoClick,
  };
}
