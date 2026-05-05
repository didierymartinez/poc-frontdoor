# Endpoints OXP de Extracto — Comandos y Consultas API

Comandos: puerto **8080** | Consultas: puerto **8090**

---

## Ciclo de vida del Extracto

```
Borrador ──► Pendiente ──► Parcialmente ──► Conciliado ──► Confirmado ──► Causada ──► Pagada
  │                        Conciliado       (100%)
  ▼
Descartado
```

La conciliacion es el proceso central del extracto: vincular cada partida del extracto con OXP de Comercio, anticipos, devoluciones o marcarlas en disputa hasta alcanzar el 100%.

---

## 1. Crear Extracto (Borrador)

El extracto se crea internamente via el pipeline de entrada (carga de PDF/CSV). No hay endpoint publico de creacion — el front trabaja sobre extractos ya radicados.

---

## 2. Modificar datos (en Borrador)

### 2.1 Completar borrador (Borrador → Pendiente)

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/CompletarBorrador` |
| **Proposito** | Envia todos los datos obligatorios y transiciona a **Pendiente**. Valida partidas, medio de pago, periodo e informacion del tercero (entidad bancaria). |
| **Disponible en** | Solo Borrador |

```json
{
  "usuarioId": "usuario-123",
  "partidas": [
    {
      "id": "uuid",
      "descripcion": "AMZN*1X2Y3Z SEATTLE",
      "valor": { "valor": 150000, "moneda": "COP" },
      "fechaTransaccion": "2026-03-10T00:00:00Z",
      "informacionTercero": {
        "nombre": "Amazon.com",
        "identificacion": { "tipo": "NIT", "numero": "900123456" }
      }
    }
  ],
  "medioPago": {
    "tipo": "Credito",
    "numero": "4111111111111111",
    "entidadBancaria": "Bancolombia"
  },
  "periodo": {
    "desde": "2026-03-01",
    "hasta": "2026-03-31"
  },
  "informacionTercero": {
    "nombre": "Bancolombia",
    "identificacion": { "tipo": "NIT", "numero": "890903938" }
  },
  "cargosFinancieros": [
    {
      "id": null,
      "tipo": "CuatroPorMil",
      "valor": { "valor": 4000, "moneda": "COP" },
      "periodo": { "desde": "2026-03-01", "hasta": "2026-03-31" }
    }
  ]
}
```

### 2.2 Vincular cargos adicionales

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/CargosAdicionales` |
| **Proposito** | Agrega o reemplaza cargos financieros del extracto (4x1000, cuota de manejo, intereses). Se incluyen para que el valor a pagar coincida con el extracto bancario [R19]. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "cargos": [
    {
      "id": null,
      "tipo": "CuatroPorMil",
      "valor": { "valor": 4000, "moneda": "COP" },
      "periodo": { "desde": "2026-03-01", "hasta": "2026-03-31" }
    },
    {
      "id": null,
      "tipo": "CuotaManejo",
      "valor": { "valor": 15000, "moneda": "COP" },
      "periodo": { "desde": "2026-03-01", "hasta": "2026-03-31" }
    }
  ]
}
```

Tipos de cargo: `CuatroPorMil`, `CuotaDeManejo`, `Intereses` (solo tarjeta de credito).

### 2.3 Descartar borrador (Borrador → Descartado)

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/DescartarBorrador` |
| **Proposito** | Descarta un extracto en borrador con motivo obligatorio. Estado terminal. |
| **Disponible en** | Solo Borrador |

```json
{
  "usuarioId": "usuario-123",
  "motivo": "Extracto duplicado"
}
```

---

## 3. Conciliacion (desde Pendiente)

La conciliacion cruza las partidas del extracto con OXP de Comercio registradas. El extracto debe estar 100% conciliado antes de poder confirmarse [R06].

### 3.1 Vincular partida con OXP de Comercio

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Vinculacion` |
| **Proposito** | Vincula una partida del extracto con una OXP de Comercio. Genera `PagoOxpComercioViaExtractoAplicado` en la OXP vinculada (reduce su saldo). Soporta vinculacion 1:1 y N:1. Puede incluir tolerancia si la diferencia esta dentro del rango configurado [R10]. |
| **Disponible en** | Pendiente, Parcialmente Conciliado |

```json
{
  "partidaId": "uuid-partida",
  "oxpComercioId": "uuid-oxp-comercio",
  "fecha": "2026-03-15T00:00:00Z",
  "monto": { "valor": 150000, "moneda": "COP" },
  "tolerancia": {
    "valor": { "valor": 500, "moneda": "COP" },
    "direccion": "ExtractoMayor"
  }
}
```

### 3.2 Cubrir partida con anticipo

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Partidas/CubrirConAnticipo` |
| **Proposito** | Cubre una partida del extracto con un anticipo existente del mismo tercero. La partida queda resuelta y el anticipo registra el pago (reduce su `saldoPorPagar`). Util cuando no hay OXP de Comercio asociada [R08]. |
| **Disponible en** | Pendiente, Parcialmente Conciliado |

```json
{
  "partidaId": "uuid-partida",
  "anticipoId": "uuid-anticipo",
  "valorCubierto": { "valor": 150000, "moneda": "COP" },
  "fecha": "2026-03-15T00:00:00Z"
}
```

### 3.3 Cubrir partida con devolucion

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Partidas/CubrirConDevolucion` |
| **Proposito** | Cubre una partida del extracto (retorno de dinero) con una devolucion registrada. La partida queda resuelta. |
| **Disponible en** | Pendiente, Parcialmente Conciliado |

```json
{
  "partidaId": "uuid-partida",
  "devolucionId": "uuid-devolucion",
  "valorCubierto": { "valor": 50000, "moneda": "COP" },
  "fecha": "2026-03-15T00:00:00Z"
}
```

### 3.4 Marcar partida en disputa

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Partidas/Disputa` |
| **Proposito** | Marca una partida como disputa (error bancario, fraude potencial, transaccion no reconocida). Cuenta como resuelta para alcanzar el 100% de conciliacion sin generar anticipos [R06b]. |
| **Disponible en** | Pendiente, Parcialmente Conciliado |

```json
{
  "partidaId": "uuid-partida",
  "motivo": "ErrorBancario",
  "usuarioId": "usuario-123",
  "fecha": "2026-03-15T00:00:00Z"
}
```

Motivos: `ErrorBancario`, `FraudePotencial`, `NoReconocida`.

### 3.5 Descartar partida en disputa

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Partidas/Descartar` |
| **Proposito** | Descarta una partida en disputa cuando el banco reversa la transaccion. Se compensa contra la linea de "Reverso Bancario" de un extracto futuro [R06b][R10c]. |
| **Disponible en** | Partida en estado Disputa |

```json
{
  "partidaId": "uuid-partida",
  "extractoReversoBancarioId": "uuid-extracto-futuro",
  "lineaReversoBancario": "Reverso transaccion 2026-03-10",
  "usuarioId": "usuario-123",
  "fecha": "2026-03-20T00:00:00Z"
}
```

### 3.6 Reclasificar partida en disputa

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Partidas/Reclasificar` |
| **Proposito** | Reclasifica una partida en disputa vinculandola con una OXP de Comercio que identifica el gasto real. Sin generar documentos duplicados ni nueva deuda [R06b]. |
| **Disponible en** | Partida en estado Disputa |

```json
{
  "partidaId": "uuid-partida",
  "oxpComercioId": "uuid-oxp-comercio",
  "usuarioId": "usuario-123",
  "fecha": "2026-03-20T00:00:00Z"
}
```

---

## 4. Transiciones de estado

### 4.1 Confirmar extracto (Conciliado → Confirmado)

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Confirmar` |
| **Proposito** | Confirma el extracto una vez la conciliacion esta al 100%. Habilita la causacion contable [R11]. |
| **Disponible en** | Solo Conciliado |

```json
{
  "usuarioId": "usuario-123"
}
```

### 4.2 Causar extracto (Confirmado → Causada)

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/Causar` |
| **Proposito** | Registra la causacion contable del extracto en SincoA&F. Incluye cargos financieros y ajustes [R14]. Sin body. |
| **Disponible en** | Solo Confirmado |

### 4.3 Aplicar pago (Causada → hacia Pagada)

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/AplicarPagoDirecto` |
| **Proposito** | Registra un pago confirmado por SincoA&F. Reduce `saldoPorPagar`. Cuando llega a cero, el extracto pasa a **Pagada** [R18]. |
| **Disponible en** | Causada |

```json
{
  "referenciaPago": "PAG-SINCO-2026-001",
  "valorPagado": 1200000
}
```

---

## 5. Distribucion de costos

### 5.1 Distribucion general del extracto

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/ConfigurarInstruccionDistribucion` |
| **Proposito** | Define como se distribuye el valor total del extracto entre unidades organizacionales. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "distribucionCentroCostos": [
    { "unidadOrganizacional": "ADM-001", "porcentaje": 1.0 }
  ]
}
```

### 5.2 Distribucion por cargo financiero

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/ConfigurarInstruccionDistribucionCargoFinanciero` |
| **Proposito** | Define la distribucion de cada cargo financiero individualmente. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "distribuciones": [
    {
      "componenteId": "uuid-cargo-financiero",
      "destinos": [
        { "unidadOrganizacional": "FIN-001", "porcentaje": 1.0 }
      ]
    }
  ]
}
```

### 5.3 Distribucion por ajuste de diferencia en cambio

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/ConfigurarInstruccionDistribucionAjusteDiferenciaCambio` |
| **Proposito** | Define la distribucion de cada ajuste por diferencia en cambio generado durante la conciliacion [R10b]. |
| **Disponible en** | Parcialmente Conciliado, Conciliado |

```json
{
  "distribuciones": [
    {
      "componenteId": "uuid-ajuste",
      "destinos": [
        { "unidadOrganizacional": "VTA-001", "porcentaje": 0.6 },
        { "unidadOrganizacional": "ADM-001", "porcentaje": 0.4 }
      ]
    }
  ]
}
```

### 5.4 Distribucion por ajuste de tolerancia

| | |
|---|---|
| **POST** | `/OxpExtracto/{id}/ConfigurarInstruccionDistribucionAjusteTolerancia` |
| **Proposito** | Define la distribucion de cada ajuste por tolerancia generado durante la conciliacion [R10]. |
| **Disponible en** | Parcialmente Conciliado, Conciliado |

```json
{
  "distribuciones": [
    {
      "componenteId": "uuid-ajuste",
      "destinos": [
        { "unidadOrganizacional": "VTA-001", "porcentaje": 1.0 }
      ]
    }
  ]
}
```

---

## 6. Consultas (API Consultas — puerto 8090)

### 6.1 Consultar extracto por ID

| | |
|---|---|
| **GET** | `/OxpExtracto/{id}` |
| **Proposito** | Retorna el detalle completo del extracto: estado, partidas (con estado individual de cada una), cargos financieros, vinculaciones, ajustes, coberturas de anticipo/devolucion, pagos aplicados, distribucion, evidencia principal. |

Respuesta:
```json
{
  "borrador": {
    "id": "uuid",
    "estado": "ParcialmenteConciliado",
    "partidas": [
      {
        "id": "uuid",
        "fechaTransaccion": "2026-03-10T00:00:00Z",
        "valor": { "valor": 150000, "moneda": "COP" },
        "descripcion": "AMZN*1X2Y3Z SEATTLE",
        "estado": "Vinculada",
        "informacionTercero": { "nombre": "Amazon.com", "identificacion": { "tipo": "NIT", "numero": "900123456" } }
      },
      {
        "id": "uuid",
        "fechaTransaccion": "2026-03-12T00:00:00Z",
        "valor": { "valor": 80000, "moneda": "COP" },
        "descripcion": "UBER *TRIP",
        "estado": "Pendiente",
        "informacionTercero": null
      }
    ],
    "cargosFinancieros": [
      { "id": "uuid", "tipo": "CuatroPorMil", "valor": { "valor": 4000, "moneda": "COP" }, "periodo": { "desde": "2026-03-01", "hasta": "2026-03-31" } }
    ],
    "periodo": { "desde": "2026-03-01", "hasta": "2026-03-31" },
    "medioPago": { "tipo": "Credito", "numero": "4111111111111111", "entidadBancaria": "Bancolombia" },
    "informacionTercero": { "nombre": "Bancolombia", "identificacion": { "tipo": "NIT", "numero": "890903938" } },
    "vinculaciones": [],
    "ajustesPorTolerancia": [],
    "ajustesPorDiferenciaCambio": [],
    "coberturasAnticipo": [],
    "coberturasDevolucion": [],
    "crucesPagoAplicados": [],
    "instruccionDistribucion": [],
    "motivoDescarte": null,
    "historialRechazos": [
      {
        "motivos": ["No se puede completar un extracto sin partidas.", "No se puede completar un extracto sin medio de pago."],
        "fecha": "2026-04-10T12:00:00Z",
        "estado": "Borrador"
      }
    ]
  },
  "archivo": { "nombre": "extracto.pdf", "tipo": "application/pdf", "base64": "..." },
  "fuenteTipo": "DocumentIntelligence",
  "ocr": "..."
}
```

Estados de partida: `Pendiente`, `Vinculada`, `Anticipo`, `Devolucion`, `Disputa`, `Descartada`.

### 6.2 Listar borradores

| | |
|---|---|
| **GET** | `/OxpExtracto/Borradores` |
| **Proposito** | Lista extractos en estado Borrador. |

### 6.3 Listar pendientes

| | |
|---|---|
| **GET** | `/OxpExtracto/Pendientes` |
| **Proposito** | Lista extractos en estado Pendiente (aun sin ninguna partida conciliada, 0%). |

### 6.4 Listar extractos en conciliacion

| | |
|---|---|
| **GET** | `/OxpExtracto/EnConciliacion` |
| **Proposito** | Lista extractos que necesitan conciliacion: estados **Pendiente** (0%) y **ParcialmenteConciliado** (entre 0% y 100%). Incluye porcentaje de conciliacion calculado como `partidasResueltas / totalPartidas × 100`. |

Respuesta:
```json
[
  {
    "id": "uuid",
    "estado": "ParcialmenteConciliado",
    "terceroNombre": "Bancolombia",
    "terceroIdentificacion": "890903938",
    "terceroTipoIdentificacion": "NIT",
    "periodoDesde": "2026-03-01",
    "periodoHasta": "2026-03-31",
    "medioPagoTipo": "Credito",
    "medioPagoNumero": "4111111111111111",
    "entidadBancaria": "Bancolombia",
    "valorPartidas": 1200000,
    "moneda": "COP",
    "totalPartidas": 10,
    "partidasResueltas": 4,
    "porcentajeConciliacion": 40.00,
    "fechaRadicacion": "2026-03-15T10:00:00Z"
  }
]
```

Una partida se considera "resuelta" cuando esta en estado `Conciliada`, `Disputa`, `Descartada`, `Anticipo` o `Devolucion` (flag `Finalizada`).

### 6.5 Listar conciliados

| | |
|---|---|
| **GET** | `/OxpExtracto/Conciliados` |
| **Proposito** | Lista extractos con conciliacion al 100%. Listos para confirmar y causar. |

### 6.6 Listar extractos disponibles para devolucion

| | |
|---|---|
| **GET** | `/Devolucion/ExtractosDisponibles` |
| **Proposito** | Lista extractos elegibles para registrar una devolucion de cargos financieros. Filtra por estado (Confirmado, Causada, Pagada) y por saldo pendiente (`saldoPorPagar > 0`) [R33]. |

Respuesta: misma estructura que `/OxpExtracto/Borradores` (lista de `VistaOxpExtracto`).

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

---

## 7. Respuestas de error

Formato [RFC 7807 ProblemDetails](https://datatracker.ietf.org/doc/html/rfc7807):

| Codigo | Significado | Cuando |
|--------|-------------|--------|
| **400** | Datos invalidos | Campos faltantes, formatos incorrectos |
| **404** | No encontrado | ID de extracto no existe |
| **422** | Regla de negocio | Estado incorrecto, conciliacion incompleta, duplicidad |

---

## 8. Flujos tipicos

### 8a. Conciliacion manual

```
1. GET  /OxpExtracto/{id}                              ← Cargar extracto con partidas (8090)
2. POST /OxpExtracto/{id}/Vinculacion                  ← Vincular partida con OXP de Comercio (8080)
   ... repetir para cada partida ...
3. POST /OxpExtracto/{id}/Partidas/CubrirConAnticipo   ← Cubrir partida sin OXP con anticipo
4. POST /OxpExtracto/{id}/Partidas/Disputa             ← Marcar partida no reconocida
   → Cuando 100% resueltas: extracto pasa a Conciliado
5. POST /OxpExtracto/{id}/Confirmar                    ← Confirmar
6. POST /OxpExtracto/{id}/Causar                       ← Causar
7. POST /OxpExtracto/{id}/AplicarPagoDirecto           ← Registrar pago de SincoA&F
```

### 8b. Resolucion de partida en disputa (periodo posterior)

```
1. GET  /OxpExtracto/{id}                              ← Cargar extracto con partida en disputa
   Opcion A — banco reverso:
2a. POST /OxpExtracto/{id}/Partidas/Descartar          ← Descartar (compensar con reverso bancario)
   Opcion B — se identifica el gasto:
2b. POST /OxpExtracto/{id}/Partidas/Reclasificar       ← Reclasificar con OXP de Comercio
```
