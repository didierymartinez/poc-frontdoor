import { useState } from 'react';
import { Box, Chip, IconButton, InputBase, Typography, useTheme } from '@mui/material';
import { IconChartPie3,  IconX } from '@tabler/icons-react';
import { DistribucionPopover } from './DistribucionPopover';
import type { DistribucionOption, DistribucionUnidad } from './DistribucionPopover';

// Inlined type to avoid shared → entities dependency
export interface FiscalItem {
  tipo: string;
  base: number;
  tarifa: string;
  valor: number;
  distri: number;
  recalculado?: boolean;
}

interface FiscalSubTableProps {
  title: string;
  total: number;
  items: FiscalItem[];
  onUpdateItem?: (idx: number, field: keyof FiscalItem, value: string | number) => void;
  onDeleteItem?: (idx: number) => void;
  distribucionOptions: DistribucionOption[];
  distribucionItems: DistribucionUnidad[];
  hideDistribucion?: boolean;
}

export function FiscalSubTable({
  title,
  total,
  items,
  onUpdateItem,
  onDeleteItem,
  distribucionOptions,
  distribucionItems,
  hideDistribucion,
}: FiscalSubTableProps) {
  const theme = useTheme();
  const [distAnchor, setDistAnchor] = useState<HTMLElement | null>(null);

  const baseCols = '80px 1fr 50px 1fr';
  const gridCols = [baseCols, !hideDistribucion ? '50px' : '', onDeleteItem ? '24px' : ''].filter(Boolean).join(' ');

  const fiscalInputSx = {
    fontSize: '0.6875rem',
    width: '100%',
    '& .MuiInputBase-input': {
      p: 0,
      borderBottom: '1px solid transparent',
      transition: 'border-color 0.15s',
      '&:hover': { borderColor: theme.palette.grey[400] },
      '&:focus': { borderColor: theme.palette.primary.main },
    },
  };

  const headers = ['Tipo', 'Base', 'Tarifa', 'Valor'];
  if (!hideDistribucion) headers.push('Distri.');
  if (onDeleteItem) headers.push('');

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">{title}</Typography>
         
        </Box>
        <Typography variant="body2" color="text.secondary">
          Total {title.toLowerCase()}: {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 }).format(total)}
        </Typography>
      </Box>
      {/* Column headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: gridCols, gap: 1, mb: 0.5 }}>
        {headers.map((h, i) => (
          <Typography
            key={h || `empty-${i}`}
            variant="caption"
            color="text.disabled"
            sx={{ px: 1, textAlign: i === 1 || i === 3 ? 'right' : i === 2 ? 'center' : i === 4 ? 'right' : 'left' }}
          >
            {h}
          </Typography>
        ))}
      </Box>
      {/* Rows */}
      {items.map((item, idx) => (
        <Box key={idx} data-row-id={`fiscal-${idx}`} sx={{ display: 'grid', gridTemplateColumns: gridCols, gap: 1, alignItems: 'center', transition: 'background-color 0.15s' }}>
          <Box sx={{ px: 1 }}>
            {onUpdateItem ? (
              <InputBase
                value={item.tipo}
                onChange={(e) => onUpdateItem(idx, 'tipo', e.target.value)}
                sx={{ ...fiscalInputSx, '& .MuiInputBase-input': { ...fiscalInputSx['& .MuiInputBase-input'], color: theme.palette.text.primary } }}
              />
            ) : (
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', color: theme.palette.text.primary }}>{item.tipo}</Typography>
            )}
          </Box>
          <Box sx={{ px: 1 }}>
            {onUpdateItem ? (
              <InputBase
                value={new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 }).format(item.base)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.,]/g, '');
                  onUpdateItem(idx, 'base', parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0);
                }}
                inputProps={{ inputMode: 'decimal' }}
                sx={{ ...fiscalInputSx, '& .MuiInputBase-input': { ...fiscalInputSx['& .MuiInputBase-input'], textAlign: 'right', color: theme.palette.text.secondary } }}
              />
            ) : (
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', textAlign: 'right', display: 'block', color: theme.palette.text.secondary }}>
                {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 }).format(item.base)}
              </Typography>
            )}
          </Box>
          <Box sx={{ px: 1 }}>
            {onUpdateItem ? (
              <InputBase
                value={item.tarifa}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.,%]/g, '');
                  onUpdateItem(idx, 'tarifa', cleaned);
                }}
                inputProps={{ inputMode: 'decimal' }}
                sx={{ ...fiscalInputSx, '& .MuiInputBase-input': { ...fiscalInputSx['& .MuiInputBase-input'], textAlign: 'center', color: theme.palette.text.secondary } }}
              />
            ) : (
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', textAlign: 'center', display: 'block', color: theme.palette.text.secondary }}>{item.tarifa}</Typography>
            )}
          </Box>
          <Box sx={{ px: 1 }}>
            {onUpdateItem ? (
              <InputBase
                value={new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 }).format(item.valor)}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9.,]/g, '');
                  onUpdateItem(idx, 'valor', parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0);
                }}
                inputProps={{ inputMode: 'decimal' }}
                sx={{ ...fiscalInputSx, '& .MuiInputBase-input': { ...fiscalInputSx['& .MuiInputBase-input'], textAlign: 'right', color: theme.palette.text.secondary } }}
              />
            ) : (
              <Typography variant="caption" sx={{ fontSize: '0.6875rem', textAlign: 'right', display: 'block', color: theme.palette.text.secondary }}>
                {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2 }).format(item.valor)}
              </Typography>
            )}
          </Box>
          {!hideDistribucion && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 0.5 }}>
              <Chip
                icon={<IconChartPie3 size={12} />}
                label={item.distri}
                size="small"
                variant="outlined"
                onClick={(e) => setDistAnchor(e.currentTarget)}
                sx={{ height: 18, fontSize: '0.6875rem', cursor: 'pointer', '& .MuiChip-icon': { ml: 0.5, mr: -0.25 } }}
              />
            </Box>
          )}
          {onDeleteItem && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton size="small" sx={{ p: 0.125 }} onClick={() => onDeleteItem(idx)}>
                <IconX size={12} color={theme.palette.text.disabled} />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}

      <DistribucionPopover
        anchorEl={distAnchor}
        onClose={() => setDistAnchor(null)}
        options={distribucionOptions}
        initialItems={distribucionItems}
        width={440}
      />
    </Box>
  );
}
