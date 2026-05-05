// ---------------------------------------------------------------------------
// Re-export OCR types from shared (kept here for backward compatibility)
// ---------------------------------------------------------------------------
export type { MetadatosOcr, CampoOcr, UbicacionOcr } from '@/shared/model/ocr.types';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

// Backend serializes enums as numbers
// TipoDocumento: 0=Extracto, 1=Comercio, 2=Anticipo, 3=Devolucion
export type TipoDocumento = 0 | 1 | 2 | 3;
// FuenteOrigen: 0=Reconocimiento, 1=RecepcionElectronica
export type FuenteOrigen = 0 | 1;
export type EstadoBorrador = 0 | 1 | 2; // 0=Pendiente, 1=Confirmado, 2=Rechazado

export const TIPO_DOC_LABEL: Record<TipoDocumento, string> = {
  0: 'Extracto',
  1: 'Comercio',
  2: 'Anticipo',
  3: 'Devolucion',
};

// Moneda: backend enum — COP=1, USD=2, EUR=3
export const MONEDA_MAP: Record<number, string> = {
  1: 'COP',
  2: 'USD',
  3: 'EUR',
};

export const TIPO_MOVIMIENTO_LABEL: Record<number, string> = {
  0: 'Compras',
  1: 'Cargos financieros',
  2: 'Pagos y abonos',
  3: 'Saldo diferido',
  4: 'Transferencias',
};

// Enum Tipos del backend: CuatroPorMil=0, CuotaDeManejo=1, Intereses=2
export const TIPO_CARGO_LABEL: Record<number, string> = {
  0: '4x1000',
  1: 'Cuota de manejo',
  2: 'Intereses',
};

// ---------------------------------------------------------------------------
// Value Objects (all have Valor + optional Ubicacion)
// ---------------------------------------------------------------------------

export interface Coordenada {
  x: number;
  y: number;
}

export interface UbicacionDTO {
  superiorIzquierda: Coordenada;
  superiorDerecha: Coordenada;
  inferiorIzquierda: Coordenada;
  inferiorDerecha: Coordenada;
}

export interface Source {
  pageNumber: number;
  ubicacion: UbicacionDTO;
}

export interface VOFecha {
  valor?: string; // DateOnly serialized as string
  ubicacion?: Source;
}

export interface VOMonto {
  valor?: number;
  ubicacion?: Source;
}

export interface VONombre {
  valor?: string;
  ubicacion?: Source;
}

export interface VONumero {
  valor?: string;
  ubicacion?: Source;
}

export interface VOIdentificacion {
  valor?: string;
  ubicacion?: Source;
}

// ---------------------------------------------------------------------------
// Shared Domain Types
// ---------------------------------------------------------------------------

export interface Acreedor {
  nombre?: VONombre;
  identificacion?: VOIdentificacion;
  tipoIdentificacion?: string;
}

export interface Referencia {
  numero?: VONumero;
  fechaDocumento?: VOFecha;
}

export interface Impuesto {
  nombre?: string;
  valor?: number;
  porcentaje?: number;
}

export interface Descuento {
  valor?: number;
  porcentaje?: number;
}

export interface Concepto {
  id?: string;
  descripcion?: string;
  cantidad?: number;
  valorUnitario?: number;
  valorTotal?: number;
  impuestos?: Impuesto[];
  descuento?: Descuento;
  ubicacion?: Source;
}

export interface ConceptoAnticipo {
  descripcion?: string;
  valor?: number;
  impuestos?: Impuesto[];
  ubicacion?: Source;
}

export interface Total {
  subtotal?: VOMonto;
  totalAPagar?: VOMonto;
}

// ---------------------------------------------------------------------------
// Extracto sub-types
// ---------------------------------------------------------------------------

export interface Tarjeta {
  numero?: VONumero;
  tipo?: string;
}

export interface Periodo {
  desde?: VOFecha;
  hasta?: VOFecha;
}

// TipoMovimiento: 0=Compra, 1=CargoFinanciero, 2=Pago, 3=SaldoDiferido, 4=Transferencia
export interface MovimientoExtracto {
  id?: string;
  codigo?: string;
  descripcion?: string;
  fecha?: string;
  valor?: VOMonto;
  moneda?: number | string;
  tasaCambio?: TasaRepresentativaMercado;
  tipo?: number | string;
  ubicacion?: Source;
}

export interface TasaRepresentativaMercado {
  valor?: number;
  fecha?: string;
}

export interface TotalExtracto {
  moneda?: number | string;
  subtotal?: VOMonto;
  saldoAnterior?: VOMonto;
  totalPagosAbonos?: VOMonto;
  totalAPagar?: VOMonto;
}

// ---------------------------------------------------------------------------
// Devolucion sub-types
// ---------------------------------------------------------------------------

export interface ReferenciaAfectada {
  numero?: VONumero;
}

// ---------------------------------------------------------------------------
// Obligacion (polymorphic via $tipo)
// ---------------------------------------------------------------------------

interface ObligacionBase {
  unidadMedidaCoordenadas?: string;
}

export interface Comercio extends ObligacionBase {
  $tipo: 'comercio';
  referencia?: Referencia;
  acreedor?: Acreedor;
  fechaPago?: VOFecha;
  ordenCompra?: VONumero;
  moneda?: number | string;
  formaPago?: string;
  medioPago?: string;
  descripcion?: string;
  conceptos: Concepto[];
  total?: Total;
}

export interface Anticipo extends ObligacionBase {
  $tipo: 'anticipo';
  referencia?: Referencia;
  beneficiario?: Acreedor;
  fechaPago?: VOFecha;
  moneda?: number | string;
  formaPago?: string;
  medioPago?: string;
  concepto?: ConceptoAnticipo;
}

export interface Extracto extends ObligacionBase {
  $tipo: 'extracto';
  tarjeta?: Tarjeta;
  entidadFinanciera?: Acreedor;
  periodo?: Periodo;
  fechaPago?: VOFecha;
  movimientos: MovimientoExtracto[];
  totales: TotalExtracto[];
}

export interface Devolucion extends ObligacionBase {
  $tipo: 'devolucion';
  referencia?: Referencia;
  acreedor?: Acreedor;
  moneda?: number | string;
  formaPago?: string;
  medioPago?: string;
  descripcion?: string;
  conceptos?: Concepto[];
  total?: Total;
  referenciaAfectada?: ReferenciaAfectada;
}

export type Obligacion = Comercio | Anticipo | Extracto | Devolucion;
