import { Box, Chip, Divider, Skeleton, Typography, useTheme } from '@mui/material';
import { IconCalendarEvent } from '@tabler/icons-react';
import iaLabelSrc from '@/shared/assets/IA-label.svg';

function RegistroHeader() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
      {/* Left side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Skeleton variant="text" width={100} sx={{ fontSize: '1.25rem' }} />
        <Divider orientation="vertical" flexItem sx={{ alignSelf: 'center', height: 12 }} />
        <Chip
          label="Pendiente"
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'warning.main',
            color: theme.palette.warning.main,
            height: 22,
            fontSize: '0.6875rem',
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5px' }}>
          <Typography
            sx={{
              fontSize: '8.57px',
              letterSpacing: '0.43px',
              textTransform: 'uppercase',
              color: 'action.active',
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            Extraído con
          </Typography>
          <Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: 19, height: 18 }} />
        </Box>
      </Box>

      {/* Right side: Fecha */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Fecha transacción
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="body2" color="text.primary">
            {new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </Typography>
          <IconCalendarEvent size={16} color={theme.palette.action.active} />
        </Box>
      </Box>
    </Box>
  );
}

/** Skeleton bone matching Figma's grey.100 with rounded corners */
function Bone({ height, width, sx }: { height: number; width?: number | string; sx?: object }) {
  return (
    <Skeleton
      variant="rectangular"
      // animation="wave"
      height={height}
      width={width ?? '100%'}
      sx={{ borderRadius: 1, bgcolor: 'grey.100', ...sx }}
    />
  );
}

export const OCRSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Real header */}
      <RegistroHeader />

      {/* Skeleton content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
        {/* Formulario skeleton */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Row 1: full width */}
          <Bone height={32} />
          {/* Row 2: 230px + flex */}
          <Box sx={{ display: 'flex', gap: 2, height: 32 }}>
            <Bone height={32} width={230} />
            <Bone height={32} sx={{ flex: 1 }} />
          </Box>
          {/* Row 3: 230px + flex */}
          <Box sx={{ display: 'flex', gap: 2, height: 32 }}>
            <Bone height={32} width={230} />
            <Bone height={32} sx={{ flex: 1 }} />
          </Box>
          {/* Row 4: 230px only */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Bone height={32} width={230} />
          </Box>
        </Box>

        {/* Table skeleton */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Bone height={24} />
          <Bone height={72} />
          <Bone height={24} />
        </Box>

        {/* Bottom bones */}
        <Bone height={48} />
        <Bone height={48} />
      </Box>
    </Box>
  );
};
