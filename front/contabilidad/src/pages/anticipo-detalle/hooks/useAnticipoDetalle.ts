import { useParams, useOutletContext } from 'react-router-dom';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries, MONEDA_MAP } from '@/entities/borrador';
import type { AgregadoAnticipo } from '@/entities/borrador';
import type { MainLayoutContext } from '@/shared/model';
import { base64ToBlobUrl } from '@/shared/lib';

const ESTADO_LABEL: Record<number, string> = {
  0: 'Borrador',
  1: 'Vigente',
  2: 'Pagado',
  3: 'Regularizado',
  4: 'Cerrado',
  5: 'Reversado',
  6: 'Descartado',
};

const ESTADO_COLOR: Record<number, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  0: 'warning',
  1: 'primary',
  2: 'success',
  3: 'info',
  4: 'error',
  5: 'error',
  6: 'default',
};

const MEDIO_PAGO_LABEL: Record<number, string> = {
  0: 'Tarjeta de crédito',
  1: 'Tarjeta de débito',
};

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mapAnticipo(a: AgregadoAnticipo) {
  const moneda = a.valorMonetario ? (MONEDA_MAP[a.valorMonetario.moneda] ?? 'COP') : 'COP';
  const totalPagado = a.crucesPagoAplicados.reduce((sum, p) => sum + p.valorCubierto.valor, 0);
  const totalRegularizado = a.crucesRegularizacion.reduce((sum, r) => sum + r.montoRegularizado.valor, 0);
  const total = a.valorMonetario?.valor ?? 0;

  return {
    id: a.id,
    estado: ESTADO_LABEL[a.estado] ?? 'Vigente',
    estadoColor: ESTADO_COLOR[a.estado] ?? 'primary',
    medioPago: a.medioPago ? (MEDIO_PAGO_LABEL[a.medioPago.tipo] ?? '') : undefined,
    medioPagoNumero: a.medioPago?.numero ?? undefined,
    medioPagoRaw: a.medioPago,
    tercero: a.informacionTercero
      ? `${a.informacionTercero.identificacion?.numero ?? ''} – ${a.informacionTercero.nombre}`
      : undefined,
    fecha: a.fecha ? new Date(a.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : undefined,
    justificacion: a.justificacion,
    soporte: a.soporte,
    distribucion: a.instruccionDistribucion,
    total,
    moneda,
    totalFormatted: fmt(total),
    saldoPorPagar: {
      pagado: fmt(totalPagado),
      pendiente: fmt(total - totalPagado),
      pendienteRaw: total - totalPagado,
    },
    saldoPorRegularizar: {
      regularizado: fmt(totalRegularizado),
      pendiente: fmt(total - totalRegularizado),
      pendienteRaw: total - totalRegularizado,
    },
    pagos: a.crucesPagoAplicados.map((p) => ({
      tipo: p.tipo === 0 ? 'Pago directo' : 'Extracto',
      tipoColor: undefined as 'default' | 'error' | undefined,
      referencia: p.referenciaId ?? p.id,
      fecha: new Date(p.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      valor: fmt(p.valorCubierto.valor),
    })),
    regularizaciones: a.crucesRegularizacion.map((r) => ({
      tipo: 'Regularización',
      tipoColor: undefined as 'default' | 'error' | undefined,
      referencia: r.oxpComercioId,
      fecha: new Date(r.fechaRegularizacion).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      valor: fmt(r.montoRegularizado.valor),
    })),
  };
}

export function useAnticipoDetalle() {
  const { id } = useParams<{ id: string }>();
  const { openDocument } = useOutletContext<MainLayoutContext>();
  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleAnticipo(id ?? ''),
    enabled: !!id,
  });

  const anticipo = detalle?.anticipo;
  const archivo = detalle?.archivo;
  const hasSoporte = !!(anticipo?.soporte) || !!(archivo?.base64);
  const mapped = anticipo ? mapAnticipo(anticipo) : undefined;

  const handleOpenSoporte = useCallback(() => {
    if (archivo?.base64) {
      const url = base64ToBlobUrl(archivo.base64, archivo.tipo || 'application/pdf');
      openDocument(url, archivo.nombre || 'soporte');
    }
  }, [archivo, openDocument]);

  return { id, isPending, anticipo: mapped, hasSoporte, handleOpenSoporte };
}
