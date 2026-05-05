import { useState } from 'react';
import { useTheme } from '@mui/material';
import type { Dayjs } from 'dayjs';
import type { TerceroOption } from '../ui/anticipo-helpers';

export function useFormularioAnticipoEmpty() {
  const theme = useTheme();

  const [medioPago, setMedioPago] = useState('');
  const [fechaTransaccion, setFechaTransaccion] = useState<Dayjs | null>(null);
  const [tercero, setTercero] = useState<TerceroOption | null>(null);
  const terceroOptions: TerceroOption[] = tercero ? [tercero] : [];
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [moneda, setMoneda] = useState('');
  const [monto, setMonto] = useState('0,00');
  const [soporte, setSoporte] = useState('');

  return {
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
  };
}
