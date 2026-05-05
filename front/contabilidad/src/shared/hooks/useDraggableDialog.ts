import { useCallback, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';

/**
 * Hook that provides draggable + row-highlight behavior for Dialog/Popover.
 *
 * Usage:
 *   const { paperRef, onMouseDown, highlightSourceRow } = useDraggableDialog(open);
 *
 *   - Attach `paperRef` to the Paper element (via slotProps.paper.ref)
 *   - Attach `onMouseDown` to the draggable header area
 *   - Call `highlightSourceRow(anchorEl)` to highlight the source row
 */
export function useDraggableDialog(open: boolean) {
  const theme = useTheme();
  const paperRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetRef = useRef({ x: 0, y: 0 });
  const highlightedRow = useRef<HTMLElement | null>(null);

  // Reset position when opening
  useEffect(() => {
    if (open) {
      offsetRef.current = { x: 0, y: 0 };
      if (paperRef.current) paperRef.current.style.transform = '';
    }
  }, [open]);

  // Drag listeners
  useEffect(() => {
    if (!open) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !paperRef.current) return;
      offsetRef.current = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };
      paperRef.current.style.transform = `translate(${offsetRef.current.x}px, ${offsetRef.current.y}px)`;
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [open]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = {
      x: e.clientX - offsetRef.current.x,
      y: e.clientY - offsetRef.current.y,
    };
    e.preventDefault();
  }, []);

  // Highlight the closest row with data-row-id
  const highlightSourceRow = useCallback((anchorEl: HTMLElement | null) => {
    // Clean previous
    if (highlightedRow.current) {
      highlightedRow.current.style.backgroundColor = '';
      highlightedRow.current = null;
    }
    if (!anchorEl) return;
    const row = anchorEl.closest('[data-row-id]') as HTMLElement | null;
    if (row) {
      row.style.backgroundColor = theme.palette.primary.main + '0A';
      highlightedRow.current = row;
    }
  }, [theme]);

  // Cleanup highlight on close
  useEffect(() => {
    if (!open && highlightedRow.current) {
      highlightedRow.current.style.backgroundColor = '';
      highlightedRow.current = null;
    }
  }, [open]);

  return { paperRef, onMouseDown, highlightSourceRow };
}
