import {
  Box,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { IconInfoCircle } from '@tabler/icons-react';

interface ImpuestoItem {
  nombre: string;
  porcentaje: string;
  valor: string;
}

interface ResumenDevolucionProps {
  totalDevolucion: string;
  moneda: string;
  trm: string;
  funcional: string;
  valorBruto: string;
  totalImpuestos: string;
  impuestos: ImpuestoItem[];
  totalRetenciones: string;
  retenciones: ImpuestoItem[];
}

function DesgloseLine({ nombre, porcentaje, valor }: ImpuestoItem) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', pl: 1, alignItems: 'center' }}>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {nombre}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {porcentaje}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {valor}
      </Typography>
    </Box>
  );
}

export function ResumenDevolucion({
  totalDevolucion,
  moneda,
  trm,
  funcional,
  valorBruto,
  totalImpuestos,
  impuestos,
  totalRetenciones,
  retenciones,
}: ResumenDevolucionProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: 'grey.50',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 1,
        p: 2,
        width: 360,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {/* Total devolución */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" color="text.primary">
          Total devolución
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="h6" color="text.primary">
            {totalDevolucion}
          </Typography>
          <Typography variant="caption" color="text.primary">
            {moneda}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1}>
        {/* TRM */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            TRM
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {trm}
            </Typography>
            <IconInfoCircle size={16} color={theme.palette.action.active} />
          </Box>
        </Box>

        {/* Funcional */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Funcional
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {funcional}
          </Typography>
        </Box>

        {/* Valor bruto */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Valor bruto
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {valorBruto}
          </Typography>
        </Box>

        {/* Total impuestos */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Total impuestos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalImpuestos}
            </Typography>
          </Box>
          <Box
            sx={{
              pl: 1,
              borderLeft: '1px solid',
              borderColor: 'grey.300',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {impuestos.map((imp) => (
              <DesgloseLine key={imp.nombre} {...imp} />
            ))}
          </Box>
        </Box>

        {/* Total retenciones */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Total retenciones
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalRetenciones}
            </Typography>
          </Box>
          <Box
            sx={{
              pl: 1,
              borderLeft: '1px solid',
              borderColor: 'grey.300',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {retenciones.map((ret) => (
              <DesgloseLine key={ret.nombre} {...ret} />
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}
