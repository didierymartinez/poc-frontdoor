import { Box, Divider, Stack, Typography } from '@mui/material';

interface ResumenSaldosProps {
  totalFormatted: string;
  moneda: string;
  saldoPorPagar: { pagado: string; pendiente: string; pendienteRaw: number };
  saldoPorRegularizar: { regularizado: string; pendiente: string; pendienteRaw: number };
}

export function ResumenSaldos({ totalFormatted, moneda, saldoPorPagar, saldoPorRegularizar }: ResumenSaldosProps) {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        p: 2,
        minWidth: 260,
      }}
    >
      <Stack spacing={1.5}>
        {/* Total anticipo */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.primary" fontWeight={600}>
            Total anticipo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography variant="h6" color="text.primary" fontWeight={600}>
              {totalFormatted}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {moneda}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Saldo por pagar */}
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          Saldo por pagar
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Pagado</Typography>
          <Typography variant="body2" color="text.primary">{saldoPorPagar.pagado}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Pendiente</Typography>
          <Typography variant="body2" color={saldoPorPagar.pendienteRaw > 0 ? 'warning.main' : 'text.primary'} fontWeight={saldoPorPagar.pendienteRaw > 0 ? 500 : 400}>
            {saldoPorPagar.pendiente}
          </Typography>
        </Box>

        <Divider />

        {/* Saldo por regularizar */}
        <Typography variant="body2" color="text.primary" fontWeight={500}>
          Saldo por regularizar
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Regularizado</Typography>
          <Typography variant="body2" color="text.primary">{saldoPorRegularizar.regularizado}</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Pendiente</Typography>
          <Typography variant="body2" color={saldoPorRegularizar.pendienteRaw > 0 ? 'warning.main' : 'text.primary'} fontWeight={saldoPorRegularizar.pendienteRaw > 0 ? 500 : 400}>
            {saldoPorRegularizar.pendiente}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
