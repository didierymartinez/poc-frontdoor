import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';
import type { VistaComercioDevolucion, VistaExtractoDevolucion, VistaAnticipoDevolucion } from '@/entities/borrador';
import type { TipoOrigen } from '@/shared/model';

export interface DocumentoOrigen {
  id: string;
  obligacion: string;
  radicador: string;
  tarjeta: string;
  numTarjeta: string;
  monto: number;
  moneda: string;
  disabled?: boolean;
  disabledReason?: string;
  disabledDetail?: string;
}

function mapComercioToDoc(item: VistaComercioDevolucion): DocumentoOrigen {
  return {
    id: item.id,
    obligacion: item.descripcion || item.id,
    radicador: item.terceroNombre,
    tarjeta: '',
    numTarjeta: '',
    monto: item.valor,
    moneda: item.moneda,
  };
}

function mapExtractoToDoc(item: VistaExtractoDevolucion): DocumentoOrigen {
  return {
    id: item.id,
    obligacion: item.id,
    radicador: item.terceroNombre,
    tarjeta: '',
    numTarjeta: '',
    monto: item.valorTotal,
    moneda: item.moneda,
  };
}

function mapAnticipoToDoc(item: VistaAnticipoDevolucion): DocumentoOrigen {
  return {
    id: item.id,
    obligacion: item.id,
    radicador: item.terceroNombre,
    tarjeta: item.medioPago?.toLowerCase() ?? '',
    numTarjeta: item.medioPago ?? '',
    monto: item.valor,
    moneda: item.moneda,
  };
}

export function useBuscarDocumento(tipo: TipoOrigen, terceroId: string, enabled: boolean) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [popperAnchor, setPopperAnchor] = useState<HTMLElement | null>(null);
  const [popperDoc, setPopperDoc] = useState<DocumentoOrigen | null>(null);

  const comercioQuery = useQuery({ ...borradorQueries.comerciosDisponiblesDevolucion(), enabled: enabled && tipo === 'compra' });
  const extractoQuery = useQuery({ ...borradorQueries.extractosDisponiblesDevolucion(), enabled: enabled && tipo === 'extracto' });
  const anticipoQuery = useQuery({ ...borradorQueries.anticiposDisponiblesDevolucion(), enabled: enabled && tipo === 'anticipo' });

  const isLoading = tipo === 'compra' ? comercioQuery.isLoading
    : tipo === 'extracto' ? extractoQuery.isLoading
    : anticipoQuery.isLoading;

  const documentos = useMemo(() => {
    if (tipo === 'compra') {
      const data = comercioQuery.data;
      if (!data) return [];
      return data.filter((item) => item.terceroIdentificacion === terceroId).map(mapComercioToDoc);
    }
    if (tipo === 'extracto') {
      const data = extractoQuery.data;
      if (!data) return [];
      return data.filter((item) => item.terceroIdentificacion === terceroId).map(mapExtractoToDoc);
    }
    // anticipo
    const data = anticipoQuery.data;
    if (!data) return [];
    return data.filter((item) => item.terceroIdentificacion === terceroId).map(mapAnticipoToDoc);
  }, [tipo, terceroId, comercioQuery.data, extractoQuery.data, anticipoQuery.data]);

  const filtered = search
    ? documentos.filter((d) => d.id.toLowerCase().includes(search.toLowerCase()) || d.obligacion.toLowerCase().includes(search.toLowerCase()))
    : documentos;

  const handleItemClick = (doc: DocumentoOrigen) => {
    if (!doc.disabled) setSelectedId(doc.id);
  };

  const handleItemMouseEnter = (e: React.MouseEvent<HTMLElement>, doc: DocumentoOrigen) => {
    if (doc.disabled) {
      setPopperAnchor(e.currentTarget);
      setPopperDoc(doc);
    }
  };

  const handleItemMouseLeave = (doc: DocumentoOrigen) => {
    if (doc.disabled) {
      setPopperAnchor(null);
      setPopperDoc(null);
    }
  };

  return {
    selectedId,
    search,
    setSearch,
    filtered,
    isLoading,
    popperAnchor,
    popperDoc,
    handleItemClick,
    handleItemMouseEnter,
    handleItemMouseLeave,
  };
}

export type { DocumentoOrigen as DocumentoMock };
