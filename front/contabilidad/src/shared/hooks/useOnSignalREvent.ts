import { useEffect, useRef } from 'react';
import { useSignalR } from '@/shared/api';

interface Options<T> {
  event: string;
  enabled?: boolean;
  timeoutMs?: number;
  onEvent: (payload: T) => void;
  onTimeout?: () => void;
}

const DEFAULT_TIMEOUT_MS = 120_000;

/**
 * Generic hook to listen to a SignalR event.
 * Automatically subscribes/unsubscribes and supports timeout.
 */
export function useOnSignalREvent<T>({
  event,
  enabled = true,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onEvent,
  onTimeout,
}: Options<T>) {
  const { connection } = useSignalR();
  const onEventRef = useRef(onEvent);
  const onTimeoutRef = useRef(onTimeout);

  // Keep latest callbacks in refs — mutar dentro de effect, no en render.
  useEffect(() => {
    onEventRef.current = onEvent;
    onTimeoutRef.current = onTimeout;
  });

  useEffect(() => {
    if (!enabled) return;

    const handler = (payload: T) => {
      onEventRef.current(payload);
    };

    connection.on(event, handler);

    const timer = setTimeout(() => {
      onTimeoutRef.current?.();
    }, timeoutMs);

    return () => {
      connection.off(event, handler);
      clearTimeout(timer);
    };
  }, [connection, event, enabled, timeoutMs]);
}
