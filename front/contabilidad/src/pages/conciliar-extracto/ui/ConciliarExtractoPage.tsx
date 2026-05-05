import { Box } from '@mui/material';
import { ConciliarExtracto } from '@/features/conciliar-extracto';
import { ConciliacionActionBar } from '@/widgets/conciliacion-action-bar';
import { useConciliarExtractoPage } from '../hooks/useConciliarExtractoPage';

export function ConciliarExtractoPage() {
  const {
    formRef,
    barStyle,
    isPending,
    borrador,
    callbacks,
    progress,
    sinConciliar,
    conciliados,
    canSubmit,
    isMutating,
    handleSubmit,
  } = useConciliarExtractoPage();

  return (
    <Box sx={{ p: 2, pb: 10 }}>
      <Box ref={formRef}>
        <ConciliarExtracto
          borrador={borrador}
          isPending={isPending}
          isMutating={isMutating}
          callbacks={callbacks}
          sinConciliarCount={sinConciliar}
          conciliadosCount={conciliados}
        />
      </Box>

      {!isPending && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: barStyle.left,
            width: barStyle.width,
            zIndex: 10,
          }}
        >
          <ConciliacionActionBar
            progress={progress}
            submitDisabled={!canSubmit || isMutating}
            processing={isMutating}
            onSubmit={handleSubmit}
          />
        </Box>
      )}
    </Box>
  );
}
