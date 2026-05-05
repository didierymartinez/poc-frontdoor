# Feature-Sliced Design (FSD)

## Descripción general

El diseño segmentado de características (FSD, por sus siglas en inglés) es una metodología arquitectónica para la creación de estructuras de aplicaciones front-end. En pocas palabras, es una recopilación de reglas y convenciones para organizar el código. El objetivo principal de esta metodología es lograr que el proyecto sea más comprensible y estable ante los requisitos empresariales en constante cambio.

Además de un conjunto de convenciones, FSD también es un conjunto de herramientas. Contamos con un linter para verificar la arquitectura de tu proyecto, generadores de carpetas a través de una interfaz de línea de comandos o entornos de desarrollo integrados (IDE), así como una amplia biblioteca de ejemplos.

## ¿Es lo adecuado para mí?

FSD se puede implementar en proyectos y equipos de cualquier tamaño. Es adecuado para su proyecto si:

- Estás trabajando en el frontend (interfaz de usuario en web, móvil, ordenador, etc.).
- Estás creando una aplicación, no una biblioteca.

¡Y eso es todo! No hay restricciones en cuanto al lenguaje de programación, el marco de interfaz de usuario o el gestor de estado que utilices. También puedes adoptar FSD de forma incremental, usarlo en monorepos y escalarlo enormemente dividiendo tu aplicación en paquetes e implementando FSD individualmente dentro de ellos.

Si ya tienes una arquitectura y estás considerando migrar a FSD, asegúrate de que la arquitectura actual esté causando problemas en tu equipo. Por ejemplo, si tu proyecto ha crecido demasiado y se ha vuelto demasiado complejo para implementar nuevas funcionalidades de manera eficiente, o si esperas la incorporación de muchos miembros nuevos al equipo. Si la arquitectura actual funciona, quizás no valga la pena cambiarla. Pero si decides migrar, consulta la sección de Migración para obtener orientación.

## Ejemplo básico

Aquí tenéis un proyecto sencillo que implementa FSD:

```
📁 app
📁 pages
📁 shared
```

Estas carpetas de nivel superior se llaman **capas**. Analicemos esto con más detalle:

```
📂 app
  📁 routes
  📁 analytics
📂 pages
  📁 home
  📂 article-reader
    📁 ui
    📁 api
  📁 settings
📂 shared
  📁 ui
  📁 api
```

Las carpetas internas de `📂 pages` se denominan **segmentos**. Dividen la capa por dominio (en este caso, por páginas).

Las carpetas dentro de `📂 app`, `📂 shared`, y `📂 pages/article-reader` se llaman **segmentos**, y dividen las secciones (o capas) según su propósito técnico, es decir, para qué sirve el código.

## Conceptos

Las capas, rebanadas y segmentos forman una jerarquía:

```
Capas → Rebanadas (Slices) → Segmentos

Capas:
  app (aplicación)
  processes (procesos) [obsoleto]
  pages (páginas)
  widgets
  features (funciones)
  entities (entidades)
  shared (compartido)

Slices (ejemplo en entities):
  user
  post
  comment

Segmentos (ejemplo en post):
  ui
  model
  api
```

## Capas

Las capas están estandarizadas en todos los proyectos FSD. No es necesario usar todas las capas, pero sus nombres son importantes. Actualmente hay siete (de arriba a abajo):

1. **App (Aplicación)**: todo lo que hace que la aplicación funcione: enrutamiento, puntos de entrada, estilos globales, proveedores.
2. **Processes (Procesos)** *(obsoleto)*: escenarios complejos entre páginas.
3. **Pages (Páginas)**: páginas completas o grandes partes de una página en el enrutamiento anidado.
4. **Widgets**: grandes bloques de funcionalidad o interfaz de usuario autónomos, que generalmente ofrecen un caso de uso completo.
5. **Features (Funcionalidades)**: implementaciones reutilizadas de funcionalidades completas del producto, es decir, acciones que aportan valor comercial al usuario.
6. **Entities (Entidades)**: entidades comerciales con las que trabaja el proyecto, como `user` o `product`.
7. **Shared (Compartido)**: funcionalidad compartida y reutilizable, especialmente cuando está desvinculada de las particularidades del proyecto o negocio, aunque no necesariamente.

> **Advertencia**
> Las capas **App** y **Shared**, a diferencia de otras capas, no tienen secciones y se dividen directamente en segmentos.
>
> Sin embargo, todas las demás capas (**Entities**, **Features**, **Widgets** y **Pages**) conservan la estructura en la que primero debe crear secciones, dentro de las cuales creará los segmentos.

**El truco con las capas es que los módulos de una capa solo pueden conocer e importar módulos de las capas inmediatamente inferiores.**

## Rebanadas (Slices)

Las secciones (slices) dividen el código por dominio de negocio. Puedes elegir el nombre que quieras y crear tantas como desees. Las secciones facilitan la navegación por el código al mantener juntos los módulos lógicamente relacionados.

**Las capas no pueden utilizar otras capas de la misma capa**, lo que contribuye a una alta cohesión y un bajo acoplamiento.

## Segmentos

Las secciones, así como las capas App y Shared, constan de segmentos, y los segmentos agrupan el código según su propósito. Los nombres de los segmentos no están sujetos al estándar, pero existen varios nombres convencionales para los propósitos más comunes:

| Segmento | Propósito |
|----------|-----------|
| `ui` | Todo lo relacionado con la visualización de la interfaz de usuario: componentes de la interfaz de usuario, formateadores de fecha, estilos, etc. |
| `api` | Interacciones con el backend: funciones de solicitud, tipos de datos, mapeadores, etc. |
| `model` | El modelo de datos: esquemas, interfaces, almacenes y lógica de negocio. |
| `lib` | Código de biblioteca que otros módulos en esta sección necesitan. |
| `config` | Archivos de configuración y banderas de características. |

Por lo general, estos segmentos son suficientes para la mayoría de las capas; solo crearías tus propios segmentos en Shared o App, pero esto no es una regla.

## Ventajas

### Uniformidad
Dado que la estructura está estandarizada, los proyectos se vuelven más uniformes, lo que facilita la incorporación de nuevos miembros al equipo.

### Estabilidad ante cambios y refactorización
- Un módulo en una capa no puede usar otros módulos de la misma capa ni de las capas superiores.
- Esto permite realizar modificaciones aisladas sin consecuencias imprevistas para el resto de la aplicación.

### Reutilización controlada de la lógica
- Dependiendo de la capa, se puede lograr que el código sea altamente reutilizable o muy local.
- Esto permite mantener un equilibrio entre seguir el principio DRY (Don't Repeat Yourself) y la practicidad.

### Orientación a las necesidades del negocio y de los usuarios
La aplicación está dividida en dominios de negocio y se fomenta el uso del lenguaje empresarial en la nomenclatura, para que puedas realizar un trabajo útil con el producto sin necesidad de comprender completamente todas las demás partes no relacionadas del proyecto.

## Adopción incremental

Si dispone de un código fuente existente que desea migrar a FSD, le sugerimos la siguiente estrategia:

1. Comience por ir dando forma poco a poco a las capas de **app** y **shared**, módulo por módulo, para crear una base sólida.
2. Distribuya toda la interfaz de usuario existente entre **widgets** y **pages** de forma general, incluso si tienen dependencias que infringen las reglas de FSD.
3. Comience a resolver gradualmente las infracciones de importación y también a extraer **entities** y, posiblemente, incluso **features**.

> Se recomienda abstenerse de agregar nuevas entidades grandes mientras se refactoriza el código o al refactorizar solo ciertas partes del proyecto.
