import { useEffect, useState } from 'react';
import { TextField, Typography } from '@mui/material';
import type { Comercio } from '@/entities/borrador';
import { useRegistroCompraStore } from '../model/registro-compra.store';

interface ObservacionesSectionProps {
  data?: Comercio;
  hasError?: boolean;
  mode?: 'borrador' | 'pendiente' | 'devuelta' | 'confirmada';
}

export function ObservacionesSection({ data, hasError, mode = 'borrador' }: ObservacionesSectionProps) {
  const setFormField = useRegistroCompraStore((s) => s.setFormField);
  const [value, setValue] = useState(data?.descripcion ?? '');
  const readOnly = mode !== 'borrador';

  // Sync initial value to store on mount
  useEffect(() => {
    if (data?.descripcion) setFormField('descripcion', data.descripcion);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (v: string) => {
    setValue(v);
    setFormField('descripcion', v);
  };

  if (readOnly) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        <Typography component="span" variant="body2" color="text.primary" fontWeight={500}>Observaciones: </Typography>
        {value || '—'}
      </Typography>
    );
  }

  return (
    <TextField
      label="Observaciones"
      required
      multiline
      minRows={2}
      size="small"
      fullWidth
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      sx={{
        '& .MuiOutlinedInput-root': {
          alignItems: 'flex-start',
          ...(hasError && { bgcolor: 'error.50' }),
        },
      }}
    />
  );
}
