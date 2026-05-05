export interface FiscalItem {
  tipo: string;
  base: number;
  tarifa: string;
  valor: number;
  distri: number;
  recalculado?: boolean;
}

export interface ConceptoRow {
  /** Backend ID — null for new conceptos */
  id: string | null;
  /** Local unique key for UI tracking (expanded state, updates, deletes) */
  _key: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valorUnitario: number;
  valor: number; // calculated: valorUnitario × cantidad
  distribucion: number;
  impuestos: FiscalItem[];
  retenciones: FiscalItem[];
  ubicacion?: unknown;
}
