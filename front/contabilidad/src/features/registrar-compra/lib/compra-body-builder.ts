import type { AgregadoOxpComercio } from '@/entities/borrador';
import type { FormularioComercioData } from '../model/registro-compra.store';
import type { FormValues } from '@/features/confirmar-borrador';
import type { ConceptoRow } from '@/entities/concepto';
import { toDatetime } from '@/shared/lib';

export type OxpMode = 'borrador' | 'pendiente' | 'devuelta' | 'confirmada';

export function deriveMode(estado?: number): OxpMode {
  switch (estado) {
    case 1: return 'pendiente';
    case 2:
    case 3: return 'confirmada';
    case 4: return 'devuelta';
    default: return 'borrador';
  }
}

export function getFormValues(formulario: FormularioComercioData, storeConceptos: ConceptoRow[]): FormValues {
  return {
    medioPago: formulario.medioPago || undefined,
    tercero: formulario.terceroLabel || undefined,
    moneda: formulario.moneda || undefined,
    monto: formulario.monto ? String(formulario.monto) : undefined,
    fechaTransaccion: formulario.fechaTransaccion || undefined,
    descripcion: formulario.descripcion || undefined,
    conceptosCount: storeConceptos.length,
    conceptos: storeConceptos.map((c) => ({
      descripcion: c.descripcion,
      cantidad: c.cantidad,
      valor: c.valor,
    })),
  };
}

export function buildConceptoPayload(c: ConceptoRow, borrador: AgregadoOxpComercio, monedaNum: number) {
  const original = c.id ? borrador.conceptos.find((bc) => bc.id === c.id) : undefined;
  return {
    id: c.id,
    codigo: c.codigo,
    descripcion: c.descripcion,
    cantidad: c.cantidad,
    dinero: { moneda: monedaNum, valor: c.valor },
    trm: original?.trm ?? null,
    tipo: original?.tipo ?? 0,
    clasificacionTributaria: original?.clasificacionTributaria ?? '',
    conceptoPago: original?.conceptoPago ?? '',
    referenciaOrigen: original?.referenciaOrigen ?? '',
    desgloseFiscal: {
      impuestos: c.impuestos.map((imp) => ({
        tipo: imp.tipo,
        base: { moneda: monedaNum, valor: imp.base },
        tarifa: parseFloat(imp.tarifa.replace('%', '')),
        valor: { moneda: monedaNum, valor: imp.valor },
      })),
      retenciones: c.retenciones.map((ret) => ({
        tipo: ret.tipo,
        base: { moneda: monedaNum, valor: ret.base },
        tarifa: parseFloat(ret.tarifa.replace('%', '')),
        valor: { moneda: monedaNum, valor: ret.valor },
      })),
    },
    destinacionCostos: original?.destinacionCostos ?? [],
  };
}

export function buildBody(borrador: AgregadoOxpComercio, formulario: FormularioComercioData, storeConceptos: ConceptoRow[]) {
  const monedaNum = borrador.valorMonetario.moneda ?? 0;
  const conceptos = storeConceptos.map((c) => buildConceptoPayload(c, borrador, monedaNum));

  return {
    valor: { moneda: monedaNum, valor: formulario.monto || (borrador.valorMonetario.valor ?? 0) },
    informacionTercero: {
      nombre: formulario.terceroLabel || (borrador.informacionTercero.nombre ?? ''),
      identificacion: {
        tipo: formulario.tipoDocumento || (borrador.informacionTercero.identificacion?.tipo ?? ''),
        numero: formulario.numeroDocumento || (borrador.informacionTercero.identificacion?.numero ?? ''),
      },
    },
    descripcion: formulario.descripcion || (borrador.descripcion ?? ''),
    conceptos,
    medioPago: {
      tipo: formulario.medioPago === 'Credito' ? 0
        : formulario.medioPago === 'Debito' ? 1
        : (borrador.medioPago?.tipo ?? 0),
      numero: borrador.medioPago?.numero ?? '',
      entidadBancaria: borrador.medioPago?.entidadBancaria ?? '',
    },
    documento: {
      numero: formulario.soporte || (borrador.documento?.numero ?? ''),
      tipo: borrador.documento?.tipo ?? 0,
      fecha: formulario.fechaTransaccion
        ? toDatetime(formulario.fechaTransaccion)
        : (borrador.documento?.fecha ?? ''),
    },
  };
}
