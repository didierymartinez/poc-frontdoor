import type {
  AgregadoOxpComercio,
  AgregadoOxpExtracto,
  AgregadoAnticipo,
} from './borrador-api.types';
import type {
  MetadatosOcr,
  Comercio,
  Anticipo,
  Extracto,
  Source,
} from './borrador.types';
import { MONEDA_MAP } from './borrador.types';

/**
 * Maps an OCR campo name to a Source (highlight location) or undefined.
 */
function ocrSource(ocr: MetadatosOcr | undefined, fieldName: string): Source | undefined {
  const campo = ocr?.campos?.find((c) => c.nombreCampo === fieldName);
  if (!campo) return undefined;
  const u = campo.ubicacion;
  return {
    pageNumber: u.numeroPagina,
    ubicacion: {
      superiorIzquierda: u.superiorIzquierda,
      superiorDerecha: u.superiorDerecha,
      inferiorIzquierda: u.inferiorIzquierda,
      inferiorDerecha: u.inferiorDerecha,
    },
  };
}

/**
 * Adapts AgregadoOxpComercio (full aggregate) + MetadatosOcr
 * into the Comercio shape that RegistroForm expects.
 */
export function agregadoComercioToComercio(
  agg: AgregadoOxpComercio | undefined,
  ocr?: MetadatosOcr,
): Comercio | undefined {
  if (!agg) return undefined;

  return {
    $tipo: 'comercio',
    referencia: {
      numero: {
        valor: agg.documento?.numero ?? undefined,
        ubicacion: ocrSource(ocr, 'Referencia.Numero'),
      },
      fechaDocumento: {
        valor: agg.documento?.fecha?.split('T')[0],
        ubicacion: ocrSource(ocr, 'Referencia.FechaDocumento'),
      },
    },
    acreedor: {
      nombre: {
        valor: agg.informacionTercero.nombre || undefined,
        ubicacion: ocrSource(ocr, 'Acreedor.Nombre'),
      },
      identificacion: {
        valor: agg.informacionTercero.identificacion?.numero || undefined,
      },
      tipoIdentificacion: agg.informacionTercero.identificacion?.tipo || undefined,
    },
    fechaPago: undefined,
    moneda: MONEDA_MAP[agg.valorMonetario.moneda] ?? agg.valorMonetario.moneda,
    medioPago: agg.medioPago != null
      ? (agg.medioPago.tipo === 0 ? 'Credito' : 'Debito')
      : undefined,
    descripcion: agg.descripcion || undefined,
    conceptos: agg.conceptos.map((c, i) => ({
      id: c.id,
      descripcion: c.descripcion,
      cantidad: c.cantidad,
      valorUnitario: c.dinero.valor / (c.cantidad || 1),
      valorTotal: c.dinero.valor,
      impuestos: [],
      ubicacion: ocrSource(ocr, `Concepto[${i}]`),
    })),
    total: {
      subtotal: {
        valor: agg.valorMonetario.valor,
        ubicacion: ocrSource(ocr, 'Total.Subtotal'),
      },
      totalAPagar: {
        valor: agg.valorMonetario.valor,
        ubicacion: ocrSource(ocr, 'Total.TotalAPagar'),
      },
    },
  };
}

/**
 * Adapts AgregadoOxpExtracto (full aggregate) + MetadatosOcr
 * into the Extracto shape that RegistroExtractoForm expects.
 */
export function agregadoExtractoToExtracto(
  agg: AgregadoOxpExtracto | undefined,
  ocr?: MetadatosOcr,
): Extracto | undefined {
  if (!agg) return undefined;

  const moneda = agg.partidas[0]?.valor?.moneda;

  return {
    $tipo: 'extracto',
    tarjeta: {
      numero: {
        valor: agg.medioPago?.numero || undefined,
        ubicacion: ocrSource(ocr, 'Tarjeta.Numero'),
      },
      tipo: agg.medioPago?.tipo === 0 ? 'Credito' : 'Debito',
    },
    entidadFinanciera: {
      nombre: {
        valor: agg.informacionTercero.nombre || undefined,
        ubicacion: ocrSource(ocr, 'EntidadFinanciera.Nombre'),
      },
    },
    periodo: {
      desde: {
        valor: agg.periodo?.desde ?? undefined,
      },
      hasta: {
        valor: agg.periodo?.hasta ?? undefined,
        ubicacion: ocrSource(ocr, 'Periodo.Hasta'),
      },
    },
    fechaPago: {
      valor: undefined,
      ubicacion: ocrSource(ocr, 'FechaPago'),
    },
    movimientos: agg.partidas.map((p, i) => ({
      id: p.id,
      descripcion: p.descripcion,
      fecha: p.fechaTransaccion?.split('T')[0],
      valor: { valor: p.valor.valor },
      moneda: p.valor.moneda,
      tipo: p.estado,
      tasaCambio: undefined,
      ubicacion: ocrSource(ocr, `Movimiento[${i}]`),
    })),
    totales: [
      {
        moneda: moneda != null ? (MONEDA_MAP[moneda] ?? moneda) : undefined,
        subtotal: {
          valor: agg.partidas.reduce((sum, p) => sum + p.valor.valor, 0),
        },
        totalAPagar: {
          valor: agg.partidas.reduce((sum, p) => sum + p.valor.valor, 0),
        },
      },
    ],
  };
}

/**
 * Adapts AgregadoAnticipo (full aggregate) + MetadatosOcr
 * into the Anticipo shape that AnticipoForm expects.
 * OCR campos: Beneficiario.Nombre, Beneficiario.Identificacion, FechaPago, Concepto
 */
export function agregadoAnticipoToAnticipo(
  agg: AgregadoAnticipo | undefined,
  ocr?: MetadatosOcr,
): Anticipo | undefined {
  if (!agg) return undefined;

  return {
    $tipo: 'anticipo',
    referencia: undefined,
    beneficiario: {
      nombre: {
        valor: agg.informacionTercero?.nombre || undefined,
        ubicacion: ocrSource(ocr, 'Beneficiario.Nombre'),
      },
      identificacion: {
        valor: agg.informacionTercero?.identificacion?.numero || undefined,
        ubicacion: ocrSource(ocr, 'Beneficiario.Identificacion'),
      },
      tipoIdentificacion: agg.informacionTercero?.identificacion?.tipo || undefined,
    },
    fechaPago: {
      valor: agg.fecha?.split('T')[0],
      ubicacion: ocrSource(ocr, 'FechaPago'),
    },
    moneda: agg.valorMonetario ? (MONEDA_MAP[agg.valorMonetario.moneda] ?? agg.valorMonetario.moneda) : undefined,
    medioPago: agg.medioPago
      ? (agg.medioPago.tipo === 0 ? 'Credito' : 'Debito')
      : undefined,
    concepto: {
      valor: agg.valorMonetario?.valor,
      descripcion: agg.justificacion || undefined,
      ubicacion: ocrSource(ocr, 'Concepto'),
    },
  };
}
