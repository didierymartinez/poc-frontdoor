import { useEffect, useRef } from 'react';
import { useSignalR } from './use-signalr';

interface WolverineCloudEvent {
  type: string;
  data: { tipo: string; datos: unknown };
}

interface Options<T> {
  tipo: string;
  enabled?: boolean;
  onMessage: (datos: T) => void;
}

export function useOnNotificacion<T = unknown>({
  tipo,
  enabled = true,
  onMessage,
}: Options<T>) {
  const { connection } = useSignalR();
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!enabled) return;

    const handler = (json: string) => {
      try {
        const event: WolverineCloudEvent = JSON.parse(json);
        if (event.data?.tipo === tipo) {
          onMessageRef.current(event.data.datos as T);
        }
      } catch {
        // ignore malformed messages
      }
    };

    connection.on('ReceiveMessage', handler);
    return () => {
      connection.off('ReceiveMessage', handler);
    };
  }, [connection, enabled, tipo]);
}
