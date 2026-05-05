import { MONEDA_MAP } from '@/entities/borrador';
import type { AgregadoOxpComercio } from '@/entities/borrador';

const ESTADO_LABEL: Record<number, string> = {
  0: 'Borrador', 1: 'Pendiente', 2: 'Confirmada', 3: 'Causada', 4: 'Devuelta', 5: 'Pagada', 6: 'Descartado',
};

const ESTADO_COLOR: Record<number, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  0: 'warning', 1: 'warning', 2: 'success', 3: 'info', 4: 'warning', 5: 'success', 6: 'error',
};

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function mapCompra(c: AgregadoOxpComercio) {
  const moneda = MONEDA_MAP[c.valorMonetario.moneda] ?? 'COP';
  const totalBruto = c.conceptos.reduce((s, con) => s + con.dinero.valor, 0);
  const totalImpuestos = c.conceptos.reduce((s, con) => {
    if (!con.desgloseFiscal) return s;
    return s + con.desgloseFiscal.impuestos.reduce((si, imp) => si + imp.valor.valor, 0);
  }, 0);
  const totalRetenciones = c.conceptos.reduce((s, con) => {
    if (!con.desgloseFiscal) return s;
    return s + con.desgloseFiscal.retenciones.reduce((sr, ret) => sr + ret.valor.valor, 0);
  }, 0);

  return {
    id: c.id,
    estado: ESTADO_LABEL[c.estado] ?? 'Pendiente',
    estadoColor: ESTADO_COLOR[c.estado] ?? 'warning',
    tercero: c.informacionTercero
      ? `${c.informacionTercero.identificacion?.numero ?? ''} – ${c.informacionTercero.nombre}`
      : undefined,
    descripcion: c.descripcion,
    documento: c.documento,
    medioPago: c.medioPago,
    trm: c.tasaRepresentativaMercado,
    moneda,
    total: c.valorMonetario.valor,
    totalFormatted: fmt(c.valorMonetario.valor),
    totalBruto: fmt(totalBruto),
    totalImpuestos: fmt(totalImpuestos),
    totalRetenciones: fmt(totalRetenciones),
    funcional: c.tasaRepresentativaMercado
      ? fmt(c.valorMonetario.valor * c.tasaRepresentativaMercado.valor)
      : undefined,
    conceptos: c.conceptos.map((con) => ({
      id: con.id,
      codigo: con.codigo,
      descripcion: con.descripcion,
      cantidad: con.cantidad,
      valor: con.dinero.valor,
      impuestos: con.desgloseFiscal?.impuestos.map((imp) => ({
        tipo: imp.tipo,
        base: fmt(imp.base.valor),
        tarifa: `${imp.tarifa}%`,
        valor: fmt(imp.valor.valor),
        valorNum: imp.valor.valor,
      })) ?? [],
      retenciones: con.desgloseFiscal?.retenciones.map((ret) => ({
        tipo: ret.tipo,
        base: fmt(ret.base.valor),
        tarifa: `${ret.tarifa}%`,
        valor: fmt(ret.valor.valor),
        valorNum: ret.valor.valor,
      })) ?? [],
    })),
    distribucion: c.instruccionDistribucion,
    soportePresupuestal: c.soportePresupuestal,
    archivos: c.archivosVinculados,
    pagos: c.pagosAplicados,
  };
}
