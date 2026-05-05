import { Box, Typography } from '@mui/material';

interface CargoFinanciero {
  no: string;
  codigo: string;
  movimiento: string;
  valor: string;
  moneda: string;
  trm: string;
}

interface CargosFinancierosTableProps {
  cargos: CargoFinanciero[];
}

const COLUMNS = [
  { label: 'No.', width: 48, align: 'left' as const },
  { label: 'Código', width: 120, align: 'left' as const },
  { label: 'Movimiento', flex: true, align: 'left' as const },
  { label: 'Valor', flex: true, align: 'right' as const },
];

export function CargosFinancierosTable({ cargos }: CargosFinancierosTableProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Cargos financieros a devolver
      </Typography>

      <Box>
        {/* Header */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center',
            bgcolor: 'grey.100', borderRadius: 1,
            height: 24, px: 1,
          }}
        >
          {COLUMNS.map((col) => (
            <Box
              key={col.label}
              sx={{
                width: col.flex ? undefined : col.width,
                flex: col.flex ? 1 : undefined,
                textAlign: col.align,
                px: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">{col.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* Rows */}
        {cargos.map((cargo) => (
          <Box
            key={cargo.no}
            sx={{
              display: 'flex', alignItems: 'center',
              height: 38, px: 1,
              borderBottom: '0.5px solid',
              borderColor: 'grey.200',
            }}
          >
            <Box sx={{ width: 48, px: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{cargo.no}</Typography>
            </Box>
            <Box sx={{ width: 120, px: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{cargo.codigo}</Typography>
            </Box>
            <Box sx={{ flex: 1, px: 0.5 }}>
              <Typography variant="body2" color="text.secondary">{cargo.movimiento}</Typography>
            </Box>
            <Box sx={{ flex: 1, px: 0.5, textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                <Typography variant="body2" color="text.primary">{cargo.valor}</Typography>
                <Typography variant="body1" color="text.secondary">{cargo.moneda}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                <Typography variant="caption" color="text.secondary">TRM</Typography>
                <Typography variant="caption" color="text.secondary">{cargo.trm}</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export type { CargoFinanciero };
