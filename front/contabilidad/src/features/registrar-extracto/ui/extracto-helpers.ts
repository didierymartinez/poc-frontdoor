import dayjs from 'dayjs';
import type { Extracto, CargoFinancieroExtracto } from '@/entities/borrador';
import { MONEDA_MAP, TIPO_CARGO_LABEL } from '@/entities/borrador';

export const OCR_FIELD_HOVER = 'rgba(59, 130, 246, 0.06)';
export const OCR_ROW_HOVER = 'rgba(59, 130, 246, 0.06)';

export interface PartidaRow {
  /** Backend ID — null for new partidas */
  id: string | null;
  /** Local unique key for UI tracking */
  _key: number;
  numero: string;
  transaccion: string;
  codigo: string;
  descripcion: string;
  valor: number;
  moneda: string;
  tipo?: number;
  ubicacion?: unknown;
  isCargo?: boolean;
  tipoCargo?: number;
}

export { TIPO_CARGO_LABEL };

export { formatCurrency } from '@/shared/lib';

export function resolveMoneda(moneda?: number | string): string {
  if (typeof moneda === 'number') return MONEDA_MAP[moneda] ?? '';
  return moneda ?? '';
}

export function mapApiPartidas(data?: Extracto): PartidaRow[] {
  if (!data?.movimientos?.length) return [];
  return data.movimientos.map((m, i) => ({
    id: m.id ?? null,
    _key: i + 1,
    numero: String(i + 1).padStart(2, '0'),
    transaccion: m.fecha ? dayjs(m.fecha).format('DD/MM/YYYY') : '',
    codigo: m.codigo ?? '',
    descripcion: m.descripcion ?? '',
    valor: m.valor?.valor ?? 0,
    moneda: resolveMoneda(m.moneda),
    tipo: typeof m.tipo === 'number' ? m.tipo : undefined,
    ubicacion: m.ubicacion,
  }));
}

export function mapApiCargos(cargos: CargoFinancieroExtracto[], startKey: number): PartidaRow[] {
  return cargos.map((c, i) => ({
    id: c.id,
    _key: startKey + i,
    numero: String(startKey + i).padStart(2, '0'),
    transaccion: '',
    codigo: '',
    descripcion: TIPO_CARGO_LABEL[c.tipo] ?? `Cargo ${c.tipo}`,
    valor: c.valor.valor,
    moneda: resolveMoneda(c.valor.moneda),
    isCargo: true,
    tipoCargo: c.tipo,
  }));
}
