# Dirección de diseño · iharlabs.com

> **Revisión del 11-11-2026: «De Excel a su propia aplicación».** Igor decidió centrar la empresa en una sola cosa
> («el que mucho abarca poco aprieta») y pidió una web totalmente nueva y mucho más moderna. Manda esto:
> - **Un solo mensaje:** pasar de Excel a una aplicación propia. Fuera la oferta de webs, las suscripciones y Motion.
> - **Toda en oscuro** (`--fondo` #060913). El color cuenta la historia: **verde de hoja de cálculo → azul de app**
>   (`--grad`). La palabra «Excel» del título va dentro de una celda seleccionada, con su tirador.
> - **La portada convierte sola** un Excel en Flow, en bucle de 10 s (`@property --p` + clip-path + un haz de luz).
>   Nada que arrastrar: la gente no sabía que había que hacerlo. Con movimiento reducido queda fija al 56 %.
> - Cinta de «frases de oficina con Excel», bloque «− Excel / + aplicación», apps hechas con su archivo de origen
>   (`.archivo` → `.flecha` → app), tres tamaños con precio cerrado (Hoja, Libro, Macro), tabla de alternativas
>   con precios de mercado y calculadora de lo que cuesta el Excel al año.
> - Sigue vigente de abajo: nada inventado, botones que dicen lo que pasa, contraste ≥ 4,5:1, precio «por empresa,
>   no por usuario», pantallas reales con la empresa de ejemplo, sin plazos de entrega prometidos.

> **Revisión del 8-11-2026 (tarde).** Igor vio la primera versión «anticuada» y pidió una web mucho más moderna.
> Lo que manda es su gusto: portada oscura (`--noche`) con brillos azul y menta y una rejilla tenue, el
> comparador flotando con sombra de color, **Geist** en vez de IBM Plex, tarjetas grandes (radio 22) con
> sombra suave y borde de 1 px, pastillas redondas como etiquetas, un degradado azul→menta como acento
> (palabras del título, cifra grande, números de los pasos) y movimiento breve: una entrada en la portada y
> una aparición de 450 ms por tarjeta al llegar a ella. Lo que sigue vigente de abajo: nada inventado, textos
> honestos, botones que dicen lo que pasa, contraste ≥ 4,5:1, reduced-motion respetado, nada que se mueva
> solo en bucle, y el comparador antes/después como pieza memorable.

Decidida el 8-11-2026 antes de construir la segunda versión de la web. Toda página de Ihar Labs sigue
esto; los valores viven en `estilos.css` como variables y nunca se escriben sueltos.

## Quién la ve y qué debe sentir

Dueños y gerentes de pymes españolas (35–60 años), asesorías, directores financieros. Gente que
lleva su empresa en Excel y desconfía de «la IA» y de las agencias. La web tiene que sentirse como
**un taller serio**, no como una startup: números de verdad, pantallas de verdad, una persona que
construye. Confianza antes que impacto.

La única acción que importa: **pedir una conversación** (formulario). Secundaria: probar Flow.

## El elemento memorable: el antes y el después

Lo que hace Ihar Labs es convertir la herramienta que duele en la herramienta propia. La portada lo
**enseña, no lo cuenta**: a la izquierda una hoja de cálculo (recreada con la empresa de ejemplo), a
la derecha la misma tesorería en Flow, y un tirador que el visitante arrastra para pasar de una a otra.
Es la única pieza con movimiento, y se mueve porque la mueve el visitante. Todo lo demás está quieto.

## Lo que no se hace (porque es lo que hace todo el mundo)

- Ni degradados en el texto, ni degradados morado-azul, ni cristal esmerilado (`backdrop-filter`).
- Ni etiquetas en mayúsculas sobre cada título, ni «A · B · C», ni flechas «→» pegadas a los enlaces.
- Ni tarjetas idénticas de tres en tres con la misma sombra. Cada sección tiene la forma que pide su
  contenido: lista con filas, dos columnas, un solo bloque ancho.
- Ni apariciones al hacer scroll, ni burbujas flotando, ni carruseles que avanzan solos.
- Ni testimonios, cifras de clientes ni logotipos inventados. Donde falte el dato, se deja un hueco
  marcado o se quita la sección.
- Ni «IA» como reclamo en los títulos: aparece dentro, como herramienta, en frases concretas.

## Color

| Nombre | Valor | Para qué |
|---|---|---|
| `--tinta` | #15213d | texto principal, títulos |
| `--tinta-2` | #5a6577 | texto secundario |
| `--papel` | #ffffff | lienzo |
| `--papel-2` | #f3f5f9 | superficies: filas alternas, bloques, formulario |
| `--linea` | rgba(21, 33, 61, .10) | hairlines, bordes de 1 px |
| `--marino` | #182a60 | la marca; una sola sección oscura (cómo lo hacemos) y el pie |
| `--azul` | #2b58c8 | acciones: botones principales, enlaces, foco (4.9:1 sobre blanco) |
| `--azul-oscuro` | #1f46a8 | hover del botón |
| `--menta` | #1f9d6b | solo «cuadra», éxito, el tirador del antes/después (texto: 3.4:1, solo grande) |
| `--ambar` | #b7791f | avisos, estimado |
| `--rojo` | #c0392b | errores, «sin cuadrar» |

Reparto: 60 % papel, 30 % superficies (`--papel-2`, marino), 10 % azul. El azul no decora: si no se
puede pulsar, no es azul.

## Tipografía

Una sola familia: **IBM Plex Sans** (variable, incluida en `fuentes/`). Tiene carácter de documento
técnico, se lee bien en pantalla y no es la que sale por defecto. **IBM Plex Mono 500** solo dentro de
la hoja de cálculo recreada y en cifras que cambian (calculadora), donde ser monoespaciada significa algo.

Pesos: 400 (texto), 500 (etiquetas, botones, navegación), 600 (títulos). Nada por encima de 600.

Escala (px / interlineado):
- Portada h1: 52 / 1.08, letra −0.02em; en móvil 36.
- h2 de sección: 36 / 1.15; en móvil 28.
- h3: 22 / 1.25.
- Entrada (lead): 20 / 1.5.
- Cuerpo: 17 / 1.6. Secundario: 15 / 1.5. Meta: 13 / 1.4. Nada por debajo de 13.

Títulos con `text-wrap: balance`; párrafos de 60–72 caracteres por línea (`max-width: 62ch`).
Frase de título en minúsculas normales; nada de mayúsculas sostenidas.

## Espacio y forma

Rejilla de 8 px (micro: 4 px). Ancho de contenido 1120 px, gutter 24 px (16 en móvil). Separación
entre secciones 112 px (72 en móvil). Alineación a la izquierda en toda la página; lo centrado solo
cuando es una sola columna estrecha (preguntas).

Radio: 6 px en controles, 12 px en bloques, 16 px en los marcos de las pantallas. Radios concéntricos
(exterior = interior + relleno). Profundidad con un borde hairline primero; sombra solo en los marcos
de las pantallas, difusa y con alfa < 0.08.

## Componentes

- **Botón principal**: fondo `--azul`, texto blanco, 500, 44 px de alto, radio 6. Hover: `--azul-oscuro`.
  Pulsación: `scale(.98)`. Foco: anillo de 3 px azul al 35 %.
- **Botón secundario**: borde hairline, fondo blanco, texto `--tinta`.
- **Enlace de texto**: `--azul`, subrayado al pasar; sin flechas.
- **Fila de lista** (servicios, productos): título a la izquierda, descripción a la derecha, hairline
  entre filas. Es una lista, así que parece una lista.
- **Marco de pantalla**: borde hairline, radio 16, sombra difusa; sin barra de navegador falsa salvo en
  la portada, donde el dominio real importa.
- **Formulario**: etiquetas visibles encima, campos de 48 px, placeholders solo con ejemplos de formato,
  error en texto bajo el campo (qué pasó y qué hacer), éxito en texto. Nada de iconos dentro.
- **Movimiento**: 150–200 ms, `ease-out`, solo `transform` y `opacity`, solo tras una acción del
  visitante. Con `prefers-reduced-motion`, cambios instantáneos.

## Imágenes

Pantallas reales de Flow con la empresa de ejemplo «Vértice Comercial, S.L.» (datos inventados, y se
dice). Vídeo y pantallas del Gestor de turnos con los datos de ejemplo de SB. Ningún icono de
biblioteca «de pensar»: cuando hace falta un signo, uno sencillo, monocromo, a mano.

## Textos

Tratamiento de usted. Frases cortas. Un verbo en cada botón que dice lo que pasa: «Pedir una
conversación», «Probar Flow 30 días», «Calcular mi ahorro», «Enviar el mensaje». Cifras con punto de
miles y coma decimal. Nunca «revolucionar», «potenciar», «solución integral», «de última generación».
