import type { FuenteOrigen, TipoDocumento, Obligacion } from './borrador.types';
import type { MetadatosOcr } from './borrador.types';

// ---------------------------------------------------------------------------
// API Response Types — Radicacion Consultas
// ---------------------------------------------------------------------------

export interface ArchivoStorage {
  nombre: string;
  tipo: string;
  base64: string;
}

// --- Vista projections (flat, used by LIST endpoints) ---

/** GET /api/radicacion/consultas/OxpExtracto/Borradores — list item */
export interface VistaOxpExtracto {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  periodoDesde?: string | null;
  periodoHasta?: string | null;
  medioPago: string;
  valorPartidas: number;
  valorCargosFinancieros: number;
  valorTotal: number;
  moneda: string;
  numeroPartidas: number;
  referenciaContable?: string | null;
  referenciaContableFecha?: string | null;
  totalPagado: number;
  saldoPorPagar: number;
  fechaRadicacion: string;
  fechaConfirmacion?: string | null;
  fechaCausacion?: string | null;
  fechaPago?: string | null;
}

/** GET /api/radicacion/consultas/OxpComercio/Borradores — list item */
export interface VistaOxpComercio {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  descripcion: string;
  valor: number;
  moneda: string;
  documentoNumero?: string | null;
  documentoTipo?: string | null;
  documentoFecha?: string | null;
  medioPago?: string | null;
  soportePresupuestal?: string | null;
  referenciaContable?: string | null;
  referenciaContableFecha?: string | null;
  totalPagado: number;
  saldoPorPagar: number;
  bloqueadaPorRegularizacion: boolean;
  fechaRadicacion: string;
  fechaConfirmacion?: string | null;
  fechaCausacion?: string | null;
  fechaPago?: string | null;
}

// --- Aggregate response types (full domain entities, used by GET-by-id endpoints) ---

export interface Dinero {
  moneda: number;
  valor: number;
}

export interface InformacionTercero {
  nombre: string;
  identificacion?: { tipo: string; numero: string } | null;
}

export interface StorageInfo {
  container: string;
  key: string;
}

export interface StorageInfoBlob {
  container: string;
  blobName: string;
}

export interface DocumentoComercio {
  numero: string;
  tipo: number;
  fecha: string;
}

export interface TributoApi {
  tipo: string;
  base: Dinero;
  tarifa: number;
  valor: Dinero;
  distribucionCentroCostos?: DestinoNegocio[];
}

export interface DesgloseFiscalApi {
  impuestos: TributoApi[];
  retenciones: TributoApi[];
}

export interface ConceptoRadicacion {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  dinero: Dinero;
  trm?: { moneda: number; valor: number } | null;
  tipo: number;
  clasificacionTributaria: string;
  conceptoPago: string;
  referenciaOrigen: string;
  desgloseFiscal?: DesgloseFiscalApi | null;
  destinacionCostos: DestinoNegocio[];
}

export interface DestinoNegocio {
  unidadOrganizacional: string;
  porcentaje: number;
}

export interface ReferenciaSistemaContable {
  referencia?: string | null;
  fecha?: string | null;
}

export interface PagoAplicadoDto {
  id: string;
  tipo: number;
  valorCubierto: Dinero;
  fechaAplicacion: string;
  referenciaId?: string | null;
  oxpExtractoId?: string | null;
  partidaId?: string | null;
  referenciaPago?: string | null;
}

/** Entrada de rechazo del pipeline OCR+IA (solo en estado Borrador) */
export interface EntradaRechazo {
  motivos: string[];
  fecha: string;
  estado: string;
}

/** GET /api/radicacion/consultas/OxpComercio/{id} — DetalleOxpComercio */
export interface AgregadoOxpComercio {
  id: string;
  estado: number;
  informacionTercero: InformacionTercero;
  descripcion: string;
  valorMonetario: Dinero;
  conceptos: ConceptoRadicacion[];
  medioPago?: MedioPagoExtracto | null;
  tasaRepresentativaMercado?: { moneda: number; valor: number } | null;
  soportePresupuestal?: string | null;
  archivosVinculados: StorageInfo[];
  documento?: DocumentoComercio | null;
  instruccionDistribucion: DestinoNegocio[];
  evidencia?: StorageInfo | null;
  motivoDevolucion?: string | null;
  motivoDescarte?: string | null;
  bloqueadaPorRegularizacion: boolean;
  referenciaSistemaContable?: ReferenciaSistemaContable | null;
  pagosAplicados: PagoAplicadoDto[];
  historialRechazos?: EntradaRechazo[];
}

export interface PartidaExtracto {
  id: string;
  fechaTransaccion: string;
  valor: Dinero;
  valorOriginal?: Dinero | null;
  descripcion: string;
  estado: number;
  informacionTercero?: InformacionTercero | null;
}

export interface CargoFinancieroExtracto {
  id: string;
  tipo: number;
  valor: Dinero;
  periodo: { desde?: string | null; hasta?: string | null };
  distribucionCentroCostos: DestinoNegocio[];
}

export interface MedioPagoExtracto {
  tipo: number;
  numero: string;
  entidadBancaria: string;
}

export interface CrucePagoExtractoDto {
  id: string;
  tipo: number;
  valorCubierto: Dinero;
  fechaAplicacion: string;
  referenciaPago?: string | null;
}

// --- Backend enums (conciliación extracto) ---

/** ClasificacionAjuste: GastoFinanciero=0, IngresoFinanciero=1 */
export const CLASIFICACION_AJUSTE = { GastoFinanciero: 0, IngresoFinanciero: 1 } as const;

/** DireccionAjuste: Aprovechamiento=0, Gasto=1 */
export const DIRECCION_AJUSTE = { Aprovechamiento: 0, Gasto: 1 } as const;

/** MotivoDisputa: ErrorBancario=0, FraudePotencial=1, NoReconocida=2 */
export const MOTIVO_DISPUTA = { ErrorBancario: 0, FraudePotencial: 1, NoReconocida: 2 } as const;

/** TipoCrucePagoExtracto: PagoSistemaContable=0, Devolucion=1, Revertido=2 */
export const TIPO_CRUCE_PAGO_EXTRACTO = { PagoSistemaContable: 0, Devolucion: 1, Revertido: 2 } as const;

/** TipoVinculacion: Directa=0 (1:1) */
export const TIPO_VINCULACION = { Directa: 0 } as const;

/** TipoPago (PagoAplicadoDto.tipo en OxpComercio): Anticipo=0, Extracto=1, Devolucion=2, PagoDirecto=3 */
export const TIPO_PAGO = { Anticipo: 0, Extracto: 1, Devolucion: 2, PagoDirecto: 3 } as const;

/** PartidaExtracto.Estados [Flags]: bitwise */
export const ESTADO_PARTIDA = {
  Pendiente: 1,
  Conciliada: 2,
  Vinculada: 4,
  Disputa: 8,
  Descartada: 16,
  Anticipo: 32,
  Devolucion: 64,
} as const;

// --- Extracto conciliation entities ---

export interface VinculacionExtracto {
  referenciaId: string;
  partidaId: string;
  tipo: number;
  origen: number;
  fecha?: string;
}

export interface AjustePorToleranciaExtracto {
  id: string;
  oxpComercioId: string;
  valor: Dinero;
  direccion: number;
  distribucionCentroCostos: DestinoNegocio[];
}

export interface AjustePorDiferenciaCambioExtracto {
  id: string;
  oxpComercioId: string;
  trmRadicacion: number;
  trmExtracto: number;
  valor: Dinero;
  clasificacion: number;
  distribucionCentroCostos: DestinoNegocio[];
}

export interface CoberturaAnticipoExtracto {
  id: string;
  partidaId: string;
  anticipoId: string;
  valorCubierto: Dinero;
}

export interface CoberturaDevolucionExtracto {
  id: string;
  partidaId: string;
  devolucionId: string;
  valorCubierto: Dinero;
}

/** Backend enum para estados del agregado OxpExtracto */
export const ESTADO_EXTRACTO = {
  Borrador: 0,
  Pendiente: 1,
  Conciliado: 2,
  ParcialmenteConciliado: 3,
  Confirmado: 4,
  Causado: 5,
  Pagado: 6,
  Descartado: 7,
} as const;

/** GET /api/radicacion/consultas/OxpExtracto/EnConciliacion — list item */
export interface VistaExtractoConciliacion {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  periodoDesde?: string | null;
  periodoHasta?: string | null;
  medioPagoTipo: string;
  medioPagoNumero: string;
  entidadBancaria: string;
  valorPartidas: number;
  moneda: string;
  totalPartidas: number;
  partidasResueltas: number;
  porcentajeConciliacion: number;
  fechaRadicacion: string;
}

/** GET /api/radicacion/consultas/OxPExtracto/{id} — DetalleOxpExtracto */
export interface AgregadoOxpExtracto {
  id: string;
  estado: number;
  partidas: PartidaExtracto[];
  cargosFinancieros: CargoFinancieroExtracto[];
  periodo?: { desde?: string | null; hasta?: string | null } | null;
  medioPago?: MedioPagoExtracto | null;
  evidencia?: StorageInfo | null;
  informacionTercero: InformacionTercero;
  referenciaSistemaContable?: ReferenciaSistemaContable | null;
  crucesPagoAplicados: CrucePagoExtractoDto[];
  vinculaciones: VinculacionExtracto[];
  ajustesPorTolerancia: AjustePorToleranciaExtracto[];
  ajustesPorDiferenciaCambio: AjustePorDiferenciaCambioExtracto[];
  coberturasAnticipo: CoberturaAnticipoExtracto[];
  coberturasDevolucion: CoberturaDevolucionExtracto[];
  instruccionDistribucion: DestinoNegocio[];
  motivoDescarte?: string | null;
  historialRechazos?: EntradaRechazo[];
}

/** GET /api/radicacion/consultas/OxPExtracto/{id} */
export interface BorradorExtractoDetalle {
  extracto: AgregadoOxpExtracto;
  archivo?: ArchivoStorage;
  fuenteTipo?: FuenteOrigen;
  ocr?: MetadatosOcr;
}

/** GET /api/radicacion/consultas/OxpComercio/{id} */
export interface BorradorComercioDetalle {
  comercio: AgregadoOxpComercio;
  archivo?: ArchivoStorage;
  fuenteTipo?: FuenteOrigen;
  ocr?: MetadatosOcr;
}

// --- Anticipo types ---

/** GET /api/radicacion/consultas/Anticipo/Borradores (list item) */
export interface VistaAnticipo {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  valor: number;
  moneda: string;
  medioPago: string;
  justificacion?: string | null;
  totalRegularizado: number;
  saldoPorRegularizar: number;
  totalPagado: number;
  saldoPorPagar: number;
  fechaRegistro: string;
}

export interface CruceRegularizacionAplicada {
  id: string;
  oxpComercioId: string;
  montoRegularizado: Dinero;
  fechaRegularizacion: string;
}

export interface CrucePagoAplicado {
  id: string;
  tipo: number;
  valorCubierto: Dinero;
  fecha: string;
  referenciaId?: string | null;
}

/** GET /api/radicacion/consultas/Anticipo/{id} — DetalleAnticipo */
export interface AgregadoAnticipo {
  id: string;
  estado: number;
  informacionTercero: InformacionTercero;
  valorMonetario: Dinero;
  valorTotal?: Dinero | null;
  medioPago?: MedioPagoExtracto | null;
  soporte?: StorageInfo | null;
  justificacion?: string | null;
  fecha: string;
  motivoDescarte?: string | null;
  instruccionDistribucion: DestinoNegocio[];
  crucesRegularizacion: CruceRegularizacionAplicada[];
  crucesPagoAplicados: CrucePagoAplicado[];
  historialRechazos?: EntradaRechazo[];
}

/** GET /api/radicacion/consultas/Anticipo/{id} */
export interface AnticipoDetalle {
  anticipo: AgregadoAnticipo;
  archivo?: ArchivoStorage;
  fuenteTipo?: FuenteOrigen;
  ocr?: MetadatosOcr;
}

// --- Vistas disponibles para devolución (endpoints dedicados) ---

/** GET /Devolucion/ComerciosDisponibles */
export interface VistaComercioDevolucion {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  descripcion: string;
  valor: number;
  moneda: string;
  totalPagado: number;
  totalDevuelto: number;
  saldoPorPagar: number;
  fechaRadicacion: string;
  fechaConfirmacion?: string | null;
}

/** GET /Devolucion/ExtractosDisponibles */
export interface VistaExtractoDevolucion {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  periodoDesde?: string | null;
  periodoHasta?: string | null;
  valorTotal: number;
  moneda: string;
  totalPagado: number;
  saldoPorPagar: number;
  fechaRadicacion: string;
}

/** GET /Devolucion/AnticiposDisponibles */
export interface VistaAnticipoDevolucion {
  id: string;
  estado: number;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  valor: number;
  moneda: string;
  medioPago: string;
  justificacion?: string | null;
  totalRegularizado: number;
  saldoPorRegularizar: number;
  totalPagado: number;
  saldoPorPagar: number;
  fechaRegistro: string;
}

// --- Devolucion types ---

/** Estado de la devolución: Pendiente=0, Confirmada=1, Causada=2 */
export const ESTADO_DEVOLUCION = { Pendiente: 0, Confirmada: 1, Causada: 2 } as const;

/** Tipo de origen de la devolución: Comercio=0, Extracto=1, Anticipo=2 */
export const TIPO_ORIGEN_DEVOLUCION = { Comercio: 0, Extracto: 1, Anticipo: 2 } as const;

/** GET /api/radicacion/consultas/Devolucion/Todas — list item */
export interface VistaDevolucion {
  id: string;
  estado: number;
  origen: string;
  terceroNombre: string;
  terceroIdentificacion: string;
  terceroTipoIdentificacion: string;
  descripcion: string;
  valor: number;
  moneda: string;
  fechaRadicacion: string;
  fechaConfirmacion?: string | null;
  fechaCausacion?: string | null;
}

/** ConceptoDevuelto dentro de AgregadoDevolucion (origen Comercio) */
export interface ConceptoDevueltoApi {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorBruto: Dinero;
  clasificacionTributaria: string;
  conceptoPago: string;
  referenciaOrigen: string;
  desgloseFiscal?: DesgloseFiscalApi | null;
}

/** CargoDevuelto dentro de AgregadoDevolucion (origen Extracto) */
export interface CargoDevueltoApi {
  id: string;
  referenciaCargoFinanciero: string;
  descripcion: string;
  valor: Dinero;
}

/** ReversaTotal dentro de AgregadoDevolucion (origen Anticipo) */
export interface ReversaTotalApi {
  id: string;
  motivoReversa: string;
  descripcion: string;
  valor: Dinero;
}

/** Origen de la devolución (referencia al agregado padre) */
export interface OrigenDevolucion {
  /** Discriminador polimórfico del backend (.NET $type) */
  $type: string;
  oxpComercioId?: string | null;
  oxpExtractoId?: string | null;
  cargoFinancieroIds?: string[] | null;
  anticipoId?: string | null;
}

/** Distribución de un concepto devuelto (request) */
export interface DistribucionConceptoDevuelto {
  conceptoDevueltoId: string;
  destinos: DestinoNegocio[];
}

/** Instrucción de distribución unificada (response del detalle) */
export interface InstruccionDistribucionDevolucion {
  tipo: string;
  conceptoDevueltoId: string;
  tipoTributo?: string | null;
  destinos: DestinoNegocio[];
}

/** GET /api/radicacion/consultas/Devolucion/{id} — aggregate */
export interface AgregadoDevolucion {
  id: string;
  estado: number;
  origen: OrigenDevolucion;
  informacionTercero: InformacionTercero;
  descripcion: string;
  conceptosDevueltos?: ConceptoDevueltoApi[] | null;
  cargosDevueltos?: CargoDevueltoApi[] | null;
  reversa?: ReversaTotalApi | null;
  instruccionesDistribucion?: InstruccionDistribucionDevolucion[] | null;
  soporte?: StorageInfoBlob | null;
  valorMonetario: Dinero;
  documento?: DocumentoComercio | null;
  trm?: { moneda: number; valor: number } | null;
  fechaRadicacion: string;
}

/** GET /api/radicacion/consultas/Devolucion/{id} — full detail wrapper */
export interface DevolucionDetalle {
  devolucion: AgregadoDevolucion;
  archivo?: ArchivoStorage;
  fuenteTipo?: FuenteOrigen;
  ocr?: MetadatosOcr;
}

// --- Devolucion command request types ---

/** POST /Devolucion — InformacionDevolucion part of multipart/form-data */
export interface InformacionDevolucionRequest {
  origen: {
    tipo: 'Comercio' | 'Extracto' | 'Anticipo';
    oxpComercioId?: string | null;
    oxpExtractoId?: string | null;
    cargoFinancieroIds?: string[] | null;
    anticipoId?: string | null;
  };
  informacionTercero: {
    nombre: string;
    identificacion: { tipo: string; numero: string };
  };
  descripcion: string;
  conceptosDevueltos?: ConceptoDevueltoRequest[] | null;
  cargosDevueltos?: CargoDevueltoRequest[] | null;
  reversa?: ReversaRequest | null;
}

export interface ConceptoDevueltoRequest {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorBruto: { valor: number; moneda: number };
  clasificacionTributaria: string;
  conceptoPago: string;
  referenciaOrigen: string;
  desgloseFiscal?: {
    impuestos: TributoRequest[];
    retenciones: TributoRequest[];
  } | null;
}

export interface TributoRequest {
  tipo: string;
  base: { valor: number; moneda: number };
  tarifa: number;
  valor: { valor: number; moneda: number };
}

export interface CargoDevueltoRequest {
  id: string;
  referenciaCargoFinanciero: string;
  descripcion: string;
  valor: { valor: number; moneda: number };
}

export interface ReversaRequest {
  id: string;
  motivoReversa: string;
  descripcion: string;
  valor: { valor: number; moneda: number };
}

/** POST /Devolucion/{id}/ConfigurarInstruccionDistribucionConcepto */
export interface DistribucionConceptoRequest {
  conceptoDevueltoId: string;
  destinos: { unidadOrganizacional: string; porcentaje: number }[];
}

/** POST /Devolucion/{id}/ConfigurarInstruccionDistribucionTributo */
export interface DistribucionTributoRequest {
  conceptoDevueltoId: string;
  tipoTributo: string;
  destinos: { unidadOrganizacional: string; porcentaje: number }[];
}

/** POST /Devolucion/{id}/Causar */
export interface CausarDevolucionRequest {
  numeroAsientoContable: string;
  fechaCausacion: string;
}

// --- Rechazos (pipeline de entrada) ---

/** @deprecated Usar historialRechazos dentro del agregado (AgregadoOxpComercio, AgregadoOxpExtracto, AgregadoAnticipo) */
export interface RechazosDetalle {
  id: string;
  tipoAgregado: string;
  entradas: { motivo: string; fecha: string }[];
}

// --- Legacy types kept for backward compatibility during migration ---

/** @deprecated Use VistaOxpExtracto or VistaOxpComercio */
export interface BorradorResumen {
  id: string;
  tipo: TipoDocumento;
  origen: FuenteOrigen;
  numeroDocumento?: string;
  idDocumentoExterno: string;
  medioPago: string;
  formaPago: string;
  valorTotal: number;
  comercio: string;
  fechaRegistro: string;
  periodo?: { desde?: string; hasta?: string };
  moneda: number | string;
}

/** @deprecated Use BorradorExtractoDetalle or BorradorComercioDetalle */
export interface BorradorDetalle {
  id: string;
  tipo: TipoDocumento;
  origen: FuenteOrigen;
  archivo?: ArchivoStorage;
  fechaIngestion: string;
  obligacion: Obligacion;
}
