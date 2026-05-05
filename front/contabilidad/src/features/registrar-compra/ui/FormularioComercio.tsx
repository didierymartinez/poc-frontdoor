import { useRef } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { IconChartPie3, IconPaperclip, IconSearch } from '@tabler/icons-react';
import { DistribucionPopover, CurrencyInput } from '@/shared/ui';
import type { Comercio } from '@/entities/borrador';
import iaLabelSrc from '@/shared/assets/IA-label.svg';
import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';
import amexLogo from '@/shared/assets/card-brands/amex.png';
import { useFormularioComercio } from '../hooks/useFormularioComercio';
import { useRegistroCompraStore } from '../model/registro-compra.store';

const TARJETAS_DEFAULT = [
  { value: 'visa-default', label: 'Visa **** 0000', logo: visaLogo },
  { value: 'mastercard-default', label: 'Mastercard **** 0000', logo: mastercardLogo },
  { value: 'amex-default', label: 'Amex **** 0000', logo: amexLogo },
  { value: 'diners-default', label: 'Diners **** 0000', logo: dinersLogo },
];

const OCR_FIELD_BORDER = 'rgba(59, 130, 246, 0.4)';

function errorSx(campo: string, fields: string[]): Record<string, unknown> {
  if (!fields.includes(campo)) return {};
  return {
    '& .MuiOutlinedInput-root': { bgcolor: 'error.50' },
    '& .MuiPickersOutlinedInput-root': { bgcolor: 'error.50' },
  };
}

interface FormularioComercioProps {
  data?: Comercio;
  onVerSugerida: () => void;
  hideDistribucion?: boolean;
  errorFields?: string[];
  montoOverride?: number | null;
  onMontoChange?: (v: number) => void;
  mode?: 'borrador' | 'pendiente' | 'devuelta' | 'confirmada';
  highlightsEnabled?: boolean;
}

export function FormularioComercio({ data, onVerSugerida, hideDistribucion, errorFields = [], montoOverride, onMontoChange, mode = 'borrador', highlightsEnabled = true }: FormularioComercioProps) {
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
    soporte,
    setSoporte,
    fechaTransaccionError,
    distAnchor,
    setDistAnchor,
  } = useFormularioComercio({ data, montoOverride, highlightsEnabled });

  const docReadOnly = mode === 'confirmada';
  const noEndpoint = mode === 'pendiente' || mode === 'confirmada';
  const showInlineAdjuntar = mode !== 'borrador';
  const inlineFileRef = useRef<HTMLInputElement>(null);
  const addPendingFile = useRegistroCompraStore((s) => s.addPendingFile);

  const handleInlineFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addPendingFile(file);
    e.target.value = '';
  };

  return (
    <Stack spacing={1.5}>
      {/* Row 1: Medio de pago + Selecciona tarjeta (connected) */}
      <Box sx={{ display: 'flex' }}>
        <TextField
          data-testid="combobox-medio-pago"
          select
          label="Medio de pago"
          required
          size="small"
          value={medioPago}
          onChange={(e) => setMedioPago(e.target.value)}
          slotProps={{ select: { MenuProps: { slotProps: { backdrop: { sx: { backgroundColor: 'transparent' } } } } } }}
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
                <Box
                  sx={{
                    width: 23, height: 16, borderRadius: '2.5px',
                    border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                  }}
                >
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
            disabled={noEndpoint}
            slotProps={{
              textField: {
                size: 'small',
                required: true,
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
          onMouseEnter={highlight(data?.acreedor?.nombre?.ubicacion)}
          onMouseLeave={clearHighlight}
          sx={{ width: 230, display: 'flex' }}
        >
          <TextField
            select={!docReadOnly}
            label="Tipo doc."
            required
            size="small"
            value={tipoDocumento}
            onChange={(e) => !docReadOnly && setTipoDocumento(e.target.value)}
            slotProps={{ input: { readOnly: docReadOnly } }}
            sx={{
              width: 84, flexShrink: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px 0 0 4px',
                ...(docReadOnly && { bgcolor: 'grey.100' }),
              },
              ...(data?.acreedor?.nombre?.ubicacion && {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
              }),
              ...errorSx('tipoDocumento', errorFields),
            }}
          >
            {!docReadOnly && [
              <MenuItem key="CC" value="CC">CC</MenuItem>,
              <MenuItem key="NIT" value="NIT">NIT</MenuItem>,
              <MenuItem key="CE" value="CE">CE</MenuItem>,
              <MenuItem key="PA" value="PA">PA</MenuItem>,
              <MenuItem key="TI" value="TI">TI</MenuItem>,
            ]}
          </TextField>
          <TextField
            label="No. Documento"
            required
            size="small"
            value={numeroDocumento}
            onChange={(e) => !docReadOnly && setNumeroDocumento(e.target.value)}
            placeholder="Ingresa numero"
            slotProps={{ input: { readOnly: docReadOnly } }}
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: '0 4px 4px 0', ml: '-1px',
                ...(docReadOnly && { bgcolor: 'grey.100' }),
              },
              ...(data?.acreedor?.nombre?.ubicacion && {
                '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
              }),
              ...errorSx('numeroDocumento', errorFields),
            }}
          />
        </Box>
        <Box
          onMouseEnter={highlight(data?.acreedor?.nombre?.ubicacion)}
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
              ...(data?.acreedor?.nombre?.ubicacion && {
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

      {/* Row 3: Moneda+Monto | No. Soporte+Adjuntar */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ width: 230 }}>
          <Box sx={{ display: 'flex' }}>
            <TextField
              select label="Moneda" size="small" required value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              disabled={noEndpoint}
              sx={{ width: 84, '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' }, ...errorSx('moneda', errorFields) }}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="COP">COP</MenuItem>
              <MenuItem value="MXN">MXN</MenuItem>
            </TextField>
            <Box
              onMouseEnter={highlight(data?.total?.totalAPagar?.ubicacion)}
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
                  ...(data?.total?.totalAPagar?.ubicacion && { borderColor: OCR_FIELD_BORDER }),
                  ...(errorFields.includes('monto') && { bgcolor: 'error.50' }),
                }}
              />
            </Box>
          </Box>
          {moneda && moneda !== 'COP' && moneda !== '' && (
            <Box sx={{ bgcolor: 'rgba(47,67,208,0.04)', borderRadius: 1, px: 1.75, py: 0.375 }}>
              <Typography variant="caption" color="primary.main">
                Moneda extranjera: {moneda}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1, display: 'flex' }}>
          <Box
            onMouseEnter={highlight(data?.referencia?.numero?.ubicacion)}
            onMouseLeave={clearHighlight}
            sx={{ flex: 1 }}
          >
            <TextField
              label="No. Soporte" size="small" placeholder="Ingresa numero"
              value={soporte}
              onChange={(e) => setSoporte(e.target.value)}
              disabled={noEndpoint}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': { borderRadius: '4px 0 0 4px' },
                ...(data?.referencia?.numero?.ubicacion && {
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: OCR_FIELD_BORDER },
                }),
              }}
            />
          </Box>
          {showInlineAdjuntar && (
            <Box
              sx={{
                width: 120, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.300', borderRadius: '0 4px 4px 0', ml: '-1px',
              }}
            >
              <input ref={inlineFileRef} type="file" hidden onChange={handleInlineFile} accept=".pdf,.png,.jpg,.jpeg" />
              <Button
                variant="text"
                size="small"
                startIcon={<IconPaperclip size={16} />}
                onClick={() => inlineFileRef.current?.click()}
                sx={{ color: 'primary.main' }}
              >
                Adjuntar
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Distribucion de costos */}
      {!hideDistribucion && (
        <Box data-row-id="distribucion" sx={{ position: 'relative', width: 230, borderRadius: 1, px: 1.5, pt: 1.125, pb: 0.875, transition: 'background-color 0.15s' }}>
          <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', top: -7, left: 16 }}>
            Distribucion de costos
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              component="button"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => setDistAnchor(e.currentTarget)}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'none', border: 'none', cursor: 'pointer', p: 0 }}
            >
              <Typography variant="body1" color="text.primary">Distribuir</Typography>
              <IconChartPie3 size={16} color={theme.palette.text.primary} />
            </Box>
            <Link
              component="button" underline="none" onClick={onVerSugerida}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}
            >
              <Typography variant="body2" color="primary.main">Ver sugerida</Typography>
              <Box sx={{ width: 16, height: 16 }}>
                <Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: '100%', height: '100%' }} />
              </Box>
            </Link>
          </Box>
        </Box>
      )}

      <DistribucionPopover
        anchorEl={distAnchor}
        onClose={() => setDistAnchor(null)}
        options={[]}
        initialItems={[]}
        width={540}
      />
    </Stack>
  );
}
