import { useCallback, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { DocumentRenderer } from './DocumentRenderer';
import { ViewerControls } from './ViewerControls';
import { EmptyState } from '../index';

interface DocumentViewerProps {
  url?: string;
  name?: string;
  scanAnimation?: boolean;
  isLoading?: boolean;
}

export const DocumentViewer = ({ url, name, scanAnimation, isLoading }: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const centerScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(200, prev + 25));
    centerScroll();
  }, [centerScroll]);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(25, prev - 25));
    centerScroll();
  }, [centerScroll]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
    centerScroll();
  }, [centerScroll]);

  const handleDownload = useCallback(() => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = name ?? 'documento';
    a.click();
  }, [url, name]);

  const handleOpenExternal = useCallback(() => {
    if (!url) return;
    window.open(url, '_blank');
  }, [url]);

  if (isLoading) {
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 3 }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Cargando documento...
        </Typography>
      </Box>
    );
  }

  if (!url) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <EmptyState
          title="Sin documento"
          description="Selecciona o carga un documento para visualizarlo aquí."
        />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
      {/* Document name bar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'grey.200',
          flexShrink: 0,
        }}
      >
        <Typography variant="body2" color="text.secondary" noWrap>
          {name}
        </Typography>
      </Box>

      {/* Scroll container */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          bgcolor: 'grey.100',
        }}
      >
        <DocumentRenderer url={url} name={name ?? ''} zoom={zoom} rotation={rotation} scanAnimation={scanAnimation} scrollContainerRef={scrollRef} />
      </Box>

      {/* Floating controls */}
      <ViewerControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onDownload={handleDownload}
        onOpenExternal={handleOpenExternal}
      />
    </Box>
  );
};
