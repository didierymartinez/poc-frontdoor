import { useState } from 'react';
import { Box } from '@mui/material';
import { ExtractoView } from '@/widgets/extracto-view';
import { ConfirmacionPaginatorBar } from '@/widgets/confirmacion-paginator-bar';
import { DevolverDialog } from '@/features/devolver-obligacion';
import { useConfirmacionExtracto } from '../hooks/useConfirmacionExtracto';

export function ConfirmacionExtractoPage() { 
  const [devolverOpen, setDevolverOpen] = useState(false);
  const { extracto, isPending, hasSoporte, handleOpenSoporte } = useConfirmacionExtracto();

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <ExtractoView
        loading={isPending}
        codigo={extracto?.id ? `OXP-EXT-${extracto.id.slice(0, 8)}` : ''}
        estado={extracto?.estado}
        estadoColor={extracto?.estadoColor}
        periodo={extracto?.periodo}
        entidadBancaria={extracto?.entidadBancaria}
        medioPago={extracto?.medioPago}
        totalPartidas={extracto?.totalPartidas}
        totalCargos={extracto?.totalCargos}
        total={extracto?.total}
        moneda={extracto?.moneda}
        partidas={extracto?.partidas}
        onOpenSoporte={hasSoporte ? handleOpenSoporte : undefined}
      />

      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 680,
          zIndex: 10,
        }}
      >
        <ConfirmacionPaginatorBar onDevolver={() => setDevolverOpen(true)} />
      </Box>

      <DevolverDialog open={devolverOpen} onClose={() => setDevolverOpen(false)} />
    </Box>
  );
}
