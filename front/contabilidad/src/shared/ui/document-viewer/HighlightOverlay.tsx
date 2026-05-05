import { Box } from '@mui/material';
import type { HighlightSource } from '@/shared/model';

const PDF_POINTS_PER_INCH = 72;

const HIGHLIGHT_STYLE = {
  background: 'rgba(59, 130, 246, 0.2)',
  border: 'rgba(59, 130, 246, 0.6)',
} as const;

interface HighlightOverlayProps {
  source: HighlightSource;
  currentPage: number;
  unidadMedidaCoordenadas: string;
  containerWidth: number;
  containerHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

export function HighlightOverlay({
  source,
  currentPage,
  unidadMedidaCoordenadas,
  containerWidth,
  containerHeight,
  naturalWidth,
  naturalHeight,
}: HighlightOverlayProps) {
  if (source.pageNumber !== currentPage) return null;
  if (containerWidth === 0 || containerHeight === 0) return null;

  const ub = source.ubicacion;
  const isInch = unidadMedidaCoordenadas.toLowerCase() === 'inch';

  let scaleX: number;
  let scaleY: number;

  if (isInch) {
    const pageWidthInches = naturalWidth / PDF_POINTS_PER_INCH;
    const pageHeightInches = naturalHeight / PDF_POINTS_PER_INCH;
    scaleX = containerWidth / pageWidthInches;
    scaleY = containerHeight / pageHeightInches;
  } else {
    scaleX = containerWidth / naturalWidth;
    scaleY = containerHeight / naturalHeight;
  }

  const left = ub.superiorIzquierda.x * scaleX;
  const top = ub.superiorIzquierda.y * scaleY;
  const width = (ub.superiorDerecha.x - ub.superiorIzquierda.x) * scaleX;
  const height = (ub.inferiorIzquierda.y - ub.superiorIzquierda.y) * scaleY;

  return (
    <Box
      sx={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        background: HIGHLIGHT_STYLE.background,
        border: `2px solid ${HIGHLIGHT_STYLE.border}`,
        borderRadius: '3px',
        pointerEvents: 'none',
        zIndex: 10,
        transition: 'opacity 0.2s ease-in-out',
      }}
    />
  );
}
