import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  getSnapshot: () => string;
  save: () => Promise<boolean>;
  enabled: boolean;
  intervalMs?: number;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  saveNow: () => Promise<void>;
  lastSavedAt: Date | null;
  /** Update the baseline snapshot so the next diff starts from the current state */
  resetSnapshot: () => void;
}

export function useAutoSave({
  getSnapshot,
  save,
  enabled,
  intervalMs = 10_000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const lastSnapshotRef = useRef<string | null>(null);
  const savingRef = useRef(false);

  // Keep latest callbacks in refs so the interval never goes stale
  const getSnapshotRef = useRef(getSnapshot);
  const saveRef = useRef(save);
  useEffect(() => { getSnapshotRef.current = getSnapshot; }, [getSnapshot]);
  useEffect(() => { saveRef.current = save; }, [save]);

  // Initialize snapshot on mount / when enabled changes
  useEffect(() => {
    if (enabled && lastSnapshotRef.current == null) {
      lastSnapshotRef.current = getSnapshotRef.current();
    }
  }, [enabled]);

  const performSave = useCallback(async () => {
    if (savingRef.current) return;
    const current = getSnapshotRef.current();
    if (current === lastSnapshotRef.current) return;

    savingRef.current = true;
    setIsSaving(true);
    try {
      const ok = await saveRef.current();
      if (ok) {
        lastSnapshotRef.current = current;
        setLastSavedAt(new Date());
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  // Auto-save interval — stable deps, never resets
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(performSave, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, performSave]);

  const resetSnapshot = useCallback(() => {
    lastSnapshotRef.current = getSnapshotRef.current();
  }, []);

  return { isSaving, saveNow: performSave, lastSavedAt, resetSnapshot };
}
