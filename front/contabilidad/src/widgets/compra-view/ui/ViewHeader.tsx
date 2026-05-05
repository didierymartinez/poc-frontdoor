import { Box, Chip, Typography } from '@mui/material';

interface ViewHeaderProps {
  codigo: string;
  estado: string;
  estadoColor: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error';
}

export function ViewHeader({ codigo, estado, estadoColor }: ViewHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'primary.50',
        px: 3,
        py: 1.5,
        m: -1,
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          {codigo}
        </Typography>
        <Chip
          label={estado}
          variant="outlined"
          size="small"
          color={estadoColor}
          sx={{ height: 22, fontSize: '0.75rem', fontWeight: 500 }}
        />
      </Box>
    </Box>
  );
}
