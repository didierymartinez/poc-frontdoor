import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';

export function useBorradoresTable() {
  const [activeTab, setActiveTab] = useState(0);
  const { data: comercios = [], isPending: isPendingComercio } = useQuery(borradorQueries.borradoresComercio());
  const { data: extractos = [], isPending: isPendingExtracto } = useQuery(borradorQueries.borradoresExtracto());
  const { data: anticipos = [], isPending: isPendingAnticipo } = useQuery(borradorQueries.borradoresAnticipo());

  return { activeTab, setActiveTab, comercios, isPendingComercio, extractos, isPendingExtracto, anticipos, isPendingAnticipo };
}
