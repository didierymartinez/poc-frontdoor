import { Box } from '@mui/material';
import type { Extracto, CargoFinancieroExtracto } from '@/entities/borrador';
import { ExtractoHeader } from './ExtractoHeader';
import { ExtractoFormSkeleton } from './ExtractoFormSkeleton';
import { FormFields } from './FormFields';
import { PartidasTable } from './PartidasTable';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface RegistroExtractoFormProps {
  data?: Extracto;
  isPending?: boolean;
  errorFields?: string[];
  cargos?: CargoFinancieroExtracto[];
  periodo?: { desde?: string | null; hasta?: string | null } | null;
  onTotalChange?: (total: number) => void;
  onFiscalChange?: (summary: import('../hooks/usePartidasTable').ExtractoFiscalSummary) => void;
  onPeriodoChange?: (desde: string | undefined, hasta: string | undefined) => void;
  onMedioPagoChange?: (tipo: number, numero: string) => void;
  onCargosChange?: (cargos: CargoFinancieroExtracto[]) => void;
}

export function RegistroExtractoForm({ data, isPending, errorFields = [], cargos, periodo, onTotalChange, onFiscalChange, onPeriodoChange, onMedioPagoChange, onCargosChange }: RegistroExtractoFormProps) {
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
      {isPending ? (
        <ExtractoFormSkeleton />
      ) : (
        <>
          <Box p={2} bgcolor="background.paper">
            <ExtractoHeader data={data} />
          </Box>
          <FormFields data={data} errorFields={errorFields} onPeriodoChange={onPeriodoChange} onMedioPagoChange={onMedioPagoChange} />
          <PartidasTable data={data} cargos={cargos} periodo={periodo} hasError={errorFields.includes('movimientos')} onTotalChange={onTotalChange} onFiscalChange={onFiscalChange} onCargosChange={onCargosChange} />
        </>
      )}
    </Box>
  );
}
