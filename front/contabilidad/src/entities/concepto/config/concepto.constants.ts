import type { ConceptoRow } from '../model/concepto.types';
import type { DistribucionUnidad, DistribucionOption } from '@/shared/ui';

export const mockConceptos: ConceptoRow[] = [
  {
    id: 'mock-1', _key: 1, codigo: '123434', descripcion: 'Anticipo', cantidad: 70, valorUnitario: 14289.14, valor: 1000240, distribucion: 3,
    impuestos: [
      { tipo: 'IVA', base: 2000, tarifa: '19%', valor: 2000, distri: 3 },
      { tipo: 'ICA', base: 800, tarifa: '0,8%', valor: 54, distri: 1 },
    ],
    retenciones: [
      { tipo: 'ReteICA', base: 700, tarifa: '0,5%', valor: 133, distri: 4 },
      { tipo: 'ReteIVA', base: 360, tarifa: '0,8%', valor: 80, distri: 1 },
      { tipo: 'Rete fu...', base: 80, tarifa: '12%', valor: 54, distri: 2 },
    ],
  },
  {
    id: 'mock-2', _key: 2, codigo: '35456', descripcion: 'Compra', cantidad: 36, valorUnitario: 2222.22, valor: 80000, distribucion: 2,
    impuestos: [{ tipo: 'IVA', base: 1500, tarifa: '19%', valor: 285, distri: 2 }],
    retenciones: [{ tipo: 'ReteICA', base: 500, tarifa: '0,5%', valor: 25, distri: 1 }],
  },
  {
    id: 'mock-3', _key: 3, codigo: '90284', descripcion: 'Devolución', cantidad: 14, valorUnitario: 9335.71, valor: 130700, distribucion: 4,
    impuestos: [{ tipo: 'IVA', base: 3000, tarifa: '19%', valor: 570, distri: 4 }],
    retenciones: [{ tipo: 'ReteIVA', base: 200, tarifa: '0,8%', valor: 16, distri: 1 }],
  },
  {
    id: 'mock-4', _key: 4, codigo: '44567', descripcion: 'Anticipo', cantidad: 4, valorUnitario: 1450000, valor: 5800000, distribucion: 4,
    impuestos: [{ tipo: 'IVA', base: 10000, tarifa: '19%', valor: 1900, distri: 3 }],
    retenciones: [{ tipo: 'ReteICA', base: 4000, tarifa: '0,5%', valor: 200, distri: 2 }],
  },
];

export const mockDistribucionUnidades: DistribucionUnidad[] = [
  { id: '123456', nombre: '123456 - Arquitectura y mampostería', porcentaje: 25, valorAsignado: 1000240, locked: true },
  { id: '010102', nombre: '010102 - Compras nacionales', porcentaje: 25, valorAsignado: 1000240 },
  { id: '123456b', nombre: '123456 - Tech Innovations', porcentaje: 25, valorAsignado: 1000240 },
  { id: '654321', nombre: '654321 - Creative Solutions', porcentaje: 25, valorAsignado: 1000240 },
];

export const mockDistribucionOptions: DistribucionOption[] = [
  { label: '123456 - Arquitectura y mampostería', id: '123456' },
  { label: '010102 - Compras nacionales', id: '010102' },
  { label: '123456 - Tech Innovations', id: '123456b' },
  { label: '654321 - Creative Solutions', id: '654321' },
  { label: '789012 - Logística Global', id: '789012' },
];

export const mockTerceros = [
  { label: '123459 - Amazon S.A.S.', id: '123459' },
  { label: '987654 - Google LLC', id: '987654' },
  { label: '456789 - Microsoft Corp', id: '456789' },
];

export const mockArchivos = [
  { id: 1, nombre: 'Nombre_archivo.ext' },
  { id: 2, nombre: 'Nombre_archivo.ext' },
  { id: 3, nombre: 'Nombre_archivo.ext' },
];
