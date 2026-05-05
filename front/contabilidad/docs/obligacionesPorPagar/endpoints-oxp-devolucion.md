# Endpoints Devolucion — Comandos y Consultas API

Comandos: puerto **8080** | Consultas: puerto **8090**

---

## Ciclo de vida de la Devolucion

```
Pendiente ──► Confirmada ──► Causada
```

La devolucion nace en estado **Pendiente** al radicarse. Al confirmarse, se aplica automaticamente sobre el agregado de origen (OXP Comercio, OXP Extracto o Anticipo). Al causarse, se registra el asiento contable.

### Tipos de origen

| Origen | Descripcion | Datos requeridos |
|--------|-------------|------------------|
| **Comercio** | Devolucion parcial/total de una OXP de Comercio. Incluye conceptos devueltos con desglose fiscal. Si el valor excede el saldo de la OXP, el excedente genera un Anticipo automaticamente. | `ConceptosDevueltos` |
| **Extracto** | Devolucion de cargos financieros de un extracto bancario. | `CargosDevueltos` |
| **Anticipo** | Reversa total de un anticipo vigente. El valor debe coincidir exactamente con el valor del anticipo. | `Reversa` |

---

## 1. Radicar devolucion (→ Pendiente)

| | |
|---|---|
| **POST** | `/Devolucion` |
| **Content-Type** | `multipart/form-data` |
| **Proposito** | Crea una devolucion en estado **Pendiente**. Valida que el agregado de origen exista y este en un estado valido. Opcionalmente adjunta un soporte (archivo). |
| **Disponible en** | Siempre (creacion) |

El body es `multipart/form-data` con dos partes:

| Parte | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `InformacionDevolucion` | JSON | Si | Datos de la devolucion |
| `Soporte` | File | No | Archivo de soporte (PDF, imagen, etc.) |

### Estructura de `InformacionDevolucion`

```json
{
  "origen": {
    "tipo": "Comercio",
    "oxpComercioId": "uuid-oxp-comercio",
    "oxpExtractoId": null,
    "cargoFinancieroIds": null,
    "anticipoId": null
  },
  "informacionTercero": {
    "nombre": "Proveedor ABC",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  },
  "descripcion": "Devolucion parcial por error en facturacion",
  "conceptosDevueltos": [
    {
      "id": "uuid",
      "codigo": "SRV-001",
      "descripcion": "Servicio de consultoria",
      "cantidad": 1,
      "valorBruto": { "valor": 500000, "moneda": "COP" },
      "clasificacionTributaria": "Gravado",
      "conceptoPago": "Servicios",
      "referenciaOrigen": "FAC-2026-001",
      "desgloseFiscal": {
        "impuestos": [
          { "tipo": "IVA", "base": { "valor": 500000, "moneda": "COP" }, "tarifa": 0.19, "valor": { "valor": 95000, "moneda": "COP" } }
        ],
        "retenciones": [
          { "tipo": "ReteFuente", "base": { "valor": 500000, "moneda": "COP" }, "tarifa": 0.11, "valor": { "valor": 55000, "moneda": "COP" } }
        ]
      }
    }
  ],
  "cargosDevueltos": null,
  "reversa": null
}
```

### Variante Extracto

```json
{
  "origen": {
    "tipo": "Extracto",
    "oxpExtractoId": "uuid-extracto",
    "cargoFinancieroIds": ["uuid-cargo-1", "uuid-cargo-2"]
  },
  "informacionTercero": {
    "nombre": "Bancolombia",
    "identificacion": { "tipo": "NIT", "numero": "890903938" }
  },
  "descripcion": "Devolucion de cargos financieros cobrados por error",
  "cargosDevueltos": [
    {
      "id": "uuid",
      "referenciaCargoFinanciero": "uuid-cargo-1",
      "descripcion": "Cuota de manejo cobrada doble",
      "valor": { "valor": 15000, "moneda": "COP" }
    }
  ]
}
```

### Variante Anticipo

```json
{
  "origen": {
    "tipo": "Anticipo",
    "anticipoId": "uuid-anticipo"
  },
  "informacionTercero": {
    "nombre": "Proveedor XYZ",
    "identificacion": { "tipo": "NIT", "numero": "800456789" }
  },
  "descripcion": "Reversa total de anticipo por cancelacion de contrato",
  "reversa": {
    "id": "uuid",
    "motivoReversa": "Cancelacion de contrato",
    "descripcion": "Se reversa la totalidad del anticipo",
    "valor": { "valor": 2000000, "moneda": "COP" }
  }
}
```

**Respuesta:** `201 Created` con header `Location: Devolucion/{devolucionId}`

### Validaciones por tipo de origen

| Origen | Validaciones |
|--------|-------------|
| **Comercio** | OXP Comercio debe estar en estado Confirmada, Causada o Pagada. El tercero debe coincidir. El acumulado de devoluciones no puede exceder el valor neto de la OXP [I17]. |
| **Extracto** | OXP Extracto debe estar en estado Confirmado, Causado o Pagado. El valor de la devolucion no puede exceder el saldo restante del extracto. |
| **Anticipo** | Anticipo debe estar en estado Vigente. No debe tener pagos aplicados ni regularizaciones. El valor de la reversa debe coincidir exactamente con el valor total del anticipo. El tercero debe coincidir. |

---

## 2. Confirmar devolucion (Pendiente → Confirmada)

| | |
|---|---|
| **POST** | `/Devolucion/{devolucionId}/Confirmar` |
| **Proposito** | Confirma la devolucion y ejecuta la logica de aplicacion sobre el agregado de origen. Sin body. |
| **Disponible en** | Solo Pendiente |

**Efectos segun tipo de origen:**

| Origen | Efecto al confirmar |
|--------|---------------------|
| **Comercio** | Reduce el saldo de la OXP de Comercio. Si el valor de la devolucion excede el saldo restante, el excedente genera un **Anticipo** automaticamente. Si la OXP queda saldada, pasa a Pagada. |
| **Extracto** | Aplica la devolucion sobre los cargos financieros referenciados del extracto. |
| **Anticipo** | Reversa completamente el anticipo (pasa a estado Descartado). |

**Respuesta:** `200 OK`

```json
// Body: Guid? — ID del anticipo generado (solo para Comercio cuando hay excedente)
"uuid-anticipo-generado"
// o null si no se genero anticipo
```

---

## 3. Causar devolucion (Confirmada → Causada)

| | |
|---|---|
| **POST** | `/Devolucion/{devolucionId}/Causar` |
| **Proposito** | Registra la causacion contable de la devolucion con el numero de asiento y fecha de causacion. |
| **Disponible en** | Solo Confirmada |

```json
{
  "numeroAsientoContable": "ASC-DEV-2026-001",
  "fechaCausacion": "2026-04-01T00:00:00Z"
}
```

**Respuesta:** `200 OK`

---

## 4. Distribucion de costos (solo origen Comercio)

La distribucion permite definir como se reparte el valor de cada concepto devuelto y sus tributos entre unidades organizacionales. Solo disponible cuando la devolucion esta en estado **Pendiente** y su origen es **Comercio**.

### 4.1 Distribucion por concepto devuelto

| | |
|---|---|
| **POST** | `/Devolucion/{devolucionId}/ConfigurarInstruccionDistribucionConcepto` |
| **Proposito** | Define la distribucion de un concepto devuelto entre unidades organizacionales. La suma de porcentajes debe ser 100% [I2]. Semantica upsert: si ya existe instruccion para el concepto, se reemplaza. |
| **Disponible en** | Solo Pendiente, solo origen Comercio |

```json
{
  "conceptoDevueltoId": "uuid-concepto",
  "destinos": [
    { "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 },
    { "unidadOrganizacional": "ADM-001", "porcentaje": 0.4 }
  ]
}
```

**Respuesta:** `200 OK`

### 4.2 Distribucion por tributo de concepto devuelto

| | |
|---|---|
| **POST** | `/Devolucion/{devolucionId}/ConfigurarInstruccionDistribucionTributo` |
| **Proposito** | Define la distribucion de un tributo especifico (impuesto o retencion) dentro de un concepto devuelto. Si no se configura explicitamente, hereda la distribucion del concepto padre [I10]. Semantica upsert. |
| **Disponible en** | Solo Pendiente, solo origen Comercio |

```json
{
  "conceptoDevueltoId": "uuid-concepto",
  "tipoTributo": "IVA",
  "destinos": [
    { "unidadOrganizacional": "FIN-001", "porcentaje": 1.0 }
  ]
}
```

**Respuesta:** `200 OK`

---

## 5. Consultas (API Consultas — puerto 8090)

### 5.1 Listar comercios disponibles para devolucion

| | |
|---|---|
| **GET** | `/Devolucion/ComerciosDisponibles` |
| **Proposito** | Lista OXP de Comercio elegibles para registrar una devolucion. Filtra por estado (Confirmada, Causada, Pagada) y por margen disponible (`totalDevuelto < valor`) [R31]. |

Respuesta:
```json
[
  {
    "id": "uuid",
    "estado": "Confirmada",
    "terceroNombre": "Proveedor ABC",
    "terceroIdentificacion": "900123456",
    "terceroTipoIdentificacion": "NIT",
    "descripcion": "Compra de licencias",
    "valor": 1000000,
    "moneda": "COP",
    "totalPagado": 0,
    "totalDevuelto": 200000,
    "saldoPorPagar": 1000000,
    "fechaRadicacion": "2026-03-15T00:00:00Z",
    "fechaConfirmacion": "2026-03-20T00:00:00Z"
  }
]
```

### 5.2 Listar extractos disponibles para devolucion

| | |
|---|---|
| **GET** | `/Devolucion/ExtractosDisponibles` |
| **Proposito** | Lista extractos elegibles para registrar una devolucion de cargos financieros. Filtra por estado (Confirmado, Causada, Pagada) y por saldo pendiente (`saldoPorPagar > 0`) [R33]. |

Respuesta:
```json
[
  {
    "id": "uuid",
    "estado": "Confirmado",
    "terceroNombre": "Bancolombia",
    "terceroIdentificacion": "890903938",
    "terceroTipoIdentificacion": "NIT",
    "periodoDesde": "2026-03-01",
    "periodoHasta": "2026-03-31",
    "valorTotal": 1200000,
    "moneda": "COP",
    "totalPagado": 0,
    "saldoPorPagar": 1200000,
    "fechaRadicacion": "2026-03-15T00:00:00Z"
  }
]
```

### 5.3 Listar anticipos disponibles para devolucion (reversa)

| | |
|---|---|
| **GET** | `/Devolucion/AnticiposDisponibles` |
| **Proposito** | Lista anticipos elegibles para reversa total via devolucion. Filtra por estado Vigente y sin cruces previos (`totalPagado == 0` y `totalRegularizado == 0`) [R28, R34]. |

Respuesta:
```json
[
  {
    "id": "uuid",
    "estado": "Vigente",
    "terceroNombre": "Proveedor XYZ",
    "terceroIdentificacion": "800456789",
    "terceroTipoIdentificacion": "NIT",
    "valor": 2000000,
    "moneda": "COP",
    "medioPago": "Credito - 4111111111111111 (Bancolombia)",
    "justificacion": "Anticipo por contrato",
    "totalRegularizado": 0,
    "saldoPorRegularizar": 2000000,
    "totalPagado": 0,
    "saldoPorPagar": 2000000,
    "fechaRegistro": "2026-04-01T00:00:00Z"
  }
]
```

### 5.4 Listar devoluciones pendientes

| | |
|---|---|
| **GET** | `/Devolucion/Pendientes` |
| **Proposito** | Lista devoluciones en estado Pendiente. Aun no confirmadas ni aplicadas sobre el origen. |

Respuesta:
```json
[
  {
    "id": "uuid",
    "estado": "Pendiente",
    "origen": "Comercio",
    "terceroNombre": "Proveedor ABC",
    "terceroIdentificacion": "900123456",
    "terceroTipoIdentificacion": "NIT",
    "descripcion": "Devolucion parcial por error en facturacion",
    "valor": 500000,
    "moneda": "COP",
    "fechaRadicacion": "2026-04-01T00:00:00Z",
    "fechaConfirmacion": null,
    "fechaCausacion": null
  }
]
```

### 5.5 Listar devoluciones confirmadas

| | |
|---|---|
| **GET** | `/Devolucion/Confirmadas` |
| **Proposito** | Lista devoluciones en estado Confirmada. Ya aplicadas sobre el origen, pendientes de causacion contable. |

### 5.6 Listar devoluciones causadas

| | |
|---|---|
| **GET** | `/Devolucion/Causadas` |
| **Proposito** | Lista devoluciones en estado Causada. Con asiento contable registrado. |

### 5.7 Listar todas las devoluciones

| | |
|---|---|
| **GET** | `/Devolucion/Todas` |
| **Proposito** | Lista todas las devoluciones sin filtro de estado. |

### 5.8 Consultar devolucion por ID

| | |
|---|---|
| **GET** | `/Devolucion/{id}` |
| **Proposito** | Retorna el detalle completo de la devolucion: estado, origen, tercero, valor, conceptos devueltos (Comercio), cargos devueltos (Extracto), reversa (Anticipo), instrucciones de distribucion, soporte, documento, TRM. Incluye archivo de soporte si existe. |
| **Respuesta 404** | Si la devolucion no existe. |

Respuesta:
```json
{
  "devolucion": {
    "id": "uuid",
    "estado": "Pendiente",
    "origen": {
      "$type": "Comercio",
      "oxpComercioId": "uuid-oxp-comercio"
    },
    "informacionTercero": {
      "nombre": "Proveedor ABC",
      "identificacion": { "tipo": "NIT", "numero": "900123456" }
    },
    "descripcion": "Devolucion parcial por error en facturacion",
    "valorMonetario": { "valor": 500000, "moneda": "COP" },
    "soporte": { "container": "soportesdevoluciones", "blobName": "uuid-archivo" },
    "documento": null,
    "trm": null,
    "conceptosDevueltos": [
      {
        "id": "uuid",
        "codigo": "SRV-001",
        "descripcion": "Servicio de consultoria",
        "cantidad": 1,
        "valorBruto": { "valor": 500000, "moneda": "COP" },
        "clasificacionTributaria": "Gravado",
        "conceptoPago": "Servicios",
        "referenciaOrigen": "FAC-2026-001",
        "desgloseFiscal": {
          "impuestos": [
            { "tipo": "IVA", "base": { "valor": 500000, "moneda": "COP" }, "tarifa": 0.19, "valor": { "valor": 95000, "moneda": "COP" } }
          ],
          "retenciones": [
            { "tipo": "ReteFuente", "base": { "valor": 500000, "moneda": "COP" }, "tarifa": 0.11, "valor": { "valor": 55000, "moneda": "COP" } }
          ]
        }
      }
    ],
    "cargosDevueltos": [],
    "reversa": null,
    "instruccionesDistribucion": [
      {
        "tipo": "ConceptoDevuelto",
        "conceptoDevueltoId": "uuid",
        "tipoTributo": null,
        "destinos": [
          { "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 },
          { "unidadOrganizacional": "ADM-001", "porcentaje": 0.4 }
        ]
      }
    ],
    "historialRechazos": [
      {
        "motivos": ["No se puede confirmar sin conceptos."],
        "fecha": "2026-04-10T12:00:00Z",
        "estado": "Pendiente"
      }
    ]
  },
  "archivo": { "nombre": "soporte.pdf", "tipo": "application/pdf", "base64": "..." },
  "fuenteTipo": "DocumentIntelligence",
  "ocr": "..."
}
```

---

## 6. Respuestas de error

Formato [RFC 7807 ProblemDetails](https://datatracker.ietf.org/doc/html/rfc7807):

| Codigo | Significado | Cuando |
|--------|-------------|--------|
| **400** | Datos invalidos | Campos faltantes, formatos incorrectos, tipo de origen no reconocido |
| **404** | No encontrado | ID de devolucion, OXP, extracto o anticipo no existe |
| **422** | Regla de negocio | Estado incorrecto, tercero no coincide, valor excede limite, anticipo con pagos aplicados |

---

## 7. Flujos tipicos

### 7a. Devolucion de OXP de Comercio (parcial)

```
1. GET  /Devolucion/ComerciosDisponibles                           ← Listar comercios elegibles (8090)
2. POST /Devolucion                                                ← Radicar con origen Comercio + conceptos devueltos (8080)
   → 201 Created, Location: Devolucion/{id}
3. POST /Devolucion/{id}/ConfigurarInstruccionDistribucionConcepto ← Distribuir cada concepto (opcional)
4. POST /Devolucion/{id}/ConfigurarInstruccionDistribucionTributo  ← Distribuir tributos (opcional, hereda de concepto si no se configura)
5. POST /Devolucion/{id}/Confirmar                                 ← Confirmar y aplicar sobre OXP de Comercio
   → 200 OK, body: null (sin excedente) o "uuid-anticipo" (con excedente)
6. POST /Devolucion/{id}/Causar                                    ← Registrar causacion contable
```

### 7b. Devolucion de cargos financieros de extracto

```
1. GET  /Devolucion/ExtractosDisponibles           ← Listar extractos elegibles (8090)
2. POST /Devolucion                                ← Radicar con origen Extracto + cargos devueltos (8080)
   → 201 Created
3. POST /Devolucion/{id}/Confirmar                 ← Confirmar y aplicar sobre extracto
4. POST /Devolucion/{id}/Causar                    ← Registrar causacion contable
```

### 7c. Reversa total de anticipo

```
1. GET  /Devolucion/AnticiposDisponibles           ← Listar anticipos elegibles (8090)
2. POST /Devolucion                                ← Radicar con origen Anticipo + reversa (8080)
   → 201 Created
3. POST /Devolucion/{id}/Confirmar                 ← Confirmar y reversar anticipo
4. POST /Devolucion/{id}/Causar                    ← Registrar causacion contable
```

---

## 8. Modelo de datos de referencia

### Dinero

```json
{ "valor": 500000, "moneda": "COP" }
```

### InformacionTercero

```json
{
  "nombre": "Proveedor ABC",
  "identificacion": { "tipo": "NIT", "numero": "900123456" }
}
```

### DestinoNegocio

```json
{ "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 }
```

### DesgloseFiscal

```json
{
  "impuestos": [
    { "tipo": "IVA", "base": { "valor": 500000, "moneda": "COP" }, "tarifa": 0.19, "valor": { "valor": 95000, "moneda": "COP" } }
  ],
  "retenciones": [
    { "tipo": "ReteFuente", "base": { "valor": 500000, "moneda": "COP" }, "tarifa": 0.11, "valor": { "valor": 55000, "moneda": "COP" } }
  ]
}
```
