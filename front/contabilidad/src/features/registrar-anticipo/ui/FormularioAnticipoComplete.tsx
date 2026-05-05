import { useState } from 'react';
import type { Anticipo as AnticipoData, AgregadoAnticipo } from '@/entities/borrador';
import {
  Autocomplete,
  Box,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import {
  IconSearch,
  IconChartPie3,
} from '@tabler/icons-react';
import { CurrencyInput, DistribucionDialog } from '@/shared/ui';
import {
  TARJETAS_DEFAULT,
  OCR_FIELD_BORDER,
} from './anticipo-helpers';
import { useFormularioAnticipoComplete } from '../hooks/useFormularioAnticipoComplete';

function errorSx(campo: string, fields: string[]): Record<string, unknown> {
  if (!fields.includes(campo)) return {};
  return {
    '& .MuiOutlinedInput-root': { bgcolor: 'error.50' },
    '& .MuiPickersOutlinedInput-root': { bgcolor: 'error.50' },
  };
}

export function FormularioAnticipoComplete({ data, agregado, hideDistribucion, errorFields = [], onMontoChange }: { data?: AnticipoData; agregado?: AgregadoAnticipo; hideDistribucion?: boolean; errorFields?: string[]; onMontoChange?: (v: number) => void }) {
  const [distribucionOpen, setDistribucionOpen] = useState(false);
  const {
    theme,
    highlight,
    clearHighlight,
    medioPago,
    setMedioPago,
    tarjeta,
    setTarjeta,
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
    fechaTransaccionError,
  } = useFormularioAnticipoComplete({ data, agregado });

  return (
    <Stack spacing={1.5}>
      {/* Row 1: Medio de pago + Selecciona tarjeta — joined */}
      <Box sx={{ display: 'flex' }}>
        <TextField
          select
          label="Medio de pago"
          required
          size="small"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          sx={{
            width: 230,
            '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px', bgcolor: 'grey.50' },
            ...errorSx('medioPago', errorFields),
          }}
        >
          <MenuItem value="Credito">Crédito</MenuItem>
          <MenuItem value="Debito">Débito</MenuItem>
        </TextField>
        <TextField
          select
          label="Selecciona tarjeta"
          required
          size="small"
          value={tarjeta}
          onChange={(e) => setTarjeta(e.target.value)}
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
        <Box
          onMouseEnter={highlight(data?.fechaPago?.ubicacion ?? data?.referencia?.fechaDocumento?.ubicacion)}
          onMouseLeave={clearHighlight}
        >
          <DatePicker
            label="Fecha de transaccion"
            value={fechaTransaccion}
            onChange={(v: Dayjs | null) => setFechaTransaccion(v)}
            format="DD/MM/YYYY"
            maxDate={dayjs()}
            slotProps={{
              textField: {
                size: 'small', required: true,
                ...(fechaTransaccionError && { error: true, helperText: fechaTransaccionError }),
                sx: {
                  width: 230,
                  '& .MuiPickersOutlinedInput-root': { height: 32 },
                  ...((data?.fechaPago?.ubicacion ?? data?.referencia?.fechaDocumento?.ubicacion) && {
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
                  }),
                  ...errorSx('fechaTransaccion', errorFields),
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Row 3: Tipo doc + No. Documento | Tercero */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box
          onMouseEnter={highlight(data?.beneficiario?.nombre?.ubicacion)}
          onMouseLeave={clearHighlight}
          sx={{ width: 230, display: 'flex' }}
        >
          <TextField
            select
            label="Tipo doc."
            required
            size="small"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            sx={{
              width: 84, flexShrink: 0,
              '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' },
              ...(data?.beneficiario?.nombre?.ubicacion && {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
              }),
              ...errorSx('tipoDocumento', errorFields),
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
              ...(data?.beneficiario?.nombre?.ubicacion && {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
              }),
              ...errorSx('numeroDocumento', errorFields),
            }}
          />
        </Box>
        <Box
          onMouseEnter={highlight(data?.beneficiario?.nombre?.ubicacion)}
          onMouseLeave={clearHighlight}
          sx={{ flex: 1 }}
        >
          <Autocomplete
            options={terceroOptions}
            freeSolo
            value={tercero}
            onChange={(_e, v) => setTercero(typeof v === 'string' ? { label: v, id: '' } : v)}
            onInputChange={(_e, v, reason) => { if (reason === 'input') setTercero({ label: v, id: '' }); }}
            size="small"
            sx={{
              '& .MuiInputBase-root': { height: 32 },
              ...(data?.beneficiario?.nombre?.ubicacion && {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
              }),
              ...errorSx('tercero', errorFields),
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tercero"
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <InputAdornment position="end">
                        <IconSearch size={16} color={theme.palette.action.active} />
                      </InputAdornment>
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
      </Box>

      {/* Row 3: Moneda+Monto */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: 230, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex' }}>
            <TextField
              select
              label="Moneda"
              required
              size="small"
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              sx={{ width: 84, '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' }, ...errorSx('moneda', errorFields) }}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="MXN">MXN</MenuItem>
            </TextField>
            <Box
              onMouseEnter={highlight(data?.concepto?.ubicacion)}
              onMouseLeave={clearHighlight}
              sx={{ flex: 1 }}
            >
              <CurrencyInput
                value={monto}
                onChange={(v) => { setMonto(v); onMontoChange?.(v); }}
                placeholder="0,00"
                sx={{
                  width: '100%', height: 32,
                  border: '1px solid', borderColor: 'grey.400', borderRadius: '0 4px 4px 0', ml: '-1px',
                  px: 1,
                  '& .MuiInputBase-input': { textAlign: 'right', fontSize: '0.8125rem' },
                  ...(data?.concepto?.ubicacion && { borderColor: OCR_FIELD_BORDER }),
                  ...(errorFields.includes('monto') && { bgcolor: 'error.50' }),
                }}
              />
            </Box>
          </Box>
          {/* TRM helper text */}
          {moneda !== 'COP' && (
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                bgcolor: 'rgba(47,67,208,0.04)',
                borderRadius: 1,
                px: 1.75,
                py: 0.375,
                mt: 0,
              }}
            >
              TRM: $3.698 | Fnl. 9.000.000,00
            </Typography>
          )}
        </Box>
      </Box>

      {/* Distribucion de costos */}
      {!hideDistribucion && (
        <>
          <Box
            onClick={() => setDistribucionOpen(true)}
            sx={{
              position: 'relative',
              border: '0px solid transparent',
              borderRadius: 1,
              px: 1.5,
              pt: 1.125,
              pb: 0.875,
              width: 230,
              cursor: 'pointer',
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
          <DistribucionDialog
            open={distribucionOpen}
            onClose={() => setDistribucionOpen(false)}
            options={[]}
            initialItems={[]}
            onConfirm={() => setDistribucionOpen(false)}
          />
        </>
      )}
    </Stack>
  );
}
