import type { RegistroNotificacion } from '@/entities/borrador';
import { useOnSignalREvent } from '@/shared/hooks/useOnSignalREvent';

interface Options {
  enabled?: boolean;
  timeoutMs?: number;
  onRadicada: (payload: RegistroNotificacion) => void;
  onTimeout?: () => void;
}

export function useOnDevolucionRadicada({ enabled = true, timeoutMs, onRadicada, onTimeout }: Options) {
  useOnSignalREvent<RegistroNotificacion>({
    event: 'DevolucionRadicada',
    enabled,
    timeoutMs,
    onEvent: onRadicada,
    onTimeout,
  });
}
