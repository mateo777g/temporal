# Fragmentless — página web

La página pública de Fragmentless, una empresa de software. El sistema para restaurantes es solo su
**primer producto**, no la identidad de la marca. Eslogan: «Un mundo sin piezas sueltas».

## Cómo presentar la marca (importante)

Fragmentless se presenta como una empresa sólida y con visión, no como un proyecto personal.

- Nada de historia personal (la prepa, primeros trabajos, ventas que no se cerraron) ni de cosas que
  suenen a registro de cambios o proceso interno («rediseñamos las vistas», «todo queda escrito»).
- El fundador aparece solo como un detalle breve: «Fragmentless la fundó Matthew Santibañez Reyes a los 19 años».
- Los principios y beneficios se escriben como promesas para el cliente, no como reglas internas.
- De los documentos internos (como «Visión de Fragmentless») no se publican precios, costos,
  distribuidores, infraestructura ni nombres de clientes.
- El texto sobre el logo ∫∫ de ese documento está desactualizado: no usarlo.
- Los botones de la portada que hablan de la empresa (como «Conócenos») llevan a `nosotros.html`, no al
  sistema. «Conoce el Sistema» lleva a `./#sistema`.

## Estructura

Sitio estático en HTML, CSS y JS sin framework, más unos componentes React/TypeScript compilados a un bundle.

| Archivo | Qué es |
| --- | --- |
| `index.html` | Inicio. Portada → escena de la laptop (scroll) → sección del panel (`#sistema`) → tarjetas → clientes → footer |
| `style.css` | Estilos de `index.html` y de lo compartido: barra, botones (`.boton`, `.boton-borde`, `.boton-primario`), footer |
| `escena.js` | La laptop 3D que se encoge, gira, se va al lado y se cierra con el scroll |
| `barra.js` | La barra de arriba y sus submenús. Abierta con el mouse no frena el scroll; con dedo o teclado sí |
| `hoja.js` | La hoja blanca de la sección del panel, que sube encima de la escena |
| `nosotros.html`, `nosotros.css`, `nosotros.js` | Página Nosotros: portada, misión, el nombre, hacia dónde vamos (negra), cómo trabajamos, primer producto (azul) |
| `src/wave-entry.tsx` | Entrada React: monta `#panel-showcase`, `#feature-cards` y `#site-footer` |
| `components/` | Componentes React (fila curva de capturas con OGL, tarjetas, footer con brillo) |
| `assets/` | Bundle compilado (`wave-background.js`, `components.css`), logos, `og-imagen.jpg` |
| `prueba/` | Imágenes y videos que usa la página (a pesar del nombre, son los de verdad) |
| `scripts/teclas-claras.py` | Saca las teclas claras (`teclado-claro.webp`) de las negras (`teclado.webp`) con Pillow |

La laptop: `.laptop` contiene `.video` (pantalla), `.grosor-pantalla` y `.teclado`.

- **Pantalla** (`.video`): el marco negro, los videos recortados por dentro, la cámara al centro del marco de
  arriba (`.video::before`) y el reflejo del vidrio (`.video::after`, una diagonal tenue arriba a la izquierda).
- **Grosor de la pantalla** (`.grosor-pantalla`): una caja del tamaño de la pantalla con `.tapa` al fondo, las
  `.orilla-*` y las mismas `.esquina-*` de la base (ahí las «de atrás» son las de arriba). Mide la mitad que la
  base. Sus orillas llevan el brillo del lado de la tapa, así que cerrada se ven dos orillas pulidas, una sobre otra.
- **Base** (`.teclado`): teclas (imagen), trackpad y su grosor: `.canto` (enfrente), `.canto-atras` (en la
  bisagra), `.costado-izq` y `.costado-der`, y `.esquina-*` (dos tramos de 45° que cierran cada una de las cuatro
  esquinas redondas, igual de redondas que la tapa). El grosor mide 3 % del fondo del teclado (`3cqh`).
- **Rejilla de las bocinas** (`.teclado::before`, con `position: absolute` para no entrar en la cuadrícula del
  teclado): una franja de agujeritos de medio milímetro, uno cada milímetro, entre la bisagra y la fila de las F,
  a lo ancho de las teclas. A 1280 mide unos 4 px de alto y se ve como una línea gris un poco más oscura; de
  cerca, como rejilla. No se comprobó si tiembla mientras se mueve la laptop, ni cómo se ve en una pantalla Retina.
- **Muesca de enfrente** para abrir la tapa: fingida con `.canto:not(.canto-atras)::after` (el hueco visto de
  frente) y `.teclado::after` (la sombra en el teclado). Va centrada en la laptop, no en el trackpad, que se corre
  a la izquierda por el teclado numérico.
- **Puertos** en el costado derecho: dos USB-C (`.costado-der::before`; el segundo es su `box-shadow`) y la
  entrada de audífonos (`.costado-der::after`), hacia atrás, junto a la bisagra. Medidos en `cqh` del teclado;
  en pantalla, el USB-C sale de unos 4 × 11 px a 1280 y 5 × 15 px a 1920, así que son formas lisas y oscuras.
- **Bisagra** (`.bisagra`, dentro del teclado): un cuarto de cilindro en el rincón entre la pantalla y el
  teclado, hecho con una tira lisa en diagonal (`.bisagra-frente`) con un degradado que hace la curva, y dos
  puntas de cuarto de círculo. Su eje es la línea donde gira la pantalla, así que no se mueve; cerrada queda
  guardada dentro de la pantalla.
- **Debajo de la base**: `.sombra` y `.piso` (un piso de luz gris que se enciende con la parte negra, con
  `--oscuro` de `escena.js`). Como están en el 3D del teclado, siguen a la laptop sin código extra.

La laptop es plateada, con teclas claras y orillas pulidas. En la parte negra el plateado baja un 20 % con
`--oscuro` (por eso `--plata-*` está en `.laptop` y no en `:root`); al 42 % se notaba que cambiaba de color, y
sin bajar parecía tener luz propia. No sigue al cursor: quieta, la sombra y la luz se pueden afinar para cada
pose del scroll. En la pose del centro va más chica y más arriba (`k` y `y` en `POSES`) para que el texto
«Presentamos nuestro nuevo software» quepa debajo sin pasarle encima.
La parte negra (`.noche`) no es negro plano: una luz gris suave detrás de la laptop, cargada a la derecha, y
el fondo que se aclara poquito hacia abajo, sin línea de piso. La luz sigue a la laptop de lado (`--luz-x`) y
su altura (`--luz-y`) no cambia; las dos variables las pone `escena.js`.
Todo es 3D real (`preserve-3d`); ver los comentarios en `style.css`.
Hasta que `escena.js` la acomoda por primera vez (pone `data-escena` en `<html>`), la laptop y el eslogan
están escondidos; si no, mientras baja el bundle se ve la pantalla azul a todo lo ancho.

## Dónde nos quedamos (23 de octubre de 2026)

Se pulió la laptop de la escena: esquinas redondas, sombra, plateada con teclas claras, quieta (sin cursor) y
el fondo de la parte negra. Después se le pusieron detalles, cada uno con su commit: grosor de la pantalla,
reflejo en el vidrio, bisagra, cámara en el marco, muesca de enfrente, puertos del costado y rejilla de las
bocinas. Ya se probó y se descartó (no volver a proponerlo igual):

- Centrar la laptop completa en la pose del centro: se veía menos centrada; manda la pantalla.
- Oscurecer el plateado de noche al 42 % (se notaba el cambio de color) o nada (parecía tener luz propia): va al 20 %.
- Un estudio con línea entre pared y piso: se veía demasiado definido.
- Pedir a la IA imágenes nuevas (teclas o detalles): no hace falta; las teclas salen de la imagen actual con el
  script y los detalles son formas sencillas que salen mejor en CSS.
- Logo en la tapa: era de maquetas viejas.
- Un reflejo más tenue, o que bajara en la parte negra: no se distinguía.
- Una bisagra de cilindro completo (cerrada, su mitad de atrás asomaba detrás de la tapa) o hecha con 6 tiras de
  15° (se veía un punteado donde se encimaban): va el cuarto de enfrente, con una sola tira.
- Puertos en el costado izquierdo: en todo el scroll nunca da hacia la cámara, y con `backface-visibility: hidden`
  ni se dibuja.
- Lengüeta o bisel dentro de los puertos: saldrían de menos de 1 px.
- Rejillas de bocinas a los lados de las teclas: no caben, porque con el teclado numérico ocupan hasta el 94 % del
  ancho.
- Una rejilla con agujeros más grandes (unos 2 px en pantalla): de cerca parecía de juguete, y los puntos podían
  hacer un patrón que temblara al moverse la laptop.

Con eso la laptop ya tiene todos los detalles que se planearon. En celular la escena de la laptop se va a cambiar
por otra cosa, así que sus detalles se revisan solo en escritorio.

## Comandos

```sh
npm install
npm run build      # typecheck + bundle de React (esbuild) + Tailwind
```

- Solo hace falta compilar al cambiar algo en `components/`, `src/` o `styles/components.css`. Los cambios
  al HTML, a `style.css`, a `nosotros.css` o a los `.js` de la raíz no necesitan build.
- Para verla: `.claude/launch.json` tiene el servidor `fragmentless` (`python -m http.server 5510`).
  También sirve Live Server.
- Imágenes y video se comprimen con ffmpeg (ver `README.md`): fotos a WebP de 1200 px y video H.264 de 1280 px sin audio.
- Al cambiar `style.css` o un `.js` de la raíz, subir su `?v=` en `index.html` (por ejemplo `style.css?v=bocinas-1`),
  para que el navegador no use la copia vieja guardada.

## Cómo probar la laptop en el navegador integrado

Los cambios a la laptop se prueban primero en la pestaña del usuario, inyectando estilos o elementos con JS,
sin tocar archivos; se pasan a los archivos cuando dice «pásalo». Trucos que funcionaron:

- **Poses por scroll:** `recorrido = .escena.offsetHeight - 2 × .escena-fija.offsetHeight`. Portada: 0; centro:
  0.35 del recorrido; derecha: 0.76; a medio cierre: el recorrido menos 0.6 pantallas; cerrada: menos 0.2.
  Usar `scrollTo({ top, behavior: 'instant' })`, porque `html` tiene `scroll-behavior: smooth`.
- **Lupa:** para ver de cerca, escalar `.escena-fija` con `transform` (`translate` + `scale`) alrededor del
  punto que interesa. No cambia la geometría. Quitarla al terminar.
- **Dónde cae un punto del 3D:** meter un `div` de 1 px en ese lugar (por ejemplo, en `.teclado` a `left: 50%;
  top: 100%`), leer su `getBoundingClientRect()` y quitarlo.
- **Hacia dónde mira un plano:** con tres de esos puntos en sus esquinas (0 0, 100 % 0 y 0 100 %), el signo del
  producto cruz de las dos orillas dice si da hacia la cámara (positivo) o si le da la espalda y no se dibuja.
- **Tamaño en pantalla:** al emular 1280, 1440 o 1920, el panel encoge la página para que quepa, así que una
  captura no enseña los píxeles de verdad. Lo que mide algo en pantalla se saca con esos puntos.
- **Panel escondido o chico:** no se pintan cuadros. Una captura obliga a pintar uno, pero la primera puede salir
  vieja o negra, o tardar demasiado (tomar otra). Las medidas no cambian hasta que se pinta, y esperar
  `requestAnimationFrame` se cuelga.
- **Consola:** la del navegador integrado guarda errores de cargas viejas (como «cursor is not defined» de una
  versión anterior de `escena.js`). Para comprobar que está limpia, cargar la página en un `iframe` escondido con
  `srcdoc`: el HTML con un script al principio que anote errores y avisos, y sin el script que mete Live Server
  (si no, sale un error de WebSocket «srcdoc»). Luego recorrer las poses y leer lo anotado.

## Convenciones

- Todo en español: nombres de clases, variables, funciones y comentarios (`pintar`, `pedirCuadro`, `.boton-primario`).
- Cada archivo empieza con un comentario de qué es, y los comentarios explican el *por qué*, en frases completas.
- Colores en variables de `:root` (`--azul: #1355E8`, `--tinta`, `--noche`, …). Letra: Inter.
- Respetar `prefers-reduced-motion` en toda animación nueva.
- Probar en escritorio y en celular (375 px) sin scroll horizontal, y revisar la consola. Los detalles de la
  laptop, solo en escritorio (1280, 1440 y 1920 px): en celular va a ir otra cosa.
- Un commit por cambio, subido a GitHub, para poder regresar solo esa parte.
- Es un repositorio de git (rama `main`, `core.autocrlf false` para dejar los archivos como están), con copia en
  GitHub: https://github.com/mateo777g/temporal (público). Antes de un cambio grande, hacer commit y subirlo
  para poder regresar a la versión anterior.

## Pendientes conocidos

- Enlaces que todavía apuntan a `#`: «Iniciar Sesión», «Planes», «Contáctanos», y «Más información» y
  «Comprar» de la escena en `index.html`.
- Cuando haya dominio: `og:image` en `index.html` y `nosotros.html` debe ser una dirección completa (`https://…`).
- Según la marca, el nombre «fragmentless» va en la letra Outfit, peso 200. La barra todavía usa Inter.
- `prueba/` podría renombrarse (por ejemplo, `media/`). Los archivos que ya no se cargan (`nuevo.mp4`,
  `nuevo.jpg`, `libreta.png`, `mesera.png`, `mesera.webp`, `cuentas.png`, `tableta-manos.webp`,
  `panel-*.mp4`) no deben subirse al hosting. `teclado.webp` tampoco se carga, pero se queda en el repo: es
  la imagen de la que `scripts/teclas-claras.py` saca `teclado-claro.webp`.
- `respaldos/2026-10-23-antes-de-portada/` tiene una copia de `index.html`, `style.css` y `escena.js` de antes
  de esconder la laptop hasta que carga; se puede borrar y no debe subirse al hosting.
- La sección `.clientes` de `index.html` está vacía hasta que haya logos de clientes reales.