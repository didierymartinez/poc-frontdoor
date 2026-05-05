import { useCallback, useRef } from 'react';
import { Box, Divider } from '@mui/material';
import { IconGripVertical } from '@tabler/icons-react';

interface SplitViewHandleProps {
  onResize: (deltaX: number) => void;
}

export const SplitViewHandle = ({ onResize }: SplitViewHandleProps) => {
  const startXRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startXRef.current = e.clientX;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startXRef.current;
        startXRef.current = moveEvent.clientX;
        onResize(delta);
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [onResize],
  );

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'stretch',
        flexShrink: 0,
        width: 0,
      }}
    >
      <Divider orientation="vertical" flexItem />

      {/* Drag handle */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 12,
          py: 0.5,
          bgcolor: 'grey.50',
          borderRadius: '32px',
          boxShadow:
            '0px 1px 5px 0px rgba(93,109,126,0.08), 0px 2px 2px 0px rgba(93,109,126,0.12), 0px 3px 1px -2px rgba(93,109,126,0.16)',
          cursor: 'col-resize',
          overflow: 'hidden',
        }}
      >
        <IconGripVertical size={14} />
      </Box>
    </Box>
  );
};
