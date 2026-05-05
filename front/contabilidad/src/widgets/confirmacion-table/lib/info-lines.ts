export interface InfoLine {
  label: string;
  value: string;
}

function fmtMonto(v?: number) {
  if (v == null) return '—';
  return `$${v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtFecha(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function comercioInfoLines(row: {
  id: string;
  terceroNombre: string;
  descripcion: string;
  valor: number;
  moneda: string;
  documentoNumero?: string | null;
  fechaRadicacion: string;
}): InfoLine[] {
  return [
    { label: 'Tercero', value: row.terceroNombre },
    { label: 'Descripción', value: row.descripcion || '—' },
    { label: 'No. Documento', value: row.documentoNumero || '—' },
    { label: 'Monto', value: `${fmtMonto(row.valor)} ${row.moneda}` },
    { label: 'Fecha radicación', value: fmtFecha(row.fechaRadicacion) },
  ];
}

export function extractoInfoLines(row: {
  id: string;
  terceroNombre: string;
  medioPago: string;
  valorTotal: number;
  moneda: string;
  periodoDesde?: string | null;
  periodoHasta?: string | null;
  fechaRadicacion: string;
}): InfoLine[] {
  return [
    { label: 'Entidad', value: row.terceroNombre },
    { label: 'Medio de pago', value: row.medioPago || '—' },
    { label: 'Periodo', value: `${fmtFecha(row.periodoDesde)} — ${fmtFecha(row.periodoHasta)}` },
    { label: 'Valor', value: `${fmtMonto(row.valorTotal)} ${row.moneda}` },
    { label: 'Fecha radicación', value: fmtFecha(row.fechaRadicacion) },
  ];
}
