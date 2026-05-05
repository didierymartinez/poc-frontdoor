import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';
import type { VistaOxpComercio, VistaAnticipo, VistaDevolucion } from '@/entities/borrador';

interface VincularConfig {
  multiSelect: boolean;
}

interface ObligacionItem {
  id: string;
  codigo: string;
  tercero: string;
  monto: string;
  moneda: string;
}

function fmtCurrency(v: number): string {
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mapComercio(items: VistaOxpComercio[]): ObligacionItem[] {
  return items.map((c) => ({
    id: c.id,
    codigo: c.documentoNumero ? `OXPC · ${c.documentoNumero}` : `OXPC-${c.id.slice(-5).toUpperCase()}`,
    tercero: `${c.terceroNombre}${c.terceroIdentificacion ? ` · ${c.terceroTipoIdentificacion} ${c.terceroIdentificacion}` : ''}`,
    monto: fmtCurrency(c.saldoPorPagar),
    moneda: c.moneda,
  }));
}

function mapAnticipo(items: VistaAnticipo[]): ObligacionItem[] {
  return items.map((a) => ({
    id: a.id,
    codigo: `OXAN-${a.id.slice(-5).toUpperCase()}`,
    tercero: `${a.terceroNombre}${a.terceroIdentificacion ? ` · ${a.terceroTipoIdentificacion} ${a.terceroIdentificacion}` : ''}`,
    monto: fmtCurrency(a.saldoPorPagar),
    moneda: a.moneda,
  }));
}

function mapDevolucion(items: VistaDevolucion[]): ObligacionItem[] {
  return items.map((d) => ({
    id: d.id,
    codigo: `DEV-${d.id.slice(-5).toUpperCase()}`,
    tercero: `${d.terceroNombre}${d.terceroIdentificacion ? ` · ${d.terceroTipoIdentificacion} ${d.terceroIdentificacion}` : ''}`,
    monto: fmtCurrency(d.valor),
    moneda: d.moneda,
  }));
}

export function useVincularObligacion(
  config: VincularConfig,
  tipo: 'comercio' | 'anticipo' | 'devolucion',
  isOpen: boolean,
  onVincular?: (selected: string[]) => Promise<void> | void,
  onClose?: () => void,
  linkedIds?: string[],
) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [crearAnticipoOpen, setCrearAnticipoOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comercioData, isPending: comercioPending } = useQuery({
    ...borradorQueries.causadasComercio(),
    enabled: isOpen && tipo === 'comercio',
  });

  const { data: anticipoData, isPending: anticipoPending } = useQuery({
    ...borradorQueries.vigentesAnticipo(),
    enabled: isOpen && tipo === 'anticipo',
  });

  const { data: devolucionData, isPending: devolucionPending } = useQuery({
    ...borradorQueries.pendientesDevolucion(),
    enabled: isOpen && tipo === 'devolucion',
  });

  const isPending = tipo === 'comercio' ? comercioPending : tipo === 'anticipo' ? anticipoPending : devolucionPending;

  const allObligaciones = useMemo(() => {
    if (tipo === 'comercio') return mapComercio(comercioData ?? []);
    if (tipo === 'anticipo') return mapAnticipo(anticipoData ?? []);
    if (tipo === 'devolucion') return mapDevolucion(devolucionData ?? []);
    return [];
  }, [tipo, comercioData, anticipoData, devolucionData]);

  const filteredObligaciones = useMemo(() => {
    if (!search.trim()) return allObligaciones;
    const q = search.toLowerCase();
    return allObligaciones.filter(
      (o) => o.codigo.toLowerCase().includes(q) || o.tercero.toLowerCase().includes(q),
    );
  }, [allObligaciones, search]);

  const toggleSelect = (id: string) => {
    if (isSubmitting) return;
    if (tipo === 'comercio' && linkedIds?.includes(id)) return;
    if (config.multiSelect) {
      setSelected((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
      );
    } else {
      onVincular?.([id]);
      setSelected([]);
      onClose?.();
    }
  };

  const handleVincular = async () => {
    setIsSubmitting(true);
    try {
      await onVincular?.(selected);
      setSelected([]);
      onClose?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setSelected([]);
    onClose?.();
  };

  return {
    search,
    setSearch,
    selected,
    crearAnticipoOpen,
    setCrearAnticipoOpen,
    toggleSelect,
    handleVincular,
    handleClose,
    obligaciones: filteredObligaciones,
    isPending,
    isSubmitting,
  };
}
