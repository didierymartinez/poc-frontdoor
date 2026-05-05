import { screen } from '@testing-library/react';
import { expect, test, describe, beforeEach } from 'vitest';
import { renderWithProviders } from '@/shared/lib/testing/test-utils';
import type { Comercio } from '@/entities/borrador';
import { useRegistroCompraStore } from '../model/registro-compra.store';
import { FormularioComercio } from './FormularioComercio';

// ---------------------------------------------------------------------------
// Mock data — basado en docs/endpoints-oxp-comercio.md y modelo de dominio
// ---------------------------------------------------------------------------

/** Comercio con todos los campos que el backend envía al front via el adapter */
const COMERCIO_MOCK: Comercio = {
  $tipo: 'comercio',
  referencia: {
    numero: { valor: 'FAC-001' },
    fechaDocumento: { valor: '2026-03-15' },
  },
  acreedor: {
    nombre: { valor: 'Amazon.com' },
    identificacion: { valor: '900123456' },
    tipoIdentificacion: 'NIT',
  },
  fechaPago: undefined,
  moneda: 'COP',
  medioPago: 'Credito',
  descripcion: 'Compra de licencias',
  conceptos: [
    {
      id: 'c1',
      descripcion: 'Servicio de consultoria',
      cantidad: 1,
      valorUnitario: 500000,
      valorTotal: 500000,
      impuestos: [],
    },
  ],
  total: {
    subtotal: { valor: 1500000 },
    totalAPagar: { valor: 1500000 },
  },
};

const noop = () => {};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  useRegistroCompraStore.getState().reset();
});

// ---------------------------------------------------------------------------
// Tests de renderizado — campos del modelo de dominio
// ---------------------------------------------------------------------------

describe('FormularioComercio — Renderizado segun modelo de dominio', () => {
  test('Si se renderiza con datos de comercio, debe mostrar el medio de pago seleccionado', async () => {
    // Arrange & Act
    renderWithProviders(
      <FormularioComercio data={COMERCIO_MOCK} onVerSugerida={noop} />,
    );

    // Assert
    const medioPagoField = await screen.findByTestId('combobox-medio-pago');
    expect(medioPagoField).toHaveTextContent('Crédito');
  });

  test('Si se renderiza con datos de comercio, debe mostrar el tercero con nombre e identificacion', async () => {
    // Arrange & Act
    renderWithProviders(
      <FormularioComercio data={COMERCIO_MOCK} onVerSugerida={noop} />,
    );

    // Assert
    expect(await screen.findByDisplayValue('Amazon.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('900123456')).toBeInTheDocument();
  });

  test('Si se renderiza con datos de comercio, debe mostrar la moneda seleccionada', async () => {
    // Arrange & Act
    renderWithProviders(
      <FormularioComercio data={COMERCIO_MOCK} onVerSugerida={noop} />,
    );

    // Assert
    const monedaInputs = await screen.findAllByDisplayValue('COP');
    expect(monedaInputs.length).toBeGreaterThanOrEqual(1);
  });

  test('Si se renderiza con datos de comercio, debe mostrar el numero de soporte', async () => {
    // Arrange & Act
    renderWithProviders(
      <FormularioComercio data={COMERCIO_MOCK} onVerSugerida={noop} />,
    );

    // Assert
    expect(await screen.findByDisplayValue('FAC-001')).toBeInTheDocument();
  });
});
