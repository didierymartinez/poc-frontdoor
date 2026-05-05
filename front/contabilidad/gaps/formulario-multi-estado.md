# Gaps pendientes — Formulario multi-estado

## Gap #2: Endpoints granulares faltantes en `sendGranularUpdates`

**Archivo**: `src/pages/radicacion/hooks/useRadicacionCompra.ts` — funcion `sendGranularUpdates()`

Actualmente el dirty tracking solo compara y envia 4 campos: Valor, Tercero, Conceptos, MedioPago.
Faltan los siguientes endpoints granulares que el backend soporta:

| Campo | Mutation existente | Endpoint | Estado |
|---|---|---|---|
| TRM | `useEditarTrm` | `POST /ObligacionPorPagar/{id}/TasaRepresentativaMercado` | No se llama |
| Soporte presupuestal | `useEditarSoportePresupuestal` | `POST /ObligacionPorPagar/{id}/SoportePresupuestal` | No se llama |
| Distribucion | `useEditarDistribucion` | `POST /ObligacionPorPagar/{id}/ConfigurarInstruccionDistribucion` | No se llama |

### Que hacer

1. Agregar al snapshot los valores originales de TRM, soporte presupuestal y distribucion
2. Agregar comparacion en `sendGranularUpdates()` para cada campo
3. Llamar el endpoint correspondiente solo si cambio

**Nota**: Los campos de TRM, soporte presupuestal y distribucion aun no estan completamente conectados al formulario (los selectores existen pero no todos sincronizan al store). Implementar cuando se conecte la UI de estos campos.

---

## Gap #3: Conceptos hash no detecta cambios en desglose fiscal

**Archivo**: `src/pages/radicacion/hooks/useRadicacionCompra.ts` — snapshot y `sendGranularUpdates()`

El hash de conceptos actualmente solo compara: `{ id, descripcion, cantidad, valor }`.

**No detecta cambios en**:
- `desgloseFiscal.impuestos` (tipo, base, tarifa, valor de cada impuesto)
- `desgloseFiscal.retenciones` (tipo, base, tarifa, valor de cada retencion)
- `destinacionCostos`

### Que hacer

Ampliar el hash para incluir el desglose fiscal:

```ts
// Actual
JSON.stringify(conceptos.map(c => ({ id, descripcion, cantidad, valor })))

// Propuesto
JSON.stringify(conceptos.map(c => ({
  id: c.id,
  descripcion: c.descripcion,
  cantidad: c.cantidad,
  valor: c.valor,
  impuestos: c.impuestos.map(i => ({ tipo: i.tipo, base: i.base, tarifa: i.tarifa, valor: i.valor })),
  retenciones: c.retenciones.map(r => ({ tipo: r.tipo, base: r.base, tarifa: r.tarifa, valor: r.valor })),
})))
```

**Impacto**: Si un usuario cambia solo un impuesto/retencion en un concepto sin cambiar cantidad ni valor, el cambio no se enviaria al backend. Baja probabilidad pero posible.
