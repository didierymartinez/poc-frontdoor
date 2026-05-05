import { useEffect, useRef, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCompletarExtracto, useDescartarExtracto, validarFormulario, obtenerWarningsExtracto } from '@/features/confirmar-borrador';
import type { FormValues, MovimientoValues } from '@/features/confirmar-borrador';
import { showToast } from '@/shared/ui';
import { borradorQueries, agregadoExtractoToExtracto, MONEDA_MAP, ESTADO_EXTRACTO } from '@/entities/borrador';
import type { CargoFinancieroExtracto } from '@/entities/borrador';
import type { MainLayoutContext } from '@/shared/model';
import { buildOcrHighlightMap, toDatetime } from '@/shared/lib';
import { useFloatingBarStyle } from '@/shared/hooks/useFloatingBarStyle';
import { useDocumentSetup } from '@/shared/hooks/useDocumentSetup';

export function useRadicacionExtracto() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const completarMutation = useCompletarExtracto();
  const descartarMutation = useDescartarExtracto();
  const isProcessing = completarMutation.isPending || descartarMutation.isPending;
  const [descartarOpen, setDescartarOpen] = useState(false);
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [liveTotal, setLiveTotal] = useState<number | null>(null);
  const [liveFiscal, setLiveFiscal] = useState<{ items: { nombre: string; valor: number }[]; total: number } | null>(null);
  const [livePeriodo, setLivePeriodo] = useState<{ desde?: string; hasta?: string }>({});
  const [liveMedioPago, setLiveMedioPago] = useState<{ tipo: number; numero: string } | null>(null);
  const [totalMismatchOpen, setTotalMismatchOpen] = useState(false);
  const [mismatchInfo, setMismatchInfo] = useState<{ totalOriginal: number; totalMovimientos: number } | null>(null);
  const [liveCargos, setLiveCargos] = useState<CargoFinancieroExtracto[] | null>(null);

  const handleCargosChange = (cargos: CargoFinancieroExtracto[]) => {
    setLiveCargos(cargos);
  };

  const handlePeriodoChange = (desde: string | undefined, hasta: string | undefined) => {
    setLivePeriodo({ desde, hasta });
  };

  const handleMedioPagoChange = (tipo: number, numero: string) => {
    setLiveMedioPago({ tipo, numero });
  };

  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleExtracto(id ?? ''),
    enabled: !!id,
  });
  const borrador = detalle?.extracto;
  const ocr = detalle?.ocr;
  const rechazos = borrador?.estado === 0 ? borrador.historialRechazos : undefined;
  const getHighlight = buildOcrHighlightMap(ocr);
  const obligacion = agregadoExtractoToExtracto(borrador, ocr);

  // Si el extracto ya no es borrador ni pendiente, redirigir a conciliación
  useEffect(() => {
    if (borrador && borrador.estado !== ESTADO_EXTRACTO.Borrador && borrador.estado !== ESTADO_EXTRACTO.Pendiente) {
      navigate(`/conciliar-extracto/${borrador.id}`, { replace: true });
    }
  }, [borrador, navigate]);

  const { openDocument } = useOutletContext<MainLayoutContext>();
  const formRef = useRef<HTMLDivElement>(null);

  // Shared hooks
  const barStyle = useFloatingBarStyle(formRef);
  const { setHighlightSource } = useDocumentSetup({
    id, isPending, archivo: detalle?.archivo, ocr, openDocument,
  });

  const getFormValues = (): FormValues => {
    const form = formRef.current;
    if (!form) return {};
    const movimientosRows = form.querySelectorAll('[data-row-id]');
    const movimientos: MovimientoValues[] = Array.from(movimientosRows).map((row) => {
      const cells = row.querySelectorAll('[data-cell]');
      let fecha = '';
      let descripcion = '';
      let valor = 0;
      cells.forEach((cell) => {
        const key = cell.getAttribute('data-cell');
        if (key === 'fecha') fecha = (cell.querySelector('input') as HTMLInputElement)?.value ?? '';
        if (key === 'descripcion') descripcion = (cell.querySelector('input') as HTMLInputElement)?.value ?? '';
        if (key === 'valor') {
          const raw = (cell.querySelector('input') as HTMLInputElement)?.value ?? '';
          valor = parseFloat(raw.replace(/[^0-9.,-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
        }
      });
      return { fecha, descripcion, valor };
    });
    return {
      entidadFinanciera: borrador?.informacionTercero.nombre || undefined,
      tarjetaNumero: liveMedioPago?.numero || borrador?.medioPago?.numero || undefined,
      movimientosCount: movimientosRows.length,
      periodoDesde: livePeriodo.desde || borrador?.periodo?.desde || undefined,
      periodoHasta: livePeriodo.hasta || borrador?.periodo?.hasta || undefined,
      movimientos,
    };
  };

  const buildExtractoBody = () => {
    const values = getFormValues();
    const moneda = borrador!.partidas[0]?.valor.moneda ?? 0;
    const partidas = (borrador!.partidas).map((p, i) => {
      const edited = values.movimientos?.[i];
      return {
        id: p.id,
        fechaTransaccion: edited?.fecha ? toDatetime(edited.fecha) : p.fechaTransaccion,
        valor: edited?.valor != null ? { moneda, valor: edited.valor } : p.valor,
        valorOriginal: p.valorOriginal ?? null,
        descripcion: edited?.descripcion || p.descripcion,
        estado: p.estado,
        informacionTercero: p.informacionTercero ?? null,
      };
    });

    return {
      partidas,
      medioPago: {
        tipo: liveMedioPago?.tipo ?? borrador!.medioPago?.tipo ?? 0,
        numero: liveMedioPago?.numero ?? borrador!.medioPago?.numero ?? '',
        entidadBancaria: borrador!.medioPago?.entidadBancaria ?? '',
      },
      periodo: {
        desde: livePeriodo.desde || borrador!.periodo?.desde || null,
        hasta: livePeriodo.hasta || borrador!.periodo?.hasta || null,
      },
      informacionTercero: {
        nombre: borrador!.informacionTercero.nombre,
        identificacion: {
          tipo: borrador!.informacionTercero.identificacion?.tipo || 'NIT',
          numero: borrador!.informacionTercero.identificacion?.numero || '900123456',
        },
      },
      cargosFinancieros: (liveCargos ?? borrador!.cargosFinancieros).map((c) => ({
        id: c.id, tipo: c.tipo, valor: c.valor, periodo: c.periodo,
        distribucionCentroCostos: c.distribucionCentroCostos,
      })),
    };
  };

  const doConfirmar = () => {
    if (!borrador) return;
    completarMutation.mutate(
      { oxpExtractoId: borrador.id, body: buildExtractoBody() },
      {
        onSuccess: () => {
          setErrorFields([]);
          showToast('Borrador confirmado exitosamente', 'success');
          setTimeout(() => navigate(`/conciliar-extracto/${borrador.id}`, { replace: true }), 1500);
        },
        onError: (err) => { showToast(err.message, 'error'); },
      },
    );
  };

  const handleGuardar = () => {
    if (!borrador) return;
    const values = getFormValues();
    const errors = validarFormulario(0, values);
    setErrorFields(errors.map((e) => e.campo));
    if (errors.length > 0) {
      showToast(`Campos obligatorios sin diligenciar: ${errors.map((e) => e.mensaje).join(', ')}`, 'error');
      return;
    }
    if (values.movimientos?.length) {
      const warnings = obtenerWarningsExtracto(values.movimientos);
      for (const w of warnings) showToast(w.mensaje, 'warning');
    }
    const activeCargos = liveCargos ?? borrador.cargosFinancieros;
    const totalOriginal = borrador.partidas.reduce((sum, p) => sum + p.valor.valor, 0) + activeCargos.reduce((sum, c) => sum + c.valor.valor, 0);
    if (liveTotal != null && totalOriginal > 0 && Math.abs(totalOriginal - liveTotal) > 0.01) {
      setMismatchInfo({ totalOriginal, totalMovimientos: liveTotal });
      setTotalMismatchOpen(true);
      return;
    }
    doConfirmar();
  };

  const handleMismatchContinue = () => {
    setTotalMismatchOpen(false);
    setMismatchInfo(null);
    doConfirmar();
  };

  const handleConfirmDescartar = (motivo: string, obs: string) => {
    if (!borrador) return;
    descartarMutation.mutate(
      { oxpExtractoId: borrador.id, usuarioId: 'current-user', motivo: `${motivo}: ${obs}` },
      {
        onSuccess: () => { setDescartarOpen(false); showToast('Borrador descartado', 'success'); setTimeout(() => navigate('/borradores-pendientes', { replace: true }), 1000); },
        onError: (err) => { showToast(err.message, 'error'); },
      },
    );
  };

  // ActionBar computed
  const fmtVal = (v: number) => `$ ${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cargosActivos = liveCargos ?? borrador?.cargosFinancieros ?? [];
  const impuestos = liveFiscal
    ? liveFiscal.items.map((i) => ({ nombre: i.nombre, valor: fmtVal(i.valor) }))
    : cargosActivos.length
      ? [{ nombre: 'Cargos financieros', valor: fmtVal(cargosActivos.reduce((sum, c) => sum + c.valor.valor, 0)) }]
      : [];

  const totalCargos = cargosActivos.reduce((sum, c) => sum + c.valor.valor, 0);
  const totalImpuestos = liveFiscal?.total ?? totalCargos ?? undefined;

  return {
    id, isPending, isProcessing, borrador, obligacion, ocr, getHighlight, rechazos, errorFields, descartarOpen, setDescartarOpen,
    barStyle, formRef, totalUbicacion: getHighlight('Total.TotalAPagar'), setHighlightSource,
    handleGuardar, handleConfirmDescartar, rechazarMutation: descartarMutation,
    liveTotal, setLiveTotal, setLiveFiscal, handlePeriodoChange, handleMedioPagoChange, handleCargosChange,
    efectivoPeriodo: { desde: livePeriodo.desde ?? borrador?.periodo?.desde ?? null, hasta: livePeriodo.hasta ?? borrador?.periodo?.hasta ?? null },
    totalMismatchOpen, setTotalMismatchOpen, mismatchInfo, handleMismatchContinue,
    total: liveTotal ?? (borrador ? borrador.partidas.reduce((sum, p) => sum + p.valor.valor, 0) + cargosActivos.reduce((sum, c) => sum + c.valor.valor, 0) : undefined),
    subtotal: borrador ? borrador.partidas.reduce((sum, p) => sum + p.valor.valor, 0) : undefined,
    moneda: borrador?.partidas[0]?.valor.moneda != null ? MONEDA_MAP[borrador.partidas[0].valor.moneda] : undefined,
    impuestos, totalImpuestos,
  };
}
