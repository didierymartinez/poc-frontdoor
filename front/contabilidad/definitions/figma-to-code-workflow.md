# Workflow: Figma a Codigo

## Proposito

Este documento define el proceso estandar para convertir disenos de Figma en codigo production-ready usando React + MUI 7 + Feature-Sliced Design. Sirve como instruccion que Claude Code sigue automaticamente al recibir una URL de Figma.

> **Nota**: Este documento es iterativo. Se actualiza con lecciones aprendidas de cada implementacion.

---

## Pre-requisitos

Antes de iniciar cualquier implementacion:

- [ ] URL del frame o pagina en Figma
- [ ] Dev server corriendo (`bun run dev`)
- [ ] Playwright MCP instalado con `--caps=vision,testing`
- [ ] Figma MCP conectado (plugin habilitado)

**Stack del proyecto:**
- React 19 + TypeScript 5.9 (strict mode)
- MUI 7 con tema Cosmos (`src/app/styles/cosmosTheme.ts`)
- Iconos: `@tabler/icons-react`
- Path alias: `@/` → `src/`
- Arquitectura: Feature-Sliced Design (ver `definitions/feature-sliced-design.md`)

---

## Fase 1: Analisis del Diseno

Ejecutar las herramientas MCP de Figma en este orden:

| Paso | Herramienta MCP | Proposito |
|------|----------------|-----------|
| 1 | `get_metadata` | Estructura XML: IDs, nombres, dimensiones. Usar esto PRIMERO para entender la jerarquia sin sobrecargar el contexto |
| 2 | `get_design_context` (nodos hijos) | Datos estructurados de nodos individuales (una fila, el header, el footer). NO llamar en el nodo raiz si es complejo (>50 hijos) porque puede generar >100KB |
| 3 | `get_screenshot` | Vision general visual del frame completo para referencia |
| 4 | `get_variable_defs` | Tokens de diseno (variables y estilos definidos en Figma) |
| 5 | `search_design_system` | Buscar componentes reutilizables en la libreria del design system |
| 6 | `get_code_connect_map` | Verificar si existen mappings previos entre nodos Figma y codigo |

> **Importante**: Para componentes complejos (DataGrid, formularios grandes), llamar `get_design_context` en nodos hijos individuales en vez del nodo raiz. Esto evita respuestas truncadas y permite analizar cada seccion en detalle.

### Que extraer del analisis

- **Jerarquia de componentes**: que bloques visuales componen la pagina
- **Colores**: hex exactos de fondos, textos, bordes, iconos
- **Tipografia**: tamano, peso, familia de cada texto
- **Spacing**: margenes, paddings, gaps entre elementos
- **Iconos**: nombres o formas de los iconos utilizados
- **Estados**: hover, disabled, selected, error (si el diseno los muestra)

---

## Fase 2: Clasificacion en Capas FSD

Cada bloque visual identificado en la Fase 1 se clasifica segun este arbol de decision:

| Pregunta | Si la respuesta es si → | Ubicacion |
|----------|------------------------|-----------|
| Es la composicion completa de una ruta/pagina? | **Page** | `src/pages/{page-name}/ui/{PageName}Page.tsx` |
| Es un bloque UI autonomo grande (tabla, formulario, sidebar)? | **Widget** | `src/widgets/{widget-name}/ui/{WidgetName}.tsx` |
| Es una accion del usuario con valor de negocio (aprobar, filtrar, buscar)? | **Feature** | `src/features/{verb-noun}/ui/{VerbNoun}.tsx` |
| Es la representacion visual de una entidad de dominio? | **Entity** | `src/entities/{entity}/ui/{EntityName}Card.tsx` |
| Es un primitivo UI reutilizable (badge, status indicator)? | **Shared** | `src/shared/ui/{ComponentName}.tsx` |

### Convenciones de nombrado

- **Carpetas**: `kebab-case` (ej: `entrada-radicador`, `obligaciones-table`)
- **Componentes**: `PascalCase` (ej: `EntradaRadicadorPage`, `ObligacionesTable`)
- **Features**: verbo + sustantivo (ej: `filter-obligations`, `approve-entry`)
- **Entities**: sustantivo singular (ej: `obligation`, `user`)
- **Barrel exports**: cada slice tiene `index.ts` que exporta su API publica

```
src/{layer}/{slice-name}/
├── index.ts          # export { ComponentName } from './ui/ComponentName'
└── ui/
    └── ComponentName.tsx
```

---

## Fase 3: Mapeo de Tokens al Tema Cosmos

### Colores

Mapear cada color de Figma al token mas cercano de `cosmosTheme.ts`:

| Color en Figma | Token en theme |
|---------------|---------------|
| Violeta/morado | `theme.palette.primary.*` (main: #5323de) |
| Cyan/turquesa | `theme.palette.secondary.*` (main: #00bcd4) |
| Rojo | `theme.palette.error.*` (main: #d14343) |
| Naranja | `theme.palette.warning.*` (main: #fb8500) |
| Azul | `theme.palette.info.*` (main: #2d9fc5) |
| Verde | `theme.palette.success.*` (main: #8fc93a) |
| Grises | `theme.palette.grey.*` (50: #fbfbfb ... 900: #a2a6ab) |
| #101840 (texto oscuro) | `theme.palette.text.primary` |
| rgba(16,24,64,0.6) | `theme.palette.text.secondary` |
| #f5f5f5 (fondo) | `theme.palette.background.default` |
| #ffffff (superficies) | `theme.palette.background.paper` |

**Tonos de cada color** (50-900): usar el sufijo numerico. Ejemplo: `theme.palette.primary[300]` para #b9b3ff.

### Tipografia

| Tamano en Figma | Variant MUI | Font size |
|----------------|-------------|-----------|
| 40px | `h1` | 2.5rem |
| 32px | `h2` | 2rem |
| 28px | `h3` | 1.75rem |
| 22px | `h4` | 1.375rem |
| 18px | `h5` | 1.125rem |
| 16px | `h6` | 1rem |
| 14px regular | `body1` | 0.875rem |
| 14px medium | `subtitle1` | 0.875rem (fw:400) |
| 13px regular | `body2` | 0.8125rem |
| 13px medium | `subtitle2` | 0.8125rem (fw:500) |
| 12px | `body3` | 0.75rem |
| 11px normal | `caption` | 0.6875rem |
| 11px uppercase | `overline` | 0.6875rem |

**Regla**: siempre usar `<Typography variant="...">`, nunca `fontSize` inline.

### Spacing

- **Unidad base**: 8px
- **Formula**: valor en Figma / 8 = multiplicador para `theme.spacing(n)`
- Ejemplos: 4px = `theme.spacing(0.5)`, 8px = `theme.spacing(1)`, 16px = `theme.spacing(2)`, 24px = `theme.spacing(3)`

### Componentes Figma → MUI

| Elemento en Figma | Componente MUI | Notas |
|-------------------|---------------|-------|
| Frame / Auto layout (vertical) | `Stack` o `Box` con `flexDirection: 'column'` | Preferir `Stack` con `spacing` |
| Frame / Auto layout (horizontal) | `Stack direction="row"` | |
| Text | `Typography` | Siempre con `variant` |
| Button | `Button` | Default `size="small"`, `textTransform: none` ya aplicado |
| Input / Text field | `TextField` | Default `size="small"` |
| Table / Data table | `DataGrid` | Usar `density="compact"` (26px rows) |
| Checkbox | `Checkbox` | |
| Toggle / Switch | `Switch` | |
| Dropdown / Select | `Select` o `Autocomplete` | |
| Modal / Dialog | `Dialog` | |
| Card | `Card` | |
| Divider / Line | `Divider` | |
| Chip / Tag | `Chip` | `borderRadius: 4` ya aplicado |
| Alert / Banner | `Alert` | |
| Tooltip | `Tooltip` | Fondo violeta claro ya configurado |
| Tabs | `Tabs` + `Tab` | `textTransform: none` ya aplicado |
| Icon | `@tabler/icons-react` | Formato: `Icon{PascalCaseName}` |
| Avatar | `Avatar` | Fondo gris #ced1d4 ya configurado |
| Breadcrumbs | `Breadcrumbs` | |
| Stepper | `Stepper` | |
| Snackbar | `Snackbar` | Fondo #323232 ya configurado |
| Rating | `Rating` | Color #ffb400 ya configurado |

### Deteccion y correccion de discrepancias de tokens

Si un color, tamano de fuente, spacing u otro token del diseno de Figma **NO tiene equivalente exacto** en `cosmosTheme.ts`:

1. **Documentar** la discrepancia con valor exacto de Figma vs valor actual del theme
2. **Actualizar siempre `src/app/styles/cosmosTheme.ts`** con el valor del Figma Handoff. El Figma es la fuente de verdad para los tokens visuales del proyecto.
3. **Agregar comentario** en el theme indicando que el valor fue actualizado desde el Figma Handoff (ej: `// actualizado desde Figma Handoff (antes: #xxx)`)
4. **Registrar** la discrepancia en la tabla de discrepancias y en la seccion "Lecciones aprendidas" de este documento

> **Regla**: El Figma Handoff siempre tiene prioridad sobre los valores actuales del theme. Cuando hay diferencia, se actualiza el theme, no se adapta el codigo al theme viejo.

---

## Fase 4: Implementacion

### Orden estricto bottom-up

```
shared → entities → features → widgets → pages
```

Implementar en este orden para respetar la regla FSD de que los imports solo fluyen de arriba hacia abajo.

### Reglas de implementacion

1. **Estructura FSD**: crear carpeta del slice con `index.ts` barrel export
2. **Componentes delgados**: los `.tsx` en `ui/` solo contienen JSX y presentacion. Toda la logica (estado, efectos, validaciones, mutations) se extrae a custom hooks en `hooks/`
3. **Hooks vs lib**: los custom hooks (`useX`) van en `hooks/`. Las funciones puras sin estado van en `lib/`. NUNCA mezclar
4. **Estilos**: usar `sx` prop para estilos one-off. Nunca usar `style` inline
5. **Colores**: nunca hardcodear hex. Siempre `theme.palette.*`
6. **Tipografia**: nunca hardcodear font-size. Siempre `<Typography variant="...">`
7. **Spacing**: nunca hardcodear px. Siempre `theme.spacing(n)`
8. **Layout**: usar `Box`, `Stack`, `Grid` en vez de `<div>` raw
9. **Iconos**: importar de `@tabler/icons-react` con formato `Icon{PascalCaseName}`
10. **Defaults**: respetar defaults del theme (buttons small, inputs small, lists dense)
11. **TypeScript**: sin `any`, usar tipos estrictos
12. **Code Connect**: al finalizar, registrar mappings con `add_code_connect_map`

---

## Fase 5: Verificacion Visual — El resultado debe ser igual al Figma

El objetivo es lograr **fidelidad visual 1:1** entre la implementacion y el diseno de Figma.

### Ciclo de verificacion

#### 1. Capturar ambas fuentes

```
# Implementacion (Playwright MCP)
browser_navigate → localhost:{port}/{ruta}
browser_take_screenshot → captura de la pagina implementada

# Diseno original (Figma MCP)
get_screenshot → captura del frame de Figma
```

#### 2. Comparacion visual directa

Analizar ambos screenshots verificando:

- **Layout**: posiciones, distribuciones, alineacion de elementos
- **Colores**: fondos, textos, bordes, iconos — deben coincidir exactamente
- **Tipografia**: tamano, peso, familia, line-height
- **Spacing**: margenes, paddings, gaps entre elementos
- **Componentes**: bordes, sombras, border-radius, estados visuales

#### 3. Verificacion programatica con `browser_evaluate`

Extraer estilos computados de elementos clave para detectar diferencias sutiles:

```javascript
// Ejemplo: extraer estilos computados de un elemento
const el = document.querySelector('.MuiTypography-h6');
const styles = window.getComputedStyle(el);
return {
  fontSize: styles.fontSize,
  fontWeight: styles.fontWeight,
  color: styles.color,
  padding: styles.padding,
  margin: styles.margin
};
```

Comparar estos valores contra los tokens esperados del diseno de Figma.

#### 4. Verificacion de contenido con testing tools

```
browser_verify_element_visible → confirmar que todos los elementos del diseno estan presentes
browser_verify_text_visible → confirmar que los textos son visibles y correctos
```

#### 5. Ciclo de correccion

Si hay diferencias → corregir el codigo → repetir la verificacion hasta lograr fidelidad 1:1.

#### 6. Verificacion de accesibilidad

```
browser_snapshot → obtener arbol de accesibilidad del DOM
```

Verificar que la estructura semantica es correcta (headings, landmarks, labels).

#### 7. Limpieza de screenshots

Al finalizar la verificacion, **eliminar todos los screenshots generados por Playwright** en `.playwright-mcp/`:

```bash
rm -f .playwright-mcp/*.png .playwright-mcp/*.jpeg
```

> **Regla**: Nunca dejar screenshots de verificacion en el proyecto. Son archivos temporales que no deben commitearse.

---

## Fase 6: Correccion y Documentacion de Discrepancias

Cuando se detectan diferencias durante la verificacion:

### Clasificacion

| Tipo | Accion |
|------|--------|
| Error de implementacion | Corregir codigo, re-verificar con Playwright |
| Token faltante o diferente en theme | **Actualizar `cosmosTheme.ts`** con el valor del Figma + documentar en tabla de discrepancias |
| Diferencia intencional | Documentar justificacion |

> **Regla**: Ante cualquier discrepancia de tokens, siempre modificar `src/app/styles/cosmosTheme.ts` para que coincida con el Figma Handoff. No usar valores "cercanos" ni dejar el theme desactualizado.

### Tabla de discrepancias

Cuando un token no existe en el theme, documentar asi:

| Propiedad | Valor Figma | Valor anterior en theme | Decision |
|-----------|------------|------------------------|----------|
| Chip primary background | #e1e6ff | #c4e1f5 (azul claro) | Actualizar theme — el Figma Handoff usa violeta claro, no azul |
| Chip primary text color | #2f43d0 | #5a5e73 (gris) | Actualizar theme — el Figma Handoff usa violeta oscuro como texto |
| Chip primary hover | #c8cfff (derivado) | #a2cdee | Actualizar theme — derivado del nuevo primary chip |
| Chip outlined primary border/text | #2f43d0 | #5323de | Actualizar theme — consistencia con chip filled primary |
| Chip outlined success border/text | #72b525 | #8fc93a | Actualizar theme — Figma Handoff usa tono mas oscuro para outlined success |
| Chip outlined info border/text | #228db8 | #2d9fc5 | Actualizar theme — Figma Handoff usa tono mas oscuro para outlined info |
| Chip outlined error border/text | #c63434 | #d14343 | Actualizar theme — Figma Handoff usa tono mas oscuro para outlined error |
| Filter chip badge colors | Cada filtro tiene badge con color semantico propio (success/200, info/200, primary/200, error/200) | Badge sin color semantico | Implementar badge colors por estado en cada panel |

---

## Checklist de Calidad

Antes de considerar una pagina terminada:

- [ ] `bun run build` compila sin errores
- [ ] `bun run lint` pasa sin warnings
- [ ] Verificacion visual con Playwright: resultado identico al Figma
- [ ] No hay colores hex hardcoded (todo via `theme.palette.*`)
- [ ] No hay font-sizes hardcoded (todo via `Typography` variant o `theme.typography.*`)
- [ ] No hay spacing hardcoded (todo via `theme.spacing()`)
- [ ] Imports FSD respetados (sin imports hacia arriba ni circulares)
- [ ] Componentes en `ui/` son delgados (logica en `hooks/`, helpers en `lib/`)
- [ ] No hay hooks (`useX`) en carpetas `lib/` ni `ui/`
- [ ] Cada slice tiene `index.ts` barrel export
- [ ] Componentes usan MUI, no HTML raw (`div`, `span`, `p`)
- [ ] Iconos importados de `@tabler/icons-react`
- [ ] Defaults densos respetados (buttons small, inputs small, DataGrid compact)
- [ ] Sin tipos `any` en TypeScript
- [ ] Discrepancias de tokens documentadas y resueltas
- [ ] Nombres PascalCase (componentes) y kebab-case (carpetas)
- [ ] Screenshots de Playwright eliminados (`.playwright-mcp/*.png`, `*.jpeg`)

---

## Ejemplo de Referencia

Patron existente en el proyecto:

```
src/pages/entrada-radicador/
├── index.ts                          # export { EntradaRadicadorPage } from './ui/EntradaRadicadorPage'
└── ui/
    └── EntradaRadicadorPage.tsx       # Importa widget de @/widgets/obligaciones-table

src/widgets/obligaciones-table/
├── index.ts                          # export { ObligacionesTable } from './ui/ObligacionesTable'
└── ui/
    └── ObligacionesTable.tsx          # Usa Box, Typography de MUI
```

La page compone widgets. Los widgets usan componentes MUI con el tema Cosmos.

---

## Lecciones Aprendidas

*(Esta seccion se actualiza con cada implementacion)*

| Fecha | Leccion | Contexto |
|-------|---------|----------|
| 2025-03-25 | `get_design_context` puede generar output >100KB que no cabe en contexto. Usar `get_metadata` primero para obtener la estructura y luego `get_design_context` en nodos hijos especificos (ej: una fila, el footer) | DataGrid Obligaciones Radicador — nodo 4542:69042 |
| 2025-03-25 | Los assets de imagenes del Figma MCP (`figma.com/api/mcp/asset/...`) son URLs temporales (7 dias). Para produccion, descargar y guardar en `src/shared/assets/` | Logos de tarjetas Mastercard, Visa, Diners, Amex |
| 2025-03-25 | El paquete correcto para iconos React es `@tabler/icons-react`, no `@tabler/icons` (que es solo SVG). Verificar que el paquete `-react` esta en package.json | Import de IconFileDescription, IconStar |
| 2025-03-25 | `@mui/x-data-grid` no viene incluido con MUI 7. Debe instalarse aparte con `bun add @mui/x-data-grid`. El theme ya tiene estilos para MuiDataGrid | Implementacion del DataGrid |
| 2025-03-25 | Para la Fase de Analisis, la secuencia optima es: (1) `get_metadata` para estructura, (2) `get_design_context` en nodos hijos individuales (una fila, el header, el footer), (3) `get_screenshot` para referencia visual. Esto evita respuestas truncadas | Workflow optimizado tras primera prueba |
| 2025-03-25 | Los Figma components con nombre `<DataGrid>` mapean directamente a MUI DataGrid. Los headers usan `body2` con `text.secondary`, las celdas `body2` con `text.primary` o `text.secondary` segun importancia | Mapeo de componentes Figma → MUI |
| 2025-03-25 | En el Figma, los logos de medio de pago son imagenes rasterizadas dentro de un frame de 23x16px con borde `#d9d9d9` y border-radius `2.5px`. En produccion conviene reemplazarlos por SVGs del design system | Columna "Medio" del DataGrid |
| 2025-03-25 | Playwright MCP `browser_navigate` + `browser_take_screenshot` es la forma mas rapida de verificar. El `browser_snapshot` (arbol de accesibilidad) sirve para confirmar que los datos se renderizan correctamente sin necesidad de screenshot | Verificacion visual |
| 2026-03-25 | En MUI X DataGrid v8, `.MuiDataGrid-columnHeaderRow` NO existe como clase standalone (solo como sufijo Emotion `css-xxx-MuiDataGrid-columnHeaderRow`). La clase real del header row es `.MuiDataGrid-row--borderBottom`. Ademas, cada `.MuiDataGrid-columnHeader` tiene `background-color: white` por defecto, lo que tapa cualquier fondo aplicado al row padre. Para aplicar bgcolor al header, usar el selector `& .MuiDataGrid-columnHeader` directamente | Header bgcolor del DataGrid |
| 2026-03-25 | Para validar que un estilo se aplico correctamente en MUI/DataGrid: (1) Usar `browser_evaluate` con `querySelector` para verificar que el selector CSS apunta a un elemento real (no retorna `null`). (2) Leer `window.getComputedStyle(el).backgroundColor` (u otra propiedad) para confirmar el valor computado. (3) Si el valor no coincide, inspeccionar elementos hijos/padres — un hijo con fondo opaco puede tapar el estilo del padre. (4) Probar el estilo inline via `browser_evaluate` (`el.style.backgroundColor = '#xxx'`) y tomar screenshot para confirmar visualmente antes de modificar el codigo | Validacion de estilos con Playwright |
| 2026-03-25 | Una vez que el usuario confirme que el diseno esta correctamente implementado, eliminar todos los screenshots `.png`/`.jpeg` generados por Playwright en `.playwright-mcp/` para no acumular archivos temporales en el proyecto | Limpieza post-verificacion |
| 2026-03-25 | Cuando en el Figma una toolbar tiene elementos a la izquierda (chips, filtros) y a la derecha (search, acciones) en la misma fila, NO separarlos en componentes/contenedores distintos. Deben estar en el mismo `Box` con `display: flex` y `justifyContent: space-between`. Si un panel necesita su propia toolbar (ej: chips de filtro), mover el search al panel en vez de dejarlo en el shell padre | Alineacion toolbar Devoluciones |
| 2026-03-25 | Cuando una columna del DataGrid usa colores condicionales (ej: "Vence en" con rojo para urgencia), el Figma MCP no siempre expone la logica de colores en la data estructurada. Verificar visualmente en el screenshot de Figma comparando valores y sus colores para inferir la regla. En este caso: valores <= 3 dias usan `error.main`, "Hoy" usa `text.primary` bold, y el resto `text.secondary` | Colores condicionales en columna Vence en |
| 2026-03-25 | El empty state de las tablas NO usa `noRowsOverlay` del DataGrid. En el Figma, cuando no hay datos se oculta TODO (toolbar, chips, search, DataGrid) y se muestra solo el EmptyState centrado debajo de los tabs. Implementar con early return condicional: `if (rows.length === 0) return <EmptyState ... />` antes del render del toolbar+grid. El componente EmptyState va en `shared/ui/` con el SVG de ilustracion en `shared/assets/EmptyState/` | Empty state de tablas sin datos |
| 2026-03-25 | Los colores de Chip en el Figma Handoff (primary bg: `#e1e6ff`, text: `#2f43d0`) NO coincidian con los tokens del theme original (bg: `#c4e1f5`, text: `#5a5e73`). Se actualizo `cosmosTheme.ts` con los valores del Figma. **Siempre verificar los colores de Chips contra el Figma antes de implementar**, ya que el design system Cosmos puede tener tokens actualizados que aun no se reflejan en el theme del proyecto | Discrepancia Chip colors en tabla Devoluciones — nodo 4542:72114 |
| 2026-03-25 | Los chips outlined del Figma usan tonos mas oscuros que los `*.main` del theme para bordes/texto: success `#72b525` (vs `#8fc93a`), info `#228db8` (vs `#2d9fc5`), error `#c63434` (vs `#d14343`). Se actualizaron todos en `cosmosTheme.ts`. **Patron**: los outlined chips en Figma tienden a usar tonos 700-800 de la paleta en vez del `main` (500) | Chips outlined en tabla Anticipos — nodo 4568:67245 |
| 2026-03-25 | Los filter chips del Figma tienen badges (pills) con color semantico diferente por cada filtro (ej: Vigente usa primary/200, Pagado usa success/200, Cerrado usa error/200). El badge del filtro activo usa su color semantico; el badge inactivo usa `grey.200` con `text.secondary`. Implementar con un `filterBadgeColors` map por label | Filter chips con badges semanticos en Anticipos |
| 2026-03-25 | Los status chips de cada panel mapean a colores MUI semanticos diferentes. Siempre verificar contra el Figma: (1) Vigente = `primary` (no `info`), (2) Regularizado = `info` (no `success`), (3) Cerrado = `error` (no `default`), (4) Reversado = `default` (no `error`). El mapeo no es intuitivo — siempre confirmar con el Figma | Mapeo estado→color en chips de tabla Anticipos |
| 2026-03-25 | El nodo `content` del Figma envuelve el DataGrid en una card con `background.paper` (white), `border-radius: 8px` y `box-shadow: 6px 4px 4px 0px rgba(73,71,71,0.03)`. Agregar `CssBaseline` en `main.tsx` para que el fondo de la pagina sea `background.default` (#f5f5f5) y la card blanca se distinga. El titulo "Obligaciones por pagar" va FUERA de la card, directamente sobre el fondo gris | Estructura page: fondo gris + card blanca — nodo 4542:72700 |
| 2026-03-25 | **CRITICO**: El theme `cosmosTheme.ts` define estilos para `MuiDataGrid-root--densityStandard` con `!important` (rows 32px, headers 40px). Si el DataGrid no especifica `density`, usa `standard` por defecto. Los `sx` del componente con selectores simples (`& .MuiDataGrid-row`) NO sobrescriben el theme porque tienen menor especificidad. **Solucion**: usar selectores con prefijo de densidad en los `sx`: `&.MuiDataGrid-root--densityStandard .MuiDataGrid-row` para que tengan la misma especificidad que el theme y el ultimo en insertarse gane. Valores del Figma: headers=24px, rows=40px, footer=22px | Especificidad CSS de DataGrid vs theme — nodo 4272:87752 |
| 2026-03-26 | **Regla IA Label**: Toda referencia a "IA" en la UI (etiquetas "GENERADO CON IA", "EXTRAÍDO CON IA", "Ver sugerida IA", etc.) debe usar el SVG `src/shared/assets/IA-label.svg` renderizado como `<Box component="img" src={iaLabelSrc} alt="IA" sx={{ width: 19, height: 18 }} />`. **Nunca** usar texto plano "IA", Chips con label "IA", ni emojis ✦ como sustituto. En Vite, los SVG importados son URLs (strings), no componentes React — siempre renderizar con `<img>`, nunca como `<Component />` | Labels IA en RegistroForm, OCRSkeleton, DistribucionCostosDialog, VincularObligacionDialog |
