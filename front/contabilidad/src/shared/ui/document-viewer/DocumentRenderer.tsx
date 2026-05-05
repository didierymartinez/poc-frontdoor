import type { RefObject } from 'react';
import { Box } from '@mui/material';
import { PdfViewer } from './PdfViewer';
import { ImageViewer } from './ImageViewer';

const SCANNER_SX = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: '50px',
  background: 'linear-gradient(180deg, rgba(47,67,208,0.4) 0%, rgba(47,67,208,0) 100%)',
  '@keyframes scanDown': {
    '0%': { top: '-50px' },
    '100%': { top: '100%' },
  },
  animation: 'scanDown 15s linear infinite',
} as const;

interface DocumentRendererProps {
  url: string;
  name: string;
  zoom: number;
  rotation: number;
  scanAnimation?: boolean;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

function isPdf(name: string): boolean {
  return name.toLowerCase().endsWith('.pdf');
}

export const DocumentRenderer = ({ url, name, zoom, rotation, scanAnimation, scrollContainerRef }: DocumentRendererProps) => {
  const pdfFile = isPdf(name);

  return (
    <Box
      sx={{
        width: `${zoom}%`,
        mx: 'auto',
        transform: `rotate(${rotation}deg)`,
        transition: 'width 0.2s ease, transform 0.3s ease',
        boxShadow: 2,
        position: 'relative',
      }}
    >
      {pdfFile
        ? <PdfViewer url={url} scrollContainerRef={scrollContainerRef} />
        : <ImageViewer url={url} name={name} scrollContainerRef={scrollContainerRef} />
      }

      {scanAnimation && (
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
          <Box sx={SCANNER_SX} />
        </Box>
      )}
    </Box>
  );
};
