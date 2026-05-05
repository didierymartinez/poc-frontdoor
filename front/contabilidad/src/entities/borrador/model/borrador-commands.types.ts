import type { Anticipo } from './borrador.types';

// ---------------------------------------------------------------------------
// Command / request types
// ---------------------------------------------------------------------------

export interface MedioPagoAnticipoEvento {
  tipo: 'Credito' | 'Debito';
  numero: string;
  entidadBancaria: string;
}

export interface ConfirmarAnticipoRequest {
  documento: Anticipo;
  medioPago: MedioPagoAnticipoEvento;
}

export interface RechazarBorradorRequest {
  motivo: string;
}
