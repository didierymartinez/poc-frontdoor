import type { TipoDocumento } from './borrador.types';

// ---------------------------------------------------------------------------
// SignalR notification types
// ---------------------------------------------------------------------------

/** SignalR "BorradorRegistrado" payload */
export interface BorradorNotificacion {
  id: string;
  tipo: TipoDocumento;
}

/** SignalR "ComercioRadicado" / "ExtractoRadicado" payload */
export interface RadicacionNotificacion {
  id: string;
  estado: string;
}

/** SignalR "AnticipoRegistrado" / "DevolucionRadicada" payload */
export interface RegistroNotificacion {
  id: string;
}
