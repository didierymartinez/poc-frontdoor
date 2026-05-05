import { useCallback, useState } from 'react';
import { useParams, useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';
import { useCausarObligacion, useDevolverOxpComercio } from '@/features/confirmar-borrador';
import type { MainLayoutContext } from '@/shared/model';
import { base64ToBlobUrl } from '@/shared/lib';
import { showToast } from '@/shared/ui';
import { mapCompra } from '../lib/compra-mapper';

interface ConfirmacionNavState {
  confirmacionIds: string[];
  currentIndex: number;
}

export function useConfirmacionCompra() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { openDocument } = useOutletContext<MainLayoutContext>();

  const navState = location.state as ConfirmacionNavState | null;
  const [navIds, setNavIds] = useState<string[] | null>(navState?.confirmacionIds ?? null);
  const [navIndex, setNavIndex] = useState(navState?.currentIndex ?? 0);

  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleComercio(id ?? ''),
    enabled: !!id,
    staleTime: 0,
  });

  const causarMutation = useCausarObligacion();
  const devolverMutation = useDevolverOxpComercio();

  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [devolverOpen, setDevolverOpen] = useState(false);

  const borrador = detalle?.comercio;
  const archivo = detalle?.archivo;
  const mapped = borrador ? mapCompra(borrador) : undefined;
  const hasSoporte = !!(archivo?.base64);

  const isProcessing = causarMutation.isPending || devolverMutation.isPending;

  // Pagination
  const hasPagination = navIds !== null && navIds.length > 0;
  const isFirst = navIndex <= 0;
  const isLast = navIds ? navIndex >= navIds.length - 1 : true;
  const paginationLabel = hasPagination ? `${navIndex + 1} / ${navIds!.length}` : undefined;

  const handleOpenSoporte = useCallback(() => {
    if (archivo?.base64) {
      const url = base64ToBlobUrl(archivo.base64, archivo.tipo || 'application/pdf');
      openDocument(url, archivo.nombre || 'documento');
    }
  }, [archivo, openDocument]);

  // Navigation
  const handleAnterior = useCallback(() => {
    if (!navIds || navIndex <= 0) return;
    const prevIndex = navIndex - 1;
    const prevId = navIds[prevIndex];
    setNavIndex(prevIndex);
    navigate(`/confirmacion-compra/${prevId}`, {
      replace: true,
      state: { confirmacionIds: navIds, currentIndex: prevIndex },
    });
  }, [navIds, navIndex, navigate]);

  const handleSiguiente = useCallback(() => {
    if (!navIds || navIndex >= navIds.length - 1) return;
    const nextIndex = navIndex + 1;
    const nextId = navIds[nextIndex];
    setNavIndex(nextIndex);
    navigate(`/confirmacion-compra/${nextId}`, {
      replace: true,
      state: { confirmacionIds: navIds, currentIndex: nextIndex },
    });
  }, [navIds, navIndex, navigate]);

  // After success helper: remove current ID, navigate to next or /confirmacion
  const advanceAfterAction = useCallback((removedId: string) => {
    if (navIds) {
      const remaining = navIds.filter((nid) => nid !== removedId);
      if (remaining.length === 0) {
        setTimeout(() => navigate('/causacion', { replace: true }), 1500);
      } else {
        const nextIndex = Math.min(navIndex, remaining.length - 1);
        const nextId = remaining[nextIndex];
        setNavIds(remaining);
        setNavIndex(nextIndex);
        setTimeout(() => navigate(`/confirmacion-compra/${nextId}`, {
          replace: true,
          state: { confirmacionIds: remaining, currentIndex: nextIndex },
        }), 1500);
      }
    } else {
      setTimeout(() => navigate('/causacion', { replace: true }), 1500);
    }
  }, [navIds, navIndex, navigate]);

  // Actions
  const handleConfirmar = useCallback(async () => {
    if (!id) return;
    try {
      await causarMutation.mutateAsync(id);
      setConfirmarOpen(false);
      showToast('Obligación causada exitosamente', 'success');
      advanceAfterAction(id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al causar', 'error');
    }
  }, [id, causarMutation, advanceAfterAction]);

  const handleDevolver = useCallback(async (motivo: string, observaciones: string) => {
    if (!id) return;
    try {
      await devolverMutation.mutateAsync({ id, motivo: `${motivo}: ${observaciones}` });
      setDevolverOpen(false);
      showToast('Obligación devuelta exitosamente', 'success');
      advanceAfterAction(id);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error al devolver', 'error');
    }
  }, [id, devolverMutation, advanceAfterAction]);

  return {
    id,
    isPending,
    isProcessing,
    compra: mapped,
    hasSoporte,
    handleOpenSoporte,
    confirmarOpen,
    setConfirmarOpen,
    devolverOpen,
    setDevolverOpen,
    handleConfirmar,
    handleDevolver,
    // Pagination
    hasPagination,
    isFirst,
    isLast,
    paginationLabel,
    handleAnterior,
    handleSiguiente,
  };
}
