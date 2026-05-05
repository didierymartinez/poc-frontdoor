import { useCallback } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries, MONEDA_MAP } from '@/entities/borrador';
import type { AgregadoOxpExtracto } from '@/entities/borrador';
import type { MainLayoutContext } from '@/shared/model';
import { base64ToBlobUrl } from '@/shared/lib';
import type { PartidaRow } from '@/widgets/extracto-view';

const ESTADO_LABEL: Record<number, string> = {
  0: 'Borrador', 1: 'Radicado', 2: 'Conciliado', 3: 'Confirmado', 4: 'Causado', 5: 'Pagado', 6: 'Descartado',
};
const ESTADO_COLOR: Record<number, 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error'> = {
  0: 'warning', 1: 'warning', 2: 'info', 3: 'success', 4: 'info', 5: 'success', 6: 'error',
};

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mapExtracto(e: AgregadoOxpExtracto) {
  const moneda = e.partidas[0]?.valor?.moneda != null ? (MONEDA_MAP[e.partidas[0].valor.moneda] ?? 'COP') : 'COP';
  const totalPartidas = e.partidas.reduce((s, p) => s + p.valor.valor, 0);
  const totalCargos = e.cargosFinancieros.reduce((s, c) => s + c.valor.valor, 0);

  const partidas: PartidaRow[] = e.partidas.map((p, i) => ({
    no: String(i + 1).padStart(2, '0'),
    codigo: '',
    movimiento: p.descripcion,
    transaccion: p.fechaTransaccion
      ? new Date(p.fechaTransaccion).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '-',
    valor: `${fmt(p.valor.valor)} ${MONEDA_MAP[p.valor.moneda] ?? ''}`,
    valorSecundario: p.valorOriginal ? `TRM ${fmt(p.valorOriginal.valor)}` : undefined,
  }));

  return {
    id: e.id,
    estado: ESTADO_LABEL[e.estado] ?? 'Conciliado',
    estadoColor: ESTADO_COLOR[e.estado] ?? 'info',
    periodo: e.periodo
      ? {
          desde: e.periodo.desde ? new Date(e.periodo.desde).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : undefined,
          hasta: e.periodo.hasta ? new Date(e.periodo.hasta).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) : undefined,
        }
      : undefined,
    entidadBancaria: e.informacionTercero?.nombre,
    medioPago: e.medioPago,
    moneda,
    totalPartidas: fmt(totalPartidas),
    totalCargos: fmt(totalCargos),
    total: fmt(totalPartidas + totalCargos),
    partidas,
    distribucion: e.instruccionDistribucion,
  };
}

export function useConfirmacionExtracto() {
  const { id } = useParams<{ id: string }>();
  const { openDocument } = useOutletContext<MainLayoutContext>();
  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleExtracto(id ?? ''),
    enabled: !!id,
  });

  const borrador = detalle?.extracto;
  const archivo = detalle?.archivo;
  const mapped = borrador ? mapExtracto(borrador) : undefined;
  const hasSoporte = !!(archivo?.base64);

  const handleOpenSoporte = useCallback(() => {
    if (archivo?.base64) {
      const url = base64ToBlobUrl(archivo.base64, archivo.tipo || 'application/pdf');
      openDocument(url, archivo.nombre || 'extracto');
    }
  }, [archivo, openDocument]);

  return { id, isPending, extracto: mapped, hasSoporte, handleOpenSoporte };
}
