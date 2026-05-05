import { Box, Button, Typography, useTheme } from '@mui/material';

interface AnticipoActionBarProps {
  total?: number;
  moneda?: string;
  onGuardar?: () => void;
  onDescartar?: () => void;
  guardando?: boolean;
}

export function AnticipoActionBar({ total, moneda, onGuardar, onDescartar, guardando }: AnticipoActionBarProps) {
  const theme = useTheme();

  const formattedTotal = total != null
    ? `$ ${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$ 0,00';

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
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          height: 24,
        }}
      >
        <Typography variant="caption" color="text.secondary">Total</Typography>
        <Typography variant="subtitle1" color="text.primary" fontWeight={500}>
          {formattedTotal}
        </Typography>
        {moneda && (
          <Typography variant="caption" color="text.secondary">{moneda}</Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Button variant="text" color="primary" onClick={onDescartar} disabled={guardando}>Descartar</Button>
        <Button variant="contained" onClick={onGuardar} disabled={guardando}>
          {guardando ? 'Enviando...' : 'Enviar a confirmación'}
        </Button>
      </Box>
    </Box>
  );
}
