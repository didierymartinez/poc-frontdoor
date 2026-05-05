import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Document, Page } from 'react-pdf';
import './pdf-worker';
import orbitsIcon from '@/shared/assets/EmptyState/Orbits.svg';
import { useDocumentViewerStore } from '@/shared/model';
import { HighlightOverlay } from './HighlightOverlay';

const PDF_POINTS_PER_INCH = 72;

interface PageDims {
  originalWidth: number;
  originalHeight: number;
  renderedWidth: number;
  renderedHeight: number;
}

interface PdfViewerProps {
  url: string;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export const PdfViewer = ({ url, scrollContainerRef }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>();
  const [numPages, setNumPages] = useState(0);
  const [pageDims, setPageDims] = useState<Record<number, PageDims>>({});

  const highlightSource = useDocumentViewerStore((s) => s.highlightSource);
  const unidadMedida = useDocumentViewerStore((s) => s.unidadMedidaCoordenadas);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll to highlight position
  useEffect(() => {
    if (!highlightSource || !scrollContainerRef?.current) return;
    const pageIndex = highlightSource.pageNumber - 1;
    const dims = pageDims[pageIndex];
    if (!dims || !dims.renderedHeight) return;

    const isInch = unidadMedida.toLowerCase() === 'inch';
    let highlightTopInPage: number;
    if (isInch) {
      const pageHeightInches = dims.originalHeight / PDF_POINTS_PER_INCH;
      highlightTopInPage = highlightSource.ubicacion.superiorIzquierda.y * (dims.renderedHeight / pageHeightInches);
    } else {
      highlightTopInPage = highlightSource.ubicacion.superiorIzquierda.y * (dims.renderedHeight / dims.originalHeight);
    }

    // Sum heights of pages above
    let pagesAboveHeight = 0;
    for (let i = 0; i < pageIndex; i++) {
      const d = pageDims[i];
      if (d) pagesAboveHeight += d.renderedHeight + 8; // 8px = mb: 1
    }

    const scrollContainer = scrollContainerRef.current;
    const targetScroll = pagesAboveHeight + highlightTopInPage - scrollContainer.clientHeight / 3;

    scrollContainer.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, [highlightSource, pageDims, unidadMedida, scrollContainerRef]);

  return (
    <Box ref={containerRef} sx={{ width: '100%' }}>
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => { setNumPages(n); setPageDims({}); }}
        loading={
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        }
        error={
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 6 }}>
            <Box component="img" src={orbitsIcon} alt="" sx={{ width: 72, height: 44 }} />
            <Typography variant="body2" color="text.secondary">
              No fue posible cargar el documento
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Verifica la conexión o intenta de nuevo más tarde.
            </Typography>
          </Box>
        }
      >
        {Array.from({ length: numPages }, (_, i) => {
          const pageNum = i + 1;
          const dims = pageDims[i];
          const isInch = (unidadMedida || 'pixel').toLowerCase() === 'inch';
          return (
            <Box key={i} sx={{ position: 'relative', mb: 1 }}>
              <Page
                pageNumber={pageNum}
                width={containerWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                onLoadSuccess={(page) => {
                  // Capture original PDF dimensions (points at scale 1)
                  type PageProxy = {
                    originalWidth?: number; originalHeight?: number;
                    getViewport: (opts: { scale: number }) => { width: number; height: number };
                  };
                  const p = page as unknown as PageProxy;
                  const vp = p.getViewport({ scale: 1 });
                  const origW = p.originalWidth ?? vp.width;
                  const origH = p.originalHeight ?? vp.height;
                  // Store original dims now; rendered dims will be measured after render
                  setPageDims((prev) => ({
                    ...prev,
                    [i]: {
                      originalWidth: origW,
                      originalHeight: origH,
                      renderedWidth: prev[i]?.renderedWidth ?? 0,
                      renderedHeight: prev[i]?.renderedHeight ?? 0,
                    },
                  }));
                }}
                onRenderSuccess={() => {
                  // Measure actual rendered size from the DOM after painting
                  const pageEl = containerRef.current?.querySelectorAll('.react-pdf__Page')[i] as HTMLElement | undefined;
                  if (!pageEl) return;
                  setPageDims((prev) => ({
                    ...prev,
                    [i]: {
                      ...prev[i],
                      renderedWidth: pageEl.clientWidth,
                      renderedHeight: pageEl.clientHeight,
                    },
                  }));
                }}
              />
              {highlightSource && dims && dims.renderedWidth > 0 && (
                <HighlightOverlay
                  source={highlightSource}
                  currentPage={pageNum}
                  unidadMedidaCoordenadas={isInch ? 'inch' : 'pixel'}
                  containerWidth={dims.renderedWidth}
                  containerHeight={dims.renderedHeight}
                  naturalWidth={dims.originalWidth}
                  naturalHeight={dims.originalHeight}
                />
              )}
            </Box>
          );
        })}
      </Document>
    </Box>
  );
};
