import { useMemo } from 'react';
import type { AgregadoOxpExtracto } from '@/entities/borrador';
import { ESTADO_PARTIDA } from '@/entities/borrador';
import {
  useVincularPartida,
  useCubrirConAnticipo,
  useMarcarDisputa,
} from '../api/conciliar-extracto.mutations';

export function useConciliacion(extractoId: string | undefined, borrador?: AgregadoOxpExtracto) {
  const vincularMutation = useVincularPartida();
  const cubrirAnticipoMutation = useCubrirConAnticipo();
  const marcarDisputaMutation = useMarcarDisputa();

  const vincularPartida = (partidaId: string, oxpComercioId: string, monto: { valor: number; moneda: number }) => {
    if (!extractoId) return;
    vincularMutation.mutate({ extractoId, partidaId, oxpComercioId, monto });
  };

  const vincularPartidaAsync = (partidaId: string, oxpComercioId: string, monto: { valor: number; moneda: number }) => {
    if (!extractoId) return Promise.resolve();
    return vincularMutation.mutateAsync({ extractoId, partidaId, oxpComercioId, monto });
  };

  const cubrirConAnticipo = (partidaId: string, anticipoId: string, valorCubierto: { valor: number; moneda: number }) => {
    if (!extractoId) return;
    cubrirAnticipoMutation.mutate({ extractoId, partidaId, anticipoId, valorCubierto });
  };

  const marcarDisputa = (partidaId: string, motivo: number) => {
    if (!extractoId) return;
    marcarDisputaMutation.mutate({ extractoId, partidaId, motivo });
  };

  const { progress, sinConciliar, conciliados, total } = useMemo(() => {
    if (!borrador?.partidas?.length) return { progress: 0, sinConciliar: 0, conciliados: 0, total: 0 };
    const t = borrador.partidas.length;
    // Finalizada = Conciliada(2) | Disputa(8) | Descartada(16) | Anticipo(32) | Devolucion(64)
    const FINALIZADA = ESTADO_PARTIDA.Conciliada | ESTADO_PARTIDA.Vinculada | ESTADO_PARTIDA.Disputa | ESTADO_PARTIDA.Descartada | ESTADO_PARTIDA.Anticipo | ESTADO_PARTIDA.Devolucion;
    const resueltas = borrador.partidas.filter((p) => (p.estado & FINALIZADA) !== 0).length;
    return {
      progress: Math.round((resueltas / t) * 100),
      sinConciliar: t - resueltas,
      conciliados: resueltas,
      total: t,
    };
  }, [borrador]);

  const isMutating = vincularMutation.isPending || cubrirAnticipoMutation.isPending || marcarDisputaMutation.isPending;

  return {
    vincularPartida,
    vincularPartidaAsync,
    cubrirConAnticipo,
    marcarDisputa,
    progress,
    sinConciliar,
    conciliados,
    total,
    canSubmit: progress === 100,
    isMutating,
  };
}
