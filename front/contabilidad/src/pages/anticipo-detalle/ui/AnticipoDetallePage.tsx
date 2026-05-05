import { Box } from '@mui/material';
import { AnticipoView } from '@/widgets/anticipo-view';
import { useAnticipoDetalle } from '../hooks/useAnticipoDetalle';

export function AnticipoDetallePage() {
  const { anticipo, isPending, hasSoporte, handleOpenSoporte } = useAnticipoDetalle();

  return (
    <Box sx={{ p: 2 }}>
      <AnticipoView
        loading={isPending}
        codigo={anticipo?.id ? `OXP-ANT-${anticipo.id.slice(0, 8)}` : ''}
        estado={anticipo?.estado}
        estadoColor={anticipo?.estadoColor}
        medioPago={anticipo?.medioPago}
        medioPagoNumero={anticipo?.medioPagoNumero}
        fecha={anticipo?.fecha}
        tercero={anticipo?.tercero}
        soporte={anticipo?.soporte}
        justificacion={anticipo?.justificacion}
        distribucion={anticipo?.distribucion}
        totalFormatted={anticipo?.totalFormatted}
        moneda={anticipo?.moneda}
        saldoPorPagar={anticipo?.saldoPorPagar}
        saldoPorRegularizar={anticipo?.saldoPorRegularizar}
        pagos={anticipo?.pagos}
        regularizaciones={anticipo?.regularizaciones}
        onOpenSoporte={hasSoporte ? handleOpenSoporte : undefined}
      />
    </Box>
  );
}
