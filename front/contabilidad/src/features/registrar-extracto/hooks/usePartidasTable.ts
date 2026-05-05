import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import type { Dayjs } from 'dayjs';
import type { Extracto, Source, CargoFinancieroExtracto } from '@/entities/borrador';
import { TIPO_MOVIMIENTO_LABEL } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import { showToast } from '@/shared/ui';
import { type PartidaRow, mapApiPartidas, mapApiCargos, TIPO_CARGO_LABEL } from '../ui/extracto-helpers';

export interface ExtractoFiscalSummary {
  items: { nombre: string; valor: number }[];
  total: number;
}

interface UsePartidasTableParams {
  data?: Extracto;
  cargos?: CargoFinancieroExtracto[];
  periodo?: { desde?: string | null; hasta?: string | null } | null;
  onTotalChange?: (total: number) => void;
  onFiscalChange?: (summary: ExtractoFiscalSummary) => void;
  onCargosChange?: (cargos: CargoFinancieroExtracto[]) => void;
}

export function usePartidasTable({ data, cargos, periodo, onTotalChange, onFiscalChange, onCargosChange }: UsePartidasTableParams) {
  const theme = useTheme();
  const apiPartidas = mapApiPartidas(data);
  const initialPartidas = apiPartidas.length > 0 ? apiPartidas : [];
  const [partidas, setPartidas] = useState(initialPartidas);

  const apiCargos = mapApiCargos(cargos ?? [], initialPartidas.length + 1);
  const [cargoRows, setCargoRows] = useState(apiCargos);

  // New partida row state
  const [newRowDate, setNewRowDate] = useState<Dayjs | null>(null);
  const [newCodigo, setNewCodigo] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [newValorNum, setNewValorNum] = useState(0);
  const [newMoneda, setNewMoneda] = useState('');

  // New cargo row state
  const [newCargoTipo, setNewCargoTipo] = useState<number>(0);
  const [newCargoValor, setNewCargoValor] = useState(0);
  const [newCargoMoneda, setNewCargoMoneda] = useState('');

  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);
  const highlightRow = (ubicacion?: unknown) => () => {
    const src = ubicacion as Source | undefined;
    if (src && 'pageNumber' in src) setHighlightSource(src as HighlightSource);
  };
  const clearHighlight = () => setHighlightSource(null);

  const updateRow = (key: number, field: keyof PartidaRow, value: string | number) => {
    setPartidas((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)));
  };

  const deleteRow = (key: number) => {
    setPartidas((prev) => prev.filter((r) => r._key !== key));
  };

  const updateCargoRow = (key: number, field: keyof PartidaRow, value: string | number) => {
    setCargoRows((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value } : r)));
  };

  const deleteCargoRow = (key: number) => {
    setCargoRows((prev) => prev.filter((r) => r._key !== key));
  };

  const handleAddRow = () => {
    const missing: string[] = [];
    if (!newRowDate) missing.push('fecha');
    if (!newDescripcion.trim()) missing.push('descripcion');
    if (!newValorNum) missing.push('valor');
    if (missing.length > 0) {
      showToast(`Movimiento incompleto: falta ${missing.join(', ')}`, 'error');
      return;
    }
    const nextKey = partidas.length > 0 ? Math.max(...partidas.map((r) => r._key)) + 1 : 1;
    setPartidas((prev) => [...prev, {
      id: null,
      _key: nextKey,
      numero: String(nextKey).padStart(2, '0'),
      transaccion: newRowDate!.format('DD/MM/YYYY'),
      codigo: newCodigo,
      descripcion: newDescripcion,
      valor: newValorNum,
      moneda: newMoneda || 'COP',
    }]);
    setNewRowDate(null);
    setNewCodigo('');
    setNewDescripcion('');
    setNewValorNum(0);
    setNewMoneda('');
  };

  const handleAddCargo = () => {
    if (!newCargoValor) {
      showToast('Cargo incompleto: falta valor', 'error');
      return;
    }
    const allKeys = [...partidas, ...cargoRows].map((r) => r._key);
    const nextKey = allKeys.length > 0 ? Math.max(...allKeys) + 1 : 1;
    setCargoRows((prev) => [...prev, {
      id: null,
      _key: nextKey,
      numero: String(nextKey).padStart(2, '0'),
      transaccion: '',
      codigo: '',
      descripcion: TIPO_CARGO_LABEL[newCargoTipo] ?? `Cargo ${newCargoTipo}`,
      valor: newCargoValor,
      moneda: newCargoMoneda || 'COP',
      isCargo: true,
      tipoCargo: newCargoTipo,
    }]);
    setNewCargoTipo(0);
    setNewCargoValor(0);
    setNewCargoMoneda('');
  };

  const isRowIncomplete = (row: PartidaRow) => !row.transaccion || !row.descripcion || !row.valor;

  // Notify total changes (partidas + cargos)
  useEffect(() => {
    const partidasTotal = partidas.reduce((sum, r) => sum + Math.abs(r.valor), 0);
    const cargosTotal = cargoRows.reduce((sum, r) => sum + Math.abs(r.valor), 0);
    if (onTotalChange) onTotalChange(partidasTotal + cargosTotal);

    if (onFiscalChange) {
      const groups: Record<number, number> = {};
      for (const r of partidas) {
        const t = r.tipo ?? -1;
        if (t > 0) groups[t] = (groups[t] ?? 0) + Math.abs(r.valor);
      }
      const items = Object.entries(groups).map(([tipo, val]) => ({
        nombre: TIPO_MOVIMIENTO_LABEL[Number(tipo)] ?? `Tipo ${tipo}`,
        valor: val,
      }));
      const fiscalTotal = items.reduce((sum, i) => sum + i.valor, 0);
      onFiscalChange({ items, total: fiscalTotal });
    }
  }, [partidas, cargoRows, onTotalChange, onFiscalChange]);

  // Notify cargo changes back to parent
  useEffect(() => {
    if (!onCargosChange) return;
    const monedaNum = data?.movimientos?.[0]?.moneda;
    const moneda = typeof monedaNum === 'number' ? monedaNum : 0;
    const cargoPeriodo = { desde: periodo?.desde ?? null, hasta: periodo?.hasta ?? null };
    const mapped: CargoFinancieroExtracto[] = cargoRows.map((r) => ({
      id: r.id ?? crypto.randomUUID(),
      tipo: r.tipoCargo ?? 0,
      valor: { moneda, valor: r.valor },
      periodo: cargoPeriodo,
      distribucionCentroCostos: [],
    }));
    onCargosChange(mapped);
  }, [cargoRows, onCargosChange, data, periodo]);

  return {
    theme,
    partidas,
    cargoRows,
    newRowDate,
    setNewRowDate,
    newCodigo,
    setNewCodigo,
    newDescripcion,
    setNewDescripcion,
    newValorNum,
    setNewValorNum,
    newMoneda,
    setNewMoneda,
    newCargoTipo,
    setNewCargoTipo,
    newCargoValor,
    setNewCargoValor,
    newCargoMoneda,
    setNewCargoMoneda,
    highlightRow,
    clearHighlight,
    updateRow,
    deleteRow,
    updateCargoRow,
    deleteCargoRow,
    handleAddRow,
    handleAddCargo,
    isRowIncomplete,
  };
}
