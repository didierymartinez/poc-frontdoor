# Endpoints Anticipo — Comandos y Consultas API

Comandos: puerto **8080** | Consultas: puerto **8090**

---

## Ciclo de vida del Anticipo

```
Borrador ──► Vigente ──► Pagado ──► Cerrado
               │            │
               │            └──► Cerrado (si regularizado)
               │
               ├──► Regularizado ──► Cerrado (si pagado)
               │
               └──► Reversado (terminal, via Devolucion)

Borrador ──► Descartado (terminal)
```

Un anticipo es un pago adelantado a un proveedor que debe **regularizarse** (cruzarse contra OXP de Comercio) y **pagarse** (via extracto, pago directo o devolucion). Cuando ambos saldos llegan a cero, el anticipo pasa a **Cerrado**.

### Estados

| Estado | Descripcion |
|--------|-------------|
| **Borrador** | Creado via pipeline de entrada. Datos incompletos, pendiente de formalizar. |
| **Vigente** | Datos completos. Disponible para regularizacion y pago. |
| **Pagado** | Saldo por pagar = 0. Aun puede tener saldo por regularizar. |
| **Regularizado** | Saldo por regularizar = 0. Aun puede tener saldo por pagar. |
| **Cerrado** | Ambos saldos en cero. Estado terminal. |
| **Reversado** | Anulado completamente via devolucion. Estado terminal. |
| **Descartado** | Borrador descartado con motivo. Estado terminal. |

### Dos saldos independientes

| Saldo | Calculo | Se reduce con |
|-------|---------|---------------|
| **SaldoPorRegularizar** | ValorMonetario − ΣRegularizaciones | Regularizacion parcial/total contra OXP Comercio |
| **SaldoPorPagar** | ValorTotal − ΣPagos | Pago directo, vinculacion a partida de extracto, devolucion |

---

## 1. Registrar anticipo (→ Vigente)

| | |
|---|---|
| **POST** | `/Anticipo` |
| **Content-Type** | `multipart/form-data` |
| **Proposito** | Registra un anticipo con todos los datos completos. Nace en estado **Vigente**. Programa automaticamente una alerta de plazo vencido (por defecto 30 dias). Opcionalmente adjunta un archivo de soporte. |
| **Disponible en** | Siempre (creacion) |

El body es `multipart/form-data` con dos partes:

| Parte | Tipo | Requerido | Descripcion |
|-------|------|-----------|-------------|
| `InformacionAnticipo` | JSON | Si | Datos del anticipo |
| `Soporte` | File | No | Archivo de soporte (PDF, imagen, etc.) |

### Estructura de `InformacionAnticipo`

```json
{
  "informacionTercero": {
    "nombre": "Proveedor ABC",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  },
  "valorMonetario": { "valor": 5000000, "moneda": "COP" },
  "medioPago": {
    "tipo": "Credito",
    "numero": "4111111111111111",
    "entidadBancaria": "Bancolombia"
  },
  "fecha": "2026-04-01T00:00:00Z",
  "justificacion": "Anticipo por inicio de proyecto de consultoria",
  "instruccionDistribucion": [
    { "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 },
    { "unidadOrganizacional": "ADM-001", "porcentaje": 0.4 }
  ]
}
```

| Campo | Requerido | Notas |
|-------|-----------|-------|
| `informacionTercero` | Si | Nombre e identificacion del proveedor |
| `valorMonetario` | Si | Valor > 0 |
| `medioPago` | Si | Tipo: `Credito` o `Debito` |
| `fecha` | Si | Fecha de registro |
| `justificacion` | No | Texto libre |
| `instruccionDistribucion` | No | Suma de porcentajes debe ser 100% |

**Respuesta:** `201 Created` con `Location: Anticipo/{anticipoId}` y body `Guid` (anticipoId)

---

## 2. Registrar anticipo de compra (→ Pagado)

| | |
|---|---|
| **POST** | `/RegistrarAnticipoCompra` |
| **Content-Type** | `application/json` |
| **Proposito** | Registra un anticipo que ya fue pagado (proviene de una compra). Nace directamente en estado **Pagado**. No soporta archivo adjunto. |

```json
{
  "informacionTercero": {
    "nombre": "Proveedor ABC",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  },
  "valorMonetario": { "valor": 5000000, "moneda": "COP" },
  "medioPago": {
    "tipo": "Credito",
    "numero": "4111111111111111",
    "entidadBancaria": "Bancolombia"
  },
  "fecha": "2026-04-01T00:00:00Z",
  "justificacion": "Anticipo por compra directa"
}
```

**Respuesta:** `201 Created` con body `Guid` (anticipoId)

---

## 3. Modificar datos (en Borrador)

### 3.1 Completar borrador (Borrador → Vigente)

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/Completar` |
| **Proposito** | Envia los datos obligatorios para formalizar un anticipo en borrador. Transiciona a **Vigente**. Programa alerta de plazo vencido. |
| **Disponible en** | Solo Borrador |

```json
{
  "informacionTercero": {
    "nombre": "Proveedor ABC",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  },
  "valorMonetario": { "valor": 5000000, "moneda": "COP" },
  "medioPago": {
    "tipo": "Credito",
    "numero": "4111111111111111",
    "entidadBancaria": "Bancolombia"
  },
  "justificacion": "Anticipo por inicio de proyecto",
  "instruccionDistribucion": [
    { "unidadOrganizacional": "ADM-001", "porcentaje": 1.0 }
  ]
}
```

**Respuesta:** `200 OK`

### 3.2 Descartar borrador (Borrador → Descartado)

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/DescartarBorrador` |
| **Proposito** | Descarta un anticipo en borrador con motivo obligatorio. Estado terminal. |
| **Disponible en** | Solo Borrador |

```json
{
  "usuarioId": "usuario-123",
  "motivo": "Anticipo duplicado"
}
```

**Respuesta:** `200 OK`

---

## 4. Distribucion de costos

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/ConfigurarInstruccionDistribucion` |
| **Proposito** | Define como se distribuye el valor del anticipo entre unidades organizacionales. La suma de porcentajes debe ser 100%. Semantica upsert: reemplaza la distribucion existente. |
| **Disponible en** | Borrador, Vigente |

```json
{
  "distribucionCentroCostos": [
    { "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 },
    { "unidadOrganizacional": "ADM-001", "porcentaje": 0.4 }
  ]
}
```

**Respuesta:** `200 OK`

---

## 5. Regularizacion (cruce contra OXP de Comercio)

La regularizacion vincula el anticipo con una OXP de Comercio del mismo tercero, reduciendo el saldo por regularizar. Al regularizar, la OXP de Comercio se bloquea por regularizacion y recibe un pago via anticipo.

### 5.1 Regularizar parcialmente

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/RegularizarParcialmente` |
| **Proposito** | Cruza un monto parcial del anticipo contra una OXP de Comercio. El tercero de ambos debe coincidir. Reduce `SaldoPorRegularizar` del anticipo y aplica pago sobre la OXP. |
| **Disponible en** | Vigente (con saldo por regularizar > 0) |

```json
{
  "oxpComercioId": "uuid-oxp-comercio",
  "montoARegularizar": { "valor": 2000000, "moneda": "COP" }
}
```

**Respuesta:** `200 OK`

### 5.2 Regularizar totalmente

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/RegularizarTotalmente` |
| **Proposito** | Cruza la totalidad del saldo restante del anticipo contra una OXP de Comercio. El monto aplicado es el valor neto de la OXP. El anticipo pasa a **Regularizado** (o **Cerrado** si ya estaba pagado). |
| **Disponible en** | Vigente (con saldo por regularizar > 0) |

```json
{
  "oxpComercioId": "uuid-oxp-comercio"
}
```

**Respuesta:** `200 OK`

---

## 6. Pagos

### 6.1 Aplicar pago directo

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/AplicarPagoDirecto` |
| **Proposito** | Registra un pago confirmado (desde SincoA&F u otro sistema). Reduce `SaldoPorPagar`. Cuando llega a cero, el anticipo pasa a **Pagado** (o **Cerrado** si ya estaba regularizado). |
| **Disponible en** | Vigente, Pagado, Regularizado |

```json
{
  "referenciaId": "uuid-referencia-pago",
  "valorCubierto": { "valor": 5000000, "moneda": "COP" }
}
```

**Respuesta:** `200 OK`

### 6.2 Reversar anticipo (via Devolucion)

| | |
|---|---|
| **POST** | `/Anticipo/{anticipoId}/Reversar` |
| **Proposito** | Reversa completamente el anticipo. Solo permitido si no tiene pagos ni regularizaciones aplicadas. Pasa a **Reversado** (terminal). Normalmente invocado internamente al confirmar una Devolucion de tipo Anticipo. |
| **Disponible en** | Solo Vigente, sin pagos ni regularizaciones |

```json
{
  "devolucionId": "uuid-devolucion",
  "motivoReversa": "Cancelacion de contrato con proveedor"
}
```

**Respuesta:** `200 OK`

---

## 7. Consultas (API Consultas — puerto 8090)

### 7.1 Consultar anticipo por ID

| | |
|---|---|
| **GET** | `/Anticipo/{id}` |
| **Proposito** | Retorna el detalle completo del anticipo: estado, tercero, valor, medio de pago, distribucion, cruces de regularizacion, cruces de pago, soporte, justificacion. Incluye el archivo de soporte si existe. |

Respuesta:
```json
{
  "anticipo": {
    "id": "uuid",
    "estado": "Vigente",
    "informacionTercero": {
      "nombre": "Proveedor ABC",
      "identificacion": { "tipo": "NIT", "numero": "900123456" }
    },
    "valorMonetario": { "valor": 5000000, "moneda": "COP" },
    "valorTotal": { "valor": 5000000, "moneda": "COP" },
    "medioPago": {
      "tipo": "Credito",
      "numero": "4111111111111111",
      "entidadBancaria": "Bancolombia"
    },
    "soporte": { "container": "soportesanticipos", "blobName": "uuid-archivo" },
    "justificacion": "Anticipo por inicio de proyecto",
    "fecha": "2026-04-01T00:00:00Z",
    "motivoDescarte": null,
    "instruccionDistribucion": [
      { "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 },
      { "unidadOrganizacional": "ADM-001", "porcentaje": 0.4 }
    ],
    "crucesRegularizacion": [
      {
        "id": "uuid",
        "oxpComercioId": "uuid-oxp",
        "montoRegularizado": { "valor": 2000000, "moneda": "COP" },
        "fechaRegularizacion": "2026-04-10T00:00:00Z",
        "tipo": "Parcial"
      }
    ],
    "historialRechazos": [
      {
        "motivos": ["No se puede formalizar un anticipo sin información de tercero."],
        "fecha": "2026-04-10T12:00:00Z",
        "estado": "Borrador"
      }
    ],
    "crucesPagoAplicados": [
      {
        "id": "uuid",
        "tipo": "PagoDirecto",
        "referenciaId": "uuid-ref",
        "valorCubierto": { "valor": 5000000, "moneda": "COP" },
        "fecha": "2026-04-15T00:00:00Z"
      }
    ]
  },
  "archivo": { "nombre": "soporte.pdf", "tipo": "application/pdf", "base64": "..." },
  "fuenteTipo": "DocumentIntelligence",
  "ocr": "..."
}
```

Tipos de cruce de pago: `Extracto`, `Devolucion`, `PagoDirecto`, `Reversado`.

Tipos de regularizacion: `Parcial`, `Total`, `Reversa`, `Revertido`.

### 7.2 Listar borradores

| | |
|---|---|
| **GET** | `/Anticipo/Borradores` |
| **Proposito** | Lista anticipos en estado Borrador. Pendientes de formalizar. |

Respuesta:
```json
[
  {
    "id": "uuid",
    "estado": "Borrador",
    "terceroNombre": "Proveedor ABC",
    "terceroIdentificacion": "900123456",
    "terceroTipoIdentificacion": "NIT",
    "valor": 5000000,
    "moneda": "COP",
    "medioPago": "Credito - 4111111111111111 (Bancolombia)",
    "justificacion": "Anticipo pendiente",
    "totalRegularizado": 0,
    "saldoPorRegularizar": 5000000,
    "totalPagado": 0,
    "saldoPorPagar": 5000000,
    "fechaRegistro": "2026-04-01T00:00:00Z"
  }
]
```

### 7.3 Listar vigentes

| | |
|---|---|
| **GET** | `/Anticipo/Vigentes` |
| **Proposito** | Lista anticipos en estado Vigente. Disponibles para regularizacion y pago. |

Misma estructura de respuesta que Borradores.

### 7.4 Listar todos

| | |
|---|---|
| **GET** | `/Anticipo/Todos` |
| **Proposito** | Lista todos los anticipos sin filtro de estado. |

Misma estructura de respuesta que Borradores.

### 7.5 Listar anticipos disponibles para devolucion (reversa)

| | |
|---|---|
| **GET** | `/Devolucion/AnticiposDisponibles` |
| **Proposito** | Lista anticipos elegibles para reversa total via devolucion. Filtra por estado Vigente y sin cruces previos (`totalPagado == 0` y `totalRegularizado == 0`) [R28, R34]. |

Respuesta: misma estructura que `/Anticipo/Borradores` (lista de `VistaOxpAnticipo`), pero solo incluye anticipos que cumplen las precondiciones para reversa.

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

---

## 8. Respuestas de error

Formato [RFC 7807 ProblemDetails](https://datatracker.ietf.org/doc/html/rfc7807):

| Codigo | Significado | Cuando |
|--------|-------------|--------|
| **400** | Datos invalidos | Campos faltantes, formatos incorrectos, valor <= 0 |
| **404** | No encontrado | ID de anticipo u OXP de Comercio no existe |
| **422** | Regla de negocio | Estado incorrecto, tercero no coincide, saldo insuficiente, porcentajes no suman 100% |

---

## 9. Flujos tipicos

### 9a. Anticipo directo (registro → regularizacion → pago)

```
1. POST /Anticipo                                          ← Registrar anticipo vigente (8080)
   → 201 Created, Location: Anticipo/{id}
2. POST /Anticipo/{id}/ConfigurarInstruccionDistribucion   ← Distribuir por centro de costo (opcional)
   ... tiempo despues, llega la factura del proveedor ...
3. POST /Anticipo/{id}/RegularizarParcialmente             ← Cruzar con OXP de Comercio
   ... o ...
   POST /Anticipo/{id}/RegularizarTotalmente               ← Cruzar totalidad con OXP
   ... pago confirmado por SincoA&F ...
4. POST /Anticipo/{id}/AplicarPagoDirecto                  ← Registrar pago
   → Anticipo pasa a Cerrado cuando ambos saldos = 0
```

### 9b. Anticipo desde borrador (pipeline de entrada)

```
1. GET  /Anticipo/Borradores                               ← Listar borradores pendientes (8090)
2. GET  /Anticipo/{id}                                     ← Ver detalle con OCR/archivo (8090)
3. POST /Anticipo/{id}/Completar                           ← Formalizar borrador → Vigente (8080)
   ... continua flujo normal de regularizacion/pago ...
```

### 9c. Anticipo de compra (ya pagado)

```
1. POST /RegistrarAnticipoCompra                           ← Registrar con estado Pagado (8080)
   → Solo requiere regularizacion
2. POST /Anticipo/{id}/RegularizarTotalmente               ← Cruzar con OXP de Comercio
   → Anticipo pasa a Cerrado
```

### 9d. Reversa de anticipo (via devolucion)

```
1. POST /Devolucion                                        ← Radicar devolucion con origen Anticipo (8080)
2. POST /Devolucion/{devId}/Confirmar                      ← Confirmar → reversa el anticipo automaticamente
   → Anticipo pasa a Reversado
```

### 9e. Descarte de borrador

```
1. GET  /Anticipo/Borradores                               ← Listar borradores (8090)
2. POST /Anticipo/{id}/DescartarBorrador                   ← Descartar con motivo (8080)
   → Anticipo pasa a Descartado (terminal)
```

---

## 10. Modelo de datos de referencia

### Dinero

```json
{ "valor": 5000000, "moneda": "COP" }
```

### InformacionTercero

```json
{
  "nombre": "Proveedor ABC",
  "identificacion": { "tipo": "NIT", "numero": "900123456" }
}
```

### MedioPago

```json
{
  "tipo": "Credito",
  "numero": "4111111111111111",
  "entidadBancaria": "Bancolombia"
}
```

Tipos: `Credito`, `Debito`.

### DestinoNegocio

```json
{ "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 }
```

`porcentaje` es un decimal entre 0 (exclusivo) y 1 (inclusivo). La suma de todos los destinos debe ser exactamente 1.0 (100%).
