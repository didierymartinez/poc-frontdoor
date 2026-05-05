// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PartidaRow {
  no: string;
  codigo: string;
  movimiento: string;
  transaccion: string;
  valor: string;
  valorSecundario?: string;
  distrCostos?: boolean;
  ajusteDiferencia?: string;
  ajusteDiferenciaDetalle?: string;
  ajusteDiferenciaDistr?: boolean;
  ajusteTolerancia?: string;
  ajusteToleranciaDetalle?: string;
  ajusteToleranciaDistr?: boolean;
  estado?: string;
  estadoTipo?: 'disputa' | 'link' | 'anticipo' | 'devolucion';
  estadoExtra?: string;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

export const mockPartidas: PartidaRow[] = [
  { no: '01', codigo: '075859', movimiento: 'Comisión p...', transaccion: '20/02/2026', valor: '$300.000,00 COP', estado: 'En disputa', estadoTipo: 'disputa' },
  { no: '02', codigo: '566211', movimiento: 'Movimiento...', transaccion: '20/02/2026', valor: '$34,00 USD', valorSecundario: 'TRM $ 3.766,95', estado: 'OXPC-004 | OX...', estadoTipo: 'link' },
  { no: '03', codigo: '566211', movimiento: 'Compra res...', transaccion: '-', valor: '$34,00 USD', valorSecundario: 'TRM $ 3.766,95', distrCostos: true },
  { no: '04', codigo: '882661', movimiento: 'Pago medi...', transaccion: '20/02/2026', valor: '$300.000,00 COP', ajusteTolerancia: 'Mayor: $3.600.00,00', ajusteToleranciaDetalle: 'Obligación: $3.800,05', ajusteToleranciaDistr: true, estado: 'OXPC-004 | ...', estadoTipo: 'link', estadoExtra: '+2' },
  { no: '05', codigo: '927353', movimiento: 'Comisión p...', transaccion: '20/02/2026', valor: '$34,00 USD', valorSecundario: 'TRM $ 3.766,95', distrCostos: true, ajusteDiferencia: 'Gasto: + $35,60', ajusteDiferenciaDetalle: 'TRM ext.: $3.800,05', ajusteDiferenciaDistr: true, estado: 'OXAN-004', estadoTipo: 'anticipo' },
  { no: '06', codigo: '927353', movimiento: 'Comisión p...', transaccion: '20/02/2026', valor: '$34,00 USD', valorSecundario: 'TRM $ 3.766,95', distrCostos: true, ajusteDiferencia: 'Gasto: + $35,60', ajusteDiferenciaDetalle: 'TRM ext.: $3.800,05', ajusteDiferenciaDistr: true, ajusteTolerancia: 'Mayor: $3.600.00,00', ajusteToleranciaDetalle: 'Obligación: $3.800,05', ajusteToleranciaDistr: true, estado: 'OXAN-004', estadoTipo: 'anticipo' },
  { no: '07', codigo: '927353', movimiento: 'Cuota de m...', transaccion: '-', valor: '$300.000,00 COP', distrCostos: true },
  { no: '08', codigo: '817163', movimiento: 'Compra tie...', transaccion: '20/02/2026', valor: '$300.000,00 COP', estado: 'En disputa', estadoTipo: 'disputa' },
  { no: '09', codigo: '384595', movimiento: 'Compra In...', transaccion: '20/02/2026', valor: '$34,00 USD', valorSecundario: 'TRM $ 3.766,95', distrCostos: true, ajusteDiferencia: 'Gasto: + $35,60', ajusteDiferenciaDetalle: 'TRM ext.: $3.800,05', ajusteDiferenciaDistr: true, ajusteTolerancia: 'Mayor: $3.600.00,00', ajusteToleranciaDetalle: 'Obligación: $3.800,05', ajusteToleranciaDistr: true, estado: 'OXDE-004', estadoTipo: 'devolucion' },
];
