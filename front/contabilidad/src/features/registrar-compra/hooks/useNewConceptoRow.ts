import { useEffect, useState } from 'react';
import { showToast } from '@/shared/ui';
import type { ConceptoRow, FiscalItem } from '@/entities/concepto';

export function useNewConceptoRow() {
  const [newCodigo, setNewCodigo] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newCantidad, setNewCantidad] = useState('');
  const [newValorNum, setNewValorNum] = useState(0);
  const [newRowImpuestos, setNewRowImpuestos] = useState<FiscalItem[]>([]);
  const [newRowRetenciones, setNewRowRetenciones] = useState<FiscalItem[]>([]);

  // Recalculate staged new row taxes/retenciones when valorUnitario/cantidad change
  useEffect(() => {
    const newBase = newValorNum * (parseInt(newCantidad) || 0);
    if (newRowImpuestos.length > 0) {
      setNewRowImpuestos((prev) => prev.map((imp) => {
        const pct = parseFloat(imp.tarifa.replace('%', ''));
        if (!pct) return imp;
        return { ...imp, base: newBase, valor: Math.round(newBase * (pct / 100) * 100) / 100 };
      }));
    }
    if (newRowRetenciones.length > 0) {
      setNewRowRetenciones((prev) => prev.map((ret) => {
        const pct = parseFloat(ret.tarifa.replace('%', ''));
        if (!pct) return ret;
        return { ...ret, base: newBase, valor: Math.round(newBase * (pct / 100) * 100) / 100 };
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newValorNum, newCantidad]);

  const newRowTotal = newValorNum * (parseInt(newCantidad) || 0);

  const addConcepto = (
    setConceptos: React.Dispatch<React.SetStateAction<ConceptoRow[]>>,
    setExpanded: React.Dispatch<React.SetStateAction<Set<number>>>,
  ) => {
    const missing: string[] = [];
    if (!newDescripcion.trim()) missing.push('descripcion');
    if (!newCantidad.trim() || parseInt(newCantidad) === 0) missing.push('cantidad');
    if (!newValorNum) missing.push('valor');
    if (missing.length > 0) {
      showToast(`Concepto incompleto: falta ${missing.join(', ')}`, 'error');
      return;
    }
    const _key = Date.now();
    const cant = parseInt(newCantidad) || 0;
    const nuevo: ConceptoRow = {
      id: null,
      _key,
      codigo: newCodigo,
      descripcion: newDescripcion,
      cantidad: cant,
      valorUnitario: newValorNum,
      valor: Math.round(newValorNum * cant * 100) / 100,
      distribucion: 0,
      impuestos: newRowImpuestos,
      retenciones: newRowRetenciones,
    };
    setConceptos((prev) => [...prev, nuevo]);
    setExpanded((prev) => new Set(prev).add(_key));
    setNewCodigo('');
    setNewDescripcion('');
    setNewCantidad('');
    setNewValorNum(0);
    setNewRowImpuestos([]);
    setNewRowRetenciones([]);
  };

  const addNewRowImpuesto = (item: FiscalItem) => {
    setNewRowImpuestos((prev) => [...prev, item]);
  };

  const deleteNewRowImpuesto = (idx: number) => {
    setNewRowImpuestos((prev) => prev.filter((_, i) => i !== idx));
  };

  const addNewRowRetencion = (item: FiscalItem) => {
    setNewRowRetenciones((prev) => [...prev, item]);
  };

  const deleteNewRowRetencion = (idx: number) => {
    setNewRowRetenciones((prev) => prev.filter((_, i) => i !== idx));
  };

  return {
    newCodigo, setNewCodigo,
    newDescripcion, setNewDescripcion,
    newCantidad, setNewCantidad,
    newValorNum, setNewValorNum,
    newRowImpuestos, addNewRowImpuesto, deleteNewRowImpuesto,
    newRowRetenciones, addNewRowRetencion, deleteNewRowRetencion,
    newRowTotal,
    addConcepto,
  };
}
