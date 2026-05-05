import { expect, test, describe } from 'vitest';
import type { FormularioComercioData } from '../model/registro-compra.store';
import type { ConceptoRow } from '@/entities/concepto';
import type { AgregadoOxpComercio } from '@/entities/borrador';
import { validarFormulario } from '@/features/confirmar-borrador';
import { getFormValues, buildBody } from './compra-body-builder';

// ---------------------------------------------------------------------------
// Fixtures — basados en docs/endpoints-oxp-comercio.md
// ---------------------------------------------------------------------------

/** FormularioComercioData completo como lo deja el store despues de llenar el formulario */
const FORMULARIO_COMPLETO: FormularioComercioData = {
  medioPago: 'Credito',
  tarjeta: 'visa-default',
  fechaTransaccion: '15/03/2026',
  tipoDocumento: 'NIT',
  numeroDocumento: '900123456',
  terceroLabel: 'Amazon.com',
  moneda: 'COP',
  monto: 1500000,
  soporte: 'FAC-001',
  descripcion: 'Compra de licencias',
};

/** ConceptoRow completo como lo deja la tabla de conceptos */
const CONCEPTO_COMPLETO: ConceptoRow = {
  id: 'c1',
  _key: 1,
  codigo: 'SRV-001',
  descripcion: 'Servicio de consultoria',
  cantidad: 1,
  valorUnitario: 500000,
  valor: 500000,
  distribucion: 0,
  impuestos: [{ tipo: 'IVA', base: 500000, tarifa: '19%', valor: 95000, distri: 0 }],
  retenciones: [{ tipo: 'ReteFuente', base: 500000, tarifa: '11%', valor: 55000, distri: 0 }],
};

/** AgregadoOxpComercio del backend — estado borrador */
const BORRADOR_MOCK: AgregadoOxpComercio = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  estado: 0,
  informacionTercero: { nombre: 'Amazon.com', identificacion: { tipo: 'NIT', numero: '900123456' } },
  descripcion: 'Compra de licencias',
  valorMonetario: { moneda: 1, valor: 1500000 },
  conceptos: [
    {
      id: 'c1',
      codigo: 'SRV-001',
      descripcion: 'Servicio de consultoria',
      cantidad: 1,
      dinero: { moneda: 1, valor: 500000 },
      tipo: 0,
      clasificacionTributaria: 'Gravado',
      conceptoPago: 'Servicios',
      referenciaOrigen: 'FAC-2026-001',
      destinacionCostos: [],
    },
  ],
  medioPago: { tipo: 0, numero: '4111111111111111', entidadBancaria: 'Bancolombia' },
  documento: { numero: 'FAC-001', tipo: 0, fecha: '2026-03-15T00:00:00' },
  instruccionDistribucion: [],
  archivosVinculados: [],
  bloqueadaPorRegularizacion: false,
  pagosAplicados: [],
};

// ---------------------------------------------------------------------------
// getFormValues — conversión store → FormValues para validación
// ---------------------------------------------------------------------------

describe('getFormValues — convierte store a FormValues para validación', () => {
  test('Si el formulario esta completo con conceptos, debe retornar todos los campos definidos', () => {
    // Act
    const values = getFormValues(FORMULARIO_COMPLETO, [CONCEPTO_COMPLETO]);

    // Assert
    expect(values.medioPago).toBe('Credito');
    expect(values.tercero).toBe('Amazon.com');
    expect(values.moneda).toBe('COP');
    expect(values.monto).toBe('1500000');
    expect(values.fechaTransaccion).toBe('15/03/2026');
    expect(values.descripcion).toBe('Compra de licencias');
    expect(values.conceptosCount).toBe(1);
    expect(values.conceptos).toHaveLength(1);
    expect(values.conceptos![0].descripcion).toBe('Servicio de consultoria');
    expect(values.conceptos![0].cantidad).toBe(1);
    expect(values.conceptos![0].valor).toBe(500000);
  });

  test('Si el formulario esta completo, debe pasar validación sin errores', () => {
    // Arrange
    const values = getFormValues(FORMULARIO_COMPLETO, [CONCEPTO_COMPLETO]);

    // Act
    const errors = validarFormulario(1, values);

    // Assert
    expect(errors).toEqual([]);
  });

  test('Si el monto es 0 en el store, debe marcar monto como campo faltante', () => {
    // Arrange — monto=0 es falsy, getFormValues lo convierte a undefined
    const formulario = { ...FORMULARIO_COMPLETO, monto: 0 };
    const values = getFormValues(formulario, [CONCEPTO_COMPLETO]);

    // Act
    const errors = validarFormulario(1, values);

    // Assert — monto=0 se pierde en la conversión (|| undefined)
    expect(errors.find((e) => e.campo === 'monto')).toBeDefined();
  });

  test('Si medioPago esta vacio en el store, debe marcar medioPago como faltante', () => {
    // Arrange
    const formulario = { ...FORMULARIO_COMPLETO, medioPago: '' };
    const values = getFormValues(formulario, [CONCEPTO_COMPLETO]);

    // Act
    const errors = validarFormulario(1, values);

    // Assert
    expect(errors.find((e) => e.campo === 'medioPago')).toBeDefined();
  });

  test('Si terceroLabel esta vacio en el store, debe marcar tercero como faltante', () => {
    // Arrange
    const formulario = { ...FORMULARIO_COMPLETO, terceroLabel: '' };
    const values = getFormValues(formulario, [CONCEPTO_COMPLETO]);

    // Act
    const errors = validarFormulario(1, values);

    // Assert
    expect(errors.find((e) => e.campo === 'tercero')).toBeDefined();
  });

  test('Si no hay conceptos en el store, debe marcar conceptos como faltante', () => {
    // Arrange
    const values = getFormValues(FORMULARIO_COMPLETO, []);

    // Act
    const errors = validarFormulario(1, values);

    // Assert
    expect(errors.find((e) => e.campo === 'conceptos')).toBeDefined();
  });

  test('Si hay un concepto sin descripcion en el store, debe reportar concepto incompleto', () => {
    // Arrange
    const conceptoIncompleto: ConceptoRow = { ...CONCEPTO_COMPLETO, descripcion: '' };
    const values = getFormValues(FORMULARIO_COMPLETO, [conceptoIncompleto]);

    // Act
    const errors = validarFormulario(1, values);

    // Assert
    expect(errors.find((e) => e.campo === 'conceptos')).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// buildBody — construye el payload para POST /CompletarBorrador
// ---------------------------------------------------------------------------

describe('buildBody — payload para CompletarBorrador segun docs/endpoints-oxp-comercio.md', () => {
  test('Si se construye con formulario completo, debe tener la estructura del endpoint', () => {
    // Act
    const body = buildBody(BORRADOR_MOCK, FORMULARIO_COMPLETO, [CONCEPTO_COMPLETO]);

    // Assert — estructura segun docs/endpoints-oxp-comercio.md
    // valor
    expect(body.valor).toEqual({ moneda: 1, valor: 1500000 });

    // informacionTercero
    expect(body.informacionTercero.nombre).toBe('Amazon.com');
    expect(body.informacionTercero.identificacion.tipo).toBe('NIT');
    expect(body.informacionTercero.identificacion.numero).toBe('900123456');

    // descripcion
    expect(body.descripcion).toBe('Compra de licencias');

    // medioPago (Credito → tipo 0)
    expect(body.medioPago.tipo).toBe(0);
    expect(body.medioPago.numero).toBe('4111111111111111');
    expect(body.medioPago.entidadBancaria).toBe('Bancolombia');

    // documento
    expect(body.documento.numero).toBe('FAC-001');
    expect(body.documento.fecha).toBe('2026-03-15T00:00:00');

    // conceptos
    expect(body.conceptos).toHaveLength(1);
    expect(body.conceptos[0].id).toBe('c1');
    expect(body.conceptos[0].codigo).toBe('SRV-001');
    expect(body.conceptos[0].descripcion).toBe('Servicio de consultoria');
    expect(body.conceptos[0].cantidad).toBe(1);
    expect(body.conceptos[0].dinero).toEqual({ moneda: 1, valor: 500000 });
  });

  test('Si el concepto tiene impuestos y retenciones, debe incluir desgloseFiscal en el payload', () => {
    // Act
    const body = buildBody(BORRADOR_MOCK, FORMULARIO_COMPLETO, [CONCEPTO_COMPLETO]);

    // Assert — desgloseFiscal segun docs/endpoints-oxp-comercio.md
    const fiscal = body.conceptos[0].desgloseFiscal;
    expect(fiscal.impuestos).toHaveLength(1);
    expect(fiscal.impuestos[0].tipo).toBe('IVA');
    expect(fiscal.impuestos[0].tarifa).toBe(19);
    expect(fiscal.impuestos[0].valor).toEqual({ moneda: 1, valor: 95000 });

    expect(fiscal.retenciones).toHaveLength(1);
    expect(fiscal.retenciones[0].tipo).toBe('ReteFuente');
    expect(fiscal.retenciones[0].tarifa).toBe(11);
    expect(fiscal.retenciones[0].valor).toEqual({ moneda: 1, valor: 55000 });
  });

  test('Si medioPago es Debito, debe mapear tipo a 1 en el payload', () => {
    // Arrange
    const formularioDebito = { ...FORMULARIO_COMPLETO, medioPago: 'Debito' };

    // Act
    const body = buildBody(BORRADOR_MOCK, formularioDebito, [CONCEPTO_COMPLETO]);

    // Assert
    expect(body.medioPago.tipo).toBe(1);
  });

  test('Si el formulario tiene valores vacios, debe usar los valores del borrador como fallback', () => {
    // Arrange — formulario parcialmente vacío
    const formularioVacio: FormularioComercioData = {
      medioPago: '',
      tarjeta: '',
      fechaTransaccion: '',
      tipoDocumento: '',
      numeroDocumento: '',
      terceroLabel: '',
      moneda: '',
      monto: 0,
      soporte: '',
      descripcion: '',
    };

    // Act
    const body = buildBody(BORRADOR_MOCK, formularioVacio, []);

    // Assert — debe usar los valores del borrador original
    expect(body.informacionTercero.nombre).toBe('Amazon.com');
    expect(body.informacionTercero.identificacion.tipo).toBe('NIT');
    expect(body.informacionTercero.identificacion.numero).toBe('900123456');
    expect(body.descripcion).toBe('Compra de licencias');
    expect(body.valor.valor).toBe(1500000);
    expect(body.documento.numero).toBe('FAC-001');
    expect(body.documento.fecha).toBe('2026-03-15T00:00:00');
  });
});
