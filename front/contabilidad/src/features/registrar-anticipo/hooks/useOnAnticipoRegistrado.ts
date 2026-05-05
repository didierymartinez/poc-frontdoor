import type { RegistroNotificacion } from '@/entities/borrador';
import { useOnSignalREvent } from '@/shared/hooks/useOnSignalREvent';

interface Options {
  enabled?: boolean;
  timeoutMs?: number;
  onRegistrado: (payload: RegistroNotificacion) => void;
  onTimeout?: () => void;
}

export function useOnAnticipoRegistrado({ enabled = true, timeoutMs, onRegistrado, onTimeout }: Options) {
  useOnSignalREvent<RegistroNotificacion>({
    event: 'AnticipoRegistrado',
    enabled,
    timeoutMs,
    onEvent: onRegistrado,
    onTimeout,
  });
}
