import { useMemo, useState } from 'react';
import type { ConceptoDevolucionRow } from '../ui/ConceptosDevolucionTable';
import type { AgregadoOxpComercio, AgregadoOxpExtracto, AgregadoAnticipo } from '@/entities/borrador';
import { TIPO_CARGO_LABEL } from '@/entities/borrador';
import type { TipoOrigen } from '@/shared/model';
import type { InformacionDevolucionRequest } from '@/entities/borrador';

type TipoDevolucion = 'total' | 'parcial' | 'por_concepto';

interface FiscalRow {
  tipo: string;
  base: number;
  tarifa: string;
  valor: number;
  distri: number;
}

function mapConceptosFromComercio(agg: AgregadoOxpComercio): ConceptoDevolucionRow[] {
  return agg.conceptos.map((c) => ({
    id: c.id,
    codigo: c.codigo,
    descripcion: c.descripcion,
    cantidad: c.cantidad,
    valor: c.dinero.valor,
    desgloseFiscal: [
      ...(c.desgloseFiscal?.impuestos.map((i) => i.tipo) ?? []),
      ...(c.desgloseFiscal?.retenciones.map((r) => r.tipo) ?? []),
    ],
    cantidadADevolver: c.cantidad,
    valorADevolver: c.dinero.valor,
    impuestos: c.desgloseFiscal?.impuestos.map((i) => ({
      tipo: i.tipo,
      base: i.base.valor,
      tarifa: `${(i.tarifa * 100).toFixed(1)}%`,
      valor: i.valor.valor,
      distri: 0,
    })) ?? [],
    retenciones: c.desgloseFiscal?.retenciones.map((r) => ({
      tipo: r.tipo,
      base: r.base.valor,
      tarifa: `${(r.tarifa * 100).toFixed(1)}%`,
      valor: r.valor.valor,
      distri: 0,
    })) ?? [],
  }));
}

function computeFiscalSummary(conceptos: ConceptoDevolucionRow[]) {
  const impMap = new Map<string, FiscalRow>();
  const retMap = new Map<string, FiscalRow>();

  for (const c of conceptos) {
    if (c.cantidadADevolver <= 0) continue;
    const ratio = c.cantidadADevolver / c.cantidad;

    for (const imp of c.impuestos) {
      const key = `${imp.tipo}-${imp.tarifa}`;
      const existing = impMap.get(key);
      const scaledValor = imp.valor * ratio;
      const scaledBase = imp.base * ratio;
      if (existing) {
        existing.valor += scaledValor;
        existing.base += scaledBase;
      } else {
        impMap.set(key, { ...imp, valor: scaledValor, base: scaledBase });
      }
    }
    for (const ret of c.retenciones) {
      const key = `${ret.tipo}-${ret.tarifa}`;
      const existing = retMap.get(key);
      const scaledValor = ret.valor * ratio;
      const scaledBase = ret.base * ratio;
      if (existing) {
        existing.valor += scaledValor;
        existing.base += scaledBase;
      } else {
        retMap.set(key, { ...ret, valor: scaledValor, base: scaledBase });
      }
    }
  }

  return {
    impuestos: [...impMap.values()],
    retenciones: [...retMap.values()],
  };
}

export function useFormularioDevolucion(
  totalCompra: number,
  tipoOrigen: TipoOrigen | null,
  origenAgregado: AgregadoOxpComercio | AgregadoOxpExtracto | AgregadoAnticipo | null,
) {
  const [tipoDevolucion, setTipoDevolucion] = useState<TipoDevolucion>('total');
  const [soporte, setSoporte] = useState('');
  const [soporteFile, setSoporteFile] = useState<File | null>(null);
  const [montoParcial, setMontoParcial] = useState('');
  const [distribucionOpen, setDistribucionOpen] = useState(false);
  const [motivoReversa, setMotivoReversa] = useState<string>('Proveedor incorrecto');
  const [selectedCargoIds, setSelectedCargoIds] = useState<Set<string>>(new Set());

  // Initialize selectedCargoIds when origin aggregate changes (all selected by default)
  const cargosFromOrigin = useMemo(() => {
    if (tipoOrigen === 'extracto' && origenAgregado && 'cargosFinancieros' in origenAgregado) {
      return (origenAgregado as AgregadoOxpExtracto).cargosFinancieros;
    }
    return [];
  }, [tipoOrigen, origenAgregado]);

  const toggleCargoSelection = (id: string) => {
    setSelectedCargoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllCargos = () => {
    if (selectedCargoIds.size === cargosFromOrigin.length) {
      setSelectedCargoIds(new Set());
    } else {
      setSelectedCargoIds(new Set(cargosFromOrigin.map((c) => c.id)));
    }
  };

  // Derive conceptos from origin aggregate (Comercio only)
  const conceptosFromOrigin = useMemo(() => {
    if (tipoOrigen === 'compra' && origenAgregado && 'conceptos' in origenAgregado) {
      return mapConceptosFromComercio(origenAgregado as AgregadoOxpComercio);
    }
    return [];
  }, [tipoOrigen, origenAgregado]);

  const [conceptos, setConceptos] = useState<ConceptoDevolucionRow[]>([]);

  // Sync conceptos when origin data loads
  if (conceptosFromOrigin.length > 0 && conceptos.length === 0) {
    setConceptos(conceptosFromOrigin);
  }

  const totalDevolucion = useMemo(() => {
    if (tipoOrigen === 'extracto') {
      return cargosFromOrigin
        .filter((c) => selectedCargoIds.has(c.id))
        .reduce((sum, c) => sum + c.valor.valor, 0);
    }
    if (tipoDevolucion === 'total') return totalCompra;
    if (tipoDevolucion === 'parcial') return Number(montoParcial) || 0;
    if (tipoDevolucion === 'por_concepto') {
      return conceptos
        .filter((c) => c.cantidadADevolver > 0)
        .reduce((sum, c) => sum + c.valorADevolver, 0);
    }
    return 0;
  }, [tipoOrigen, tipoDevolucion, totalCompra, montoParcial, conceptos, cargosFromOrigin, selectedCargoIds]);

  const fiscalSummary = useMemo(() => {
    if (tipoOrigen !== 'compra') return { impuestos: [], retenciones: [] };
    return computeFiscalSummary(tipoDevolucion === 'por_concepto' ? conceptos : conceptosFromOrigin);
  }, [tipoOrigen, tipoDevolucion, conceptos, conceptosFromOrigin]);

  const subtotal = useMemo(() => {
    if (tipoDevolucion === 'por_concepto') {
      return conceptos.filter((c) => c.cantidadADevolver > 0).reduce((sum, c) => sum + c.valorADevolver, 0);
    }
    return totalCompra;
  }, [tipoDevolucion, conceptos, totalCompra]);

  const totalImpuestos = fiscalSummary.impuestos.reduce((sum, i) => sum + i.valor, 0);
  const totalRetenciones = fiscalSummary.retenciones.reduce((sum, r) => sum + r.valor, 0);

  const handleCantidadChange = (id: string, cantidad: number) => {
    setConceptos((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const clamped = Math.min(Math.max(cantidad, 0), c.cantidad);
      const valorUnitario = c.cantidad > 0 ? c.valor / c.cantidad : 0;
      return { ...c, cantidadADevolver: clamped, valorADevolver: Math.round(clamped * valorUnitario * 100) / 100 };
    }));
  };

  const handleValorChange = (id: string, valor: number) => {
    setConceptos((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const clamped = Math.min(Math.max(valor, 0), c.valor);
      const valorUnitario = c.valor > 0 ? c.cantidad / c.valor : 0;
      return { ...c, valorADevolver: clamped, cantidadADevolver: Math.round(clamped * valorUnitario * 100) / 100 };
    }));
  };

  const handleSoporteFileChange = (file: File | null) => {
    setSoporteFile(file);
    setSoporte(file?.name ?? '');
  };

  // Build FormData payload for POST /Devolucion
  const buildPayload = (): FormData | null => {
    if (!origenAgregado || !tipoOrigen) return null;

    const agg = origenAgregado;
    const terceroInfo = 'informacionTercero' in agg ? agg.informacionTercero : null;
    if (!terceroInfo) return null;

    const info: InformacionDevolucionRequest = {
      origen: {
        tipo: tipoOrigen === 'compra' ? 'Comercio' : tipoOrigen === 'extracto' ? 'Extracto' : 'Anticipo',
        oxpComercioId: tipoOrigen === 'compra' ? agg.id : null,
        oxpExtractoId: tipoOrigen === 'extracto' ? agg.id : null,
        cargoFinancieroIds: null,
        anticipoId: tipoOrigen === 'anticipo' ? agg.id : null,
      },
      informacionTercero: {
        nombre: terceroInfo.nombre,
        identificacion: {
          tipo: terceroInfo.identificacion?.tipo ?? 'NIT',
          numero: terceroInfo.identificacion?.numero ?? '',
        },
      },
      descripcion: soporte || 'Devolución',
      conceptosDevueltos: null,
      cargosDevueltos: null,
      reversa: null,
    };

    if (tipoOrigen === 'compra') {
      const comercio = agg as AgregadoOxpComercio;
      if (tipoDevolucion === 'total') {
        info.conceptosDevueltos = comercio.conceptos.map((c) => ({
          id: c.id,
          codigo: c.codigo,
          descripcion: c.descripcion,
          cantidad: c.cantidad,
          valorBruto: { valor: c.dinero.valor, moneda: (c.dinero.moneda) },
          clasificacionTributaria: c.clasificacionTributaria,
          conceptoPago: c.conceptoPago,
          referenciaOrigen: c.referenciaOrigen,
          desgloseFiscal: c.desgloseFiscal ? {
            impuestos: c.desgloseFiscal.impuestos.map((i) => ({
              tipo: i.tipo,
              base: { valor: i.base.valor, moneda: (i.base.moneda) },
              tarifa: i.tarifa,
              valor: { valor: i.valor.valor, moneda: (i.valor.moneda) },
            })),
            retenciones: c.desgloseFiscal.retenciones.map((r) => ({
              tipo: r.tipo,
              base: { valor: r.base.valor, moneda: (r.base.moneda) },
              tarifa: r.tarifa,
              valor: { valor: r.valor.valor, moneda: (r.valor.moneda) },
            })),
          } : null,
        }));
      } else if (tipoDevolucion === 'por_concepto') {
        info.conceptosDevueltos = conceptos
          .filter((c) => c.cantidadADevolver > 0)
          .map((c) => {
            const original = comercio.conceptos.find((oc) => oc.id === c.id);
            return {
              id: c.id,
              codigo: c.codigo,
              descripcion: c.descripcion,
              cantidad: c.cantidadADevolver,
              valorBruto: { valor: c.valorADevolver, moneda: (original?.dinero.moneda ?? 0) },
              clasificacionTributaria: original?.clasificacionTributaria ?? '',
              conceptoPago: original?.conceptoPago ?? '',
              referenciaOrigen: original?.referenciaOrigen ?? '',
              desgloseFiscal: original?.desgloseFiscal ? {
                impuestos: original.desgloseFiscal.impuestos.map((i) => {
                  const ratio = c.cantidadADevolver / c.cantidad;
                  return {
                    tipo: i.tipo,
                    base: { valor: i.base.valor * ratio, moneda: (i.base.moneda) },
                    tarifa: i.tarifa,
                    valor: { valor: i.valor.valor * ratio, moneda: (i.valor.moneda) },
                  };
                }),
                retenciones: original.desgloseFiscal.retenciones.map((r) => {
                  const ratio = c.cantidadADevolver / c.cantidad;
                  return {
                    tipo: r.tipo,
                    base: { valor: r.base.valor * ratio, moneda: (r.base.moneda) },
                    tarifa: r.tarifa,
                    valor: { valor: r.valor.valor * ratio, moneda: (r.valor.moneda) },
                  };
                }),
              } : null,
            };
          });
      }
      // parcial: monto plano — backend proratea
    } else if (tipoOrigen === 'extracto') {
      const extracto = agg as AgregadoOxpExtracto;
      info.cargosDevueltos = extracto.cargosFinancieros
        .filter((c) => selectedCargoIds.has(c.id))
        .map((c) => ({
          id: c.id,
          referenciaCargoFinanciero: c.id,
          descripcion: TIPO_CARGO_LABEL[c.tipo] ?? `Cargo financiero tipo ${c.tipo}`,
          valor: { valor: c.valor.valor, moneda: (c.valor.moneda) },
        }));
      info.origen.cargoFinancieroIds = extracto.cargosFinancieros
        .filter((c) => selectedCargoIds.has(c.id))
        .map((c) => c.id);
    } else if (tipoOrigen === 'anticipo') {
      const anticipo = agg as AgregadoAnticipo;
      const descripcionReversa = motivoReversa === 'Proveedor incorrecto'
        ? 'Se registró el anticipo con un tercero equivocado.'
        : 'Se registró el anticipo con un valor equivocado.';
      info.reversa = {
        id: crypto.randomUUID(),
        motivoReversa,
        descripcion: descripcionReversa,
        valor: { valor: anticipo.valorMonetario.valor, moneda: (anticipo.valorMonetario.moneda) },
      };
    }

    const fd = new FormData();
    fd.append('InformacionDevolucion', JSON.stringify(info));
    if (soporteFile) {
      fd.append('Soporte', soporteFile);
    }
    return fd;
  };

  // Validation — el React Compiler memoiza automáticamente.
  const isValid = (() => {
    if (!origenAgregado || !tipoOrigen) return false;

    if (tipoOrigen === 'compra') {
      if (tipoDevolucion === 'parcial') {
        const monto = Number(montoParcial);
        return monto > 0 && monto <= totalCompra;
      }
      if (tipoDevolucion === 'por_concepto') {
        return conceptos.some((c) => c.cantidadADevolver > 0);
      }
      return true; // total
    }

    if (tipoOrigen === 'extracto') {
      return selectedCargoIds.size > 0;
    }

    if (tipoOrigen === 'anticipo') {
      return true; // reversa total, no user input needed
    }

    return false;
  })();

  return {
    tipoDevolucion, setTipoDevolucion,
    soporte, setSoporte,
    soporteFile, handleSoporteFileChange,
    montoParcial, setMontoParcial,
    conceptos,
    distribucionOpen, setDistribucionOpen,
    motivoReversa, setMotivoReversa,
    cargosFromOrigin, selectedCargoIds, toggleCargoSelection, toggleAllCargos,
    totalDevolucion,
    subtotal,
    fiscalSummary,
    totalImpuestos,
    totalRetenciones,
    isValid,
    handleCantidadChange,
    handleValorChange,
    buildPayload,
  };
}

export type { TipoDevolucion };
