import { Box, Divider, Stack, Typography, useTheme } from '@mui/material';
import { IconInfoCircle } from '@tabler/icons-react';

function SummaryLine({ label, value, variant = 'body2' }: { label: string; value: string; variant?: 'body2' | 'caption' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.125 }}>
      <Typography variant={variant} color="text.secondary">{label}</Typography>
      <Typography variant={variant} color="text.primary">{value}</Typography>
    </Box>
  );
}

interface TributoItem {
  tipo: string;
  tarifa: string;
  valor: string;
  valorNum: number;
}

interface ConceptoFiscal {
  impuestos: TributoItem[];
  retenciones: TributoItem[];
}

function groupTributos(items: TributoItem[]): { label: string; valor: string }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = `${item.tipo} ${item.tarifa}`;
    map.set(key, (map.get(key) ?? 0) + item.valorNum);
  }
  return Array.from(map, ([label, total]) => ({
    label,
    valor: `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  }));
}

interface ResumenFinancieroProps {
  totalFormatted: string;
  moneda: string;
  totalBruto: string;
  totalImpuestos: string;
  totalRetenciones: string;
  funcional?: string;
  trm?: { moneda: number; valor: number } | null;
  conceptos: ConceptoFiscal[];
}

export function ResumenFinanciero({
  totalFormatted,
  moneda,
  totalBruto,
  totalImpuestos,
  totalRetenciones,
  funcional,
  trm,
  conceptos,
}: ResumenFinancieroProps) {
  const theme = useTheme();

  // Aggregate and group impuestos/retenciones by tipo+tarifa
  const allImp = groupTributos(conceptos.flatMap((c) => c.impuestos));
  const allRet = groupTributos(conceptos.flatMap((c) => c.retenciones));

  return (
    <Box sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 1, p: 2, minWidth: 280 }}>
      <Stack spacing={1}>
        {trm && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">TRM</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2" color="text.primary">
                {trm.valor.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </Typography>
              <IconInfoCircle size={14} color={theme.palette.text.secondary} />
            </Box>
          </Box>
        )}
        {funcional && <SummaryLine label="Funcional" value={funcional} />}
        <SummaryLine label="Valor bruto" value={totalBruto} />

        {allImp.length > 0 && (
          <>
            <Divider />
            <SummaryLine label="Total impuestos" value={totalImpuestos} />
            <Box sx={{ pl: 1.5 }}>
              {allImp.map((imp) => (
                <SummaryLine key={imp.label} label={imp.label} value={imp.valor} variant="caption" />
              ))}
            </Box>
          </>
        )}

        {allRet.length > 0 && (
          <>
            <Divider />
            <SummaryLine label="Total retenciones" value={totalRetenciones} />
            <Box sx={{ pl: 1.5 }}>
              {allRet.map((ret) => (
                <SummaryLine key={ret.label} label={ret.label} value={ret.valor} variant="caption" />
              ))}
            </Box>
          </>
        )}

        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" color="text.primary" fontWeight={600}>Total</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" fontWeight={600}>{totalFormatted}</Typography>
            <Typography variant="body1" color="text.primary">{moneda}</Typography>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
