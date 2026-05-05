import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { borradorQueries } from '@/entities/borrador';

export function useConciliacionesPanel() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const [barStyle, setBarStyle] = useState<{ left: number; width: number }>({ left: 0, width: 680 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const barWidth = rect.width * 0.8;
      setBarStyle({ left: rect.left + (rect.width - barWidth) / 2, width: barWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('scroll', measure);
    return () => { ro.disconnect(); window.removeEventListener('scroll', measure); };
  }, []);

  const { data: extractos = [], isPending } = useQuery(borradorQueries.enConciliacionExtracto());

  const rows = extractos.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return [r.terceroNombre, r.id, r.medioPagoNumero].some((v) =>
      v?.toLowerCase().includes(q),
    );
  });

  return {
    theme,
    navigate,
    search,
    setSearch,
    rows,
    isPending,
    containerRef,
    barStyle,
  };
}
