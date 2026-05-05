import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';
import { showToast } from '@/shared/ui';
import { useConciliacion } from '@/features/conciliar-extracto';
import {
  useConfirmarExtracto,
  useRegistrarAnticipo,
  useCubrirConAnticipo,
  useCubrirConDevolucion,
  useReclasificarPartida,
  useDescartarPartida,
} from '@/features/conciliar-extracto/api/conciliar-extracto.mutations';
import type { ConciliacionCallbacks } from '@/features/conciliar-extracto';

export function useConciliarExtractoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);
  const [barStyle, setBarStyle] = useState<{ left: number; width: number }>({ left: 0, width: 680 });

  const { data: detalle, isLoading } = useQuery({
    ...borradorQueries.detalleExtracto(id ?? ''),
    enabled: !!id,
  });

  const borrador = detalle?.extracto;

  const {
    vincularPartidaAsync,
    marcarDisputa,
    progress,
    sinConciliar,
    conciliados,
    canSubmit,
    isMutating,
  } = useConciliacion(id, borrador);

  const confirmarMutation = useConfirmarExtracto();
  const registrarAnticipoMutation = useRegistrarAnticipo();
  const cubrirConAnticipoMutation = useCubrirConAnticipo();
  const cubrirConDevolucionMutation = useCubrirConDevolucion();
  const reclasificarMutation = useReclasificarPartida();
  const descartarMutation = useDescartarPartida();

  // React Compiler memoiza automáticamente — no useMemo manual.
  const callbacks: ConciliacionCallbacks = {
    onVincularComercio: async (partidaId, oxpComercioIds, monto) => {
      for (const oxpId of oxpComercioIds) {
        try {
          await vincularPartidaAsync(partidaId, oxpId, monto);
        } catch {
          // Error ya reportado por onMutationError en useVincularPartida
        }
      }
    },
    onCubrirConAnticipo: (partidaId, anticipoId, valorCubierto) => {
      if (!id) return;
      cubrirConAnticipoMutation.mutate({ extractoId: id, partidaId, anticipoId, valorCubierto });
    },
    onCubrirConDevolucion: (partidaId, devolucionId, valorCubierto) => {
      if (!id) return;
      cubrirConDevolucionMutation.mutate({ extractoId: id, partidaId, devolucionId, valorCubierto });
    },
    onCrearYVincularAnticipo: (partidaId, data) => {
      if (!id || !borrador) return;
      const partida = borrador.partidas.find((p) => p.id === partidaId);
      if (!partida) return;

      const tercero = partida.informacionTercero ?? borrador.informacionTercero;
      const mp = borrador.medioPago;

      registrarAnticipoMutation.mutate({
        informacionTercero: {
          nombre: tercero.nombre,
          identificacion: tercero.identificacion
            ? { tipo: tercero.identificacion.tipo, numero: tercero.identificacion.numero }
            : { tipo: '', numero: '' },
        },
        valorMonetario: {
          valor: partida.valor.valor,
          moneda: partida.valor.moneda,
        },
        medioPago: mp
          ? { tipo: mp.tipo, numero: mp.numero, entidadBancaria: mp.entidadBancaria }
          : { tipo: 0, numero: '', entidadBancaria: '' },
        fecha: new Date().toISOString(),
        justificacion: data.justificacion || 'Anticipo creado desde conciliación de extracto',
        instruccionDistribucion: data.instruccionDistribucion,
      }, {
        onSuccess: (anticipoId) => {
          cubrirConAnticipoMutation.mutate({
            extractoId: id,
            partidaId,
            anticipoId: typeof anticipoId === 'string' ? anticipoId : String(anticipoId),
            valorCubierto: { valor: partida.valor.valor, moneda: partida.valor.moneda },
          });
        },
        onError: (err) => {
          showToast(err instanceof Error ? err.message : 'Error al crear anticipo', 'error');
        },
      });
    },
    onMarcarDisputa: (partidaId, motivo) => {
      marcarDisputa(partidaId, motivo);
    },
    onReclasificar: (partidaId, oxpComercioId) => {
      if (!id) return;
      reclasificarMutation.mutate({ extractoId: id, partidaId, oxpComercioId });
    },
    onDescartar: (partidaId, extractoReversoBancarioId, lineaReversoBancario) => {
      if (!id) return;
      descartarMutation.mutate({ extractoId: id, partidaId, extractoReversoBancarioId, lineaReversoBancario });
    },
    onDesvincular: () => {
      // TODO: endpoint de desvincular no documentado aún
    },
  };

  const handleSubmit = () => {
    if (!id) return;
    confirmarMutation.mutate(id, {
      onSuccess: () => {
        showToast('Extracto confirmado exitosamente', 'success');
        navigate('/conciliacion', { replace: true });
      },
      onError: (err) => {
        showToast(err instanceof Error ? err.message : 'Error al confirmar extracto', 'error');
      },
    });
  };

  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const barWidth = rect.width * 0.8;
      setBarStyle({ left: rect.left + (rect.width - barWidth) / 2, width: barWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('scroll', measure);
    return () => { ro.disconnect(); window.removeEventListener('scroll', measure); };
  }, []);

  return {
    id,
    formRef,
    barStyle,
    detalle,
    isPending: isLoading,
    borrador,
    callbacks,
    progress,
    sinConciliar,
    conciliados,
    canSubmit,
    isMutating: isMutating || registrarAnticipoMutation.isPending || cubrirConAnticipoMutation.isPending || cubrirConDevolucionMutation.isPending || reclasificarMutation.isPending || descartarMutation.isPending || confirmarMutation.isPending,
    handleSubmit,
  };
}
