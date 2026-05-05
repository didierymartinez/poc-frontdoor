import { useState } from 'react';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';

export function useCausadasPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { data: causadas = [], isPending } = useQuery(borradorQueries.causadasComercio());

  const rows = causadas.filter((r) => {
    if (!search) return true;
    return [r.terceroNombre, r.documentoNumero, r.id, r.descripcion].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase()),
    );
  });

  return {
    theme,
    navigate,
    search,
    setSearch,
    rows,
    isPending,
    totalRows: causadas.length,
  };
}
