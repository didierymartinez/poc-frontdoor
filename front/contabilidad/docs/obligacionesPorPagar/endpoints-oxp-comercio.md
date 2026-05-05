# Endpoints OXP de Comercio — Comandos API

Puerto: **8080**
Base URL: `http://localhost:8080`

---

## Ciclo de vida de la OXP

```
Borrador ──► Pendiente ──► Confirmada ──► Causada ──► Pagada
  │              │
  ▼              ▼
Descartado    Devuelta ──► Pendiente (corregida)
```

---

## 1. Crear OXP (Borrador)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar` |
| **Proposito** | Crea una nueva OXP en estado **Borrador**. Puede recibir datos parciales. |
| **Respuesta** | `201 Created` con el ID generado. |

```json
{
  "valor": { "valor": 1000, "moneda": "COP" },
  "fechaTransaccion": "2026-03-15T00:00:00Z",
  "informacionTercero": {
    "nombre": "Amazon.com",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  },
  "archivoId": "uuid-del-archivo-subido",
  "descripcion": "Compra de licencias",
  "documento": { "numero": "FAC-001", "fecha": "2026-03-15T00:00:00Z" },
  "conceptos": []
}
```

---

## 2. Modificar datos

Estos endpoints permiten editar campos individuales de la OXP. La disponibilidad depende del estado:

| Estado permitido | Campos |
|---|---|
| **Borrador o Pendiente** | Valor, Tercero, Conceptos, Medio de pago, TRM, Soporte presupuestal, Archivo soporte, Distribucion (todos los niveles) |
| **Solo Borrador** | Descripcion, Documento (se modifican via CompletarBorrador, no tienen endpoint individual) |

Una vez **Confirmada**, ningun campo es editable. Si se necesita corregir, el confirmador debe **Devolver** la OXP al radicador.

### 2.1 Modificar valor monetario

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/ValorMonetario` |
| **Proposito** | Cambia el valor de la obligacion. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "valorMonetario": { "valor": 1500000, "moneda": "COP" }
}
```

### 2.2 Modificar informacion del tercero

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/InformacionTercero` |
| **Proposito** | Cambia el tercero (comercio/proveedor). |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "informacionTercero": {
    "nombre": "Amazon.com Inc",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  }
}
```

### 2.3 Asignar conceptos

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/Conceptos` |
| **Proposito** | Reemplaza todos los conceptos de gasto de la OXP. Requerido para confirmar. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "conceptos": [
    {
      "id": "uuid",
      "codigo": "GAS-001",
      "descripcion": "Licencia de software",
      "dinero": { "valor": 1000000, "moneda": "COP" },
      "cantidad": 1,
      "tipo": "GastoCosto",
      "clasificacionTributaria": "GRAV_19",
      "conceptoPago": "Servicios",
      "referenciaOrigen": "LIC-SW"
    }
  ]
}
```

### 2.4 Vincular medio de pago

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/MedioDePago` |
| **Proposito** | Asigna el medio de pago (tarjeta). Requerido para confirmar. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "medioPago": {
    "tipo": "Credito",
    "numero": "4111111111111111",
    "entidadBancaria": "Bancolombia"
  }
}
```

### 2.5 Vincular TRM

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/TasaRepresentativaMercado` |
| **Proposito** | Asigna la tasa de cambio para OXP en moneda extranjera. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "tasaRepresentativaMercado": { "moneda": "USD", "valor": 4200 }
}
```

### 2.6 Vincular soporte presupuestal

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/SoportePresupuestal` |
| **Proposito** | Vincula referencia de soporte presupuestal. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "soportePresupuestal": "CDP-2026-0042"
}
```

### 2.7 Vincular archivo soporte

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/ArchivoSoporte` |
| **Proposito** | Sube un archivo de soporte (factura PDF, imagen). Multipart form. |
| **Disponible en** | Borrador, Pendiente |

```
Content-Type: multipart/form-data
Campo: file (IFormFile)
```

### 2.8 Configurar distribucion de costos (nivel OXP)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/ConfigurarInstruccionDistribucion` |
| **Proposito** | Define como se distribuye el valor total entre unidades organizacionales. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "distribucionCentroCostos": [
    { "unidadOrganizacional": "VTA-001", "porcentaje": 60 },
    { "unidadOrganizacional": "ADM-001", "porcentaje": 40 }
  ]
}
```

### 2.9 Configurar distribucion de costos (nivel concepto)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/ConfigurarInstruccionDistribucionConcepto` |
| **Proposito** | Define la distribucion de un concepto especifico. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "conceptoId": "uuid-del-concepto",
  "distribucionCentroCostos": [
    { "unidadOrganizacional": "VTA-001", "porcentaje": 100 }
  ]
}
```

### 2.10 Configurar distribucion de costos (nivel tributo)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/ConfigurarInstruccionDistribucionTributo` |
| **Proposito** | Define la distribucion de un tributo dentro de un concepto. |
| **Disponible en** | Borrador, Pendiente |

```json
{
  "conceptoId": "uuid-del-concepto",
  "tributoTipo": "IVA",
  "distribucionCentroCostos": [
    { "unidadOrganizacional": "FIN-001", "porcentaje": 100 }
  ]
}
```

---

## 3. Transiciones de estado

### 3.1 Completar borrador (Borrador → Pendiente)

Dos variantes segun el flujo del front:

#### Variante A: Completar con todos los datos

| | |
|---|---|
| **POST** | `/OxpComercio/{id}/CompletarBorrador` |
| **Proposito** | Envia todos los datos obligatorios en un solo request y transiciona a **Pendiente**. Valida descripcion, tercero, valor, conceptos, medio de pago y reglas de duplicidad. |
| **Disponible en** | Solo Borrador |

```json
{
  "usuarioId": "usuario-123",
  "valor": { "valor": 1000000, "moneda": "COP" },
  "informacionTercero": {
    "nombre": "Amazon.com",
    "identificacion": { "tipo": "NIT", "numero": "900123456" }
  },
  "descripcion": "Compra de licencias",
  "conceptos": [
    {
      "id": "uuid",
      "codigo": "GAS-001",
      "descripcion": "Licencia de software",
      "dinero": { "valor": 1000000, "moneda": "COP" },
      "cantidad": 1,
      "tipo": "GastoCosto",
      "clasificacionTributaria": "GRAV_19",
      "conceptoPago": "Servicios",
      "referenciaOrigen": "LIC-SW"
    }
  ],
  "medioPago": {
    "tipo": "Credito",
    "numero": "4111111111111111",
    "entidadBancaria": "Bancolombia"
  },
  "documento": { "numero": "FAC-001", "fecha": "2026-03-15T00:00:00Z" }
}
```

#### Variante B: Completar sin datos (ya diligenciados previamente)

| | |
|---|---|
| **PUT** | `/ObligacionPorPagar/{id}/Completar` |
| **Proposito** | Transiciona a **Pendiente** validando que los datos ya diligenciados esten completos. No recibe body. |
| **Disponible en** | Solo Borrador |

### 3.2 Confirmar (Pendiente → Confirmada)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/Confirmar` |
| **Proposito** | Un usuario con rol Confirmador valida y aprueba la OXP. Habilita la causacion contable. |
| **Sin body** | Solo requiere el ID en la URL. |
| **Disponible en** | Solo Pendiente |
| **Precondiciones** | Tiene conceptos, tiene medio de pago. |
| **Error 422** | Si falta alguna precondicion, retorna el detalle de lo que falta. |

### 3.3 Devolver (Pendiente → Devuelta)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/Devolver` |
| **Proposito** | El confirmador rechaza la OXP y la devuelve al radicador con un motivo obligatorio. |
| **Disponible en** | Solo Pendiente |

```json
{
  "motivo": "Falta soporte documental de la factura"
}
```

### 3.4 Corregir (Devuelta → Pendiente)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/Corregir` |
| **Proposito** | El radicador corrige la OXP devuelta y la reenvia a confirmacion. Sin body. |
| **Disponible en** | Solo Devuelta |

### 3.5 Causar (Confirmada → Causada)

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/Causar` |
| **Proposito** | Registra la causacion contable en el sistema externo (SincoA&F). Sin body. |
| **Disponible en** | Solo Confirmada |
| **Nota** | Actualmente genera referencia stub. En el futuro integrara con SincoA&F. |

### 3.6 Descartar borrador (Borrador → Descartado)

| | |
|---|---|
| **POST** | `/OxpComercio/{id}/DescartarBorrador` |
| **Proposito** | Descarta un borrador con motivo obligatorio. Estado terminal. |
| **Disponible en** | Solo Borrador |

```json
{
  "usuarioId": "usuario-123",
  "motivo": "Compra duplicada"
}
```

---

## 4. Pagos (desde Causada)

### 4.1 Aplicar pago directo

| | |
|---|---|
| **POST** | `/ObligacionPorPagar/{id}/AplicarPagoDirecto` |
| **Proposito** | Registra un pago confirmado por SincoA&F para formas de pago diferentes a tarjeta de credito. Reduce el saldo pendiente. Si el saldo llega a cero, la OXP pasa a **Pagada**. |
| **Disponible en** | Confirmada, Causada |

```json
{
  "referenciaPago": "PAG-SINCO-2026-001",
  "valorPagado": 1000000
}
```

---

## 5. Consultas (API Consultas — puerto 8090)

### 5.1 Consultar OXP por ID

| | |
|---|---|
| **GET** | `/OxpComercio/{id}` |
| **Proposito** | Retorna el detalle completo de la OXP: estado, tercero, valor, conceptos, medio de pago, distribucion, pagos aplicados, archivos vinculados (referencias), evidencia principal (descargada en Base64), metadata OCR. |

Respuesta:
```json
{
  "borrador": {
    "id": "uuid",
    "estado": "Pendiente",
    "informacionTercero": { "nombre": "...", "identificacion": { "tipo": "NIT", "numero": "..." } },
    "descripcion": "...",
    "valorMonetario": { "valor": 1000000, "moneda": "COP" },
    "conceptos": [],
    "medioPago": { "tipo": "Credito", "numero": "...", "entidadBancaria": "..." },
    "archivosVinculados": [
      { "container": "soportesobligaciones", "key": "uuid-archivo-1" },
      { "container": "soportesobligaciones", "key": "uuid-archivo-2" }
    ],
    "documento": { "numero": "FAC-001", "fecha": "2026-03-15T00:00:00Z" },
    "pagosAplicados": [],
    "historialRechazos": [
      {
        "motivos": ["No se puede completar una obligación por pagar sin descripción.", "No se puede completar una obligación por pagar sin información del tercero."],
        "fecha": "2026-04-10T12:00:00Z",
        "estado": "Borrador"
      }
    ]
  },
  "archivo": { "nombre": "factura.pdf", "tipo": "application/pdf", "base64": "..." },
  "fuenteTipo": "DocumentIntelligence",
  "ocr": "..."
}
```

### 5.2 Descargar archivo soporte

| | |
|---|---|
| **GET** | `/OxpComercio/{id}/Soportes?key={key}` |
| **Proposito** | Descarga un archivo soporte vinculado a la OXP. El `key` se obtiene de `archivosVinculados` en el detalle de la OXP. Se pasa como query parameter porque las keys contienen `/` y espacios (ej: `2026/04/01_uuid_factura dian.pdf`). |
| **Respuesta 200** | `ArchivoStorage` con nombre, tipo MIME y contenido en Base64. |
| **Respuesta 404** | Si la OXP no existe o el key no corresponde a un soporte vinculado. |

Respuesta:
```json
{
  "nombre": "soporte-compra.pdf",
  "tipo": "application/pdf",
  "base64": "JVBERi0xLjQK..."
}
```

### 5.3 Listar borradores

| | |
|---|---|
| **GET** | `/OxpComercio/Borradores` |
| **Proposito** | Lista todas las OXP de comercio en estado Borrador. |

### 5.4 Listar pendientes

| | |
|---|---|
| **GET** | `/OxpComercio/Pendientes` |
| **Proposito** | Lista todas las OXP de comercio en estado Pendiente (listas para confirmar). |

### 5.5 Listar confirmadas

| | |
|---|---|
| **GET** | `/OxpComercio/Confirmadas` |
| **Proposito** | Lista todas las OXP de comercio en estado Confirmada. Corresponde a la vista de "Compras" confirmadas disponibles para conciliacion y causacion. |

### 5.6 Listar extractos conciliados

| | |
|---|---|
| **GET** | `/OxpExtracto/Conciliados` |
| **Proposito** | Lista todos los extractos en estado Conciliado (100% partidas resueltas). Corresponde a la vista de extractos listos para confirmar y causar. |

Respuesta extracto:
```json
[
  {
    "id": "uuid",
    "estado": "Conciliado",
    "terceroNombre": "Banco de Bogota",
    "medioPago": "TC **** **** 4588",
    "periodoDesde": "2026-10-01",
    "periodoHasta": "2026-12-31",
    "valorTotal": 1200000,
    "moneda": "COP",
    "numeroPartidas": 15,
    "fechaRadicacion": "2023-01-27T00:00:00Z"
  }
]
```

### 5.7 Listar comercios disponibles para devolucion

| | |
|---|---|
| **GET** | `/Devolucion/ComerciosDisponibles` |
| **Proposito** | Lista OXP de Comercio elegibles para registrar una devolucion. Filtra por estado (Confirmada, Causada, Pagada) y por margen disponible (`totalDevuelto < valor`). La validacion completa del acumulado vs valorNeto se ejecuta al radicar la devolucion [R31]. |

Respuesta: misma estructura que `/OxpComercio/Borradores` (lista de `VistaOxpComercio`) con el campo adicional `totalDevuelto`:

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

### 5.8 Otros endpoints de extracto

| | |
|---|---|
| **GET** | `/OxpExtracto/Borradores` |
| **Proposito** | Lista extractos en estado Borrador. |

| | |
|---|---|
| **GET** | `/OxpExtracto/Pendientes` |
| **Proposito** | Lista extractos en estado Pendiente (en proceso de conciliacion). |

| | |
|---|---|
| **GET** | `/OxpExtracto/{id}` |
| **Proposito** | Detalle completo de un extracto por ID. |

---

## 6. Respuestas de error

Todas las respuestas de error siguen el formato [RFC 7807 ProblemDetails](https://datatracker.ietf.org/doc/html/rfc7807):

| Codigo | Significado | Cuando |
|--------|-------------|--------|
| **400** | Datos invalidos | Campos faltantes, formatos incorrectos |
| **404** | No encontrado | ID de OXP no existe |
| **422** | Regla de negocio | Estado incorrecto, duplicidad, precondiciones no cumplidas |

```json
{
  "status": 422,
  "title": "Regla de negocio",
  "detail": "No se puede confirmar una obligación por pagar sin conceptos.",
  "instance": "/ObligacionPorPagar/abc123/Confirmar"
}
```

---

## 6. Flujo tipico del formulario de edicion + confirmacion

```
1. GET  /OxpComercio/{id}                       ← Cargar datos actuales (puerto 8090)
   └─ archivosVinculados: [{ key: "abc" }, ...]  ← Referencias a soportes
2. GET  /OxpComercio/{id}/Soportes?key={key}       ← Usuario abre un soporte (bajo demanda)
3. POST /ObligacionPorPagar/{id}/Conceptos       ← Usuario agrega conceptos (puerto 8080)
4. POST /ObligacionPorPagar/{id}/MedioDePago     ← Usuario asigna medio de pago
5. POST /ObligacionPorPagar/{id}/Confirmar       ← Usuario presiona "Confirmar"
   ├─ 200 OK → OXP confirmada
   └─ 422    → Mostrar que falta
```

Si la OXP fue devuelta:

```
1. GET  /Consultas/OxpComercio/{id}          ← Cargar datos (incluye motivo de devolucion)
2. POST /ObligacionPorPagar/{id}/Conceptos   ← Usuario corrige
3. POST /ObligacionPorPagar/{id}/Corregir    ← Vuelve a Pendiente
4. POST /ObligacionPorPagar/{id}/Confirmar   ← Confirmar de nuevo
```
