import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useDocumentViewerStore } from '@/shared/model';
import { HighlightOverlay } from './HighlightOverlay';

interface ImageViewerProps {
  url: string;
  name: string;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export const ImageViewer = ({ url, name, scrollContainerRef }: ImageViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightSource = useDocumentViewerStore((s) => s.highlightSource);
  const unidadMedida = useDocumentViewerStore((s) => s.unidadMedidaCoordenadas);

  const [dims, setDims] = useState<{
    naturalWidth: number;
    naturalHeight: number;
    renderedWidth: number;
    renderedHeight: number;
  } | null>(null);

  useEffect(() => {
    const img = containerRef.current?.querySelector('img');
    if (!img) return;

    const measure = () => {
      setDims({
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: img.clientWidth,
        renderedHeight: img.clientHeight,
      });
    };

    if (img.complete && img.naturalWidth) {
      measure();
    } else {
      img.addEventListener('load', measure);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(img);
    return () => {
      img.removeEventListener('load', measure);
      ro.disconnect();
    };
  }, [url]);

  // Auto-scroll to highlight position
  useEffect(() => {
    if (!highlightSource || !scrollContainerRef?.current || !dims) return;
    const scaleY = dims.renderedHeight / dims.naturalHeight;
    const highlightTop = highlightSource.ubicacion.superiorIzquierda.y * scaleY;

    scrollContainerRef.current.scrollTo({
      top: Math.max(0, highlightTop - scrollContainerRef.current.clientHeight / 3),
      behavior: 'smooth',
    });
  }, [highlightSource, dims, scrollContainerRef]);

  return (
    <Box ref={containerRef} sx={{ position: 'relative' }}>
      <Box
        component="img"
        src={url}
        alt={name}
        sx={{ width: '100%', height: 'auto', display: 'block' }}
      />
      {highlightSource && dims && dims.renderedWidth > 0 && (
        <HighlightOverlay
          source={highlightSource}
          currentPage={highlightSource.pageNumber}
          unidadMedidaCoordenadas={unidadMedida}
          containerWidth={dims.renderedWidth}
          containerHeight={dims.renderedHeight}
          naturalWidth={dims.naturalWidth}
          naturalHeight={dims.naturalHeight}
        />
      )}
    </Box>
  );
};
