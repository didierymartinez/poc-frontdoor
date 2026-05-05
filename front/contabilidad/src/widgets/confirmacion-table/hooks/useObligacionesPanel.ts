import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';
import { type GridRowSelectionModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries, MONEDA_MAP } from '@/entities/borrador';
import type { VistaOxpComercio } from '@/entities/borrador';
import { useCausarObligacion, useDevolverOxpComercio } from '@/features/confirmar-borrador';

export function useObligacionesPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({ type: 'include', ids: new Set() });
  const [devolverRow, setDevolverRow] = useState<VistaOxpComercio | null>(null);
  const [confirmarRow, setConfirmarRow] = useState<VistaOxpComercio | null>(null);
  const [bulkAction, setBulkAction] = useState<'causar' | 'devolver' | null>(null);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const [barStyle, setBarStyle] = useState<{ left: number; width: number }>({ left: 0, width: 680 });

  const { data: confirmadas = [], isPending } = useQuery(borradorQueries.confirmadasComercio());

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0) return;
      const barWidth = rect.width * 0.8;
      setBarStyle({
        left: rect.left + (rect.width - barWidth) / 2,
        width: barWidth,
      });
    };

    // Delay initial measure to let tab layout stabilize
    const frame = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('scroll', measure);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', measure);
    };
  }, [isPending]);

  const causarMutation = useCausarObligacion();
  const devolverMutation = useDevolverOxpComercio();

  const filtered = confirmadas.filter((r) => {
    if (processedIds.has(r.id)) return false;
    if (search) {
      return [r.terceroNombre, r.documentoNumero, r.id, r.descripcion].some((v) =>
        v?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return true;
  });

  const selectedIds = selectionModel.type === 'include'
    ? Array.from(selectionModel.ids) as string[]
    : filtered.map((r) => r.id);
  const selectedCount = selectedIds.length;
  const selectedTotalsByMoneda = filtered
    .filter((r) => selectedIds.includes(r.id))
    .reduce<Record<string, number>>((acc, r) => {
      const mon = typeof r.moneda === 'number' ? (MONEDA_MAP[r.moneda] ?? 'COP') : (r.moneda || 'COP');
      acc[mon] = (acc[mon] ?? 0) + r.valor;
      return acc;
    }, {});

  // Row-level actions
  const handleCausarRow = useCallback(async () => {
    if (!confirmarRow) return;
    await causarMutation.mutateAsync(confirmarRow.id);
    setProcessedIds((prev) => new Set(prev).add(confirmarRow.id));
    setConfirmarRow(null);
  }, [confirmarRow, causarMutation]);

  const handleDevolverRow = useCallback(async (motivo: string, observaciones: string) => {
    if (!devolverRow) return;
    await devolverMutation.mutateAsync({ id: devolverRow.id, motivo: `${motivo}: ${observaciones}` });
    setProcessedIds((prev) => new Set(prev).add(devolverRow.id));
    setDevolverRow(null);
  }, [devolverRow, devolverMutation]);

  // Bulk actions
  const handleBulkCausar = useCallback(async () => {
    await Promise.all(selectedIds.map((id) => causarMutation.mutateAsync(id)));
    setProcessedIds((prev) => { const next = new Set(prev); selectedIds.forEach((id) => next.add(id)); return next; });
    setSelectionModel({ type: 'include', ids: new Set() });
    setBulkAction(null);
  }, [selectedIds, causarMutation]);

  const handleBulkDevolver = useCallback(async (motivo: string, observaciones: string) => {
    await Promise.all(selectedIds.map((id) => devolverMutation.mutateAsync({ id, motivo: `${motivo}: ${observaciones}` })));
    setProcessedIds((prev) => { const next = new Set(prev); selectedIds.forEach((id) => next.add(id)); return next; });
    setSelectionModel({ type: 'include', ids: new Set() });
    setBulkAction(null);
  }, [selectedIds, devolverMutation]);

  const isProcessing = causarMutation.isPending || devolverMutation.isPending;

  return {
    theme,
    navigate,
    search,
    setSearch,
    selectionModel,
    setSelectionModel,
    selectedCount,
    selectedIds,
    selectedTotalsByMoneda,
    rows: filtered,
    isPending,
    totalRows: confirmadas.length,
    devolverRow,
    setDevolverRow,
    confirmarRow,
    setConfirmarRow,
    containerRef,
    barStyle,
    handleCausarRow,
    handleDevolverRow,
    handleBulkCausar,
    handleBulkDevolver,
    bulkAction,
    setBulkAction,
    isProcessing,
  };
}
