// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PagoRow {
  tipo: string;
  tipoColor?: 'default' | 'error';
  referencia: string;
  fecha: string;
  valor: string;
}

export interface ObligacionRow {
  tipo: string;
  tipoColor?: 'default' | 'error';
  referencia: string;
  fecha: string;
  valor: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

export const mockPagos: PagoRow[] = [
  { tipo: 'Extracto', referencia: 'EXT-94583563821 / Partida 5', fecha: '15/01/2026', valor: '$3.000.000,00' },
  { tipo: 'Pago directo', referencia: 'CE-90943632', fecha: '15/01/2026', valor: '$ 500.000,00' },
  { tipo: 'Devolución', referencia: 'DEV-923474', fecha: '15/01/2026', valor: '$ 500.000,00' },
  { tipo: 'Reversado', tipoColor: 'error', referencia: 'DEV-923474', fecha: '15/01/2026', valor: '$ 500.000,00' },
];

export const mockObligaciones: ObligacionRow[] = [
  { tipo: 'Regularización', referencia: 'OXP-COM-000981', fecha: '20/01/2026', valor: '$3.500.000,00' },
  { tipo: 'Reversado', tipoColor: 'error', referencia: 'DEV-923474', fecha: '15/01/2026', valor: '$ 500.000,00' },
];
