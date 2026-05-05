import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { IconChartPie3, IconCheck, IconChevronDown, IconArrowsMinimize, IconX, IconArrowsMaximize, IconPlus } from '@tabler/icons-react';
import { FiscalSubTable, DistribucionPopover, CurrencyInput, AgregarFiscalPopover } from '@/shared/ui';
import type { Comercio } from '@/entities/borrador';
import { IMPUESTO_OPTIONS, RETENCION_OPTIONS } from '@/entities/concepto';
import { useConceptosTable } from '../hooks/useConceptosTable';
import { useFiscalPopoverAnchors } from '../hooks/useFiscalPopoverAnchors';

const OCR_ROW_HOVER = 'rgba(59, 130, 246, 0.06)';

import type { FiscalSummary } from '../hooks/useConceptosTable';

function fmtCurrency(v: number): string {
  if (!v) return '';
  return v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface ConceptosTableProps {
  data?: Comercio;
  borradorConceptos?: import('@/entities/borrador').ConceptoRadicacion[];
  hideDistribucion?: boolean;
  hasError?: boolean;
  onTotalChange?: (total: number) => void;
  onFiscalChange?: (summary: FiscalSummary) => void;
  onConceptosChange?: (conceptos: import('@/entities/concepto').ConceptoRow[]) => void;
  highlightsEnabled?: boolean;
}

export function ConceptosTable({ data, borradorConceptos, hideDistribucion, hasError, onTotalChange, onFiscalChange, onConceptosChange, highlightsEnabled }: ConceptosTableProps) {
  const {
    theme,
    conceptos,
    expanded,
    conceptDistAnchor,
    setConceptDistAnchor,
    newCodigo,
    setNewCodigo,
    newDescripcion,
    setNewDescripcion,
    newCantidad,
    setNewCantidad,
    newValorNum,
    setNewValorNum,
    hasFiscalData,
    allExpanded,
    toggleAll,
    toggleRow,
    updateConcepto,
    deleteConcepto,
    addConcepto,
    isRowIncomplete,
    addImpuesto,
    deleteImpuesto,
    addRetencion,
    deleteRetencion,
    newRowImpuestos,
    addNewRowImpuesto,
    deleteNewRowImpuesto,
    newRowRetenciones,
    addNewRowRetencion,
    deleteNewRowRetencion,
    newRowTotal,
    highlightRow,
    clearHighlight,
    inputSx,
    newRowInputSx,
    GRID,
  } = useConceptosTable({ data, borradorConceptos, hideDistribucion, onTotalChange, onFiscalChange, onConceptosChange, highlightsEnabled });

  const {
    taxAnchor, setTaxAnchor,
    retAnchor, setRetAnchor,
    newRowTaxAnchor, setNewRowTaxAnchor,
    newRowRetAnchor, setNewRowRetAnchor,
    addMenuAnchor, setAddMenuAnchor,
    newRowMenuAnchor, setNewRowMenuAnchor,
  } = useFiscalPopoverAnchors();

  const headers: { label: string; align?: 'right' | 'center' }[] = [
    { label: 'Código' },
    { label: 'Descripción' },
    { label: 'Cant.', align: 'right' },
    { label: 'V. Unit.', align: 'right' },
    { label: 'Valor', align: 'right' },
  ];
  if (!hideDistribucion) headers.push({ label: 'Distri.', align: 'center' });
  if (hasFiscalData) headers.push({ label: 'Desglose fiscal' });
  headers.push({ label: '' });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6" color="text.secondary" fontWeight={600}>
          Conceptos
        </Typography>
        {hasFiscalData && (
          <Button
            size="small"
            variant="text"
            onClick={toggleAll}
            startIcon={allExpanded ? <IconArrowsMinimize size={16} /> : <IconArrowsMaximize size={16} />}
            sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8125rem' }}
          >
            {allExpanded ? 'Colapsar todo' : 'Expandir todo'}
          </Button>
        )}
      </Box>

      {/* Table header */}
      <Box sx={{ display: 'grid', gridTemplateColumns: GRID, borderBottom: '1px solid', borderColor: 'divider', py: 0.75 }}>
        {headers.map((h) => (
          <Typography key={h.label || 'empty'} variant="body3" color="text.secondary" sx={{ px: 1, textAlign: h.align ?? 'left' }}>{h.label}</Typography>
        ))}
      </Box>

      {/* Data rows */}
      {conceptos.map((row) => {
        const isOpen = expanded.has(row._key);
        const hasFiscal = row.impuestos.length > 0 || row.retenciones.length > 0;
        return (
          <Box
            key={row._key}
            data-row-id={row._key}
            onMouseEnter={highlightRow(row.ubicacion)}
            onMouseLeave={clearHighlight}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              transition: 'background-color 0.15s',
              ...(hasError && isRowIncomplete(row) && { bgcolor: 'error.50', borderRadius: 0.5 }),
              '&:hover': { bgcolor: row.ubicacion ? OCR_ROW_HOVER : undefined },
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: GRID, alignItems: 'center', py: 0.5, '&:hover': { bgcolor: row.ubicacion ? undefined : 'action.hover' } }}>
              <Box sx={{ px: 1 }}>
                <InputBase value={row.codigo} onChange={(e) => updateConcepto(row._key, 'codigo', e.target.value)} sx={inputSx} />
              </Box>
              <Box data-cell="descripcion" sx={{ px: 1 }}>
                <InputBase value={row.descripcion} onChange={(e) => updateConcepto(row._key, 'descripcion', e.target.value)} sx={inputSx} />
              </Box>
              <Box data-cell="cantidad" sx={{ px: 1 }}>
                <InputBase
                  value={String(row.cantidad)}
                  onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); updateConcepto(row._key, 'cantidad', parseInt(v) || 0); }}
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  sx={{ ...inputSx, '& .MuiInputBase-input': { ...inputSx['& .MuiInputBase-input'], textAlign: 'right' } }}
                />
              </Box>
              {/* V. Unitario — editable */}
              <Box sx={{ px: 1 }}>
                <CurrencyInput
                  value={row.valorUnitario}
                  onChange={(v) => updateConcepto(row._key, 'valorUnitario', v)}
                  sx={{ ...inputSx, '& .MuiInputBase-input': { p: 0, textAlign: 'right' } }}
                />
              </Box>
              {/* Valor total — calculated, not editable */}
              <Box data-cell="valor" sx={{ px: 1 }}>
                <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.secondary' }}>
                  {fmtCurrency(row.valor)}
                </Typography>
              </Box>
              {!hideDistribucion && (
                <Box
                  onClick={(e) => setConceptDistAnchor(e.currentTarget)}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, px: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                >
                  <IconChartPie3 size={14} color={theme.palette.text.secondary} />
                  <Typography variant="body2" color="text.secondary">{row.distribucion}</Typography>
                </Box>
              )}
              {hasFiscalData && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                  <Chip
                    icon={<IconPlus size={12} />}
                    label="Agregar"
                    size="small"
                    variant="outlined"
                    onClick={(e) => setAddMenuAnchor({ el: e.currentTarget, rowId: row._key, base: row.valor, row })}
                    sx={{ height: 20, fontSize: '0.6875rem', cursor: 'pointer', '& .MuiChip-icon': { ml: 0.5, mr: -0.25 }, color: 'primary.main', borderColor: 'primary.light' }}
                  />
                  {hasFiscal && (
                    <IconButton size="small" sx={{ p: 0.25 }} onClick={() => toggleRow(row._key)}>
                      <IconChevronDown size={16} color={theme.palette.text.secondary} style={{ transform: isOpen ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
                    </IconButton>
                  )}
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton size="small" sx={{ p: 0.25 }} onClick={() => deleteConcepto(row._key)}>
                  <IconX size={14} color={theme.palette.text.secondary} />
                </IconButton>
              </Box>
            </Box>

            {hasFiscal && (
              <Collapse in={isOpen}>
                <Box sx={{ display: 'flex', gap: 3, bgcolor: 'grey.50', borderRadius: 0.5, p: 1.5, overflow: 'hidden' }}>
                  {row.impuestos.length > 0 && (
                    <FiscalSubTable
                      title="Impuestos"
                      total={row.impuestos.reduce((s, i) => s + i.valor, 0)}
                      items={row.impuestos}
                      distribucionOptions={[]}
                      distribucionItems={[]}
                      hideDistribucion={hideDistribucion}
                    
                      onDeleteItem={(idx) => deleteImpuesto(row._key, idx)}
                    />
                  )}
                  {row.retenciones.length > 0 && (
                    <FiscalSubTable
                      title="Retenciones"
                      total={row.retenciones.reduce((s, r) => s + r.valor, 0)}
                      items={row.retenciones}
                      distribucionOptions={[]}
                      distribucionItems={[]}
                      hideDistribucion={hideDistribucion}                    
                      onDeleteItem={(idx) => deleteRetencion(row._key, idx)}
                    />
                  )}
                </Box>
              </Collapse>
            )}
          </Box>
        );
      })}

      {/* Add new row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID,
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: '1.5px dashed',
          borderColor: 'primary.light',
          borderRadius: 1,
          py: 0.75,
          mt: 0.5,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
          },
        }}
      >
        <Box sx={{ px: 1 }}>
          <InputBase value={newCodigo} onChange={(e) => setNewCodigo(e.target.value)} placeholder="Codigo" sx={newRowInputSx} />
        </Box>
        <Box sx={{ px: 1 }}>
          <InputBase value={newDescripcion} onChange={(e) => setNewDescripcion(e.target.value)} placeholder="Escribir descripcion..." sx={newRowInputSx} />
        </Box>
        <Box sx={{ px: 1 }}>
          <InputBase value={newCantidad} onChange={(e) => setNewCantidad(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} sx={{ ...newRowInputSx, '& .MuiInputBase-input': { ...newRowInputSx['& .MuiInputBase-input'], textAlign: 'right' } }} />
        </Box>
        {/* V. Unitario — editable */}
        <Box sx={{ px: 1 }}>
          <CurrencyInput
            value={newValorNum}
            onChange={setNewValorNum}
            placeholder="$ 0,00"
            sx={{ ...newRowInputSx, '& .MuiInputBase-input': { ...newRowInputSx['& .MuiInputBase-input'], textAlign: 'right' } }}
          />
        </Box>
        {/* Valor total — calculated */}
        <Box sx={{ px: 1 }}>
          <Typography variant="body2" sx={{ textAlign: 'right', color: 'text.disabled', fontStyle: newRowTotal ? 'normal' : 'italic', fontSize: '0.8125rem' }}>
            {newRowTotal ? fmtCurrency(newRowTotal) : '—'}
          </Typography>
        </Box>
        {!hideDistribucion && <Box sx={{ px: 1, textAlign: 'center' }}><Typography variant="body3" color="text.disabled">—</Typography></Box>}
        {hasFiscalData && (
          <Box sx={{ px: 1, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {newRowImpuestos.map((imp, idx) => (
              <Chip
                key={`imp-${idx}`}
                label={`${imp.tipo} ${imp.tarifa}`}
                size="small"
                onDelete={() => deleteNewRowImpuesto(idx)}
                sx={{ height: 18, fontSize: '0.625rem' }}
              />
            ))}
            {newRowRetenciones.map((ret, idx) => (
              <Chip
                key={`ret-${idx}`}
                label={`${ret.tipo} ${ret.tarifa}`}
                size="small"
                onDelete={() => deleteNewRowRetencion(idx)}
                sx={{ height: 18, fontSize: '0.625rem' }}
              />
            ))}
            <Chip
              icon={<IconPlus size={10} />}
              label="Agregar"
              size="small"
              variant="outlined"
              onClick={(e) => setNewRowMenuAnchor(e.currentTarget)}
              sx={{ height: 18, fontSize: '0.625rem', cursor: 'pointer', '& .MuiChip-icon': { ml: 0.5, mr: -0.25 }, color: 'primary.main', borderColor: 'primary.light' }}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton size="small" sx={{ p: 0.25, color: 'primary.main' }} onClick={addConcepto}>
            <IconCheck size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Popovers */}
      <DistribucionPopover
        anchorEl={conceptDistAnchor}
        onClose={() => setConceptDistAnchor(null)}
        options={[]}
        initialItems={[]}
      />

      <AgregarFiscalPopover
        anchorEl={taxAnchor?.el ?? null}
        onClose={() => setTaxAnchor(null)}
        onAdd={(item) => { if (taxAnchor) addImpuesto(taxAnchor.rowId, item); }}
        base={taxAnchor?.base ?? 0}
        existingTipos={taxAnchor?.existingTipos ?? []}
        opciones={IMPUESTO_OPTIONS}
      />

      <AgregarFiscalPopover
        anchorEl={retAnchor?.el ?? null}
        onClose={() => setRetAnchor(null)}
        onAdd={(item) => { if (retAnchor) addRetencion(retAnchor.rowId, item); }}
        base={retAnchor?.base ?? 0}
        existingTipos={retAnchor?.existingTipos ?? []}
        opciones={RETENCION_OPTIONS}
        titulo="Agregar retención"
      />

      <AgregarFiscalPopover
        anchorEl={newRowTaxAnchor}
        onClose={() => setNewRowTaxAnchor(null)}
        onAdd={addNewRowImpuesto}
        base={newRowTotal}
        existingTipos={newRowImpuestos.map((i) => i.tipo)}
        opciones={IMPUESTO_OPTIONS}
      />

      <AgregarFiscalPopover
        anchorEl={newRowRetAnchor}
        onClose={() => setNewRowRetAnchor(null)}
        onAdd={addNewRowRetencion}
        base={newRowTotal}
        existingTipos={newRowRetenciones.map((r) => r.tipo)}
        opciones={RETENCION_OPTIONS}
        titulo="Agregar retención"
      />

      {/* Menu: choose impuesto or retención (data rows) */}
      <Menu
        anchorEl={addMenuAnchor?.el}
        open={Boolean(addMenuAnchor)}
        onClose={() => setAddMenuAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 140 } }, backdrop: { sx: { backgroundColor: 'transparent' } } }}
      >
        <MenuItem dense onClick={(e) => {
          const m = addMenuAnchor!;
          setAddMenuAnchor(null);
          setTaxAnchor({ el: e.currentTarget, rowId: m.rowId, base: m.base, existingTipos: m.row.impuestos.map((i) => i.tipo) });
        }}>Impuesto</MenuItem>
        <MenuItem dense onClick={(e) => {
          const m = addMenuAnchor!;
          setAddMenuAnchor(null);
          setRetAnchor({ el: e.currentTarget, rowId: m.rowId, base: m.base, existingTipos: m.row.retenciones.map((r) => r.tipo) });
        }}>Retención</MenuItem>
      </Menu>

      {/* Menu: choose impuesto or retención (new row) */}
      <Menu
        anchorEl={newRowMenuAnchor}
        open={Boolean(newRowMenuAnchor)}
        onClose={() => setNewRowMenuAnchor(null)}
        slotProps={{ paper: { sx: { minWidth: 140 } }, backdrop: { sx: { backgroundColor: 'transparent' } } }}
      >
        <MenuItem dense onClick={(e) => {
          setNewRowMenuAnchor(null);
          setNewRowTaxAnchor(e.currentTarget);
        }}>Impuesto</MenuItem>
        <MenuItem dense onClick={(e) => {
          setNewRowMenuAnchor(null);
          setNewRowRetAnchor(e.currentTarget);
        }}>Retención</MenuItem>
      </Menu>
    </Box>
  );
}
