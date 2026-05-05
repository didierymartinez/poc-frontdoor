import { useState } from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { Comercio } from '@/entities/borrador';
import { useDocumentViewerStore } from '@/shared/model';
import type { HighlightSource } from '@/shared/model';
import iaLabelSrc from '@/shared/assets/IA-label.svg';

type OxpMode = 'borrador' | 'pendiente' | 'devuelta' | 'confirmada';

const MODE_CHIP: Record<OxpMode, { label: string; color: 'default' | 'warning' | 'success' | 'error' }> = {
  borrador: { label: 'Borrador', color: 'default' },
  pendiente: { label: 'Pendiente', color: 'warning' },
  confirmada: { label: 'Confirmada', color: 'success' },
  devuelta: { label: 'Devuelta', color: 'warning' },
};

interface RegistroHeaderProps {
  data?: Comercio;
  mode?: OxpMode;
}

export function RegistroHeader({ data, mode = 'borrador' }: RegistroHeaderProps) {
  const theme = useTheme();
  const setHighlightSource = useDocumentViewerStore((s) => s.setHighlightSource);

  const highlight = (ubicacion?: unknown) => () => {
    const src = ubicacion as HighlightSource | undefined;
    if (src?.pageNumber && src?.ubicacion) setHighlightSource(src);
  };
  const clearHighlight = () => setHighlightSource(null);

  const [fechaRegistro, setFechaRegistro] = useState<Dayjs | null>(
    data?.referencia?.fechaDocumento?.valor ? dayjs(data.referencia.fechaDocumento.valor)
    : data?.fechaPago?.valor ? dayjs(data.fechaPago.valor)
    : dayjs(),
  );
  const [fechaRegistroOpen, setFechaRegistroOpen] = useState(false);
  const [fechaRegistroAnchor, setFechaRegistroAnchor] = useState<HTMLDivElement | null>(null);

  const numeroUbicacion = data?.referencia?.numero?.ubicacion;
  const fechaUbicacion = data?.referencia?.fechaDocumento?.ubicacion ?? data?.fechaPago?.ubicacion;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          onMouseEnter={highlight(numeroUbicacion)}
          onMouseLeave={clearHighlight}
          sx={{
            cursor: numeroUbicacion ? 'pointer' : 'default',
            borderRadius: 0.5,
            px: 0.5,
            transition: 'background-color 0.15s',
            ...(numeroUbicacion && { '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.06)' } }),
          }}
        >
          <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
            {data?.referencia?.numero?.valor ?? 'Nuevo registro'}
          </Typography>
        </Box>
        <Chip
          label={MODE_CHIP[mode].label}
          size="small"
          variant="outlined"
          color={MODE_CHIP[mode].color}
          sx={{
            bgcolor: MODE_CHIP[mode].color === 'default' ? 'grey.100' : `${MODE_CHIP[mode].color}.50`,
            color: MODE_CHIP[mode].color === 'default' ? theme.palette.text.secondary : theme.palette[MODE_CHIP[mode].color].main,
            fontWeight: 500,
            height: 22,
            fontSize: '0.75rem',
            border: '1px solid',
            borderColor: MODE_CHIP[mode].color === 'default' ? theme.palette.divider : theme.palette[MODE_CHIP[mode].color].main,
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5px' }}>
          <Typography
            sx={{
              fontSize: '8.57px',
              letterSpacing: '0.43px',
              textTransform: 'uppercase',
              color: 'action.active',
              fontWeight: 600,
              lineHeight: 1,
            }}
          >
            Extraído con
          </Typography>
          <Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: 19, height: 18 }} />
        </Box>
      </Box>
      <Box
        onMouseEnter={highlight(fechaUbicacion)}
        onMouseLeave={clearHighlight}
        sx={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5,
          borderRadius: 0.5,
          px: 0.5,
          transition: 'background-color 0.15s',
          ...(fechaUbicacion && { '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.06)' } }),
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Fecha de registro
        </Typography>
        <Box
          onClick={() => setFechaRegistroOpen(true)}
          ref={setFechaRegistroAnchor}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
        >
          <Typography variant="body2" color="text.primary">
            {fechaRegistro?.format('DD/MM/YYYY') ?? ''}
          </Typography>
          <IconCalendarEvent size={16} color={theme.palette.action.active} />
        </Box>
        <Box sx={{ display: 'none' }}>
          <DatePicker
            value={fechaRegistro}
            onChange={(v: Dayjs | null) => {
              setFechaRegistro(v);
              setFechaRegistroOpen(false);
            }}
            open={fechaRegistroOpen}
            onClose={() => setFechaRegistroOpen(false)}
            slotProps={{ popper: { anchorEl: fechaRegistroAnchor } }}
          />
        </Box>
      </Box>
    </Box>
  );
}
