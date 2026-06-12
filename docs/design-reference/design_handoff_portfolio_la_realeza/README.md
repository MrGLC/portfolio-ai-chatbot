# Handoff: Portafolio "La Realeza"

## Overview
Portafolio one-page para un consultor/desarrollador de IA, con estética "realeza / alta joyería": carmesí + oro sobre crema, tipografía serif de alta costura, y una **joya 3D narrativa** que viaja por la página transformándose según la sección activa (el elemento distintivo del sitio).

Objetivo de conversión: que el visitante agende contacto (CTA "Hablemos" + formulario al final).

## About the Design Files
Los archivos de este paquete son **referencias de diseño creadas en HTML** — un prototipo que muestra el look y el comportamiento exactos, **no código de producción para copiar tal cual**. La tarea es **recrear este diseño en el entorno del codebase destino** (React, Vue, Next.js, Astro, etc.) usando sus patrones y librerías existentes. Si aún no existe un entorno, elegir el framework más apropiado (para un portafolio estático con una escena 3D, Next.js/Astro + Three.js o react-three-fiber es una buena elección) e implementarlo ahí.

- `La Realeza.dc.html` — el prototipo completo. El markup vive dentro de `<x-dc>…</x-dc>` (estilos inline) y la lógica en la clase `Component` al final del archivo (motor Three.js de la joya, nav, formulario). Ignorar el wrapper/runtime (`support.js`, `<x-dc>`, `{{ }}`): es infraestructura del prototipo.

## Fidelity
**High-fidelity.** Colores, tipografía, espaciados, copy e interacciones son finales. Recrear pixel-perfect con las librerías del codebase. El copy está en español y contiene placeholders deliberados (`[Tu Nombre]`, métricas, logos de clientes, proyectos) que el dueño reemplazará con datos reales.

## Design Tokens

### Colores
| Token | Hex | Uso |
|---|---|---|
| `bg-cream` | `#f6efe2` | Fondo base de la página |
| `bg-cream-alt` | `#f9f3e9` | Secciones alternas (confianza, sobre mí, testimonio) |
| `bg-card` | `#fbf7ef` | Tarjetas de proyecto, hover de celdas de servicio |
| `ink` | `#181428` | Titulares y texto principal |
| `body-1` | `#5f5970` | Párrafos largos |
| `body-2` | `#6a6478` | Texto secundario / descripciones |
| `crimson` | `#c10e35` | Acento principal: CTAs, links, joya, cifras |
| `crimson-deep` | `#7e0a23` | Gradientes del logo, aristas de la joya |
| `gold` | `#c2a05c` | Líneas decorativas, bordes de chips, aristas doradas |
| `gold-text` | `#a8863f` | Eyebrows/kickers en dorado |
| `gold-bright` | `#e8b765` / `#f2c879` | Joya "corona", luz puntual dorada |
| `placeholder-tone` | `#b3a98f` | Texto de logos del marquee y placeholders |
| `cream-text` | `#f3e9d8` | Texto sobre fondo oscuro |
| `success` | `#1f9d63` / `#5fd29b` | Dot de disponibilidad, estado de éxito del form |
| `error` | `#ff8aa3` | Mensajes de validación (sobre fondo oscuro) |
| `dark-gradient` | `linear-gradient(165deg, #1c0710 0%, #330a1c 55%, #190610 100%)` | Sección contacto/footer |

### Tipografía
- **Display:** `Bodoni Moda` (Google Fonts; pesos 400–700, itálica para énfasis). Titulares, cifras, logo, quote del testimonio.
- **Body/UI:** `Hanken Grotesk` (400–700). Párrafos, nav, botones, labels.
- Escala de titulares: H1 `clamp(40px, 6vw, 76px)`, line-height 1.02, letter-spacing -0.015em; H2 `clamp(32px, 4.6vw, 56px)`, lh 1.05; H3 tarjetas 24px (600).
- Eyebrow/kicker: 12px, 600, uppercase, letter-spacing 0.28em, color `gold-text`, precedido de una línea de 42×1px con gradiente dorado que se desvanece.
- Body: 15–19px, line-height 1.65–1.75.

### Espaciado y forma
- Contenedor: max-width **1180px**, padding lateral `clamp(20px, 5vw, 40px)`.
- Padding vertical de sección: `clamp(80px, 12vh, 140px)`.
- Radios: botones/inputs 5–8px, tarjetas 10–12px, panel del form 14px, chips pill (20px).
- Sombras (crimson CTA): `0 16px 34px -16px rgba(193,14,53,.9)`; hover: `translateY(-2/-3px)` + sombra más larga.
- Tarjetas de proyecto hover: `translateY(-7px)`, borde → `rgba(194,160,92,.6)`, sombra `0 34px 64px -42px rgba(24,20,40,.55)`, transición 0.35s.

## Screens / Views (one-page, 7 capítulos)

Cada sección lleva `id` (ancla de nav **y** ancla de la coreografía 3D): `inicio`, `confianza`, `proyectos`, `sobre-mi`, `consultoria`, `testimonio`, `contacto`.

### 1. Nav (fija)
- Fixed top, z-index sobre el contenido pero **debajo del canvas de la joya** (ver z-index abajo).
- Transparente arriba; al pasar `scrollY > 40` → fondo `rgba(246,239,226,.82)` + blur(14px) + hairline inferior. Transición 0.4s.
- Izquierda: logo = rombo 26px (gradiente crimson, borde dorado, rotate 45°) + "La Realeza" en Bodoni 21px.
- Derecha (desktop ≥860px): links Inicio / Consultoría / Proyectos / Sobre mí (14px, 600, hover → crimson) + botón "Hablemos" (crimson, blanco, 11×22px padding).
- Móvil (<860px): hamburguesa de 3 líneas (la tercera corta y crimson) → panel desplegable con los mismos links apilados y CTA full-width. Se cierra al navegar.

### 2. Hero (`#inicio`)
- 100vh, grid 2 columnas (auto-fit minmax 320px): izquierda texto, derecha **espacio reservado para la joya** (la joya es un canvas global, no vive dentro del hero; el hero solo deja el hueco + un glow radial difuso de fondo).
- Fondo: radial crema `radial-gradient(120% 90% at 78% 18%, #fbf6ec, #f6efe2 42%, #f1e7d6)` + brillos crimson/oro muy tenues anclados al borde inferior.
- Contenido: eyebrow "Soluciones de IA de lujo · redefinidas" → H1 "Inteligencia artificial con sello de *realeza*." (la palabra "realeza" en itálica crimson) → párrafo (MVP en **2 semanas**) → CTAs ("Ver portafolio →" crimson sólido + "Hablemos" outline) → indicador de disponibilidad (dot verde con halo + "Disponible para nuevos proyectos · 2026").
- Abajo centrado: cue de scroll "DESLIZA" + chevron SVG animado (keyframes `cuePulse`: opacidad .25→1, translateY 0→7px, 1.8s loop).
- Entradas: texto `fadeUp` 0.9s; columna joya 1.1s con delay 0.15s.

### 3. Marquee de confianza (`#confianza`)
- Banda `bg-cream-alt` con hairlines arriba/abajo. Kicker: "Con la confianza de equipos en".
- Marquee infinito (translateX 0→-50%, 26s linear, lista duplicada) de nombres en Bodoni 23px `placeholder-tone`: VANTA, AURUM, NÓVA, KÖNIG, SOLARA, MERIDIAN — **placeholders**, reemplazar por logos reales.
- Máscara de desvanecido en ambos extremos (`mask-image: linear-gradient` transparente→negro 12%→88%→transparente).

### 4. Proyectos (`#proyectos`)
- Header en dos columnas: kicker "Portafolio" + H2 "Proyectos selectos" a la izquierda; párrafo introductorio (max 380px) alineado abajo-derecha.
- Grid de 3 tarjetas (auto-fit minmax 300px, gap 28px). Cada tarjeta:
  - Imagen 208px (placeholder rayado diagonal — pide captura real 1600×1000) con número de serie "01/02/03" en Bodoni 34px crimson al 16%.
  - Chips de categoría (pill, borde dorado, 11px uppercase): FinTech/LLM, Búsqueda/RAG, Agentes/Ops.
  - Título Bodoni 24px + descripción de una línea de resultado + link "Ver caso de estudio →" (crimson, en hover el gap de la flecha crece 8→12px).
  - Proyectos placeholder: **Atlas** (copiloto financiero), **Lumen** (búsqueda semántica), **Corte** (agente de operaciones).

### 5. Sobre mí (`#sobre-mi`)
- `bg-cream-alt`. Grid 2 col: retrato 4:5 (placeholder, pide foto 1000×1250) con badge oscuro superpuesto en la esquina inferior-derecha ("8 / AÑOS EN IA", fondo `ink`, cifra Bodoni 30px, label dorado); columna derecha: kicker "Sobre mí", H2 "Detrás de la corona", 2 párrafos de bio (`[Tu Nombre]` placeholder), y fila de 3 stats sobre hairline: +40 proyectos / 12 países / 2 sem a un MVP (cifras Bodoni crimson `clamp(28px,3.4vw,40px)`).

### 6. Consultoría (`#consultoria`)
- Header centrado (kicker con líneas doradas a ambos lados + H2 "Cómo puedo ayudarte").
- 3 celdas en grid unidas por hairlines (gap 1px sobre fondo `rgba(24,20,40,.1)`, contenedor redondeado 12px): 01 Estrategia de IA / 02 Desarrollo de MVP / 03 Acompañamiento. Numerales Bodoni 38px dorados. Hover: fondo → `bg-card`.
- Debajo, proceso en 3 pasos A/B/C: círculo 34px borde dorado con letra + título 600 + descripción 14px. (Descubrimiento / Diseño y build / Lanzamiento.)

### 7. Testimonio (`#testimonio`)
- `bg-cream-alt`, centrado, max 860px. Comilla Bodoni 64px dorada → quote en Bodoni itálica `clamp(22px,3vw,34px)` → avatar placeholder 44px + nombre/cargo. Todo placeholder.

### 8. Contacto + Footer (`#contacto`)
- Fondo `dark-gradient` con dos glows radiales decorativos (crimson arriba-derecha, oro abajo-izquierda).
- Grid 2 col: izquierda kicker dorado + H2 blanco "¿Construimos algo memorable?" + párrafo + email grande en Bodoni con subrayado dorado (`hola@larealeza.com` — placeholder) + links sociales (LinkedIn / GitHub / X, hover → dorado).
- Derecha: panel `rgba(255,255,255,.035)` borde `rgba(243,233,216,.14)` radio 14px con el formulario (ver Interactions).
- Footer dentro de la misma sección: hairline superior, logo pequeño + © + "Volver arriba ↑".

## La joya 3D — especificación de la coreografía (CRÍTICO)

Este es el corazón del diseño. **Un solo canvas WebGL `position: fixed` que cubre todo el viewport** (`pointer-events: none`), por **encima** del contenido (en el prototipo: canvas z-55, nav z-60 — la nav queda sobre la joya, la joya sobre el contenido). Three.js r128 en el prototipo; usar la versión/binding que prefiera el codebase (three vanilla o react-three-fiber).

### El reparto: un actor, cinco formas
Las cinco mallas viven en un mismo `Group`; se hace crossfade escalando cada una entre 0 y 1 (lerp factor 0.13/frame). Nunca hay dos formas a plena escala a la vez.

| Forma | Geometría | Material |
|---|---|---|
| `ico` (piedra en bruto) | `Icosahedron(1.62, detail 1)` | crimson `#c10e35`, flatShading, metalness .38, roughness .34, aristas (`EdgesGeometry` + LineBasic) `#7e0a23` op .35 |
| `octa` (diamante tallado) | `Octahedron(1.5)` escalado y×1.32 | crimson, flatShading, metal .55, rough .22, aristas doradas `#c2a05c` op .55 |
| `sphere` (esfera pulida) | `Icosahedron(1.42, detail 3)` (lisa) | crimson, metal .72, rough .14, sin aristas |
| `knot` (nudo de ingeniería) | `TorusKnot(0.92, 0.27, 160, 24)` | oro `#c2a05c`, metal .90, rough .26 |
| `crown` (joya de la corona) | `Icosahedron(1.62, 1)` | oro `#e8b765`, flatShading, metal .85, rough .30, **emissive crimson pulsante**: intensity = 0.18 + w·(0.3 + sin(t·2.2)·0.16); aristas `#f2c879` op .5 |

### Iluminación
- Ambient blanca 0.55
- Key direccional cálida `#fff1d6` ×1.5 desde (-3, 4, 5)
- Point dorada `#e8b765` ×1.25 (distancia 22) en (-2.6, 2.6, 3.2)
- Rim direccional rosada `#ff5a7a` ×0.75 desde (4, -2, -3)
- Cámara: perspectiva fov 42, z = 5.

### El guion: keyframes por capítulo
Posiciones en fracciones del viewport (x: 0=izq, 1=der; y: 0=arriba). `s` = escala. Columnas `m*` = overrides móvil (<860px). `spin` = velocidad de giro en reposo (rad/s aprox). `p` = opacidad objetivo de partículas.

| Sección | x | y | s | shape | spin | p | mx | my | ms |
|---|---|---|---|---|---|---|---|---|---|
| inicio | .72 | .47 | 1.00 | ico | .30 | .50 | .50 | .74 | .60 |
| confianza | .84 | .46 | .34 | ico | .80 | .10 | .80 | .46 | .26 |
| proyectos | .945 | .50 | .36 | octa | .45 | 0 | .90 | .08 | .24 |
| sobre-mi | .50 | .13 | .30 | sphere | .35 | 0 | .50 | .07 | .24 |
| consultoria | .10 | .15 | .36 | knot | .55 | 0 | .12 | .08 | .26 |
| testimonio | .50 | .07 | .18 | octa | .70 | 0 | .50 | .06 | .15 |
| contacto | .50 | .12 | .40 | crown | .35 | .75 | .50 | .08 | .32 |

Conversión a coordenadas de mundo: con fov 42 y cámara a z=5, `visH = 2·tan(21°)·5`, `visW = visH·aspect`; `pos.x = (x−.5)·visW`, `pos.y = −(y−.5)·visH`.

### El comportamiento: "dash & wait" (iniciativa propia)
La joya **no se interpola continuamente con el scroll** (eso se sintió "arrastrado" y se descartó). En su lugar:

1. **Capítulo activo** = la sección cuyo centro (`anchor = sectionTop + height/2`) está más cerca del centro del viewport (`scrollY + vh/2`). Evaluado cada frame.
2. **Dash**: la joya corre a su keyframe con easing adaptativo — `k = min(0.22, 0.06 + dist·0.5)` donde `dist = hypot(Δx, Δy)` en fracciones de viewport. Lejos = rápido (llega antes que el usuario); cerca = se posa suave. Escala con `k·0.8` (mín 0.08).
3. **Cede el paso en tránsito**: mientras viaja se encoge — factor `1 − min(0.30, dist·1.25)` — para no tapar contenido al cruzar texto.
4. **Llega ya transformada**: el morph (crossfade 0.13/frame) corre durante el dash, no después.
5. **Respira al esperar**: posada (`settled = max(0, 1 − dist·9)`), pulsa `escala ×(1 + sin(t·1.15)·0.028·settled)` — el "breathing time".
6. **Giro**: `rot.y += dt·spin + velScroll·0.0006 + dist·dt·2.6` (impulso extra cuando corre); `rot.x = sin(t·0.3)·0.1 + mouseY·0.25`; inclinación z por velocidad de scroll: objetivo `clamp(vel, ±140)·−0.0007`, easing 0.08. `vel` = media móvil del Δscroll (`vel = vel·0.92 + Δ·0.08`).
7. **Parallax de mouse**: posición += `(mouseX−.5)·0.22` / `−(mouseY−.5)·0.16` en mundo.

### Partículas (polvo de oro)
- 200 puntos en cáscara esférica r = 2.1–3.4, achatada (y×0.72). Colores 50/50 oro `#e6b964` / crimson `#d11e44`. Size 0.042, `depthWrite: false`.
- **Solo visibles donde aportan**: opacidad objetivo `p` del keyframe (hero .50, confianza .10, contacto .75, **0 en todas las secciones de lectura**), atenuada además en tránsito: `opacity = p·(0.3 + 0.7·settled)`. Ocultar la malla si opacity < 0.02.
- Siguen al grupo con retraso (lerp 0.05) y escalan con la joya (`0.5 + s·0.65`).
- Tweakable: el prototipo expone `showParticles` (boolean) y `gemColor` (color) como props — conservar como configuración.

### Accesibilidad / rendimiento
- Respetar `prefers-reduced-motion`: congelar dash/respiración y dejar la joya estática en el hero (el prototipo no lo implementa; añadirlo en producción).
- `pixelRatio` cap a 2. Pausar el render loop con `document.hidden`.
- En móvil la joya se posa en franjas superiores (my ≈ .06–.10) para no cubrir texto.

## Interactions & Behavior
- **Smooth scroll** entre anclas (`scroll-behavior: smooth`; cada sección con `scroll-margin-top: 80px` por la nav fija).
- **Nav**: cambio de estado al scroll (ver arriba); menú móvil toggle; cierre al navegar.
- **Hovers**: links nav → crimson; CTAs → levitan + sombra; tarjetas → levitan + borde dorado; link de caso → flecha se separa; celdas de servicio → fondo claro; sociales → dorado.
- **Formulario de contacto**:
  - Campos: Nombre (texto), Email, Mensaje (textarea, 4 filas). Labels 12px uppercase doradas. Inputs fondo `rgba(255,255,255,.04)`, borde `rgba(243,233,216,.18)`, focus → borde dorado.
  - Validación al enviar: nombre no vacío ("Falta tu nombre"), email regex `^[^@\s]+@[^@\s]+\.[^@\s]+$` ("Email no válido"), mensaje no vacío ("Cuéntame algo"). Errores 12px `#ff8aa3` bajo el campo.
  - Éxito: el form se reemplaza por estado de confirmación (check verde en círculo, "¡Mensaje enviado!", subtexto). **El prototipo no envía nada** — conectar al backend/servicio real (Formspree, Resend, API propia).
- **Animaciones de entrada**: hero con `fadeUp` (translateY 24px→0 + fade). En producción, aplicar lo mismo on-scroll a headers de sección (IntersectionObserver) si se desea; el prototipo solo anima el hero.

## State Management
- `scrolled: boolean` (scrollY > 40) → estilo de nav. Throttle con rAF.
- `isMobile: boolean` (innerWidth < 860) → nav desktop vs hamburguesa (y overrides de keyframes).
- `navOpen: boolean` → menú móvil.
- `form {name, email, message}` + `errors` + `sent: boolean` → formulario.
- Estado del motor 3D (posición/escala/pesos de morph actuales) vive fuera de React/estado de UI — es un loop rAF con variables propias; no re-renderizar la UI por frame.
- Sin data fetching; todo estático salvo el POST del formulario.

## Assets
- **Fuentes**: Bodoni Moda + Hanken Grotesk (Google Fonts).
- **Sin imágenes**: todos los visuales son placeholders rayados generados por CSS. Pendientes del dueño: capturas de proyectos (1600×1000), retrato (1000×1250), logos de clientes, avatar del testimonio, email y links sociales reales.
- **Logo**: rombo CSS (gradiente crimson + borde dorado, rotate 45°) — recrear como SVG en producción.
- Three.js r128 (CDN en el prototipo).

## Files
- `design_handoff_portfolio_la_realeza/La Realeza.dc.html` — prototipo completo (referencia). Markup con estilos inline dentro de `<x-dc>`; motor de la joya y lógica de UI en la clase `Component` (función `initThree()`, tabla `KF` de keyframes, loop `animate()`).
