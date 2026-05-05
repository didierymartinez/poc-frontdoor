import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import type { DateRange } from '@mui/x-date-pickers-pro/models';
import dayjs, { type Dayjs } from 'dayjs';
import type { Extracto } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import { getCardBrandLogo } from '@/shared/lib';
import mastercardLogo from '@/shared/assets/card-brands/mastercard.png';
import visaLogo from '@/shared/assets/card-brands/visa.png';
import dinersLogo from '@/shared/assets/card-brands/diners.png';
import amexLogo from '@/shared/assets/card-brands/amex.png';
import { IconCalendarEvent, IconRefresh } from '@tabler/icons-react';
import { OCR_FIELD_HOVER } from './extracto-helpers';
import { TotalResumen } from './TotalResumen';

const TARJETAS_DEFAULT = [
  { value: '4111111111110000', label: 'Visa **** 0000', logo: visaLogo },
  { value: '5500000000000000', label: 'Mastercard **** 0000', logo: mastercardLogo },
  { value: '340000000000000', label: 'Amex **** 0000', logo: amexLogo },
  { value: '30000000000000', label: 'Diners **** 0000', logo: dinersLogo },
];

function CambiarMedioPagoDialog({ open, onClose, onConfirm, initialTipo, initialTarjeta }: {
  open: boolean;
  onClose: () => void;
  onConfirm: (tipo: number, numero: string) => void;
  initialTipo?: string;
  initialTarjeta?: string;
}) {
  const [tipoPago, setTipoPago] = useState(initialTipo ?? 'Credito');
  const [tarjeta, setTarjeta] = useState(initialTarjeta ?? TARJETAS_DEFAULT[0].value);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>Cambiar medio de pago</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        <TextField
          select
          label="Medio de pago"
          size="small"
          value={tipoPago}
          onChange={(e) => setTipoPago(e.target.value)}
          fullWidth
        >
          <MenuItem value="Credito">Crédito</MenuItem>
          <MenuItem value="Debito">Débito</MenuItem>
        </TextField>
        <TextField
          select
          label="Selecciona tarjeta"
          size="small"
          value={tarjeta}
          onChange={(e) => setTarjeta(e.target.value)}
          fullWidth
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
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" color="inherit" onClick={onClose}>Cancelar</Button>
        <Button size="small" variant="contained" onClick={() => {
          onConfirm(tipoPago === 'Credito' ? 0 : 1, tarjeta);
          onClose();
        }}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function FormFields({ data, errorFields = [], onPeriodoChange, onMedioPagoChange }: { data?: Extracto; errorFields?: string[]; onPeriodoChange?: (desde: string | undefined, hasta: string | undefined) => void; onMedioPagoChange?: (tipo: number, numero: string) => void }) {
  const theme = useTheme();
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);

  const highlight = (src?: unknown) => () => {
    const s = src as HighlightSource | undefined;
    if (s?.pageNumber) setHighlightSource(s);
  };
  const clear = () => setHighlightSource(null);

  const entidadUbicacion = data?.entidadFinanciera?.nombre?.ubicacion;
  const tarjetaUbicacion = data?.tarjeta?.numero?.ubicacion;
  const periodoHastaUbicacion = data?.periodo?.hasta?.ubicacion;
  const fechaPagoUbicacion = data?.fechaPago?.ubicacion;

  const [periodoRange, setPeriodoRange] = useState<DateRange<Dayjs>>([
    data?.periodo?.desde?.valor ? dayjs(data.periodo.desde.valor) : null,
    data?.periodo?.hasta?.valor ? dayjs(data.periodo.hasta.valor) : null,
  ]);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [rangeAnchor, setRangeAnchor] = useState<HTMLDivElement | null>(null);

  // Medio de pago override (when user changes via dialog)
  const [medioPagoOverride, setMedioPagoOverride] = useState<{ tipo: number; numero: string } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const displayNumero = medioPagoOverride?.numero ?? data?.tarjeta?.numero?.valor;
  const displayLogo = displayNumero ? getCardBrandLogo(displayNumero) : null;

  const handleMedioPagoConfirm = (tipo: number, numero: string) => {
    setMedioPagoOverride({ tipo, numero });
    onMedioPagoChange?.(tipo, numero);
  };

  useEffect(() => {
    onPeriodoChange?.(
      periodoRange[0]?.format('YYYY-MM-DD') || undefined,
      periodoRange[1]?.format('YYYY-MM-DD') || undefined,
    );
  }, [periodoRange, onPeriodoChange]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* Entidad bancaria */}
      <Box
        onMouseEnter={highlight(entidadUbicacion)}
        onMouseLeave={clear}
        sx={{ borderRadius: 0.5, px: 0.5, transition: 'background-color 0.15s', ...(entidadUbicacion && { '&:hover': { bgcolor: OCR_FIELD_HOVER } }) }}
      >
        <Typography variant="caption" color="text.secondary">Entidad bancaria</Typography>
        <Typography variant="body2" color="text.primary" fontWeight={500} sx={{ mt: 0.25 }}>
          {data?.entidadFinanciera?.nombre?.valor ?? '—'}
        </Typography>
      </Box>

      {/* Medio de pago */}
      <Box
        onMouseEnter={highlight(tarjetaUbicacion)}
        onMouseLeave={clear}
        sx={{ borderRadius: 0.5, px: 0.5, transition: 'background-color 0.15s', ...(tarjetaUbicacion && { '&:hover': { bgcolor: OCR_FIELD_HOVER } }) }}
      >
        <Typography variant="caption" color="text.secondary">Medio de pago</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.25 }}>
          {displayLogo && (
            <Box
              sx={{
                width: 23, height: 16, borderRadius: '2.5px',
                border: '1px solid', borderColor: 'grey.300', bgcolor: 'background.paper',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
              }}
            >
              <Box component="img" src={displayLogo} alt="" sx={{ width: '70%', height: '70%', objectFit: 'contain' }} />
            </Box>
          )}
          <Typography variant="body2" color="text.primary">
            {displayNumero ? `**** ${displayNumero.slice(-4)}` : '—'}
          </Typography>
          {!data?.tarjeta?.numero?.valor && (
            <Box
              component="button"
              onClick={() => setDialogOpen(true)}
              sx={{
                display: 'flex', alignItems: 'center', background: 'none', border: 'none',
                cursor: 'pointer', p: 0, ml: 0.5,
              }}
            >
              <IconRefresh size={14} color={theme.palette.primary.main} />
            </Box>
          )}
        </Box>
      </Box>

      {/* Periodo facturado */}
      <Box
        ref={setRangeAnchor}
        onMouseEnter={highlight(periodoHastaUbicacion ?? fechaPagoUbicacion)}
        onMouseLeave={clear}
        sx={{
          borderRadius: 0.5, px: 0.5, transition: 'background-color 0.15s',
          ...((periodoHastaUbicacion ?? fechaPagoUbicacion) && { '&:hover': { bgcolor: OCR_FIELD_HOVER } }),
          ...(errorFields.includes('periodo') && { bgcolor: 'error.50' }),
        }}
      >
        <Typography variant="caption" color="text.secondary">Periodo facturado</Typography>
        <Box
          onClick={() => setRangeOpen(true)}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, cursor: 'pointer' }}
        >
          <IconCalendarEvent size={14} color={theme.palette.action.active} />
          <Typography variant="body2" color="text.primary" sx={{ '&:hover': { color: 'primary.main' } }}>
            {periodoRange[0]?.format('DD/MM/YY') ?? '—'}
          </Typography>
          <Typography variant="body2" color="text.secondary">→</Typography>
          <Typography variant="body2" color="text.primary" sx={{ '&:hover': { color: 'primary.main' } }}>
            {periodoRange[1]?.format('DD/MM/YY') ?? '—'}
          </Typography>
        </Box>
        <Box sx={{ display: 'none' }}>
          <DateRangePicker
            value={periodoRange}
            onChange={(newRange) => setPeriodoRange(newRange)}
            open={rangeOpen}
            onClose={() => setRangeOpen(false)}
            localeText={{ start: 'Desde', end: 'Hasta' }}
            slotProps={{
              popper: { anchorEl: rangeAnchor },
            }}
          />
        </Box>
      </Box>

      <TotalResumen data={data} />

      {/* Dialog para cambiar medio de pago */}
      <CambiarMedioPagoDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleMedioPagoConfirm}
        initialTipo={data?.tarjeta?.tipo === 'Debito' ? 'Debito' : 'Credito'}
        initialTarjeta={displayNumero ?? TARJETAS_DEFAULT[0].value}
      />
    </Box>
  );
}
