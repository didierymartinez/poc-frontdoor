# Campos pendientes de mapeo — ObligacionesPorPagar/Pendientes

Fecha: 2026-03-31

Endpoints migrados:
- `OxpComercio/Borradores` → `OxpComercio/Pendientes` (mismo DTO `VistaOxpComercio`)
- `OxpExtracto/Borradores` → `OxpExtracto/Pendientes` (mismo DTO `VistaOxpExtracto`)

## ComprasPanel (VistaOxpComercio)

| Campo UI | Campo DTO actual | Estado | Acción requerida |
|----------|-----------------|--------|-----------------|
| ID | `id` | Mapeado | — |
| Medio (brand logo + número tarjeta) | `medioPago` (string genérico) | Parcial | Backend devuelve string genérico, no brand (mastercard/visa/diners/amex) ni número de tarjeta. **Agregar `medioPagoNumero` y `medioPagoTipo` al DTO** |
| Transac. | `documentoFecha` | Mapeado | — |
| Monto | `valor` | Mapeado | — |
| Moneda | `moneda` | Mapeado | — |
| Tercero | `terceroNombre` | Mapeado | — |
| Radica. | `fechaRadicacion` | Mapeado | — |
| Acción (ícono documento) | ❌ No existe | Vacío | ¿Eliminar columna o agregar flag `tieneDocumento` al DTO? |

## ExtractosPanel (VistaOxpExtracto)

| Campo UI | Campo DTO actual | Estado | Acción requerida |
|----------|-----------------|--------|-----------------|
| ID | `id` | Mapeado | — |
| Entidad financiera | `terceroNombre` | Mapeado | — |
| Medio de pago (brand + número) | `medioPago` (string) | Parcial | Mismo problema que compras: no hay brand ni número de tarjeta |
| Valor extracto | `valorTotal` | Mapeado | — |
| Pago extracto | `fechaPago` | Mapeado | — |
| Periodo | `periodoDesde` / `periodoHasta` | Mapeado | — |
| Conciliación (%) | ❌ No existe | Vacío | **Agregar `porcentajeConciliacion` (int 0-100) al DTO** |
| Radicación | `fechaRadicacion` | Mapeado | — |
| Vence en | ❌ No existe | Vacío | **Agregar `fechaVencimiento` al DTO** o calcular en front si hay regla de negocio definida |

## Resumen de campos faltantes en el backend

| Campo | DTO | Tipo sugerido | Descripción |
|-------|-----|--------------|-------------|
| `medioPagoTipo` | Ambos | `string` | Brand de tarjeta (mastercard, visa, diners, amex) |
| `medioPagoNumero` | Ambos | `string?` | Número enmascarado (TC **** **** 4588) |
| `tieneDocumento` | `VistaOxpComercio` | `bool` | Si tiene archivo adjunto para mostrar ícono |
| `porcentajeConciliacion` | `VistaOxpExtracto` | `int` | Porcentaje de partidas conciliadas (0-100) |
| `fechaVencimiento` | `VistaOxpExtracto` | `DateTime?` | Fecha límite de pago para calcular "Vence en X días" |
