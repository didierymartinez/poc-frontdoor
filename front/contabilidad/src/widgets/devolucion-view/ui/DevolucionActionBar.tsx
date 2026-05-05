import { Box, Button, Stack, Typography } from '@mui/material';
import {
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';

interface DevolucionActionBarProps {
  onAnterior?: () => void;
  onSiguiente?: () => void;
  onConfirmar?: () => void;
  confirmarDisabled?: boolean;
  disableAnterior?: boolean;
  disableSiguiente?: boolean;
  paginationLabel?: string;
}

export function DevolucionActionBar({
  onAnterior,
  onSiguiente,
  onConfirmar,
  confirmarDisabled,
  disableAnterior,
  disableSiguiente,
  paginationLabel,
}: DevolucionActionBarProps) {
  const showPagination = !!paginationLabel;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        borderRadius: 1,
        border: '0.5px solid',
        borderColor: 'primary.light',
        backgroundImage:
          'linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), linear-gradient(90deg, #fff 0%, #fff 100%)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ visibility: showPagination ? 'visible' : 'hidden' }}>
        <Button
          size="medium"
          color="inherit"
          startIcon={<IconChevronLeft size={20} />}
          onClick={onAnterior}
          disabled={disableAnterior}
          sx={{ color: 'text.primary', opacity: disableAnterior ? 0.3 : 1 }}
        >
          Anterior
        </Button>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        {showPagination && (
          <Typography variant="caption" color="text.secondary">
            {paginationLabel}
          </Typography>
        )}
        <Button
          size="medium"
          variant="contained"
          onClick={onConfirmar}
          disabled={confirmarDisabled}
        >
          Confirmar
        </Button>
      </Stack>

      <Box sx={{ visibility: showPagination ? 'visible' : 'hidden' }}>
        <Button
          size="medium"
          color="inherit"
          endIcon={<IconChevronRight size={20} />}
          onClick={onSiguiente}
          disabled={disableSiguiente}
          sx={{ color: 'text.primary', opacity: disableSiguiente ? 0.3 : 1 }}
        >
          Siguiente
        </Button>
      </Box>
    </Box>
  );
}
