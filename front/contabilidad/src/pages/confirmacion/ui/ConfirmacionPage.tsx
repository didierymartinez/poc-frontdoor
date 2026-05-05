import { Box } from '@mui/material';
import { ObligacionesPanel } from '@/widgets/confirmacion-table';

export function ConfirmacionPage() {
  return (
    <Box sx={{ px: 2, pb: 2, height: '100%' }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)',
          px: 2,
          pb: 2,
          height: '100%',
        }}
      >
        <ObligacionesPanel />
      </Box>
    </Box>
  );
}
