import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import type { ConceptoRow, FiscalItem } from '@/entities/concepto';
import type { Comercio, Source, ConceptoRadicacion } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import { useRegistroCompraStore } from '../model/registro-compra.store';
import { mapApiConceptos } from '../lib/concepto-mappers';
import { getInputSx, getNewRowInputSx, buildGridTemplate } from '../config/conceptos-table.config';
import { useNewConceptoRow } from './useNewConceptoRow';

export interface FiscalSummary {
  impuestos: { nombre: string; valor: number }[];
  totalImpuestos: number;
  retenciones: { nombre: string; valor: number }[];
  totalRetenciones: number;
  subtotal: number;
  hasRecalculado: boolean;
}

interface UseConceptosTableParams {
  data?: Comercio;
  borradorConceptos?: ConceptoRadicacion[];
  hideDistribucion?: boolean;
  onTotalChange?: (total: number) => void;
  onFiscalChange?: (summary: FiscalSummary) => void;
  onConceptosChange?: (conceptos: ConceptoRow[]) => void;
  highlightsEnabled?: boolean;
}

export function useConceptosTable({ data, borradorConceptos, hideDistribucion, onTotalChange, onFiscalChange, onConceptosChange, highlightsEnabled = true }: UseConceptosTableParams) {
  const theme = useTheme();
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);

  const highlightRow = (ubicacion?: unknown) => () => {
    if (!highlightsEnabled) return;
    const src = ubicacion as Source | undefined;
    if (src?.pageNumber && src?.ubicacion) setHighlightSource(src as HighlightSource);
  };
  const clearHighlight = () => { if (highlightsEnabled) setHighlightSource(null); };

  const initialConceptos = mapApiConceptos(data, borradorConceptos);

  const [conceptos, setConceptos] = useState(initialConceptos);
  const [expanded, setExpanded] = useState<Set<number>>(
    new Set(initialConceptos.filter((r) => r.impuestos.length > 0).map((r) => r._key))
  );
  const [conceptDistAnchor, setConceptDistAnchor] = useState<HTMLElement | null>(null);

  const hasFiscalData = true;

  const toggleRow = (key: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const allExpanded = conceptos.length > 0 && conceptos.every((r) => expanded.has(r._key));
  const toggleAll = () => {
    if (allExpanded) {
      setExpanded(new Set());
    } else {
      setExpanded(new Set(conceptos.map((r) => r._key)));
    }
  };

  const updateConcepto = (key: number, field: keyof ConceptoRow, value: string | number) => {
    setConceptos((prev) => prev.map((r) => {
      if (r._key !== key) return r;
      const updated = { ...r, [field]: value };
      if (field === 'valorUnitario' && typeof value === 'number') {
        updated.valor = Math.round(value * updated.cantidad * 100) / 100;
      }
      if (field === 'cantidad' && typeof value === 'number') {
        updated.valor = Math.round(updated.valorUnitario * value * 100) / 100;
      }
      if ((field === 'valorUnitario' || field === 'cantidad') && typeof value === 'number') {
        const newBase = updated.valorUnitario * updated.cantidad;
        if (r.impuestos.length > 0) {
          updated.impuestos = r.impuestos.map((imp) => {
            const pct = parseFloat(imp.tarifa.replace('%', ''));
            if (!pct) return imp;
            return { ...imp, base: newBase, valor: Math.round(newBase * (pct / 100) * 100) / 100, recalculado: true };
          });
        }
        if (r.retenciones.length > 0) {
          updated.retenciones = r.retenciones.map((ret) => {
            const pct = parseFloat(ret.tarifa.replace('%', ''));
            if (!pct) return ret;
            return { ...ret, base: newBase, valor: Math.round(newBase * (pct / 100) * 100) / 100, recalculado: true };
          });
        }
      }
      return updated;
    }));
  };

  const deleteConcepto = (key: number) => {
    setConceptos((prev) => prev.filter((r) => r._key !== key));
    setExpanded((prev) => { const next = new Set(prev); next.delete(key); return next; });
  };

  const isRowIncomplete = (row: ConceptoRow) => !row.descripcion || !row.cantidad || !row.valorUnitario;

  const addImpuesto = (key: number, item: FiscalItem) => {
    setConceptos((prev) => prev.map((c) => {
      if (c._key !== key) return c;
      return { ...c, impuestos: [...c.impuestos, item] };
    }));
    setExpanded((prev) => new Set(prev).add(key));
  };

  const deleteImpuesto = (key: number, idx: number) => {
    setConceptos((prev) => prev.map((c) => {
      if (c._key !== key) return c;
      return { ...c, impuestos: c.impuestos.filter((_, i) => i !== idx) };
    }));
  };

  const addRetencion = (key: number, item: FiscalItem) => {
    setConceptos((prev) => prev.map((c) => {
      if (c._key !== key) return c;
      return { ...c, retenciones: [...c.retenciones, item] };
    }));
    setExpanded((prev) => new Set(prev).add(key));
  };

  const deleteRetencion = (key: number, idx: number) => {
    setConceptos((prev) => prev.map((c) => {
      if (c._key !== key) return c;
      return { ...c, retenciones: c.retenciones.filter((_, i) => i !== idx) };
    }));
  };

  // New row management (delegated to sub-hook)
  const newRow = useNewConceptoRow();

  const addConcepto = () => newRow.addConcepto(setConceptos, setExpanded);

  // Notify parent of total and fiscal changes
  const originalSubtotal = initialConceptos.reduce((sum, r) => sum + r.valor, 0);

  useEffect(() => {
    const subtotal = conceptos.reduce((sum, r) => sum + r.valor, 0);
    if (onTotalChange) onTotalChange(subtotal);
    if (onConceptosChange) onConceptosChange(conceptos);
    useRegistroCompraStore.getState().setConceptos(conceptos);

    if (onFiscalChange) {
      const allImpuestos = conceptos.flatMap((r) => r.impuestos);
      const groupedImp: Record<string, number> = {};
      for (const imp of allImpuestos) {
        const key = `${imp.tipo} ${imp.tarifa}`;
        groupedImp[key] = (groupedImp[key] ?? 0) + imp.valor;
      }
      const totalImpuestos = allImpuestos.reduce((sum, imp) => sum + imp.valor, 0);

      const allRetenciones = conceptos.flatMap((r) => r.retenciones);
      const groupedRet: Record<string, number> = {};
      for (const ret of allRetenciones) {
        const key = `${ret.tipo} ${ret.tarifa}`;
        groupedRet[key] = (groupedRet[key] ?? 0) + ret.valor;
      }
      const totalRetenciones = allRetenciones.reduce((sum, ret) => sum + ret.valor, 0);

      const hasRecalculado = Math.abs(subtotal - originalSubtotal) > 0.01
        || allImpuestos.some((imp) => imp.recalculado)
        || allRetenciones.some((ret) => ret.recalculado)
        || conceptos.length !== initialConceptos.length;
      onFiscalChange({
        impuestos: Object.entries(groupedImp).map(([nombre, valor]) => ({ nombre, valor })),
        totalImpuestos,
        retenciones: Object.entries(groupedRet).map(([nombre, valor]) => ({ nombre, valor })),
        totalRetenciones,
        subtotal,
        hasRecalculado,
      });
    }
  }, [conceptos, onTotalChange, onFiscalChange, onConceptosChange, originalSubtotal, initialConceptos.length]);

  const inputSx = getInputSx(theme);
  const newRowInputSx = getNewRowInputSx(theme);
  const GRID = buildGridTemplate(hideDistribucion, hasFiscalData);

  return {
    theme,
    conceptos,
    expanded,
    conceptDistAnchor,
    setConceptDistAnchor,
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
    highlightRow,
    clearHighlight,
    inputSx,
    newRowInputSx,
    GRID,
    // New row state
    newCodigo: newRow.newCodigo, setNewCodigo: newRow.setNewCodigo,
    newDescripcion: newRow.newDescripcion, setNewDescripcion: newRow.setNewDescripcion,
    newCantidad: newRow.newCantidad, setNewCantidad: newRow.setNewCantidad,
    newValorNum: newRow.newValorNum, setNewValorNum: newRow.setNewValorNum,
    newRowImpuestos: newRow.newRowImpuestos, addNewRowImpuesto: newRow.addNewRowImpuesto, deleteNewRowImpuesto: newRow.deleteNewRowImpuesto,
    newRowRetenciones: newRow.newRowRetenciones, addNewRowRetencion: newRow.addNewRowRetencion, deleteNewRowRetencion: newRow.deleteNewRowRetencion,
    newRowTotal: newRow.newRowTotal,
  };
}
