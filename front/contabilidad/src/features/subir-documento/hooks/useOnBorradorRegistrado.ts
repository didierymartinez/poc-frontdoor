import { useEffect, useRef } from 'react';
import { useOnNotificacion } from '@/shared/api';
import type { BorradorNotificacion } from '@/entities/borrador';

interface Options {
  enabled?: boolean;
  timeoutMs?: number;
  onRegistrado: (borrador: BorradorNotificacion) => void;
  onTimeout?: () => void;
}

export function useOnBorradorRegistrado({
  enabled = true,
  timeoutMs,
  onRegistrado,
  onTimeout,
}: Options) {
  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  });

  useOnNotificacion<BorradorNotificacion>({
    tipo: 'BorradorRegistrado',
    enabled,
    onMessage: onRegistrado,
  });

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      onTimeoutRef.current?.();
    }, timeoutMs);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled, timeoutMs]);
}
