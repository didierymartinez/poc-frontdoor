export interface PartidaRow {
  partidaId: string;
  no: string;
  codigo: string;
  movimiento: string;
  transaccion: string;
  valor: string;
  valorRaw: number;
  monedaRaw: number;
  valorSecundario?: string;
  moneda: string;
  distrCostos?: boolean;
  ajusteDiferencia?: string;
  ajusteDiferenciaDetalle?: string;
  ajusteDiferenciaDistr?: boolean;
  ajusteTolerancia?: string;
  ajusteToleranciaDetalle?: string;
  ajusteToleranciaDistr?: boolean;
  estado: string;
  estadoTipo: 'sin_vincular' | 'link' | 'anticipo' | 'disputa' | 'devolucion' | 'none';
  estadoExtra?: string;
  vinculadoA?: string;
  anticipoRef?: string;
}

export interface CrearAnticipoData {
  justificacion?: string;
  instruccionDistribucion?: { unidadOrganizacional: string; porcentaje: number }[];
}

export interface ConciliacionCallbacks {
  onVincularComercio: (partidaId: string, oxpComercioIds: string[], monto: { valor: number; moneda: number }) => Promise<void> | void;
  onCubrirConAnticipo: (partidaId: string, anticipoId: string, valorCubierto: { valor: number; moneda: number }) => void;
  onCubrirConDevolucion: (partidaId: string, devolucionId: string, valorCubierto: { valor: number; moneda: number }) => void;
  onCrearYVincularAnticipo: (partidaId: string, data: CrearAnticipoData) => void;
  onMarcarDisputa: (partidaId: string, motivo: number) => void;
  onReclasificar: (partidaId: string, oxpComercioId: string) => void;
  onDescartar: (partidaId: string, extractoReversoBancarioId: string, lineaReversoBancario: string) => void;
  onDesvincular: (partidaId: string) => void;
}
