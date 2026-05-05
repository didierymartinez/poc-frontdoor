import { Box, Divider } from '@mui/material';
import { AnticipoViewHeader } from './AnticipoViewHeader';
import { AnticipoViewSkeleton } from './AnticipoViewSkeleton';
import { DatosAnticipo } from './DatosAnticipo';
import { ResumenSaldos } from './ResumenSaldos';
import { CollapsibleSection } from './CollapsibleSection';
import { PagosRealizadosTable } from './PagosRealizadosTable';
import { ObligacionesAmortizadasTable } from './ObligacionesAmortizadasTable';
import type { PagoRow, ObligacionRow } from './anticipo-view-types';
import type { DestinoNegocio } from '@/entities/borrador';

interface AnticipoViewProps {
  loading?: boolean;
  codigo?: string;
  estado?: string;
  estadoColor?: 'default' | 'primary' | 'success' | 'info' | 'warning' | 'error';
  medioPago?: string;
  medioPagoNumero?: string;
  fecha?: string;
  tercero?: string;
  soporte?: { container: string; key: string } | null;
  justificacion?: string | null;
  distribucion?: DestinoNegocio[];
  totalFormatted?: string;
  moneda?: string;
  saldoPorPagar?: { pagado: string; pendiente: string; pendienteRaw: number };
  saldoPorRegularizar?: { regularizado: string; pendiente: string; pendienteRaw: number };
  pagos?: PagoRow[];
  regularizaciones?: ObligacionRow[];
  onOpenSoporte?: () => void;
}

export function AnticipoView({
  loading,
  codigo = '',
  estado = 'Vigente',
  estadoColor = 'primary',
  medioPago,
  medioPagoNumero,
  fecha,
  tercero,
  soporte,
  justificacion,
  distribucion = [],
  totalFormatted = '$0,00',
  moneda = 'COP',
  saldoPorPagar = { pagado: '$0,00', pendiente: '$0,00', pendienteRaw: 0 },
  saldoPorRegularizar = { regularizado: '$0,00', pendiente: '$0,00', pendienteRaw: 0 },
  pagos = [],
  regularizaciones = [],
  onOpenSoporte,
}: AnticipoViewProps) {
  if (loading) return <AnticipoViewSkeleton />;

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: '6px 4px 4px 0px rgba(73,71,71,0.03)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <Box p={2} bgcolor="background.paper">
        <AnticipoViewHeader codigo={codigo} estado={estado} estadoColor={estadoColor} />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <DatosAnticipo
            medioPago={medioPago}
            medioPagoNumero={medioPagoNumero}
            fecha={fecha}
            tercero={tercero}
            soporte={soporte}
            onOpenSoporte={onOpenSoporte}
            justificacion={justificacion}
            distribucion={distribucion}
          />
        </Box>
        <ResumenSaldos
          totalFormatted={totalFormatted}
          moneda={moneda}
          saldoPorPagar={saldoPorPagar}
          saldoPorRegularizar={saldoPorRegularizar}
        />
      </Box>

      <Divider />

      <CollapsibleSection title="Pagos realizados" count={pagos.length} emptyTitle="Sin pagos aplicados">
        <PagosRealizadosTable rows={pagos} />
      </CollapsibleSection>
      <CollapsibleSection title="Obligaciones amortizadas" count={regularizaciones.length} emptyTitle="Sin obligaciones registradas">
        <ObligacionesAmortizadasTable rows={regularizaciones} />
      </CollapsibleSection>
    </Box>
  );
}
