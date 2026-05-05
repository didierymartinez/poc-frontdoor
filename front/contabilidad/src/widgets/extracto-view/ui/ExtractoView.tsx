import { Box, Skeleton } from '@mui/material';
import { ExtractoViewHeader } from './ExtractoViewHeader';
import { DatosExtracto } from './DatosExtracto';
import { ResumenExtracto } from './ResumenExtracto';
import { PartidasTable } from './PartidasTable';
import type { PartidaRow } from './extracto-view-types';

export interface ExtractoViewProps {
  loading?: boolean;
  codigo?: string;
  estado?: string;
  estadoColor?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error';
  periodo?: { desde?: string; hasta?: string };
  entidadBancaria?: string;
  medioPago?: { tipo: number; numero: string; entidadBancaria: string } | null;
  totalPartidas?: string;
  totalCargos?: string;
  total?: string;
  moneda?: string;
  partidas?: PartidaRow[];
  onOpenSoporte?: () => void;
}

export function ExtractoView({
  loading,
  codigo = '',
  estado = 'Conciliado',
  estadoColor = 'info',
  periodo,
  entidadBancaria,
  medioPago,
  totalPartidas = '$0,00',
  totalCargos = '$0,00',
  total = '$0,00',
  moneda = 'COP',
  partidas = [],
  onOpenSoporte,
}: ExtractoViewProps) {
  if (loading) {
    return (
      <Box sx={{ bgcolor: 'background.paper', borderRadius: '8px', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={20} sx={{ borderRadius: 0.5 }} />
            ))}
          </Box>
          <Skeleton variant="rectangular" width={280} height={180} sx={{ borderRadius: 1 }} />
        </Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <ExtractoViewHeader codigo={codigo} estado={estado} estadoColor={estadoColor} />

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <DatosExtracto
            periodo={periodo}
            entidadBancaria={entidadBancaria}
            medioPago={medioPago}
            onOpenSoporte={onOpenSoporte}
          />
        </Box>
        <ResumenExtracto
          totalPartidas={totalPartidas}
          totalCargos={totalCargos}
          total={total}
          moneda={moneda}
        />
      </Box>

      {partidas.length > 0 && <PartidasTable partidas={partidas} />}
    </Box>
  );
}
