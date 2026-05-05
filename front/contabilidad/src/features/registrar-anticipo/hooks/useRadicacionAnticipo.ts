import { useRef, useState } from 'react';
import { useParams, useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import dayjs, { type Dayjs } from 'dayjs';
import { useCompletarAnticipo, useDescartarAnticipo, validarFormulario } from '@/features/confirmar-borrador';
import type { FormValues, CompletarAnticipoBody } from '@/features/confirmar-borrador';
import { useRegistroAnticipoStore } from '../model/registro-anticipo.store';
import { useRegistrarAnticipo } from '../api/anticipo.mutations';
import { borradorQueries, MONEDA_MAP, agregadoAnticipoToAnticipo } from '@/entities/borrador';
import type { MainLayoutContext } from '@/shared/model';
import { buildOcrHighlightMap } from '@/shared/lib';
import { showToast } from '@/shared/ui';
import { useFloatingBarStyle } from '@/shared/hooks/useFloatingBarStyle';
import { useDocumentSetup } from '@/shared/hooks/useDocumentSetup';

export function useRadicacionAnticipo() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const fromOcr = !!(location.state as { fromOcr?: boolean } | null)?.fromOcr;
  const navigate = useNavigate();
  const completarMutation = useCompletarAnticipo();
  const descartarMutation = useDescartarAnticipo();
  const registrarMutation = useRegistrarAnticipo();
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const isProcessing = completarMutation.isPending || registrarMutation.isPending;
  const [descartarOpen, setDescartarOpen] = useState(false);
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [montoMismatchOpen, setMontoMismatchOpen] = useState(false);
  const [mismatchInfo, setMismatchInfo] = useState<{ monto: number; montoOriginal: number } | null>(null);

  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleAnticipo(id ?? ''),
    enabled: !!id,
  });
  const anticipo = detalle?.anticipo;
  const ocr = detalle?.ocr;
  const rechazos = anticipo?.estado === 0 ? anticipo.historialRechazos : undefined;
  const getHighlight = buildOcrHighlightMap(ocr);
  const obligacion = agregadoAnticipoToAnticipo(anticipo, ocr);
  const loading = !!id && isPending;
  const { openDocument } = useOutletContext<MainLayoutContext>();
  const formRef = useRef<HTMLDivElement>(null);

  // Shared hooks
  const barStyle = useFloatingBarStyle(formRef);
  const { setHighlightSource } = useDocumentSetup({
    id, isPending, archivo: detalle?.archivo, ocr, openDocument,
  });

  const [fechaRegistro, setFechaRegistro] = useState<Dayjs | null>(dayjs());
  const [descripcion, setDescripcion] = useState(anticipo?.justificacion ?? '');

  // Re-seed cuando llega el anticipo desde la API.
  // Patrón "adjust state during render" en vez de useEffect.
  const [seededAnticipo, setSeededAnticipo] = useState(anticipo);
  if (anticipo && anticipo !== seededAnticipo) {
    setSeededAnticipo(anticipo);
    setFechaRegistro(dayjs());
    if (anticipo.justificacion) setDescripcion(anticipo.justificacion);
  }

  const getFormValues = (): FormValues => {
    const { formulario } = useRegistroAnticipoStore.getState();
    return {
      tercero: formulario.terceroLabel || undefined,
      medioPago: formulario.medioPago || undefined,
      moneda: formulario.moneda || undefined,
      monto: formulario.monto ? String(formulario.monto) : undefined,
      fechaRegistro: dayjs().toISOString(),
      fechaTransaccion: formulario.fechaTransaccion || undefined,
      descripcion: descripcion || undefined,
      soporte: formulario.archivoSoporte ? formulario.archivoSoporte.name : undefined,
    };
  };

  const MONEDA_REVERSE: Record<string, number> = { COP: 1, USD: 2, EUR: 3, MXN: 4 };

  const buildBody = (): CompletarAnticipoBody => {
    const { formulario } = useRegistroAnticipoStore.getState();
    const monedaNum = formulario.moneda
      ? (MONEDA_REVERSE[formulario.moneda] ?? anticipo?.valorMonetario?.moneda ?? 0)
      : (anticipo?.valorMonetario?.moneda ?? 0);

    return {
      informacionTercero: {
        nombre: formulario.terceroLabel || (anticipo?.informacionTercero?.nombre ?? ''),
        identificacion: {
          tipo: formulario.tipoDocumento || (anticipo?.informacionTercero?.identificacion?.tipo ?? ''),
          numero: formulario.terceroId || formulario.numeroDocumento || (anticipo?.informacionTercero?.identificacion?.numero ?? ''),
        },
      },
      valorMonetario: { moneda: monedaNum, valor: formulario.monto || (anticipo?.valorMonetario?.valor ?? 0) },
      medioPago: {
        tipo: formulario.medioPago === 'Credito' ? 0
          : formulario.medioPago === 'Debito' ? 1
          : (anticipo?.medioPago?.tipo ?? 0),
        numero: formulario.tarjeta !== 'visa-default' ? formulario.tarjeta : (anticipo?.medioPago?.numero ?? ''),
        entidadBancaria: anticipo?.medioPago?.entidadBancaria ?? '',
      },
      justificacion: descripcion || anticipo?.justificacion || null,
      instruccionDistribucion: anticipo?.instruccionDistribucion ?? [],
    };
  };

  const doConfirmar = () => {
    const body = buildBody();
    if (anticipo) {
      // Borrador desde OCR → completar
      completarMutation.mutate(
        { anticipoId: anticipo.id, body },
        {
          onSuccess: () => {
            setErrorFields([]);
            useRegistroAnticipoStore.getState().reset();
            showToast('Anticipo confirmado exitosamente', 'success');
            setTimeout(() => navigate(`/anticipo/${anticipo.id}`, { replace: true }), 1500);
          },
          onError: (err) => { showToast(err.message, 'error'); },
        },
      );
    } else {
      // Nuevo anticipo → POST /Anticipo multipart
      const formData = new FormData();
      const infoAnticipo = { ...body, fecha: dayjs().toISOString() };
      formData.append('InformacionAnticipo', JSON.stringify(infoAnticipo));
      const { archivoSoporte } = useRegistroAnticipoStore.getState().formulario;
      if (archivoSoporte) {
        formData.append('Soporte', archivoSoporte);
      }
      registrarMutation.mutate(formData, {
        onSuccess: (anticipoId) => {
          setErrorFields([]);
          useRegistroAnticipoStore.getState().reset();
          showToast('Anticipo creado exitosamente', 'success');
          setTimeout(() => navigate(`/anticipo/${anticipoId}`, { replace: true }), 1500);
        },
        onError: (err) => { showToast(err.message, 'error'); },
      });
    }
  };

  const handleGuardar = () => {
    const values = getFormValues();
    const errors = validarFormulario(2, values);
    setErrorFields(errors.map((e) => e.campo));
    if (errors.length > 0) {
      showToast(`Campos obligatorios sin diligenciar: ${errors.map((e) => e.mensaje).join(', ')}`, 'error');
      return;
    }
    if (anticipo) {
      const montoOriginal = anticipo.valorMonetario?.valor ?? 0;
      if (liveTotal != null && montoOriginal > 0 && Math.abs(liveTotal - montoOriginal) > 0.01) {
        setMismatchInfo({ monto: liveTotal, montoOriginal });
        setMontoMismatchOpen(true);
        return;
      }
    }
    doConfirmar();
  };

  const handleMismatchContinue = () => {
    setMontoMismatchOpen(false);
    setMismatchInfo(null);
    doConfirmar();
  };

  const handleMismatchRevert = () => {
    setMontoMismatchOpen(false);
    setMismatchInfo(null);
    if (anticipo?.valorMonetario?.valor) setLiveTotal(anticipo.valorMonetario.valor);
  };

  const handleConfirmDescartar = (motivo: string, _obs: string) => {
    if (!anticipo) return;
    descartarMutation.mutate(
      { anticipoId: anticipo.id, motivo },
      {
        onSuccess: () => {
          setDescartarOpen(false);
          showToast('Anticipo descartado', 'success');
          setTimeout(() => navigate('/entradas-pendientes', { replace: true }), 1500);
        },
        onError: (err) => { showToast(err.message, 'error'); },
      },
    );
  };

  const moneda = anticipo?.valorMonetario
    ? MONEDA_MAP[anticipo.valorMonetario.moneda] ?? String(anticipo.valorMonetario.moneda)
    : undefined;

  return {
    id, fromOcr, loading, isProcessing, anticipo, obligacion, ocr, getHighlight, rechazos, errorFields, buildBody,
    descartarOpen, setDescartarOpen, barStyle, formRef,
    fechaRegistro, setFechaRegistro, descripcion, setDescripcion,
    setHighlightSource, handleGuardar, handleConfirmDescartar,
    rechazarMutation: descartarMutation,
    moneda, total: liveTotal ?? anticipo?.valorMonetario?.valor ?? undefined, setLiveTotal,
    montoMismatchOpen, setMontoMismatchOpen, mismatchInfo,
    handleMismatchContinue, handleMismatchRevert,
  };
}
