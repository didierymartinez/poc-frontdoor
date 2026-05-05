import type { ImpuestoOption } from './impuesto-options';

export const RETENCION_OPTIONS: ImpuestoOption[] = [
  { tipo: 'ReteICA', tarifas: [0.414, 0.69, 0.8, 1.104], defaultTarifa: 0.8 },
  { tipo: 'ReteIVA', tarifas: [15], defaultTarifa: 15 },
  { tipo: 'ReteFuente', tarifas: [1, 2.5, 3.5, 4, 6, 10, 11], defaultTarifa: 2.5 },
];
