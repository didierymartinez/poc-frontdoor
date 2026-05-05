import { useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  IconButton,
  InputBase,
  Popover,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { IconGripHorizontal, IconLock, IconLockOpen, IconSearch, IconX } from '@tabler/icons-react';
import { useDraggableDialog } from '../hooks/useDraggableDialog';
import iaLabelSrc from '@/shared/assets/IA-label.svg';

// Types inlined to avoid shared → entities dependency
export interface DistribucionUnidad {
  id: string;
  nombre: string;
  porcentaje: number;
  valorAsignado: number;
  locked?: boolean;
}

export interface DistribucionOption {
  label: string;
  id: string;
}

// Use shared formatCurrency
import { formatCurrency as formatDistCurrency } from '@/shared/lib';

// ---------------------------------------------------------------------------
// Shared inner content (used by both Popover and Dialog modes)
// ---------------------------------------------------------------------------

function DistribucionContent({
  options,
  initialItems,
  onClose,
  onConfirm,
  onMouseDown,
  aiGenerated,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  chipLabel,
}: {
  options: DistribucionOption[];
  initialItems: DistribucionUnidad[];
  onClose: () => void;
  onConfirm?: (items: DistribucionUnidad[]) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  aiGenerated?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  chipLabel?: string;
}) {
  const theme = useTheme();
  const [items, setItems] = useState(initialItems);

  // Fixed totals from initial data — these are the maximums
  const fixedTotalPct = 100;
  const fixedTotalVal = initialItems.reduce((s, u) => s + u.valorAsignado, 0);

  // Current sums for validation
  const currentPct = items.reduce((s, u) => s + u.porcentaje, 0);
  const currentVal = items.reduce((s, u) => s + u.valorAsignado, 0);
  const isOverPct = currentPct > fixedTotalPct;
  const isOverVal = currentVal > fixedTotalVal;

  return (
    <>
      {/* Draggable header */}
      <Box
        onMouseDown={onMouseDown}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 2, py: 1.5, cursor: 'grab', '&:active': { cursor: 'grabbing' }, userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconGripHorizontal size={14} color={theme.palette.text.disabled} />
          <Typography variant="subtitle2" fontWeight={600}>Distribución de costos</Typography>
          {chipLabel && <Chip variant="filled" label={chipLabel} color="primary" size="small" />}
          {aiGenerated && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.625rem', fontWeight: 500, ml: 0.5 }}
            >
              GENERADO CON{' '}
              <Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: 19, height: 18, verticalAlign: 'middle', display: 'inline' }} />
            </Typography>
          )}
        </Box>
        <IconButton size="small" onClick={onClose}>
          <IconX size={14} />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Autocomplete
          options={options}
          size="small"
          popupIcon={<IconSearch size={16} />}
          renderInput={(params) => <TextField {...params} placeholder="Buscar y agregar" />}
          onChange={(_e, val) => {
            if (val) setItems((prev) => [...prev, { id: val.id, nombre: val.label, porcentaje: 0, valorAsignado: 0 }]);
          }}
          sx={{ mb: 1.5 }}
        />

        {/* Empty state */}
        {items.length === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, gap: 1 }}>
            <Box sx={{ width: 48, height: 48, bgcolor: 'grey.100', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" color="text.disabled">⊞</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">Agrega Unidad de negocio</Typography>
          </Box>
        )}

        {/* Table */}
        {items.length > 0 && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 130px 28px', bgcolor: 'grey.100', borderRadius: 0.5, height: 24, alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>Unidad de negocio</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, textAlign: 'center' }}>%</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, textAlign: 'right' }}>Valor asignado</Typography>
              <Box />
            </Box>
            {items.map((u, idx) => {
              const isLocked = u.locked ?? false;
              return (
                <Box
                  key={u.id + idx}
                  sx={{
                    display: 'grid', gridTemplateColumns: '1fr 80px 130px 28px', alignItems: 'center', height: 26,
                    borderBottom: '0.5px solid', borderColor: 'grey.200',
                    opacity: isLocked ? 0.45 : 1,
                    '&:hover': { bgcolor: isLocked ? undefined : 'action.hover' },
                  }}
                >
                  {/* Unidad + lock toggle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, overflow: 'hidden' }}>
                    <IconButton
                      size="small"
                      sx={{ p: 0, flexShrink: 0 }}
                      onClick={() => setItems((prev) => prev.map((item, i) => i === idx ? { ...item, locked: !item.locked } : item))}
                    >
                      {isLocked
                        ? <IconLock size={12} color={theme.palette.text.disabled} />
                        : <IconLockOpen size={12} color={theme.palette.text.secondary} />
                      }
                    </IconButton>
                    <Typography variant="caption" color={isLocked ? 'text.disabled' : 'text.primary'} noWrap>{u.nombre}</Typography>
                  </Box>

                  {/* Porcentaje */}
                  <Box sx={{ px: 1, textAlign: 'center' }}>
                    {isLocked ? (
                      <Typography variant="caption" color="text.disabled">{u.porcentaje}%</Typography>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                        <InputBase
                          value={u.porcentaje}
                          onChange={(e) => {
                            const cleaned = e.target.value.replace(/[^0-9.,]/g, '');
                            const num = parseFloat(cleaned.replace(',', '.')) || 0;
                            const othersTotal = items.reduce((s, item, i) => i === idx ? s : s + item.porcentaje, 0);
                            const capped = Math.min(num, 100 - othersTotal);
                            setItems((prev) => prev.map((item, i) => i === idx ? { ...item, porcentaje: Math.max(0, capped) } : item));
                          }}
                          inputProps={{ inputMode: 'decimal' }}
                          sx={{
                            fontSize: '0.6875rem', width: 40,
                            '& .MuiInputBase-input': {
                              p: 0, textAlign: 'center', borderBottom: '1px solid transparent', transition: 'border-color 0.15s',
                              '&:hover': { borderColor: theme.palette.grey[400] },
                              '&:focus': { borderColor: theme.palette.primary.main },
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">%</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Valor asignado */}
                  <Box sx={{ px: 1 }}>
                    {isLocked ? (
                      <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'right', display: 'block' }}>{formatDistCurrency(u.valorAsignado)}</Typography>
                    ) : (
                      <InputBase
                        value={formatDistCurrency(u.valorAsignado)}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/[^0-9.,]/g, '');
                          const num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
                          // Cap: sum of others + this must not exceed fixedTotalVal
                          const othersVal = items.reduce((s, item, i) => i === idx ? s : s + item.valorAsignado, 0);
                          const capped = Math.min(num, fixedTotalVal - othersVal);
                          setItems((prev) => prev.map((item, i) => i === idx ? { ...item, valorAsignado: Math.max(0, capped) } : item));
                        }}
                        inputProps={{ inputMode: 'decimal' }}
                        sx={{
                          fontSize: '0.6875rem', width: '100%',
                          '& .MuiInputBase-input': {
                            p: 0, textAlign: 'right', borderBottom: '1px solid transparent', transition: 'border-color 0.15s',
                            '&:hover': { borderColor: theme.palette.grey[400] },
                            '&:focus': { borderColor: theme.palette.primary.main },
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* Delete */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton size="small" sx={{ p: 0.125 }} onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))} disabled={isLocked}>
                      <IconX size={12} color={isLocked ? theme.palette.text.disabled : theme.palette.text.secondary} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
            {/* Current sums row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 130px 28px', alignItems: 'center', height: 26, bgcolor: (isOverPct || isOverVal) ? 'rgba(198,52,52,0.04)' : 'rgba(47,67,208,0.04)' }}>
              <Typography variant="caption" color={(isOverPct || isOverVal) ? 'error' : 'primary'} fontWeight={500} sx={{ px: 1 }}>Asignado</Typography>
              <Typography variant="caption" color={isOverPct ? 'error' : 'primary'} fontWeight={500} sx={{ px: 1, textAlign: 'center' }}>{currentPct}%</Typography>
              <Typography variant="caption" color={isOverVal ? 'error' : 'primary'} fontWeight={500} sx={{ px: 1, textAlign: 'right' }}>{formatDistCurrency(currentVal)}</Typography>
              <Box />
            </Box>
            {/* Fixed total row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px 130px 28px', alignItems: 'center', height: 26 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ px: 1 }}>Total</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ px: 1, textAlign: 'center' }}>{fixedTotalPct}%</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ px: 1, textAlign: 'right' }}>{formatDistCurrency(fixedTotalVal)}</Typography>
              <Box />
            </Box>
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
          <Button variant="text" size="small" onClick={onClose}>{cancelLabel}</Button>
          <Button variant="contained" size="small" onClick={() => { onConfirm?.(items); onClose(); }}>{confirmLabel}</Button>
        </Box>
      </Box>
    </>
  );
}

// ---------------------------------------------------------------------------
// Popover mode (anchored to an element)
// ---------------------------------------------------------------------------

interface DistribucionPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  options: DistribucionOption[];
  initialItems: DistribucionUnidad[];
  width?: number;
  onConfirm?: (items: DistribucionUnidad[]) => void;
  aiGenerated?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  chipLabel?: string;
}

export function DistribucionPopover({
  anchorEl,
  onClose,
  options,
  initialItems,
  width = 480,
  onConfirm,
  aiGenerated,
  confirmLabel,
  cancelLabel,
  chipLabel,
}: DistribucionPopoverProps) {
  const open = Boolean(anchorEl);
  const { paperRef, onMouseDown, highlightSourceRow } = useDraggableDialog(open);
  highlightSourceRow(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      disableScrollLock
      slotProps={{
        paper: { ref: paperRef, sx: { width, borderRadius: 1, mt: 0.5, boxShadow: '0px 4px 20px rgba(0,0,0,0.12)' } },
        root: { sx: { '& .MuiBackdrop-root': { backgroundColor: 'transparent' } } },
      }}
    >
      <DistribucionContent
        options={options}
        initialItems={initialItems}
        onClose={onClose}
        onConfirm={onConfirm}
        onMouseDown={onMouseDown}
        aiGenerated={aiGenerated}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        chipLabel={chipLabel}
      />
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Dialog mode (centered, for "Ver sugerida IA" and standalone views)
// ---------------------------------------------------------------------------

interface DistribucionDialogProps {
  open: boolean;
  onClose: () => void;
  options: DistribucionOption[];
  initialItems: DistribucionUnidad[];
  width?: number;
  onConfirm?: (items: DistribucionUnidad[]) => void;
  aiGenerated?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DistribucionDialog({
  open,
  onClose,
  options,
  initialItems,
  width = 600,
  onConfirm,
  aiGenerated,
  confirmLabel,
  cancelLabel,
}: DistribucionDialogProps) {
  const { paperRef, onMouseDown } = useDraggableDialog(open);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      disableScrollLock
      slotProps={{
        paper: { ref: paperRef, sx: { width, borderRadius: 1 } },
        backdrop: { sx: { backgroundColor: 'transparent' } },
      }}
    >
      <DistribucionContent
        options={options}
        initialItems={initialItems}
        onClose={onClose}
        onConfirm={onConfirm}
        onMouseDown={onMouseDown}
        aiGenerated={aiGenerated}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
      />
    </Dialog>
  );
}
