# Endpoints Faltantes — Devolucion

**Última revisión:** 2026-04-08

---

## Endpoints YA implementados en frontend

| Endpoint | Tipo | Estado |
|----------|------|--------|
| `GET /Devolucion/Todas` | Consulta | ✅ Query + UI (tab Devoluciones en obligaciones pendientes) |
| `GET /Devolucion/{id}` | Consulta | ✅ Query + UI (página detalle devolución) |
| `GET /Devolucion/Pendientes` | Consulta | ✅ Query + UI (tab Devoluciones + dialog vincular en conciliación) |
| `GET /Devolucion/Confirmadas` | Consulta | ✅ Query definida |
| `GET /Devolucion/Causadas` | Consulta | ✅ Query definida |
| `GET /Devolucion/ComerciosDisponibles` | Consulta | ✅ Query + UI (wizard devolución) |
| `GET /Devolucion/ExtractosDisponibles` | Consulta | ✅ Query + UI (wizard devolución) |
| `GET /Devolucion/AnticiposDisponibles` | Consulta | ✅ Query + UI (wizard devolución) |
| `POST /Devolucion` | Comando | ✅ Mutation + UI (wizard registro devolución) |
| `POST /Devolucion/{id}/Confirmar` | Comando | ✅ Mutation + UI (botón Confirmar en wizard) |

---

## Endpoints PENDIENTES de implementar en frontend

| # | Endpoint | Prioridad | Descripción |
|---|----------|-----------|-------------|
| 1 | `GET /Devolucion/{id}/Soporte` | **ALTA** | Descarga de archivo soporte de la devolución. No hay endpoint ni UI para descargar. |
| 2 | `POST /Devolucion/{id}/Devolver` | **MEDIA** | Enviar devolución a corrección (Pendiente → Devuelta). **Pregunta abierta:** ¿Existe este flujo para Devoluciones o solo aplica para OXP Comercio? La FSM del modelo de dominio solo tiene Pendiente → Confirmada → Causada. |
| 3 | `POST /Devolucion/{id}/Rechazar` | **MEDIA** | Rechazar definitivamente una devolución. **Pregunta abierta:** La FSM no contempla estado de rechazo. |

---

## Aclaraciones pendientes del backend

1. **Devolución parcial (monto plano):** ¿Se envía un monto y el backend proratea, o el front calcula los conceptos proporcionales?
2. **Campo `tipoDevolucion`:** No aparece en la estructura de `InformacionDevolucion`. ¿Lo infiere el backend?
3. **Eventos SignalR:** ¿Existen `DevolucionConfirmada` y `DevolucionCausada`?
4. **Filtros de listado:** ¿El endpoint soporta query strings por estado/origen/tercero, o se filtra en el front?
