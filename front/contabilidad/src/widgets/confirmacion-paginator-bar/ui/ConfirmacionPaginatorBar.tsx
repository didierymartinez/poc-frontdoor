import { Box, Button, Typography, useTheme } from '@mui/material';
import { IconChevronLeft, IconChevronRight, IconArrowBackUp, IconCheck } from '@tabler/icons-react';

interface ConfirmacionPaginatorBarProps {
  onAnterior?: () => void;
  onSiguiente?: () => void;
  onDevolver?: () => void;
  onConfirmar?: () => void;
  disableAnterior?: boolean;
  disableSiguiente?: boolean;
  paginationLabel?: string;
}

export function ConfirmacionPaginatorBar({
  onAnterior,
  onSiguiente,
  onDevolver,
  onConfirmar,
  disableAnterior,
  disableSiguiente,
  paginationLabel,
}: ConfirmacionPaginatorBarProps) {
  const theme = useTheme();
  const showPagination = !!paginationLabel;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        borderRadius: 1,
        border: '0.5px solid',
        borderColor: 'primary.light',
        background: `linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), ${theme.palette.background.paper}`,
      }}
    >
      {/* Anterior */}
      <Box
        onClick={disableAnterior ? undefined : onAnterior}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: disableAnterior ? 'default' : 'pointer',
          opacity: disableAnterior ? 0.3 : 1,
          visibility: showPagination ? 'visible' : 'hidden',
          '&:hover': disableAnterior ? {} : { opacity: 0.7 },
        }}
      >
        <IconChevronLeft size={16} color={theme.palette.text.primary} />
        <Typography variant="body2" color="text.primary">Anterior</Typography>
      </Box>

      {/* Center actions + label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button
          variant="text"
          startIcon={<IconArrowBackUp size={16} />}
          onClick={onDevolver}
        >
          Devolver
        </Button>

        {showPagination && (
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 48, textAlign: 'center' }}>
            {paginationLabel}
          </Typography>
        )}

        <Button
          variant="contained"
          startIcon={<IconCheck size={16} />}
          onClick={onConfirmar}
        >
          Confirmar
        </Button>
      </Box>

      {/* Siguiente */}
      <Box
        onClick={disableSiguiente ? undefined : onSiguiente}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: disableSiguiente ? 'default' : 'pointer',
          opacity: disableSiguiente ? 0.3 : 1,
          visibility: showPagination ? 'visible' : 'hidden',
          '&:hover': disableSiguiente ? {} : { opacity: 0.7 },
        }}
      >
        <Typography variant="body2" color="text.primary">Siguiente</Typography>
        <IconChevronRight size={16} color={theme.palette.text.primary} />
      </Box>
    </Box>
  );
}
