import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import type { Anticipo as AnticipoData, AgregadoAnticipo, Source } from '@/entities/borrador';
import { MONEDA_MAP } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import type { TerceroOption } from '../ui/anticipo-helpers';
import { useRegistroAnticipoStore } from '../model/registro-anticipo.store';

interface UseFormularioAnticipoCompleteParams {
  data?: AnticipoData;
  agregado?: AgregadoAnticipo;
}

export function useFormularioAnticipoComplete({ data, agregado }: UseFormularioAnticipoCompleteParams) {
  const theme = useTheme();
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);
  const { setFormField, setFormulario } = useRegistroAnticipoStore();

  const highlight = (ubicacion?: Source) => () => {
    const src = ubicacion as HighlightSource | undefined;
    if (src?.pageNumber && src?.ubicacion) setHighlightSource(src);
  };
  const clearHighlight = () => setHighlightSource(null);

  // Initialize from AgregadoAnticipo (API) first, then fall back to AnticipoData (OCR)
  const initMedioPago = agregado?.medioPago
    ? (agregado.medioPago.tipo === 0 ? 'Credito' : 'Debito')
    : (data?.medioPago ?? '');
  const initTarjeta = 'visa-default';
  const initFecha = agregado?.fecha
    ? dayjs(agregado.fecha)
    : (data?.fechaPago?.valor ? dayjs(data.fechaPago.valor) : null);
  const initTercero: TerceroOption | null = agregado?.informacionTercero
    ? { label: agregado.informacionTercero.nombre, id: agregado.informacionTercero.identificacion?.numero ?? '' }
    : (data?.beneficiario?.nombre?.valor
      ? { label: data.beneficiario.nombre.valor, id: data.beneficiario.identificacion?.valor ?? '' }
      : null);
  const initTipoDoc = agregado?.informacionTercero?.identificacion?.tipo
    ?? data?.beneficiario?.tipoIdentificacion ?? '';
  const initNumDoc = agregado?.informacionTercero?.identificacion?.numero
    ?? data?.beneficiario?.identificacion?.valor ?? '';
  const initMoneda = agregado?.valorMonetario
    ? (MONEDA_MAP[agregado.valorMonetario.moneda] ?? '')
    : (typeof data?.moneda === 'number' ? (MONEDA_MAP[data.moneda] ?? '') : (data?.moneda ?? ''));
  const initMonto = agregado?.valorMonetario?.valor ?? data?.concepto?.valor ?? 0;
  const initSoporte = data?.referencia?.numero?.valor ?? '';

  const [medioPago, setMedioPagoLocal] = useState(initMedioPago);
  const [tarjeta, setTarjetaLocal] = useState(initTarjeta);
  const [fechaTransaccion, setFechaTransaccionLocal] = useState<Dayjs | null>(initFecha);
  const [tercero, setTerceroLocal] = useState<TerceroOption | null>(initTercero);
  const terceroOptions: TerceroOption[] = tercero ? [tercero] : [];
  const [tipoDocumento, setTipoDocumentoLocal] = useState(initTipoDoc);
  const [numeroDocumento, setNumeroDocumentoLocal] = useState(initNumDoc);
  const [moneda, setMonedaLocal] = useState(initMoneda);
  const [monto, setMontoLocal] = useState(initMonto);
  const [soporte, setSoporteLocal] = useState(initSoporte);

  // Re-initialize when agregado arrives from API (async).
  // Uses the "adjust state during render" pattern instead of an effect.
  const [initialized, setInitialized] = useState(false);
  if (agregado && !initialized) {
    setInitialized(true);
    const mp = agregado.medioPago
      ? (agregado.medioPago.tipo === 0 ? 'Credito' : 'Debito')
      : '';
    setMedioPagoLocal(mp);
    setTarjetaLocal('visa-default');
    setFechaTransaccionLocal(agregado.fecha ? dayjs(agregado.fecha) : null);
    setTerceroLocal(agregado.informacionTercero
      ? { label: agregado.informacionTercero.nombre, id: agregado.informacionTercero.identificacion?.numero ?? '' }
      : null);
    setTipoDocumentoLocal(agregado.informacionTercero?.identificacion?.tipo ?? '');
    setNumeroDocumentoLocal(agregado.informacionTercero?.identificacion?.numero ?? '');
    const mon = agregado.valorMonetario ? (MONEDA_MAP[agregado.valorMonetario.moneda] ?? '') : '';
    setMonedaLocal(mon);
    setMontoLocal(agregado.valorMonetario?.valor ?? 0);
  }

  const fechaTransaccionError = fechaTransaccion?.isValid() && fechaTransaccion.isAfter(dayjs(), 'day')
    ? 'La fecha no puede ser futura'
    : '';

  // Sync local state → Zustand store
  useEffect(() => {
    setFormulario({
      medioPago,
      tarjeta,
      fechaTransaccion: fechaTransaccion?.isValid() ? fechaTransaccion.format('YYYY-MM-DD') : '',
      tipoDocumento,
      numeroDocumento,
      terceroLabel: tercero?.label ?? '',
      terceroId: tercero?.id ?? '',
      moneda,
      monto,
      soporte,
    });
  }, [medioPago, tarjeta, fechaTransaccion, tipoDocumento, numeroDocumento, tercero, moneda, monto, soporte, setFormulario]);

  // Wrapped setters that update both local and store
  const setMedioPago = (v: string) => { setMedioPagoLocal(v); setFormField('medioPago', v); };
  const setTarjeta = (v: string) => { setTarjetaLocal(v); setFormField('tarjeta', v); };
  const setFechaTransaccion = (v: Dayjs | null) => { setFechaTransaccionLocal(v); };
  const setTercero = (v: TerceroOption | null) => { setTerceroLocal(v); };
  const setTipoDocumento = (v: string) => { setTipoDocumentoLocal(v); setFormField('tipoDocumento', v); };
  const setNumeroDocumento = (v: string) => { setNumeroDocumentoLocal(v); setFormField('numeroDocumento', v); };
  const setMoneda = (v: string) => { setMonedaLocal(v); setFormField('moneda', v); };
  const setMonto = (v: number) => { setMontoLocal(v); setFormField('monto', v); };
  const setSoporte = (v: string) => { setSoporteLocal(v); setFormField('soporte', v); };

  return {
    theme,
    highlight,
    clearHighlight,
    medioPago,
    setMedioPago,
    tarjeta,
    setTarjeta,
    fechaTransaccion,
    setFechaTransaccion,
    tercero,
    setTercero,
    terceroOptions,
    tipoDocumento,
    setTipoDocumento,
    numeroDocumento,
    setNumeroDocumento,
    moneda,
    setMoneda,
    monto,
    setMonto,
    fechaTransaccionError,
    soporte,
    setSoporte,
  };
}
