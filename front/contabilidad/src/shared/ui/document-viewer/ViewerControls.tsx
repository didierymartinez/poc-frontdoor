import { Box, Divider, IconButton, Tooltip } from '@mui/material';
import {
  IconZoomIn,
  IconZoomOut,
  IconRotate,
  IconDownload,
  IconExternalLink,
} from '@tabler/icons-react';

interface ViewerControlsProps {
  zoom: number;
  disabled?: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onDownload: () => void;
  onOpenExternal: () => void;
}

export const ViewerControls = ({
  zoom,
  disabled,
  onZoomIn,
  onZoomOut,
  onRotate,
  onDownload,
  onOpenExternal,
}: ViewerControlsProps) => {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'background.paper',
        borderRadius: '12px',
        boxShadow: 3,
        px: 1,
        py: 0.5,
      }}
    >
      <Tooltip title="Alejar">
        <span>
          <IconButton size="small" onClick={onZoomOut} disabled={disabled || zoom <= 25}>
            <IconZoomOut size={18} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Acercar">
        <span>
          <IconButton size="small" onClick={onZoomIn} disabled={disabled || zoom >= 200}>
            <IconZoomIn size={18} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Rotar">
        <span>
          <IconButton size="small" onClick={onRotate} disabled={disabled}>
            <IconRotate size={18} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Descargar">
        <span>
          <IconButton size="small" onClick={onDownload} disabled={disabled}>
            <IconDownload size={18} />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Abrir en nueva pestaña">
        <span>
          <IconButton size="small" onClick={onOpenExternal} disabled={disabled}>
            <IconExternalLink size={18} />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};
