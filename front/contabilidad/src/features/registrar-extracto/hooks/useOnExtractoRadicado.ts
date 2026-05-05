import type { RadicacionNotificacion } from '@/entities/borrador';
import { useOnSignalREvent } from '@/shared/hooks/useOnSignalREvent';

interface Options {
  enabled?: boolean;
  timeoutMs?: number;
  onRadicado: (payload: RadicacionNotificacion) => void;
  onTimeout?: () => void;
}

export function useOnExtractoRadicado({ enabled = true, timeoutMs, onRadicado, onTimeout }: Options) {
  useOnSignalREvent<RadicacionNotificacion>({
    event: 'ExtractoRadicado',
    enabled,
    timeoutMs,
    onEvent: onRadicado,
    onTimeout,
  });
}
