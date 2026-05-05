export interface ImpuestoOption {
  tipo: string;
  tarifas: number[];
  defaultTarifa: number;
}

export const IMPUESTO_OPTIONS: ImpuestoOption[] = [
  { tipo: 'IVA', tarifas: [19, 5, 0], defaultTarifa: 19 },
  { tipo: 'ICA', tarifas: [0.414, 0.69, 0.8, 1.104], defaultTarifa: 0.8 },
  { tipo: 'Consumo', tarifas: [4, 8, 16], defaultTarifa: 8 },
];
