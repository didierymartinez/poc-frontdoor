export interface ValidationError {
  campo: string;
  mensaje: string;
}

export interface ConceptoValues {
  descripcion: string;
  cantidad: number;
  valor: number;
}

export interface MovimientoValues {
  descripcion: string;
  fecha: string;
  valor: number;
}

export interface FormValues {
  tercero?: string;
  medioPago?: string;
  moneda?: string;
  monto?: string;
  descripcion?: string;
  soporte?: string;
  fechaRegistro?: string;
  fechaTransaccion?: string;
  conceptosCount?: number;
  conceptos?: ConceptoValues[];
  movimientosCount?: number;
  entidadFinanciera?: string;
  tarjetaNumero?: string;
  periodoDesde?: string;
  periodoHasta?: string;
  movimientos?: MovimientoValues[];
}

function validarCompra(v: FormValues): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!v.medioPago) errors.push({ campo: 'medioPago', mensaje: 'Medio de pago' });
  if (!v.tercero) errors.push({ campo: 'tercero', mensaje: 'Tercero' });
  if (!v.moneda) errors.push({ campo: 'moneda', mensaje: 'Moneda' });
  if (!v.monto) errors.push({ campo: 'monto', mensaje: 'Monto' });
  if (!v.fechaTransaccion) errors.push({ campo: 'fechaTransaccion', mensaje: 'Fecha de transacción' });
  if (!v.descripcion) errors.push({ campo: 'descripcion', mensaje: 'Descripción' });
  if ((v.conceptosCount ?? 0) === 0) {
    errors.push({ campo: 'conceptos', mensaje: 'Al menos un concepto' });
  } else if (v.conceptos?.length) {
    const incompletos = v.conceptos.filter((c) => !c.descripcion || !c.cantidad || !c.valor);
    if (incompletos.length > 0) {
      errors.push({ campo: 'conceptos', mensaje: `${incompletos.length} concepto(s) sin descripción, cantidad o valor` });
    }
  }
  return errors;
}

function validarAnticipo(v: FormValues): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!v.medioPago) errors.push({ campo: 'medioPago', mensaje: 'Medio de pago' });
  if (!v.tercero) errors.push({ campo: 'tercero', mensaje: 'Beneficiario' });
  if (!v.moneda) errors.push({ campo: 'moneda', mensaje: 'Moneda' });
  if (!v.monto) errors.push({ campo: 'monto', mensaje: 'Monto' });
  if (!v.fechaTransaccion) errors.push({ campo: 'fechaTransaccion', mensaje: 'Fecha de transacción' });
  if (!v.soporte && !v.descripcion) errors.push({ campo: 'descripcion', mensaje: 'Descripción (obligatoria si no hay soporte)' });
  return errors;
}

function validarExtracto(v: FormValues): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!v.entidadFinanciera) errors.push({ campo: 'entidadFinanciera', mensaje: 'Entidad financiera' });
  if (!v.tarjetaNumero) errors.push({ campo: 'tarjetaNumero', mensaje: 'Número de tarjeta' });
  if (!v.periodoDesde || !v.periodoHasta) errors.push({ campo: 'periodo', mensaje: 'Periodo facturado (fecha inicio y fin)' });
  if ((v.movimientosCount ?? 0) === 0) {
    errors.push({ campo: 'movimientos', mensaje: 'Al menos un movimiento' });
  } else if (v.movimientos?.length) {
    const incompletos = v.movimientos.filter((m) => !m.descripcion || !m.fecha || !m.valor);
    if (incompletos.length > 0) {
      errors.push({ campo: 'movimientos', mensaje: `${incompletos.length} movimiento(s) sin descripción, fecha o valor` });
    }
  }
  return errors;
}

export function validarFormulario(tipo: number, values: FormValues): ValidationError[] {
  switch (tipo) {
    case 1: return validarCompra(values);
    case 2: return validarAnticipo(values);
    case 0: return validarExtracto(values);
    default: return [];
  }
}
