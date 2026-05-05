import { Box, Divider, Stack, Typography } from '@mui/material';

function SummaryLine({ label, value, variant = 'body2' }: { label: string; value: string; variant?: 'body2' | 'caption' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.125 }}>
      <Typography variant={variant} color="text.secondary">{label}</Typography>
      <Typography variant={variant} color="text.primary">{value}</Typography>
    </Box>
  );
}

interface ResumenExtractoProps {
  totalPartidas: string;
  totalCargos: string;
  total: string;
  moneda: string;
}

export function ResumenExtracto({ totalPartidas, totalCargos, total, moneda }: ResumenExtractoProps) {
  return (
    <Box sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 2, minWidth: 300 }}>
      <Stack spacing={0.75}>
        <SummaryLine label="Total partidas" value={totalPartidas} />
        <SummaryLine label="Cargos financieros" value={totalCargos} />

        <Divider sx={{ my: 0.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.primary" fontWeight={600}>Total</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="h6" color="text.primary" fontWeight={600}>{total}</Typography>
            <Typography variant="caption" color="text.secondary">{moneda}</Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
