import {
  Box,
  Chip,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import { IconCircleCheck, IconClock } from '@tabler/icons-react';

interface DevolucionViewHeaderProps {
  codigo: string;
  estado: string;
  radicador: string;
  tiempoRadicacion: string;
}

export function DevolucionViewHeader({
  codigo,
  estado,
  radicador,
  tiempoRadicacion,
}: DevolucionViewHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'primary.50',
        mx: -3,
        mt: -3,
        px: 1.5,
        py: 1.5,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" color="text.primary">
          {codigo}
        </Typography>
        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 12 }} />
        <Chip
          icon={<IconCircleCheck size={16} />}
          label={estado}
          size="small"
          variant="outlined"
          color="warning"
          sx={{ height: 22, fontSize: '0.6875rem' }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Radicó:
          </Typography>
          <Typography variant="body2" color="text.primary">
            {radicador}
          </Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 12 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconClock size={16} color={theme.palette.action.active} />
          <Typography variant="body2" color="text.secondary">
            {tiempoRadicacion}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
