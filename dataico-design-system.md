---

# DATAICO Design System

## Sistema refinado para que siempre genere el mismo estilo

Este documento es la versión consolidada y estable del sistema.
Su objetivo es que futuras pantallas salgan **coherentes, repetibles y reconocibles**.

---

# 1. Dirección visual oficial

DATAICO debe sentirse como un:

**SaaS contable moderno, premium, limpio y confiable**, con una estética sobria y elegante, pero nunca fría.

La interfaz debe equilibrar dos capas:

* una capa **editorial / de marca** en títulos, bloques héroe y estados importantes,
* y una capa **operativa / funcional** en tablas, navegación, formularios, filtros y revisión contable.

## El resultado buscado

* sofisticado
* ordenado
* respirado
* serio
* moderno
* claro
* funcional

## Lo que no debe pasar

* no debe verse demasiado “marketing”
* no debe verse demasiado “ERP duro”
* no debe verse demasiado experimental
* no debe mezclar varios lenguajes de navegación en la misma app

---

# 2. Regla madre del sistema

DATAICO tiene **un solo sistema**, pero se expresa en **tres contextos oficiales**:

1. **Product Shell**
   Navegación, tablas, listados, auditoría, revisión, dashboards.

2. **Focused Modal / Editor**
   Creación y edición de comprobantes, paneles de documento fuente, grids contables.

3. **Dashboard / Activation Layer**
   Cards de estado, onboarding de módulos, tareas, activación, CTAs de descubrimiento.

Los tres contextos deben compartir:

* colores,
* jerarquía,
* espaciado,
* iconografía,
* elevación,
* y tono visual.

Lo que cambia entre ellos no es el “estilo”, sino la **densidad y el tipo de componente**.

---

# 3. Fundaciones oficiales

## 3.1 Paleta oficial compacta

Usar siempre esta paleta base como fuente de verdad.

```txt
primary:        #1A1A1A
primary-dim:    #404040
secondary:      #737373
surface:        #FAFAFA
surface-container: #F4F4F4
outline:        #E5E5E5
accent-red:     #ED5E5D
success:        #1BD760
success-deep:   #006E2C
warning:        #F59E0B
brand-gray:     #050607
white:          #FFFFFF
```

## Regla de color

* la app vive en blanco + gris + texto oscuro
* el coral es el acento principal
* el verde y naranja son semánticos
* el negro profundo se usa solo para jerarquía estructural y estados muy puntuales

## Prohibición

No redefinir otra paleta completa para cada pantalla.
Si una referencia trae muchos tokens adicionales, se deben mapear a esta paleta compacta.

---

## 3.2 Tipografía oficial

Para que el sistema deje de oscilar, la tipografía oficial queda cerrada así:

* **Headline:** `Satoshi`
* **Body:** `Noto Sans`
* **Label:** `Noto Sans`

## Cómo interpretar las referencias con Epilogue / Manrope

Las pantallas que usan `Epilogue` y `Manrope` se toman como **referencia de jerarquía**, no como fuente literal canónica.

Eso significa:

* donde veas un título ligero y editorial, tradúcelo a `Satoshi`
* donde veas un cuerpo o label funcional, tradúcelo a `Noto Sans`

## Resultado

Se mantiene el carácter premium que te gusta, pero se elimina la ambigüedad.

---

## 3.3 Escala tipográfica

### Títulos

* H1 principal: `40–42px`
* H2 de sección: `28–32px`
* Título de card: `24px`
* Subtítulo / bloque: `18–20px`

### Texto funcional

* body principal: `14px`
* body pequeño: `12–13px`
* label y metadata: `10–11px`

### Regla

* títulos: tracking ajustado
* labels: uppercase solo cuando sea metadata o headers de tabla
* navegación: no usar mayúsculas en items principales

---

## 3.4 Radios oficiales

```txt
DEFAULT: 8px
lg:      16px
xl:      24px
2xl-ui:  32px
full:    9999px
```

## Regla por componente

* navegación estructural: `rounded-lg`
* cards: `rounded-xl`
* modales grandes: `rounded-[32px]`
* badges / pills: `rounded-full`
* inputs y selects de formularios contables: `rounded-full`
* dropdowns de página y filtros de listados: `rounded-lg`

Esta regla es importantísima porque aquí estaba gran parte de la inconsistencia anterior.

---

## 3.5 Sombras oficiales

* `shadow-sm`: cards, tablas, shells suaves
* `shadow-md`: hover de cards, elementos con jerarquía media
* `shadow-xl / 2xl`: modal principal
* sombras coral: solo muy suaves en primarios o campos monetarios activos

## Regla

La sombra acompaña, no protagoniza.

---

## 3.6 Iconografía oficial

Familia:

* `Material Symbols Outlined`

Configuración baseline:

```css
font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
```

## Excepciones

* `FILL 1` solo en estados activos, éxito, validación o énfasis semántico
* `wght 400` si el tamaño pequeño pierde legibilidad

---

# 4. Product Shell oficial

Este es el shell que debe usarse como base para la app.

## Composición

* sidebar fija izquierda
* top bar superior
* canvas principal desplazado
* fondo general `surface`

## Medidas

* sidebar: `w-64`
* top bar: `h-16`
* canvas: `ml-64 mt-16`

## Regla

El shell oficial es **integrado y recto**, no flotante.

### Queda deprecated como baseline

* sidebar separada del borde con `ml-4 my-4`
* sidebar con esquinas gigantes orgánicas
* shell híbrido entre showcase y modal en vistas regulares

Eso puede existir como exploración, pero no como patrón principal del sistema.

---

# 5. Sidebar principal oficial

## Rol

Navegación de primer nivel de toda la app.

## Estilo oficial

* fondo blanco
* borde derecho `outline`
* sin forma flotante
* padding interno generoso
* items con `rounded-lg`
* tipografía body
* íconos ligeros

## Header del sidebar

* logotipo textual limpio
* coral como marca
* subtítulo pequeño en gris

Ejemplo correcto:

* `DATAICO`
* `SaaS Contable`

---

## 5.1 Item de sidebar

### Anatomía

* ícono izquierdo
* texto
* opcional chevron
* opcional badge

### Estado default

* fondo transparente
* texto `secondary`
* icono `secondary`

### Estado hover

* fondo `surface-container`
* texto `primary`

### Estado activo oficial

* fondo `primary`
* texto blanco
* icono blanco
* radio `rounded-lg`

## Regla importante

El item activo principal queda **oscuro sólido**, porque es la solución más estable y más clara para el producto real.

### Se deprecian como baseline:

* item activo coral suave
* item activo coral sólido pill
* item activo con sombras decorativas

Esas referencias gustaron por composición general, pero **no quedan como norma del shell oficial**.

---

# 6. Top Bar oficial

## Rol

Contexto del módulo + navegación secundaria + utilidades.

## Estilo

* fondo blanco con leve transparencia
* `backdrop-blur-md`
* borde inferior sutil
* padding horizontal amplio
* altura 64px

## Contenido típico

* nombre del módulo
* tabs internas
* status pill de automatización
* notificaciones
* ayuda

---

# 7. Navegación secundaria oficial

## Solución oficial

Tabs horizontales en top bar o inmediatamente debajo.

### Ejemplos

* Contabilidad
* Libros
* Auditoría
* Reportes

## Tab default

* color `secondary`
* tamaño pequeño
* peso medio

## Tab activa

* color `accent-red`
* underline coral de 2px
* sin relleno de fondo

## Regla

Las tabs deben verse ligeras y técnicas, no como botones.

---

# 8. Breadcrumb oficial

## Rol

Ubicación exacta dentro del producto.

## Estilo

* pequeño
* uppercase cuando es breadcrumb operativo
* color `secondary/70`
* nivel actual en `primary`
* icono pequeño opcional del módulo

## Formato

`CONTABILIDAD > Comprobantes fuera de periodo`

## Regla

Siempre va encima del H1.

---

# 9. Product contexts oficiales

Aquí está la clave para que las pantallas futuras no salgan mezcladas.

---

## 9.1 Contexto A: Product Listing / Audit / Review

Usar este patrón para:

* listados
* auditoría
* comprobantes fuera de periodo
* revisiones
* tablas diagnósticas
* filtros
* paneles de control funcionales

### Características visuales

* tipografía más sobria
* dropdowns rectangulares suaves (`rounded-lg`)
* tablas dentro de `rounded-xl`
* headers pequeños y técnicos
* foco en lectura y decisión

### Componentes oficiales de este contexto

* breadcrumb
* H1
* texto de apoyo
* dropdown de filtro
* data table
* icon buttons
* status pills

---

## 9.2 Contexto B: Focused Modal / Accounting Editor

Usar este patrón para:

* crear comprobante
* editar comprobante
* ver documento fuente + automatización
* grid de asientos
* revisar balance

### Características visuales

* overlay oscuro con blur
* gran modal blanco
* header amplio
* botones pill
* inputs pill
* panels internos
* título grande editorial
* jerarquía de formulario muy clara

### Componentes oficiales

* modal shell
* source document panel
* automation rule panel
* textarea de observaciones
* selects pill
* accounting entry grid
* summary de balance
* CTA primaria y secundaria

---

## 9.3 Contexto C: Dashboard / Activation / Adoption

Usar este patrón para:

* home de Contabilidad
* tareas pendientes
* activación de módulos
* cards de onboarding
* cards informativas
* estados de automatización

### Características visuales

* cards blancas
* layout muy respirado
* titulares grandes
* pequeños artefactos gráficos o mini-illustrations
* progress bars
* CTAs suaves
* status semánticos

### Componentes oficiales

* hero block
* KPI / task card
* CTA card
* onboarding step card
* progress bar
* profile chip
* status pill activa o desactivada

---

# 10. Componentes oficiales refinados

---

## 10.1 Status pill de automatización

### Variantes

* activa
* desactivada

### Activa

* fondo blanco o `surface-container`
* borde sutil
* punto verde
* texto pequeño uppercase

### Desactivada

* fondo blanco
* borde sutil
* punto rojo o rojo suave
* texto secundario + estado rojo

### Forma

* `rounded-full`

---

## 10.2 Hero / encabezado operativo

### Estructura

* breadcrumb
* H1
* conteo opcional
* texto explicativo
* filtro o acción contextual

### Regla

No convertirlo en una pieza “marketing”; sigue siendo producto.

---

## 10.3 Filtro / dropdown de página

### Uso

Listados, revisiones, filtros de categoría, agrupaciones.

### Estilo oficial

* fondo blanco
* borde sutil
* `rounded-lg`
* shadow-sm
* tipografía funcional
* badge de conteo opcional
* chevron discreto

### Regla

En páginas de tablas el filtro es `rounded-lg`, no pill.

---

## 10.4 Data Table oficial

### Contenedor

* blanco
* `rounded-xl`
* borde sutil
* shadow-sm
* overflow hidden

### Header

* `10px`
* bold
* uppercase
* tracking-widest
* color `secondary`
* borde inferior tenue

### Filas

* hover muy suave
* separador tenue
* densidad comfortable-compact

### Tipos de celda oficiales

* fecha crítica
* identificador
* documento fuente
* tercero
* valor monetario
* acciones
* estado

### Regla

Toda tabla nueva debe usar este baseline aunque cambie el número de columnas.

---

## 10.5 Modal shell oficial

### Estilo

* overlay oscuro + blur
* modal blanco grande
* `max-w-7xl`
* radio grande `32px`
* border sutil
* `shadow-2xl`
* header y body con padding amplio

### Regla

Es una superficie de foco total.

---

## 10.6 Source Document Panel

Este componente ya queda oficial.

### Anatomía

* bloque izquierdo con documento fuente
* bloque derecho con automatización o regla contable
* separación vertical clara

### Bloque izquierdo

* eyebrow de sección
* ID del documento grande
* badges de tipo de documento
* tercero
* resumen económico: subtotal / IVA / total

### Bloque derecho

* label
* select de regla/template
* botón “Aplicar regla”
* helper text

### Regla

Este panel siempre vive dentro del editor modal, no como card suelta en dashboard.

---

## 10.7 Form fields del editor

Aquí se fija una regla nueva para resolver la mezcla entre referencias.

### En modales y flujos contables

* inputs: `rounded-full`
* selects: `rounded-full`
* botones: `rounded-full`
* labels: `Noto Sans` 14px
* textarea: `rounded-xl` o `rounded-2xl`, nunca full

### En listados y dashboards

* dropdowns y filtros: `rounded-lg`
* campos de búsqueda de página: `rounded-lg`
* no convertir todo a pill

---

## 10.8 Accounting Entry Grid oficial

### Rol

Captura y edición de asientos contables.

### Características

* grid fija
* inputs pill
* montos activos resaltados
* acciones por fila
* delete discreto o en hover
* botón “Nuevo asiento”
* summary de totales

### Regla

Este componente mantiene su estética pill porque pertenece al contexto de editor, no al contexto de listados.

---

## 10.9 Totals / validation summary

### Variantes

* balanceado
* no balanceado

### Estructura

* mensaje semántico a la izquierda
* total débito y crédito alineados a la derecha

### Regla

Debe compartir la alineación del grid contable.

---

## 10.10 Dashboard cards oficiales

Ahora quedan cerradas las familias de card del dashboard.

### A. KPI / task card

* gran número o mensaje protagonista
* icono o estado
* CTA opcional

### B. Alert / issue card

* problema puntual
* explicación
* CTA clara

### C. CTA / feature card

* título
* descripción
* botón

### D. Onboarding step card

* step label
* progreso visual
* ratio `x/y`
* descripción
* CTA
* visual support en lado derecho

### E. Media / content card

* título
* resumen
* CTA

### Regla común

* fondo blanco
* borde sutil
* `rounded-xl` o `rounded-2xl`
* padding amplio
* hover solo si aporta sentido

---

## 10.11 Progress bar oficial

### Uso

Onboarding y activación.

### Estilo

* track gris suave
* fill semántico
* radio full
* altura muy pequeña

### Colores

* naranja para pendiente/parcial
* verde para completado

---

# 11. Qué se rescata de las nuevas referencias y qué se normaliza

## Se rescata como oficial

* panel de documento fuente
* panel de automatización
* modal contable grande con blur
* grid contable pill
* cards de dashboard muy aireadas
* onboarding por pasos
* status pill de automatización
* grandes títulos editoriales
* coral como acento de marca
* superficies blancas sobre fondo gris muy suave

## Se normaliza para evitar drift

* tipografía → siempre `Satoshi + Noto Sans`
* shell → siempre integrado, no flotante
* sidebar activa → siempre `primary` sólido
* navegación → nunca pill
* filtros de página → `rounded-lg`
* campos de editor → pill
* tablas → header técnico y silencioso
* cards → `rounded-xl/2xl`, no mezclar con shells orgánicos

---

# 12. Reglas duras para futuras generaciones

Estas son las reglas que más te van a ahorrar inconsistencias.

## Nunca mezclar en una misma pantalla

* sidebar coral suave + modales oscuros + tablas ultra sobrias + títulos Epilogue
* navegación pill + filtros pill + cards pill + tabla pill
* múltiples familias tipográficas

## Siempre respetar

* una sola paleta compacta
* una sola pareja tipográfica
* una sola lógica de shell
* una sola lógica de tabla
* una sola lógica de navegación

## Estructura fija

* shell oficial
* top bar oficial
* breadcrumb oficial
* contexto visual según tipo de pantalla

---

# 13. Tailwind baseline oficial refinado

Este es el baseline que debe usarse como fuente de verdad:

```html
<script id="tailwind-config">
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#1A1A1A",
        "primary-dim": "#404040",
        "secondary": "#737373",
        "surface": "#FAFAFA",
        "surface-container": "#F4F4F4",
        "outline": "#E5E5E5",
        "accent-red": "#ED5E5D",
        "success": "#1BD760",
        "success-deep": "#006E2C",
        "warning": "#F59E0B",
        "brand-gray": "#050607",
        "on-primary": "#FFFFFF"
      },
      fontFamily: {
        "headline": ["Satoshi", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
        "label": ["Noto Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "1rem",
        "xl": "1.5rem",
        "2xl-ui": "2rem",
        "full": "9999px"
      },
      boxShadow: {
        "soft": "0 1px 2px rgba(0,0,0,0.04)",
        "card": "0 4px 16px rgba(0,0,0,0.04)",
        "modal": "0 20px 60px rgba(0,0,0,0.14)"
      }
    }
  }
}
</script>
```

---

# 14. Prompt maestro para usar este design system siempre igual

Este bloque sí te sirve para copiarlo cuando quieras que una IA genere pantallas consistentes.

```txt
Usa DATAICO Design System v3.

Dirección visual:
- SaaS contable premium, limpio, moderno, sobrio y respirado.
- Fondo general muy claro, superficies blancas, bordes sutiles y coral como acento.
- Nunca mezclar estilos de navegación, tipografía o radios.

Tipografía:
- Headline: Satoshi
- Body y Label: Noto Sans
- Títulos grandes, editoriales y ligeros.
- Texto funcional claro y sobrio.

Colores:
- primary #1A1A1A
- primary-dim #404040
- secondary #737373
- surface #FAFAFA
- surface-container #F4F4F4
- outline #E5E5E5
- accent-red #ED5E5D
- success #1BD760
- warning #F59E0B

Shell:
- Sidebar fija izquierda, blanca, integrada, con borde derecho sutil.
- Top bar blanca/translúcida con blur.
- Canvas principal con ml-64 y mt-16.

Sidebar:
- Items con rounded-lg.
- Default en gris.
- Hover con fondo surface-container.
- Activo siempre con fondo primary y texto blanco.
- Nunca usar items pill o coral como estado activo principal.

Navegación secundaria:
- Tabs horizontales.
- Activa en accent-red con underline de 2px.
- Sin fondos rellenos.

Breadcrumb:
- Pequeño, discreto, uppercase si es operativo.
- Siempre sobre el H1.

Contextos:
1) Listing/Audit: filtros rounded-lg, tablas sobrias, headers técnicos.
2) Focused Modal/Editor: gran modal blanco con blur detrás, botones e inputs pill, grid contable pill.
3) Dashboard/Activation: cards blancas, aireadas, progreso, CTA, status pills.

Componentes:
- Dropdowns de página: rounded-lg.
- Inputs/selects del editor contable: rounded-full.
- Textarea: rounded-xl.
- Cards: rounded-xl o rounded-2xl.
- Tabla diagnóstica: headers 10px uppercase bold tracking-widest, hover suave, valores a la derecha.
- Accounting grid: filas pill, montos activos resaltados, summary final.
- Status pill: rounded-full, compacta, semántica.

Iconografía:
- Material Symbols Outlined
- FILL 0, wght 300 por defecto
- FILL 1 solo para estados o énfasis puntuales

No improvisar:
- No usar otra pareja tipográfica.
- No usar otra navegación.
- No alternar entre shell flotante y shell integrada.
- No convertir navegación estructural en pill.
- No sobrediseñar sombras, tracks o underlines.
```

---

# 15. Definición final cerrada

**DATAICO es un sistema de diseño de producto para un SaaS contable moderno y premium que unifica tres contextos —listado/auditoría, editor contable y dashboard de activación— bajo una sola base visual: tipografía Satoshi + Noto Sans, shell integrada, navegación oscura y estable, superficies blancas, neutros suaves, coral como acento, cards amplias, tablas técnicas y modales de alto foco con controles pill. La consistencia no se logra repitiendo exactamente la misma forma en todos los componentes, sino fijando con precisión qué piezas son estructurales, cuáles son operativas y cuáles son contextuales.**

Si quieres, en el siguiente paso te lo convierto en una **especificación por componente** con formato estricto: **nombre, propósito, anatomía, props, estados, do / don’t y ejemplo HTML/Tailwind**