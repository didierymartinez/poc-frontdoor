import {
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import {
  IconPaperclip,
  IconSearch,
  IconChartPie3,
} from '@tabler/icons-react';
import {
  TARJETAS_DEFAULT,
  handleNumericChange,
} from './anticipo-helpers';
import { useFormularioAnticipoEmpty } from '../hooks/useFormularioAnticipoEmpty';

export function FormularioAnticipoEmpty() {
  const {
    theme,
    medioPago,
    setMedioPago,
    fechaTransaccion,
    setFechaTransaccion,
    tercero,
    setTercero,
    terceroOptions,
    tipoDocumento,
    setTipoDocumento,
    numeroDocumento,
    setNumeroDocumento,
    moneda,
    setMoneda,
    monto,
    setMonto,
    soporte,
    setSoporte,
  } = useFormularioAnticipoEmpty();

  return (
    <Stack spacing={1.5}>
      {/* Row 1: Medio de pago + Selecciona tarjeta — joined */}
      <Box sx={{ display: 'flex' }}>
        <TextField
          select
          size="small"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          sx={{
            width: 230,
            '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px', bgcolor: 'grey.50' },
          }}
          SelectProps={{
            displayEmpty: true,
            renderValue: (value) => {
              if (!value) {
                return (
                  <Typography variant="body2" color="text.secondary">
                    <Typography component="span" color="error.main">*</Typography> Medio de pago
                  </Typography>
                );
              }
              const labels: Record<string, string> = {
                Credito: 'Crédito',
                Debito: 'Débito',
              };
              return labels[value as string] ?? value;
            },
          }}
        >
          <MenuItem value="Credito">Crédito</MenuItem>
          <MenuItem value="Debito">Débito</MenuItem>
        </TextField>
        <TextField
          select
          label="Selecciona tarjeta"
          size="small"
          value={TARJETAS_DEFAULT[0].value}
          sx={{
            flex: 1,
            '& .MuiOutlinedInput-root': { borderRadius: '0 4px 4px 0', ml: '-1px' },
          }}
        >
          {TARJETAS_DEFAULT.map((t) => (
            <MenuItem key={t.value} value={t.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 23, height: 16, borderRadius: '2.5px', border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  <Box component="img" src={t.logo} alt="" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
                </Box>
                {t.label}
              </Box>
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Row 2: Fecha de transaccion */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <DatePicker
          label="Fecha de transaccion"
          value={fechaTransaccion}
          onChange={(v: Dayjs | null) => setFechaTransaccion(v)}
          format="DD/MM/YYYY"
          slotProps={{ textField: { size: 'small', required: true, sx: { width: 230, '& .MuiPickersOutlinedInput-root': { height: 32 } } } }}
        />
      </Box>

      {/* Row 3: Tipo doc + No. Documento | Tercero */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ width: 230, display: 'flex' }}>
          <TextField
            select
            size="small"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            sx={{ width: 84, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' } }}
            SelectProps={{
              displayEmpty: true,
              renderValue: (value) => {
                if (!value) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      <Typography component="span" color="error.main">*</Typography> Tipo
                    </Typography>
                  );
                }
                return value as string;
              },
            }}
          >
            <MenuItem value="CC">CC</MenuItem>
            <MenuItem value="NIT">NIT</MenuItem>
            <MenuItem value="CE">CE</MenuItem>
            <MenuItem value="PA">PA</MenuItem>
            <MenuItem value="TI">TI</MenuItem>
          </TextField>
          <TextField
            label="No. Documento"
            required
            size="small"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            placeholder="Ingresa numero"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '0 4px 4px 0', ml: '-1px' },
            }}
          />
        </Box>
        <Autocomplete
          options={terceroOptions}
          freeSolo
          value={tercero}
          onChange={(_e, v) => setTercero(typeof v === 'string' ? { label: v, id: '' } : v)}
          onInputChange={(_e, v, reason) => { if (reason === 'input') setTercero({ label: v, id: '' }); }}
          size="small"
          sx={{ flex: 1 }}
          popupIcon={<IconSearch size={16} />}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="* Tercero"
            />
          )}
        />
      </Box>

      {/* Row 3: Moneda+Monto | No. Soporte+Adjuntar */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        {/* Moneda + Monto group */}
        <Box sx={{ width: 230, display: 'flex' }}>
          <TextField
            select
            size="small"
            value={moneda}
            onChange={(e) => setMoneda(e.target.value)}
            sx={{
              width: 84,
              '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' },
            }}
            SelectProps={{
              displayEmpty: true,
              renderValue: (value) => {
                if (!value) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      Mon...
                    </Typography>
                  );
                }
                return value as string;
              },
            }}
          >
            <MenuItem value="USD">USD</MenuItem>
            <MenuItem value="COP">COP</MenuItem>
            <MenuItem value="MXN">MXN</MenuItem>
          </TextField>
          <TextField
            label="Monto"
            required
            size="small"
            value={monto}
            onChange={handleNumericChange(setMonto)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '0 4px 4px 0', ml: '-1px' },
            }}
            inputProps={{ style: { textAlign: 'right' }, inputMode: 'decimal' }}
          />
        </Box>

        {/* No. Soporte + Adjuntar group */}
        <Box sx={{ flex: 1, display: 'flex' }}>
          <TextField
            label="No. Soporte"
            size="small"
            placeholder="Ingresa numero"
            value={soporte}
            onChange={(e) => setSoporte(e.target.value)}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' },
            }}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.50',
              border: '1px solid',
              borderColor: 'grey.300',
              borderLeft: 'none',
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
              px: 1.5,
              height: 32,
            }}
          >
            <Button
              variant="text"
              startIcon={<IconPaperclip size={16} />}
              sx={{ color: 'primary.main', whiteSpace: 'nowrap', minWidth: 'auto' }}
            >
              Adjuntar
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Distribucion de costos */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: 1,
          px: 1.5,
          pt: 1.125,
          pb: 0.875,
          width: 230,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ position: 'absolute', top: -7, left: 16 }}
        >
          Distribucion de costos
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body1" color="text.primary">
            Distribuir
          </Typography>
          <IconChartPie3 size={16} color={theme.palette.text.primary} />
        </Box>
      </Box>
    </Stack>
  );
}
