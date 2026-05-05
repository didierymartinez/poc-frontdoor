// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DistribucionCosto {
  centro: string;
  nombre: string;
  porcentaje: string;
  monto: string;
}

export interface ImpuestoDetalle {
  tipo: string;
  base: string;
  tarifa: string;
  valor: string;
  distribucion: DistribucionCosto[];
}

export interface RetencionDetalle {
  tipo: string;
  base: string;
  tarifa: string;
  valor: string;
  distribucion: DistribucionCosto[];
}

export interface ConceptoViewRow {
  id: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  valor: number;
  distribuciones: DistribucionCosto[];
  impuestosCount: number;
  retencionesCount: number;
  impuestosTotal: string;
  retencionesTotal: string;
  impuestos: ImpuestoDetalle[];
  retenciones: RetencionDetalle[];
}

export interface ResumenImpuesto {
  nombre: string;
  porcentaje: string;
  valor: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

export const mockConceptos: ConceptoViewRow[] = [
  {
    id: 1, codigo: '243435', descripcion: 'Anticipo', cantidad: 6, valor: 34600000,
    distribuciones: [
      { centro: '1833', nombre: 'Impo...', porcentaje: '50%', monto: '45.700,00' },
      { centro: '0928', nombre: '...', porcentaje: '40%', monto: '1.090,00' },
      { centro: '8277', nombre: '...', porcentaje: '10%', monto: '873,00' },
    ],
    impuestosCount: 2, retencionesCount: 3,
    impuestosTotal: '234.000,00', retencionesTotal: '580.600,00',
    impuestos: [
      { tipo: 'IVA', base: '2.000,00', tarifa: '19%', valor: '1.900,00', distribucion: [
        { centro: '1833', nombre: '...', porcentaje: '50%', monto: '1.500,00' },
        { centro: '0297', nombre: 'Di...', porcentaje: '30%', monto: '80,00' },
        { centro: '8370', nombre: 'Ge...', porcentaje: '20%', monto: '80,00' },
      ]},
      { tipo: 'ICA', base: '800,00', tarifa: '0,8%', valor: '24.000,00', distribucion: [
        { centro: '1833', nombre: '...', porcentaje: '50%', monto: '1.500,00' },
      ]},
    ],
    retenciones: [
      { tipo: 'ReteICA', base: '7.000,00', tarifa: '0,5%', valor: '54.930,00', distribucion: [
        { centro: '1833', nombre: '...', porcentaje: '100%', monto: '16,04' },
      ]},
      { tipo: 'ReteICA', base: '800360,00', tarifa: '0,8%', valor: '24.000,00', distribucion: [
        { centro: '1833', nombre: 'Ma...', porcentaje: '50%', monto: '4.500,00' },
        { centro: '7366', nombre: 'As...', porcentaje: '50%', monto: '4.500,00' },
      ]},
      { tipo: 'ReteICA', base: '78.000,00', tarifa: '12%', valor: '24.000,00', distribucion: [
        { centro: '1833', nombre: 'Im...', porcentaje: '100%', monto: '16,04' },
      ]},
    ],
  },
  {
    id: 2, codigo: '243435', descripcion: 'Compra ge...', cantidad: 6, valor: 14000000,
    distribuciones: [
      { centro: '0927', nombre: 'Gerencia prin...', porcentaje: '100%', monto: '+2.' },
    ],
    impuestosCount: 1, retencionesCount: 2,
    impuestosTotal: '120.000,00', retencionesTotal: '45.000,00',
    impuestos: [], retenciones: [],
  },
  {
    id: 3, codigo: '1234...', descripcion: 'Devolución', cantidad: 14, valor: 987500,
    distribuciones: [
      { centro: '7266', nombre: 'Implementación', porcentaje: '30%', monto: '+3.' },
    ],
    impuestosCount: 4, retencionesCount: 1,
    impuestosTotal: '98.000,00', retencionesTotal: '12.000,00',
    impuestos: [], retenciones: [],
  },
  {
    id: 4, codigo: '089785', descripcion: 'Devolución', cantidad: 14, valor: 8700000,
    distribuciones: [
      { centro: '7601', nombre: 'Eventos Promo', porcentaje: '100%', monto: '+1.' },
    ],
    impuestosCount: 3, retencionesCount: 3,
    impuestosTotal: '200.000,00', retencionesTotal: '150.000,00',
    impuestos: [], retenciones: [],
  },
];

export const mockResumenImpuestos: ResumenImpuesto[] = [
  { nombre: 'IVA', porcentaje: '19%', valor: 190 },
  { nombre: 'ICA', porcentaje: '0,8%', valor: 8 },
  { nombre: 'Consumo', porcentaje: '0,4%', valor: 4 },
  { nombre: 'Impuesto adicional', porcentaje: '0,2%', valor: 2 },
];

export const mockResumenRetenciones: ResumenImpuesto[] = [
  { nombre: 'ReteIVA', porcentaje: '3.2%', valor: 32 },
  { nombre: 'ReteICA', porcentaje: '1.5%', valor: 15 },
  { nombre: 'Retefuente', porcentaje: '2,5%', valor: 25 },
  { nombre: 'Retención adicional', porcentaje: '0,5%', valor: 5 },
];

// ---------------------------------------------------------------------------
// Re-export shared utility
// ---------------------------------------------------------------------------

export { formatCurrency } from '@/shared/lib';
