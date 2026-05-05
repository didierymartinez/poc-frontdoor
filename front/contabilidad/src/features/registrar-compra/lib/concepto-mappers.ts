import type { ConceptoRow, FiscalItem } from '@/entities/concepto';
import type { Comercio, ConceptoRadicacion, TributoApi } from '@/entities/borrador';

export function mapTributoToFiscalItem(tributos: TributoApi[]): FiscalItem[] {
  return tributos.map((t) => ({
    tipo: t.tipo,
    base: t.base.valor,
    tarifa: `${t.tarifa}%`,
    valor: t.valor.valor,
    distri: 0,
  }));
}

export function mapApiConceptos(data?: Comercio, borradorConceptos?: ConceptoRadicacion[]): ConceptoRow[] {
  if (!data?.conceptos?.length) return [];
  return data.conceptos.map((c, i) => {
    const cant = c.cantidad ?? 1;
    const total = c.valorTotal ?? 0;
    const unitario = cant > 0 ? Math.round((total / cant) * 100) / 100 : total;

    const backendConcepto = c.id && borradorConceptos
      ? borradorConceptos.find((bc) => bc.id === c.id)
      : undefined;
    const desglose = backendConcepto?.desgloseFiscal;

    let impuestos: FiscalItem[];
    let retenciones: FiscalItem[];

    if (desglose) {
      impuestos = mapTributoToFiscalItem(desglose.impuestos);
      retenciones = mapTributoToFiscalItem(desglose.retenciones);
    } else {
      impuestos = (c.impuestos ?? []).map((imp) => ({
        tipo: imp.nombre ?? '',
        base: imp.porcentaje && imp.valor ? Math.round(imp.valor / (imp.porcentaje / 100)) : 0,
        tarifa: `${imp.porcentaje ?? 0}%`,
        valor: imp.valor ?? 0,
        distri: 0,
      }));
      retenciones = [];
    }

    return {
      id: c.id ?? null,
      _key: i + 1,
      codigo: backendConcepto?.codigo ?? '',
      descripcion: c.descripcion ?? '',
      cantidad: cant,
      valorUnitario: unitario,
      valor: total,
      distribucion: 0,
      impuestos,
      retenciones,
      ubicacion: c.ubicacion,
    };
  });
}
