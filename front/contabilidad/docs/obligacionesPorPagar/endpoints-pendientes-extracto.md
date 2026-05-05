# Endpoints Pendientes de Implementar en Backend — Conciliación de Extracto

**Última revisión:** 2026-04-08

---

## Estado actual

Todos los endpoints de conciliación están implementados en el frontend:

| Endpoint | Estado |
|----------|--------|
| `POST /OxpExtracto/{id}/Vinculacion` | ✅ Implementado |
| `POST /OxpExtracto/{id}/Partidas/CubrirConAnticipo` | ✅ Implementado |
| `POST /OxpExtracto/{id}/Partidas/CubrirConDevolucion` | ✅ Implementado |
| `POST /OxpExtracto/{id}/Partidas/Disputa` | ✅ Implementado |
| `POST /OxpExtracto/{id}/Confirmar` | ✅ Implementado |
| `POST /OxpExtracto/{id}/Causar` | ✅ Implementado |
| `GET /Devolucion/Pendientes` | ✅ Query + Dialog implementados |

## Pendientes por implementar en frontend

| Endpoint | Prioridad | Descripción |
|----------|-----------|-------------|
| `POST /OxpExtracto/{id}/Partidas/Descartar` | MEDIA | Botón deshabilitado — requiere seleccionar extracto de reverso bancario |
| `POST /OxpExtracto/{id}/Partidas/Reclasificar` | BAJA | Implementado solo para vincular compra, falta vincular devolución en reclasificación |
