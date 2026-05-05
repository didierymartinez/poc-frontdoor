# Feature-Sliced Design (FSD) — Arquitectura Frontend

## Tabla de Contenido

- [Qué es Feature-Sliced Design](#qué-es-feature-sliced-design)
- [Conceptos Fundamentales](#conceptos-fundamentales)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Capas (Layers)](#capas-layers)
- [Slices](#slices)
- [Segmentos (Segments)](#segmentos-segments)
- [Public API](#public-api)
- [Reglas de Dependencia](#reglas-de-dependencia)
- [Scaffolding Completo](#scaffolding-completo)
- [Convenciones de Nombrado](#convenciones-de-nombrado)
- [Patrones por Segmento](#patrones-por-segmento)
- [Testing](#testing)
- [Cross-Cutting Concerns](#cross-cutting-concerns)
- [Errores Comunes](#errores-comunes)

---

## Qué es Feature-Sliced Design

Feature-Sliced Design (FSD) es una metodología arquitectónica para aplicaciones frontend creada y mantenida por la comunidad de [feature-sliced.design](https://feature-sliced.design/). Su objetivo es organizar el código de forma **predecible, mantenible y escalable** mediante una estructura estandarizada de capas, slices y segmentos.

### Por qué usar FSD

- **Estructura predecible**: cualquier desarrollador sabe dónde encontrar y dónde colocar código sin ambigüedad.
- **Bajo acoplamiento**: las reglas de dependencia estrictas evitan que los módulos se entrelacen de forma caótica.
- **Alta cohesión**: cada slice agrupa todo lo relacionado a un concepto de negocio (UI, tipos, API, lógica) en un solo lugar.
- **Escalabilidad**: la arquitectura crece de forma ordenada sin importar el tamaño del equipo o del proyecto.
- **Refactoring seguro**: gracias a la Public API (`index.ts`), se puede reorganizar internamente un slice sin afectar al resto de la aplicación.

---

## Conceptos Fundamentales

FSD organiza el código en una jerarquía de 3 niveles:

```
Layers  →  Slices  →  Segments

(capas)    (dominios)   (tipo técnico)
fijas      libres       estandarizados
```

- **Layers**: Capas con nombres y orden fijo. Definen el nivel de responsabilidad.
- **Slices**: Carpetas dentro de cada capa, nombradas por dominio de negocio.
- **Segments**: Agrupaciones técnicas dentro de cada slice (`ui/`, `model/`, `api/`, `lib/`, `config/`).

---

## Estructura del Proyecto

```
src/
├── app/                    # Capa: inicialización y configuración global
├── pages/                  # Capa: pantallas completas / rutas
├── widgets/                # Capa: bloques grandes autónomos de UI
├── features/               # Capa: acciones del usuario con valor de negocio
├── entities/               # Capa: entidades del dominio de negocio
└── shared/                 # Capa: código reutilizable sin lógica de negocio
```

---

## Capas (Layers)

Las capas están ordenadas de mayor a menor nivel de abstracción. **Las dependencias solo fluyen hacia abajo.**

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
```

### Descripción de cada capa

| Capa | Responsabilidad | Tiene Slices |
|------|----------------|:------------:|
| **app** | Providers, router, tema global, entry point | No |
| **pages** | Composición de widgets y features por ruta | Si |
| **widgets** | Bloques de UI completos y autónomos | Si |
| **features** | Acciones del usuario que generan valor de negocio | Si |
| **entities** | Entidades/conceptos del dominio de negocio | Si |
| **shared** | Utilidades, componentes genéricos, configuración | No |

### Detalle por capa

#### `app/`

Punto de entrada de la aplicación. Configura todo lo global:

```
app/
├── providers/
│   ├── ThemeProvider.tsx
│   ├── QueryProvider.tsx
│   └── AuthProvider.tsx
├── router/
│   └── index.tsx
├── styles/
│   └── global.css
└── index.tsx                  # Entry point, composición de providers
```

#### `pages/`

Cada página compone widgets y features. **No contiene lógica de negocio.**

```
pages/
├── obligaciones/
│   ├── ui/
│   │   └── ObligacionesPage.tsx
│   └── index.ts
└── pagos/
    ├── ui/
    │   └── PagosPage.tsx
    └── index.ts
```

#### `widgets/`

Bloques grandes de UI que combinan múltiples entities y features:

```
widgets/
├── obligaciones-table/
│   ├── ui/
│   │   └── ObligacionesTable.tsx
│   ├── model/
│   │   └── table.store.ts
│   └── index.ts
└── dashboard-resumen/
    ├── ui/
    │   └── DashboardResumen.tsx
    └── index.ts
```

#### `features/`

Cada feature es **una acción del usuario**. Nombrar como verbo + sustantivo:

```
features/
├── crear-obligacion/
│   ├── ui/
│   │   └── CrearObligacionForm.tsx
│   ├── model/
│   │   └── crear-obligacion.schema.ts
│   ├── api/
│   │   └── crear-obligacion.mutation.ts
│   └── index.ts
└── aprobar-pago/
    ├── ui/
    │   └── AprobarPagoDialog.tsx
    ├── api/
    │   └── aprobar-pago.mutation.ts
    └── index.ts
```

#### `entities/`

Cada entity es **un concepto del dominio de negocio**:

```
entities/
├── obligacion/
│   ├── ui/
│   │   ├── ObligacionCard.tsx
│   │   └── ObligacionStatusBadge.tsx
│   ├── model/
│   │   ├── obligacion.types.ts
│   │   └── obligacion.store.ts
│   ├── api/
│   │   └── obligacion.queries.ts
│   ├── lib/
│   │   └── calcular-interes.ts
│   └── index.ts
├── proveedor/
│   ├── ui/
│   │   └── ProveedorAvatar.tsx
│   ├── model/
│   │   └── proveedor.types.ts
│   ├── api/
│   │   └── proveedor.queries.ts
│   └── index.ts
└── pago/
    ├── model/
    │   └── pago.types.ts
    ├── api/
    │   └── pago.queries.ts
    └── index.ts
```

#### `shared/`

Código reutilizable **sin contexto de negocio**:

```
shared/
├── ui/
│   ├── Button.tsx
│   ├── TextField.tsx
│   ├── DataTable.tsx
│   └── ConfirmDialog.tsx
├── api/
│   ├── http-client.ts
│   └── query-client.ts
├── lib/
│   ├── hooks/
│   │   ├── use-debounce.ts
│   │   └── use-local-storage.ts
│   └── utils/
│       ├── format-currency.ts
│       └── format-date.ts
├── config/
│   ├── env.ts
│   └── routes.ts
└── types/
    └── api.types.ts
```

---

## Slices

### Qué es un Slice

Un slice es una carpeta dentro de una capa que agrupa todo el código de **un tema de negocio**, completamente aislada de los otros slices de su misma capa.

### Reglas

1. **Los nombres son libres** — los define el equipo según el dominio de negocio.
2. **Son independientes** — un slice NO puede importar de otro slice en la misma capa.
3. **Existen en 4 capas** — `pages`, `widgets`, `features`, `entities`. Las capas `app` y `shared` no tienen slices, solo segmentos.

### Cómo nombrar slices

| Capa | Convención de nombre | Ejemplos |
|------|---------------------|----------|
| **pages** | Sustantivo (la pantalla) | `obligaciones`, `pagos`, `configuracion` |
| **widgets** | Sustantivo compuesto (el bloque de UI) | `obligaciones-table`, `dashboard-resumen` |
| **features** | Verbo + sustantivo (la acción) | `crear-obligacion`, `aprobar-pago`, `filtrar-obligaciones` |
| **entities** | Sustantivo singular (la entidad) | `obligacion`, `proveedor`, `pago` |

### Coordinación entre slices

Si dos slices del mismo layer necesitan interactuar, la coordinación ocurre **en la capa superior**:

```
widgets/registrar-pago-dialog/        ← COORDINA ambas entities
    ├── usa → entities/obligacion/     ← independiente
    └── usa → entities/proveedor/      ← independiente
```

---

## Segmentos (Segments)

Cada slice se divide internamente en segmentos por tipo técnico:

| Segmento | Contenido | Archivos típicos |
|----------|-----------|-------------------|
| **ui/** | Componentes React (solo JSX y presentación) | `ComponentName.tsx` |
| **hooks/** | Custom hooks con lógica de estado, efectos y orquestación | `useSliceName.ts` |
| **model/** | Estado (stores), tipos, lógica de negocio | `slice-name.store.ts`, `slice-name.types.ts` |
| **api/** | Llamadas HTTP, queries/mutations | `slice-name.queries.ts`, `slice-name.mutation.ts` |
| **lib/** | Helpers puros y funciones utilitarias (sin hooks) | `calcular-algo.ts` |
| **config/** | Constantes, enums, configuración local | `slice-name.constants.ts` |

> **Importante: `hooks/` vs `lib/`** — No mezclar hooks con helpers puros. Los custom hooks (`useX`) van en `hooks/`. Las funciones puras sin estado ni efectos van en `lib/`.

### No todos los segmentos son obligatorios

Un slice solo tiene los segmentos que necesita:

```
# Un feature simple: solo ui + api
features/exportar-reporte/
├── ui/
│   └── ExportarReporteButton.tsx
├── api/
│   └── exportar-reporte.mutation.ts
└── index.ts

# Una entity completa: todos los segmentos
entities/obligacion/
├── ui/
├── model/
├── api/
├── lib/
├── config/
└── index.ts
```

---

## Public API

Cada slice expone un archivo `index.ts` que actúa como **contrato público**. Solo lo exportado en este archivo puede ser usado por otros módulos.

### Ejemplo

```typescript
// entities/obligacion/index.ts

// Componentes
export { ObligacionCard } from './ui/ObligacionCard';
export { ObligacionStatusBadge } from './ui/ObligacionStatusBadge';

// Tipos
export type { Obligacion, EstadoObligacion } from './model/obligacion.types';

// Queries
export { obligacionQueries } from './api/obligacion.queries';

// Hooks de estado
export { useObligacionStore } from './model/obligacion.store';
```

### Reglas de importación

```typescript
// ✅ CORRECTO — importar desde la public API
import { ObligacionCard } from '@/entities/obligacion';

// ❌ INCORRECTO — acceder directamente a un archivo interno
import { ObligacionCard } from '@/entities/obligacion/ui/ObligacionCard';
```

### Beneficios

- **Refactorizar sin romper**: se puede reorganizar internamente el slice sin afectar a quienes lo consumen.
- **Imports limpios**: una sola ruta de importación por slice.
- **Control explícito**: solo se expone lo que se decide conscientemente.

---

## Reglas de Dependencia

### Regla principal

> Las dependencias solo fluyen **hacia abajo** en las capas, y los slices de una misma capa **nunca se importan entre sí**.

### Tabla de dependencias permitidas

| Desde ↓ / Hacia → | app | pages | widgets | features | entities | shared |
|-------------------|:---:|:-----:|:-------:|:--------:|:--------:|:------:|
| **app**           | —   | ✅    | ✅      | ✅       | ✅       | ✅     |
| **pages**         | ❌  | —     | ✅      | ✅       | ✅       | ✅     |
| **widgets**       | ❌  | ❌    | —       | ✅       | ✅       | ✅     |
| **features**      | ❌  | ❌    | ❌      | —        | ✅       | ✅     |
| **entities**      | ❌  | ❌    | ❌      | ❌       | —        | ✅     |
| **shared**        | ❌  | ❌    | ❌      | ❌       | ❌       | —      |

### Dentro del mismo layer

```
features/crear-obligacion  ──✅──→  entities/obligacion     (capa inferior)
features/crear-obligacion  ──✅──→  shared/ui               (capa inferior)
features/crear-obligacion  ──❌──→  features/aprobar-pago    (mismo layer)
features/crear-obligacion  ──❌──→  pages/obligaciones       (capa superior)
```

### Dentro del mismo slice

Los archivos internos de un slice **sí pueden importarse entre sí** usando rutas relativas:

```typescript
// features/crear-obligacion/ui/CrearObligacionForm.tsx
import { useCrearObligacion } from '../api/crear-obligacion.mutation';     // ✅ mismo slice
import { crearObligacionSchema } from '../model/crear-obligacion.schema';  // ✅ mismo slice
```

---

## Scaffolding Completo

```
src/
├── app/
│   ├── providers/
│   │   ├── ThemeProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   ├── router/
│   │   └── index.tsx
│   ├── styles/
│   │   └── global.css
│   └── index.tsx
│
├── pages/
│   ├── obligaciones/
│   │   ├── ui/
│   │   │   └── ObligacionesPage.tsx
│   │   └── index.ts
│   ├── pagos/
│   │   ├── ui/
│   │   │   └── PagosPage.tsx
│   │   └── index.ts
│   ├── reportes/
│   │   ├── ui/
│   │   │   └── ReportesPage.tsx
│   │   └── index.ts
│   └── login/
│       ├── ui/
│       │   └── LoginPage.tsx
│       └── index.ts
│
├── widgets/
│   ├── obligaciones-table/
│   │   ├── ui/
│   │   │   └── ObligacionesTable.tsx
│   │   ├── model/
│   │   │   └── table.store.ts
│   │   └── index.ts
│   ├── registrar-pago-dialog/
│   │   ├── ui/
│   │   │   └── RegistrarPagoDialog.tsx
│   │   └── index.ts
│   └── dashboard-resumen/
│       ├── ui/
│       │   └── DashboardResumen.tsx
│       └── index.ts
│
├── features/
│   ├── crear-obligacion/
│   │   ├── ui/
│   │   │   └── CrearObligacionForm.tsx
│   │   ├── model/
│   │   │   └── crear-obligacion.schema.ts
│   │   ├── api/
│   │   │   └── crear-obligacion.mutation.ts
│   │   └── index.ts
│   ├── editar-obligacion/
│   │   ├── ui/
│   │   │   └── EditarObligacionForm.tsx
│   │   ├── model/
│   │   │   └── editar-obligacion.schema.ts
│   │   ├── api/
│   │   │   └── editar-obligacion.mutation.ts
│   │   └── index.ts
│   ├── registrar-pago/
│   │   ├── ui/
│   │   │   └── RegistrarPagoForm.tsx
│   │   ├── model/
│   │   │   └── registrar-pago.schema.ts
│   │   ├── api/
│   │   │   └── registrar-pago.mutation.ts
│   │   └── index.ts
│   ├── aprobar-pago/
│   │   ├── ui/
│   │   │   └── AprobarPagoDialog.tsx
│   │   ├── api/
│   │   │   └── aprobar-pago.mutation.ts
│   │   └── index.ts
│   ├── filtrar-obligaciones/
│   │   ├── ui/
│   │   │   └── FiltrosPanel.tsx
│   │   ├── model/
│   │   │   └── filtros.store.ts
│   │   └── index.ts
│   ├── exportar-reporte/
│   │   ├── ui/
│   │   │   └── ExportarReporteButton.tsx
│   │   ├── api/
│   │   │   └── exportar-reporte.mutation.ts
│   │   └── index.ts
│   └── autenticacion/
│       ├── ui/
│       │   └── LoginForm.tsx
│       ├── model/
│       │   └── auth.store.ts
│       ├── api/
│       │   └── auth.mutation.ts
│       └── index.ts
│
├── entities/
│   ├── obligacion/
│   │   ├── ui/
│   │   │   ├── ObligacionCard.tsx
│   │   │   ├── ObligacionStatusBadge.tsx
│   │   │   └── ObligacionResumen.tsx
│   │   ├── model/
│   │   │   ├── obligacion.types.ts
│   │   │   └── obligacion.store.ts
│   │   ├── api/
│   │   │   └── obligacion.queries.ts
│   │   ├── lib/
│   │   │   ├── calcular-interes.ts
│   │   │   └── calcular-mora.ts
│   │   ├── config/
│   │   │   └── obligacion.constants.ts
│   │   └── index.ts
│   ├── proveedor/
│   │   ├── ui/
│   │   │   ├── ProveedorAvatar.tsx
│   │   │   └── ProveedorInfo.tsx
│   │   ├── model/
│   │   │   └── proveedor.types.ts
│   │   ├── api/
│   │   │   └── proveedor.queries.ts
│   │   └── index.ts
│   ├── pago/
│   │   ├── ui/
│   │   │   ├── PagoCard.tsx
│   │   │   └── PagoStatusChip.tsx
│   │   ├── model/
│   │   │   └── pago.types.ts
│   │   ├── api/
│   │   │   └── pago.queries.ts
│   │   └── index.ts
│   └── usuario/
│       ├── model/
│       │   └── usuario.types.ts
│       ├── api/
│       │   └── usuario.queries.ts
│       └── index.ts
│
└── shared/
    ├── ui/
    │   ├── Button.tsx
    │   ├── TextField.tsx
    │   ├── Select.tsx
    │   ├── DatePicker.tsx
    │   ├── Chip.tsx
    │   ├── DataTable.tsx
    │   ├── ConfirmDialog.tsx
    │   ├── PageHeader.tsx
    │   ├── SearchInput.tsx
    │   ├── FormField.tsx
    │   ├── EmptyState.tsx
    │   └── index.ts
    ├── api/
    │   ├── http-client.ts
    │   ├── query-client.ts
    │   └── index.ts
    ├── lib/
    │   ├── hooks/
    │   │   ├── use-debounce.ts
    │   │   ├── use-local-storage.ts
    │   │   └── index.ts
    │   ├── utils/
    │   │   ├── format-currency.ts
    │   │   ├── format-date.ts
    │   │   └── index.ts
    │   └── index.ts
    ├── config/
    │   ├── env.ts
    │   ├── routes.ts
    │   └── index.ts
    └── types/
        ├── api.types.ts
        └── index.ts
```

---

## Convenciones de Nombrado

### Archivos y carpetas

| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Carpetas (slices, segmentos) | `kebab-case` | `crear-obligacion/`, `ui/` |
| Componentes React | `PascalCase` | `ObligacionCard.tsx` |
| Hooks | `use-kebab-case` | `use-debounce.ts` |
| Stores | `kebab-case` con sufijo `.store` | `obligacion.store.ts` |
| Tipos | `kebab-case` con sufijo `.types` | `obligacion.types.ts` |
| Queries | `kebab-case` con sufijo `.queries` | `obligacion.queries.ts` |
| Mutations | `kebab-case` con sufijo `.mutation` | `crear-obligacion.mutation.ts` |
| Schemas | `kebab-case` con sufijo `.schema` | `crear-obligacion.schema.ts` |
| Constantes | `kebab-case` con sufijo `.constants` | `obligacion.constants.ts` |
| Tests | Mismo nombre con sufijo `.test` | `ObligacionCard.test.tsx` |

### Nombres claros y sin ambigüedades

Los nombres de componentes, archivos y variables deben ser **descriptivos y autoexplicativos**. Evitar:

- **Jerga visual o de diseño**: "Pill", "Bone", "Card" (cuando no es un MUI Card), "Wrapper", "Container" genérico
- **Nombres genéricos**: "Item", "Content", "View" sin contexto
- **Abreviaciones no estándar**: "Btn", "Hdr", "Ftr"

| ❌ Nombre ambiguo | ✅ Nombre descriptivo | Por qué |
|---|---|---|
| `TotalPill` | `TotalResumen` | "Pill" es jerga visual, "Resumen" describe la función |
| `Bone` | `SkeletonBlock` | "Bone" no comunica que es un placeholder de carga |
| `ViewHeader` | `CompraViewHeader` | "View" es genérico, necesita contexto del dominio |
| `Item` | `ConceptoRow` | "Item" no dice qué tipo de dato representa |
| `Content` | `FormularioComercio` | "Content" no describe qué contiene |

**Regla**: si otro desarrollador no puede entender qué hace el componente solo leyendo su nombre, el nombre es incorrecto.

### Aliases de importación

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Esto permite imports limpios:

```typescript
import { ObligacionCard } from '@/entities/obligacion';
import { httpClient } from '@/shared/api';
import { Button } from '@/shared/ui';
```

---

## Patrones por Segmento

### `ui/` — Componentes

```typescript
// entities/obligacion/ui/ObligacionCard.tsx
import type { Obligacion } from '../model/obligacion.types';

interface ObligacionCardProps {
  obligacion: Obligacion;
  onClick?: () => void;
}

export function ObligacionCard({ obligacion, onClick }: ObligacionCardProps) {
  return (
    <Card onClick={onClick}>
      <Typography variant="h6">#{obligacion.numero}</Typography>
      <Typography>Monto: ${obligacion.monto.toLocaleString()}</Typography>
    </Card>
  );
}
```

### `model/` — Tipos

```typescript
// entities/obligacion/model/obligacion.types.ts
export type EstadoObligacion = 'pendiente' | 'parcial' | 'pagada' | 'vencida';

export interface Obligacion {
  id: string;
  numero: string;
  proveedorId: string;
  monto: number;
  saldoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoObligacion;
}
```

### `model/` — Store

```typescript
// entities/obligacion/model/obligacion.store.ts
import { create } from 'zustand';

interface ObligacionUIState {
  selectedId: string | null;
  setSelected: (id: string | null) => void;
}

export const useObligacionStore = create<ObligacionUIState>((set) => ({
  selectedId: null,
  setSelected: (id) => set({ selectedId: id }),
}));
```

### `api/` — Queries (entities)

```typescript
// entities/obligacion/api/obligacion.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';
import type { Obligacion } from '../model/obligacion.types';

export const obligacionQueries = {
  all: () => queryOptions({
    queryKey: ['obligaciones'],
    queryFn: () => httpClient.get<Obligacion[]>('/obligaciones'),
  }),
  detail: (id: string) => queryOptions({
    queryKey: ['obligaciones', id],
    queryFn: () => httpClient.get<Obligacion>(`/obligaciones/${id}`),
  }),
};
```

### `api/` — Mutations (features)

```typescript
// features/crear-obligacion/api/crear-obligacion.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';

export function useCrearObligacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearObligacionDTO) =>
      httpClient.post('/obligaciones', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}
```

### `lib/` — Utilidades

```typescript
// entities/obligacion/lib/calcular-interes.ts
import type { Obligacion } from '../model/obligacion.types';

export function calcularInteresMora(obligacion: Obligacion, tasaAnual: number): number {
  const hoy = new Date();
  const vencimiento = new Date(obligacion.fechaVencimiento);
  const diasMora = Math.max(0, Math.floor((hoy.getTime() - vencimiento.getTime()) / 86400000));
  const tasaDiaria = tasaAnual / 365;
  return obligacion.saldoPendiente * tasaDiaria * diasMora;
}
```

### `config/` — Constantes

```typescript
// entities/obligacion/config/obligacion.constants.ts
export const ESTADOS_OBLIGACION = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  parcial: { label: 'Pago Parcial', color: 'info' },
  pagada: { label: 'Pagada', color: 'success' },
  vencida: { label: 'Vencida', color: 'error' },
} as const;
```

---

## Testing

Los tests se ubican **junto al archivo que prueban**, con el sufijo `.test`:

```
entities/obligacion/
├── ui/
│   ├── ObligacionCard.tsx
│   └── ObligacionCard.test.tsx        ← test junto al componente
├── model/
│   ├── obligacion.types.ts
│   └── obligacion.store.test.ts       ← test junto al store
├── lib/
│   ├── calcular-interes.ts
│   └── calcular-interes.test.ts       ← test junto a la utilidad
└── index.ts
```

### Qué testear en cada segmento

| Segmento | Tipo de test | Qué verificar |
|----------|-------------|---------------|
| **ui/** | Render + interacción | Que el componente renderiza correctamente y responde a eventos |
| **model/** | Unitario | Que el store cambia de estado correctamente |
| **api/** | Unitario con mock | Que las queries/mutations llaman al endpoint correcto |
| **lib/** | Unitario puro | Que las funciones retornan el valor esperado |

### Reglas

1. **Colocación**: los tests viven en el mismo segmento que el archivo que prueban, nunca en una carpeta global separada.
2. **Imports en tests**: un test puede importar archivos internos del slice (no necesita pasar por la Public API), ya que el test es parte del slice.
3. **Tests de integración de página**: se ubican en `pages/<slice>/` y verifican la composición completa de widgets y features.

---

## Cross-Cutting Concerns

Funcionalidades transversales que no pertenecen a un solo slice (notificaciones, analytics, manejo global de errores) se manejan de la siguiente forma:

### Notificaciones / Toasts

Se colocan en `shared/` como utilidad genérica sin lógica de negocio:

```
shared/
├── lib/
│   └── notifications/
│       ├── notification.service.ts    ← función showNotification()
│       └── index.ts
```

Cada feature invoca la notificación después de su acción:

```typescript
// features/crear-obligacion/api/crear-obligacion.mutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/shared/api';
import { showNotification } from '@/shared/lib/notifications';

export function useCrearObligacion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CrearObligacionDTO) =>
      httpClient.post('/obligaciones', dto),
    onSuccess: () => {
      showNotification({ message: 'Obligación creada', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['obligaciones'] });
    },
  });
}
```

### Error Boundaries

Se colocan en `app/` como parte de la configuración global:

```
app/
├── providers/
│   ├── ErrorBoundary.tsx              ← captura errores de renderizado
│   └── ...
```

Si un widget necesita su propio error boundary, se coloca dentro del widget:

```
widgets/obligaciones-table/
├── ui/
│   ├── ObligacionesTable.tsx
│   └── ObligacionesTableErrorFallback.tsx
```

### Analytics / Tracking

Se expone como servicio en `shared/` y se consume desde features:

```
shared/
├── lib/
│   └── analytics/
│       ├── analytics.service.ts       ← track(), identify()
│       └── index.ts
```

### Regla general

> Si la funcionalidad **no tiene lógica de negocio** → `shared/lib/`
> Si la funcionalidad **es una acción del usuario** que además trackea/notifica → la lógica de tracking/notificación vive en `shared/`, pero se **invoca desde el feature**.

---

## Regla de Hooks y Componentes Delgados

Los componentes en `ui/` deben ser **delgados**: solo JSX y presentación. Toda la lógica con estado, efectos, validaciones y orquestación se extrae a custom hooks en `hooks/`.

### Por qué

- **Testabilidad**: los hooks se pueden testear sin renderizar componentes.
- **Legibilidad**: el componente muestra claramente qué se renderiza sin mezclar lógica.
- **Reusabilidad**: la lógica del hook se puede reutilizar en otro componente si es necesario.

### Estructura

```
pages/radicacion/
├── ui/
│   └── RadicacionCompraPage.tsx      ← solo JSX, llama hooks
├── hooks/
│   └── useRadicacionCompra.ts        ← estado, effects, validación, mutations
└── index.ts

features/registrar-compra/
├── ui/
│   └── FormularioComercio.tsx         ← solo JSX
├── hooks/
│   └── useFormularioComercio.ts       ← estado del formulario, highlights
├── lib/
│   └── calcular-totales.ts            ← función pura (NO es hook)
└── index.ts
```

### Ejemplo

```typescript
// pages/radicacion/hooks/useRadicacionCompra.ts
export function useRadicacionCompra(id?: string) {
  const { data: borrador, isPending } = useQuery({ ... });
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const confirmarMutation = useConfirmarBorrador();

  const handleGuardar = () => { ... };
  const handleDescartar = () => { ... };

  return { borrador, isPending, errorFields, handleGuardar, handleDescartar, ... };
}

// pages/radicacion/ui/RadicacionCompraPage.tsx
export function RadicacionCompraPage() {
  const { borrador, errorFields, handleGuardar, ... } = useRadicacionCompra(id);

  return (
    <Box>
      <RegistroForm errorFields={errorFields} />
      <RegistroActionBar onGuardar={handleGuardar} />
    </Box>
  );
}
```

### Reglas

| Regla | Descripción |
|-------|-------------|
| `ui/` solo presenta | No debe tener `useState`, `useEffect`, `useMutation` directamente (excepto estado visual trivial como un toggle de UI) |
| `hooks/` orquesta | Contiene custom hooks con toda la lógica: estado, efectos, validaciones, llamadas API |
| `lib/` es puro | Solo funciones sin `use*`, sin estado, sin efectos. Helpers puros y cálculos |
| No mezclar `hooks/` con `lib/` | Un archivo en `lib/` NUNCA debe exportar un hook. Un archivo en `hooks/` NUNCA debe exportar una función pura sin estado |

---

## Errores Comunes

| Error | Por qué es problema | Solución |
|-------|---------------------|----------|
| Lógica de negocio en `shared/` | `shared` se acopla a todo el proyecto | Mover a `entities/` o `features/` |
| Feature que importa de otro feature | Crea acoplamiento horizontal | Extraer lo común a `entities/` o `shared/` |
| Página con lógica compleja | Dificulta reusar esa lógica | La página solo compone widgets y features |
| Entity que importa de feature | Viola la jerarquía de capas | Invertir la dependencia: el feature usa la entity |
| Importar sin usar la public API | Acopla a la estructura interna | Siempre importar desde `index.ts` del slice |
| Un slice con demasiados archivos | Mezcla múltiples responsabilidades | Dividir en slices más pequeños y específicos |
| Poner todo en `entities/` | Confundir entities con features | Entities = sustantivos, Features = verbos |
| Lógica compleja en `ui/` | Componentes gordos, difíciles de testear y leer | Extraer a custom hooks en `hooks/` |
| Hooks en `lib/` | Mezcla hooks con helpers puros, confunde responsabilidades | Hooks en `hooks/`, funciones puras en `lib/` |
