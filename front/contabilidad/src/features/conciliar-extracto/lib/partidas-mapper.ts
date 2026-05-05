import dayjs from 'dayjs';
import type { AgregadoOxpExtracto, VinculacionExtracto, CoberturaAnticipoExtracto } from '@/entities/borrador';
import { MONEDA_MAP, ESTADO_PARTIDA } from '@/entities/borrador';
import type { PartidaRow } from '../model/conciliar-extracto.types';

export function fmtCurrency(v: number): string {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function resolveEstadoTipo(flags: number): PartidaRow['estadoTipo'] {
  if (flags & ESTADO_PARTIDA.Descartada) return 'none';
  if (flags & ESTADO_PARTIDA.Disputa) return 'disputa';
  if (flags & ESTADO_PARTIDA.Devolucion) return 'devolucion';
  if (flags & ESTADO_PARTIDA.Anticipo) return 'anticipo';
  if (flags & ESTADO_PARTIDA.Vinculada || flags & ESTADO_PARTIDA.Conciliada) return 'link';
  return 'sin_vincular';
}

export function resolveEstadoLabel(flags: number): string {
  if (flags & ESTADO_PARTIDA.Descartada) return 'Descartada';
  if (flags & ESTADO_PARTIDA.Disputa) return 'En disputa';
  if (flags & ESTADO_PARTIDA.Devolucion) return 'Devolución';
  if (flags & ESTADO_PARTIDA.Anticipo) return 'Anticipo';
  if (flags & ESTADO_PARTIDA.Vinculada || flags & ESTADO_PARTIDA.Conciliada) return 'Vinculada';
  return 'Por asignar';
}

export function mapPartidas(borrador?: AgregadoOxpExtracto): PartidaRow[] {
  if (!borrador?.partidas?.length) return [];

  const vinculacionesByPartida = new Map<string, VinculacionExtracto>();
  for (const v of borrador.vinculaciones ?? []) {
    vinculacionesByPartida.set(v.partidaId, v);
  }

  const coberturasByPartida = new Map<string, CoberturaAnticipoExtracto>();
  for (const c of borrador.coberturasAnticipo ?? []) {
    coberturasByPartida.set(c.partidaId, c);
  }

  return borrador.partidas.map((p, i) => {
    const moneda = MONEDA_MAP[p.valor.moneda] ?? '';
    const vinculacion = vinculacionesByPartida.get(p.id);
    const cobertura = coberturasByPartida.get(p.id);

    return {
      partidaId: p.id,
      no: String(i + 1).padStart(2, '0'),
      codigo: '-',
      movimiento: p.descripcion || '-',
      transaccion: p.fechaTransaccion ? dayjs(p.fechaTransaccion).format('DD/MM/YYYY') : '-',
      valor: fmtCurrency(p.valor.valor),
      valorRaw: p.valor.valor,
      monedaRaw: p.valor.moneda,
      moneda,
      estado: resolveEstadoLabel(p.estado),
      estadoTipo: resolveEstadoTipo(p.estado),
      vinculadoA: vinculacion?.referenciaId?.slice(0, 8),
      anticipoRef: cobertura?.anticipoId?.slice(0, 8),
    };
  });
}
