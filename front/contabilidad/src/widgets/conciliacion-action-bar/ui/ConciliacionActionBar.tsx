import { Box, Button, LinearProgress, Typography, useTheme } from '@mui/material';

interface ConciliacionActionBarProps {
  progress?: number;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  processing?: boolean;
}

export function ConciliacionActionBar({
  progress = 10,
  onSubmit,
  submitDisabled = true,
  processing = false,
}: ConciliacionActionBarProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderRadius: 1,
        border: '0.5px solid',
        borderColor: 'primary.light',
        background: `linear-gradient(90deg, rgba(47,67,208,0.08) 0%, rgba(47,67,208,0.08) 100%), ${theme.palette.background.paper}`,
      }}
    >
      {/* Left: Progress status */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          En proceso de conciliación ({progress}%)
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ width: 200, height: 4, borderRadius: 2 }}
        />
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant="contained" disabled={submitDisabled || processing} onClick={onSubmit}>
          {processing ? 'Procesando...' : 'Enviar a confirmación'}
        </Button>
      </Box>
    </Box>
  );
}
