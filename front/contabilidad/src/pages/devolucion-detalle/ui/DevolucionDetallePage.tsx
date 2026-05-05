import { useCallback, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, CircularProgress } from '@mui/material';
import { DevolucionView, DevolucionActionBar } from '@/widgets/devolucion-view';
import { borradorQueries, ESTADO_DEVOLUCION } from '@/entities/borrador';
import { useConfirmarDevolucion } from '@/features/registrar-devolucion';
import { useFloatingBarStyle } from '@/shared/hooks/useFloatingBarStyle';
import { showToast } from '@/shared/ui';

interface DevolucionNavState {
  devolucionIds: string[];
  currentIndex: number;
}

export function DevolucionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const confirmar = useConfirmarDevolucion();
  const formRef = useRef<HTMLDivElement>(null);
  const barStyle = useFloatingBarStyle(formRef);

  const { data: detalle, isPending } = useQuery({
    ...borradorQueries.detalleDevolucion(id ?? ''),
    enabled: !!id,
  });

  // Pagination state from router
  const navState = location.state as DevolucionNavState | null;
  const [navIds, setNavIds] = useState<string[] | null>(navState?.devolucionIds ?? null);
  const [navIndex, setNavIndex] = useState(navState?.currentIndex ?? 0);

  const hasPagination = navIds !== null && navIds.length > 0;
  const isFirst = navIndex <= 0;
  const isLast = navIds ? navIndex >= navIds.length - 1 : true;
  const paginationLabel = hasPagination ? `${navIndex + 1} / ${navIds!.length}` : undefined;

  const handleAnterior = useCallback(() => {
    if (!navIds || navIndex <= 0) return;
    const prevIndex = navIndex - 1;
    const prevId = navIds[prevIndex];
    setNavIndex(prevIndex);
    navigate(`/devolucion/${prevId}`, {
      replace: true,
      state: { devolucionIds: navIds, currentIndex: prevIndex },
    });
  }, [navIds, navIndex, navigate]);

  const handleSiguiente = useCallback(() => {
    if (!navIds || navIndex >= navIds.length - 1) return;
    const nextIndex = navIndex + 1;
    const nextId = navIds[nextIndex];
    setNavIndex(nextIndex);
    navigate(`/devolucion/${nextId}`, {
      replace: true,
      state: { devolucionIds: navIds, currentIndex: nextIndex },
    });
  }, [navIds, navIndex, navigate]);

  const advanceAfterAction = useCallback((removedId: string) => {
    if (navIds) {
      const remaining = navIds.filter((nid) => nid !== removedId);
      if (remaining.length === 0) {
        setTimeout(() => navigate('/obligaciones-pendientes', { replace: true }), 1500);
      } else {
        const nextIndex = Math.min(navIndex, remaining.length - 1);
        const nextId = remaining[nextIndex];
        setNavIds(remaining);
        setNavIndex(nextIndex);
        setTimeout(() => navigate(`/devolucion/${nextId}`, {
          replace: true,
          state: { devolucionIds: remaining, currentIndex: nextIndex },
        }), 1500);
      }
    }
  }, [navIds, navIndex, navigate]);

  const handleConfirmar = () => {
    if (!id) return;
    confirmar.mutate(id, {
      onSuccess: () => {
        showToast('Devolución confirmada exitosamente', 'success');
        if (hasPagination) {
          advanceAfterAction(id);
        } else {
          setTimeout(() => navigate('/obligaciones-pendientes', { replace: true }), 1500);
        }
      },
      onError: (err) => showToast(err.message, 'error'),
    });
  };

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box ref={formRef}>
        {isPending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={32} />
          </Box>
        ) : detalle ? (
          <DevolucionView devolucion={detalle.devolucion} />
        ) : null}
      </Box>

      {detalle?.devolucion.estado === ESTADO_DEVOLUCION.Pendiente && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: barStyle.left,
            width: barStyle.width,
            zIndex: 10,
          }}
        >
          <DevolucionActionBar
            onAnterior={hasPagination ? handleAnterior : undefined}
            onSiguiente={hasPagination ? handleSiguiente : undefined}
            onConfirmar={handleConfirmar}
            confirmarDisabled={confirmar.isPending || isPending}
            disableAnterior={isFirst}
            disableSiguiente={isLast}
            paginationLabel={paginationLabel}
          />
        </Box>
      )}
    </Box>
  );
}
