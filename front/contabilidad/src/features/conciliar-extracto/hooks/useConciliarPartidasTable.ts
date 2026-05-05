import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material';
import type { AgregadoOxpExtracto } from '@/entities/borrador';
import { mapPartidas } from '../lib/partidas-mapper';
import type { PartidaRow } from '../model/conciliar-extracto.types';
import type { ExtractoContexto } from '../ui/CrearAnticipoDialog';

const COLUMN_OPTIONS = [
  { label: 'Diferencia', defaultChecked: false },
  { label: 'Tolerancia', defaultChecked: false },
  { label: 'Transacción', defaultChecked: true },
  { label: 'Código', defaultChecked: true },
  { label: 'Movimiento', defaultChecked: true },
];

interface UseConciliarPartidasTableOptions {
  borrador?: AgregadoOxpExtracto;
  sinConciliarCount?: number;
  conciliadosCount?: number;
}

export function useConciliarPartidasTable({ borrador, sinConciliarCount, conciliadosCount }: UseConciliarPartidasTableOptions) {
  const theme = useTheme();
  const [activeFilter, setActiveFilter] = useState(0);
  const [search, setSearch] = useState('');
  const [activePartidaId, setActivePartidaId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    COLUMN_OPTIONS.filter((c) => c.defaultChecked).map((c) => c.label),
  );

  const showDiferencia = visibleColumns.includes('Diferencia');
  const showTolerancia = visibleColumns.includes('Tolerancia');
  const [difDistAnchor, setDifDistAnchor] = useState<HTMLElement | null>(null);
  const [tolDistAnchor, setTolDistAnchor] = useState<HTMLElement | null>(null);

  const gridCols = [
    '30px',
    visibleColumns.includes('Código') ? '70px' : '',
    visibleColumns.includes('Movimiento') ? '2fr' : '',
    visibleColumns.includes('Transacción') ? '90px' : '',
    'minmax(120px, 1fr)',
    showDiferencia ? '1fr' : '',
    showTolerancia ? '1fr' : '',
    '200px',
  ].filter(Boolean).join(' ');

  const toggleColumn = (label: string) => {
    setVisibleColumns((prev) => prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]);
  };

  // Data mapping & filtering
  const rows = useMemo(() => mapPartidas(borrador), [borrador]);

  const vinculaciones = borrador?.vinculaciones;
  const coberturasAnticipo = borrador?.coberturasAnticipo;

  const extractoCtx: ExtractoContexto | undefined = useMemo(() => {
    if (!borrador) return undefined;
    return {
      entidadFinanciera: borrador.informacionTercero?.nombre ?? '',
      medioPagoNumero: borrador.medioPago?.numero ?? '',
    };
  }, [borrador]);

  const totalCount = rows.length;
  const sinConciliar = sinConciliarCount ?? rows.filter((r: PartidaRow) => r.estadoTipo === 'sin_vincular').length;
  const conciliados = conciliadosCount ?? rows.filter((r: PartidaRow) => r.estadoTipo !== 'sin_vincular' && r.estadoTipo !== 'none').length;

  const filteredRows = useMemo(() => {
    let filtered = rows;
    if (activeFilter === 1) filtered = rows.filter((r) => r.estadoTipo === 'sin_vincular');
    if (activeFilter === 2) filtered = rows.filter((r) => r.estadoTipo !== 'sin_vincular' && r.estadoTipo !== 'none');
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) => r.movimiento.toLowerCase().includes(q));
    }
    return filtered;
  }, [rows, activeFilter, search]);

  const filterChips = [
    { label: 'Todos', count: totalCount },
    { label: 'Sin conciliar', count: sinConciliar },
    { label: 'Conciliados', count: conciliados },
  ];

  return {
    theme,
    activeFilter,
    setActiveFilter,
    search,
    setSearch,
    activePartidaId,
    setActivePartidaId,
    visibleColumns,
    showDiferencia,
    showTolerancia,
    difDistAnchor,
    setDifDistAnchor,
    tolDistAnchor,
    setTolDistAnchor,
    gridCols,
    toggleColumn,
    rows,
    filteredRows,
    filterChips,
    extractoCtx,
    vinculaciones,
    coberturasAnticipo,
  };
}
