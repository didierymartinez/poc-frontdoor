import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import dayjs, { type Dayjs } from 'dayjs';
import type { Comercio, Source } from '@/entities/borrador';
import { MONEDA_MAP } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import { useRegistroCompraStore } from '../model/registro-compra.store';

// Tercero option type for Autocomplete
interface TerceroOption { label: string; id: string }

function toHighlight(source?: Source): HighlightSource | null {
  if (!source?.ubicacion) return null;
  return source as HighlightSource;
}

function resolveMoneda(moneda?: number | string): string {
  if (typeof moneda === 'number') return MONEDA_MAP[moneda] ?? '';
  return moneda ?? '';
}

interface UseFormularioComercioParams {
  data?: Comercio;
  montoOverride?: number | null;
  highlightsEnabled?: boolean;
}

export function useFormularioComercio({ data, montoOverride, highlightsEnabled = true }: UseFormularioComercioParams) {
  const theme = useTheme();
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);
  const setFormField = useRegistroCompraStore((s) => s.setFormField);

  const highlight = (source?: Source) => () => {
    if (!highlightsEnabled) return;
    const hl = toHighlight(source);
    if (hl) setHighlightSource(hl);
  };
  const clearHighlight = () => { if (highlightsEnabled) setHighlightSource(null); };

  const [medioPago, _setMedioPago] = useState(data?.medioPago ?? '');
  const [tarjeta, _setTarjeta] = useState('visa-default');
  const [fechaTransaccion, _setFechaTransaccion] = useState<Dayjs | null>(
    data?.fechaPago?.valor ? dayjs(data.fechaPago.valor)
    : data?.referencia?.fechaDocumento?.valor ? dayjs(data.referencia.fechaDocumento.valor)
    : null,
  );
  const [tercero, _setTercero] = useState<TerceroOption | null>(
    data?.acreedor?.nombre?.valor
      ? { label: data.acreedor.nombre.valor, id: data.acreedor.identificacion?.valor ?? '' }
      : null,
  );
  const terceroOptions: TerceroOption[] = tercero ? [tercero] : [];
  const [tipoDocumento, _setTipoDocumento] = useState(data?.acreedor?.tipoIdentificacion ?? '');
  const [numeroDocumento, _setNumeroDocumento] = useState(data?.acreedor?.identificacion?.valor ?? '');
  const [moneda, _setMoneda] = useState(resolveMoneda(data?.moneda));
  const [monto, _setMonto] = useState(data?.total?.totalAPagar?.valor ?? 0);

  // Wrap setters to sync with store
  const setMedioPago = (v: string) => { _setMedioPago(v); setFormField('medioPago', v); };
  const setTarjeta = (v: string) => { _setTarjeta(v); setFormField('tarjeta', v); };
  const setFechaTransaccion = (v: Dayjs | null) => { _setFechaTransaccion(v); setFormField('fechaTransaccion', v?.format('DD/MM/YYYY') ?? ''); };
  const setTercero = (v: TerceroOption | null) => { _setTercero(v); setFormField('terceroLabel', v?.label ?? ''); };
  const setTipoDocumento = (v: string) => { _setTipoDocumento(v); setFormField('tipoDocumento', v); };
  const setNumeroDocumento = (v: string) => { _setNumeroDocumento(v); setFormField('numeroDocumento', v); };
  const setMoneda = (v: string) => { _setMoneda(v); setFormField('moneda', v); };
  const setMonto = (v: number) => { _setMonto(v); setFormField('monto', v); };
  const [soporte, _setSoporte] = useState(data?.referencia?.numero?.valor ?? '');
  const setSoporte = (v: string) => { _setSoporte(v); setFormField('soporte', v); };
  const [distAnchor, setDistAnchor] = useState<HTMLElement | null>(null);

  // Sync monto when parent triggers override
  useEffect(() => {
    if (montoOverride != null && montoOverride > 0) setMonto(montoOverride);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montoOverride]);

  // Sync initial values to store on mount
  useEffect(() => {
    useRegistroCompraStore.getState().setFormulario({
      medioPago,
      tarjeta,
      fechaTransaccion: fechaTransaccion?.format('DD/MM/YYYY') ?? '',
      tipoDocumento,
      numeroDocumento,
      terceroLabel: tercero?.label ?? '',
      moneda,
      monto,
      soporte,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fechaTransaccionError = fechaTransaccion?.isValid() && fechaTransaccion.isAfter(dayjs(), 'day')
    ? 'La fecha no puede ser futura'
    : '';

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
    soporte,
    setSoporte,
    fechaTransaccionError,
    distAnchor,
    setDistAnchor,
  };
}
