import { useState } from 'react';
import { Box, Button, Chip, Collapse, Divider, IconButton, Typography, useTheme } from '@mui/material';
import { IconArrowsMaximize, IconArrowsMinimize, IconChevronDown } from '@tabler/icons-react';
import { CurrencyInput, FiscalSubTable } from '@/shared/ui';
import type { FiscalItem } from '@/shared/ui';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConceptoDevolucionRow {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor: number;
  desgloseFiscal: string[];
  cantidadADevolver: number;
  valorADevolver: number;
  impuestos: FiscalItem[];
  retenciones: FiscalItem[];
}

interface ConceptosDevolucionTableProps {
  rows: ConceptoDevolucionRow[];
  onCantidadChange?: (id: string, cantidad: number) => void;
  onValorChange?: (id: string, valor: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmt(v: number) {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MAX_VISIBLE_FISCAL = 3;

function FiscalCell({ items }: { items: string[] }) {
  const visible = items.slice(0, MAX_VISIBLE_FISCAL);
  const extra = items.length - MAX_VISIBLE_FISCAL;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {visible.map((item, i) => (
        <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {i > 0 && <Divider orientation="vertical" sx={{ height: 8 }} />}
          <Typography variant="caption" color="text.secondary">{item}</Typography>
        </Box>
      ))}
      {extra > 0 && (
        <Chip
          label={`+${extra}`}
          size="small"
          sx={{
            height: 18, minWidth: 20,
            bgcolor: 'grey.100', color: 'text.secondary',
            fontSize: '0.6875rem', fontWeight: 500,
            '& .MuiChip-label': { px: 0.5 },
          }}
        />
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Grid definition
// ---------------------------------------------------------------------------

const GRID = 'minmax(80px, 1fr) minmax(100px, 2fr) 60px 100px minmax(120px, 1.5fr) 100px 110px 30px';

const HEADERS: { label: string; align?: 'right' | 'center' }[] = [
  { label: 'Código' },
  { label: 'Descripción' },
  { label: 'Cantidad', align: 'right' },
  { label: 'Valor', align: 'right' },
  { label: 'Desglose fiscal' },
  { label: 'Cant. a devolver', align: 'right' },
  { label: 'Valor a devolver', align: 'right' },
  { label: '' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ConceptosDevolucionTable({ rows, onCantidadChange, onValorChange }: ConceptosDevolucionTableProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const hasFiscal = (row: ConceptoDevolucionRow) => row.impuestos.length > 0 || row.retenciones.length > 0;
  const allExpanded = rows.length > 0 && rows.filter(hasFiscal).every((r) => expanded.has(r.id));

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(rows.filter(hasFiscal).map((r) => r.id)));
    }
  };

  return (
    <Box>
      {/* Toggle all button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
        <Button
          size="small"
          variant="text"
          onClick={toggleAll}
          startIcon={allExpanded ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
          sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8125rem' }}
        >
          {allExpanded ? 'Colapsar todo' : 'Expandir todo'}
        </Button>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: '1px solid', borderColor: 'divider', py: 0.75 }}>
        {HEADERS.map((h) => (
          <Typography key={h.label || 'empty'} variant="body3" color="text.secondary" sx={{ px: 1, textAlign: h.align ?? 'left' }}>
            {h.label}
          </Typography>
        ))}
      </Box>

      {/* Data rows */}
      {rows.map((row) => {
        const isOpen = expanded.has(row.id);
        const rowHasFiscal = hasFiscal(row);

        return (
          <Box key={row.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', py: 0.5 }}>
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" color="text.secondary">{row.codigo}</Typography>
              </Box>
              <Box sx={{ px: 1 }}>
                <Typography variant="body2" color="text.secondary" noWrap>{row.descripcion}</Typography>
              </Box>
              <Box sx={{ px: 1, textAlign: 'right' }}>
                <Typography variant="body2" color="text.primary">{row.cantidad}</Typography>
              </Box>
              <Box sx={{ px: 1, textAlign: 'right' }}>
                <Typography variant="body2" color="text.primary">{fmt(row.valor)}</Typography>
              </Box>
              <Box sx={{ px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FiscalCell items={row.desgloseFiscal} />
                {rowHasFiscal && (
                  <IconButton size="small" sx={{ p: 0.25 }} onClick={() => toggleRow(row.id)}>
                    <IconChevronDown
                      size={16}
                      color={theme.palette.text.secondary}
                      style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}
                    />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ px: 0.5 }}>
                <CurrencyInput
                  value={row.cantidadADevolver}
                  onChange={(v) => onCantidadChange?.(row.id, Math.round(v))}
                  max={row.cantidad}
                  placeholder="0"
                  sx={{
                    width: '100%',
                    bgcolor: 'rgba(47,67,208,0.04)',
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'primary.main' },
                    '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
                    '& .MuiInputBase-input': { textAlign: 'right', fontSize: '0.8125rem', py: 0.5, px: 1 },
                    '& fieldset': { border: 'none' },
                  }}
                />
              </Box>
              <Box sx={{ px: 0.5 }}>
                <CurrencyInput
                  value={row.valorADevolver}
                  onChange={(v) => onValorChange?.(row.id, v)}
                  max={row.valor}
                  sx={{
                    width: '100%',
                    bgcolor: 'rgba(47,67,208,0.04)',
                    borderRadius: 0.5,
                    border: '1px solid',
                    borderColor: 'grey.300',
                    '&:hover': { borderColor: 'primary.main' },
                    '&:focus-within': { borderColor: 'primary.main', bgcolor: 'background.paper' },
                    '& .MuiInputBase-input': { textAlign: 'right', fontSize: '0.8125rem', py: 0.5, px: 1 },
                    '& fieldset': { border: 'none' },
                  }}
                />
              </Box>
              <Box />
            </Box>

            {/* Expanded fiscal detail (read-only) */}
            {rowHasFiscal && (
              <Collapse in={isOpen}>
                <Box sx={{ display: 'flex', gap: 3, bgcolor: 'grey.50', borderRadius: 0.5, p: 1.5, overflow: 'hidden' }}>
                  {row.impuestos.length > 0 && (
                    <FiscalSubTable
                      title="Impuestos"
                      total={row.impuestos.reduce((s, i) => s + i.valor, 0)}
                      items={row.impuestos}
                      distribucionOptions={[]}
                      distribucionItems={[]}
                      hideDistribucion
                    />
                  )}
                  {row.retenciones.length > 0 && (
                    <FiscalSubTable
                      title="Retenciones"
                      total={row.retenciones.reduce((s, r) => s + r.valor, 0)}
                      items={row.retenciones}
                      distribucionOptions={[]}
                      distribucionItems={[]}
                      hideDistribucion
                    />
                  )}
                </Box>
              </Collapse>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
