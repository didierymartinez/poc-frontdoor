import { Box, Divider, LinearProgress } from '@mui/material';
import type { AgregadoOxpExtracto } from '@/entities/borrador';
import { ConciliarViewHeader } from './ConciliarViewHeader';
import { ConciliarFormFields } from './ConciliarFormFields';
import { ConciliarPartidasTable } from './ConciliarPartidasTable';
import { ConciliarSkeleton } from './ConciliarSkeleton';
import type { ConciliacionCallbacks } from '../model/conciliar-extracto.types';

interface ConciliarExtractoProps {
  borrador?: AgregadoOxpExtracto;
  isPending?: boolean;
  isMutating?: boolean;
  callbacks?: ConciliacionCallbacks;
  sinConciliarCount?: number;
  conciliadosCount?: number;
}

export function ConciliarExtracto({ borrador, isPending, isMutating, callbacks, sinConciliarCount, conciliadosCount }: ConciliarExtractoProps) {
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
        position: 'relative',
      }}
    >
      {isMutating && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            borderRadius: '8px 8px 0 0',
            height: 3,
          }}
        />
      )}
      {isPending ? (
        <ConciliarSkeleton />
      ) : (
        <>
          <Box p={2} bgcolor="background.paper">
            <ConciliarViewHeader borrador={borrador} />
          </Box>
          <ConciliarFormFields borrador={borrador} />
          <Divider />
          <ConciliarPartidasTable
            borrador={borrador}
            callbacks={isMutating ? undefined : callbacks}
            sinConciliarCount={sinConciliarCount}
            conciliadosCount={conciliadosCount}
          />
        </>
      )}
    </Box>
  );
}
