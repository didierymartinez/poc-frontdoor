import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';

export function useObligacionesTable() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: comercios = [], isPending: isPendingComercio } = useQuery(borradorQueries.pendientesComercio());
  const { data: extractos = [], isPending: isPendingExtracto } = useQuery(borradorQueries.pendientesExtracto());
  const { data: anticipos = [], isPending: isPendingAnticipo } = useQuery(borradorQueries.vigentesAnticipo());
  const { data: devoluciones = [], isPending: isPendingDevolucion } = useQuery(borradorQueries.pendientesDevolucion());

  return { activeTab, setActiveTab, comercios, isPendingComercio, extractos, isPendingExtracto, anticipos, isPendingAnticipo, devoluciones, isPendingDevolucion };
}
