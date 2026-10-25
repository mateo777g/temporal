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
| `pantalla.js` | El azul de la pantalla de la laptop, dibujado en vivo con WebGL (antes era un video) |
| `barra.js` | La barra de arriba y sus submenús. Abierta con el mouse no frena el scroll; con dedo o teclado sí |
| `hoja.js` | La hoja blanca de la sección del panel, que sube encima de la escena |
| `nosotros.html`, `nosotros.css`, `nosotros.js` | Página Nosotros: portada, misión, el nombre, hacia dónde vamos (negra), cómo trabajamos, primer producto (azul) |
| `src/wave-entry.tsx` | Entrada React: monta `#panel-showcase`, `#feature-cards` y `#site-footer` |
| `components/` | Componentes React (fila curva de capturas con OGL, tarjetas, footer con brillo) |
| `assets/` | Bundle compilado (`wave-background.js`, `components.css`), logos, `og-imagen.jpg` |
| `prueba/` | Imágenes y videos que usa la página (a pesar del nombre, son los de verdad) |
| `scripts/teclas-claras.py` | Sacaba las teclas claras de la laptop plateada (`teclado-claro.webp`) de las negras (`teclado.webp`) con Pillow |

La laptop: `.laptop` contiene `.video` (pantalla), `.grosor-pantalla` y `.teclado`.

- **Pantalla** (`.video`, el nombre es de cuando tenía un video): el marco negro, recortados por dentro el
  azul en vivo (`.pantalla-azul`, un `canvas`) y la captura del panel encima, la cámara al centro del marco de
  arriba (`.video::before`) y el reflejo del vidrio (`.video::after`, una diagonal tenue arriba a la izquierda).
- **El azul en vivo** (`pantalla.js`): un shader de WebGL de manchas azul marino que se deforman, con líneas que
  brillan. Sus colores se midieron contra el video que había antes. Como en el video, la luz y lo oscuro no se
  deslizan: salen de la nada en su lugar y se van (un ruido con el tiempo como tercera dimensión, `ruido3`), y lo
  oscuro dura lo mismo que en el video (medido punto por punto). Las formas van lentas, y todo junto al 80 % de
  esas velocidades, porque se veía un poco rápido. Dibuja
  a 1280 de ancho como mucho; mientras la captura del panel lo tapa (toda la parte negra) no dibuja, pero revisa
  cada cuadro, porque esperar al scroll fallaba: su cuadro corre antes que el de `escena.js`. Con «reducir
  movimiento», un cuadro quieto. Sin WebGL se ve `fondo-azul.webp`. El de 21st.dev («Silk») no se usó: es otra
  forma, en grises y en React.
- **Grosor de la pantalla** (`.grosor-pantalla`): una caja del tamaño de la pantalla con `.tapa` al fondo, las
  `.orilla-*` y las mismas `.esquina-*` de la base (ahí las «de atrás» son las de arriba). Mide la mitad que la
  base. Sus orillas llevan el brillo del lado de la tapa, así que cerrada se ven dos orillas pulidas, una sobre otra.
- **Base** (`.teclado`): teclas (imagen), trackpad y su grosor: `.canto` (enfrente), `.canto-atras` (en la
  bisagra), `.costado-izq` y `.costado-der`, y `.esquina-*` (dos tramos de 45° que cierran cada una de las cuatro
  esquinas redondas, igual de redondas que la tapa). El grosor mide 3 % del fondo del teclado (`3cqh`).
- **Rejilla de las bocinas** (`.teclado::before`, con `position: absolute` para no entrar en la cuadrícula del
  teclado): una franja de agujeritos de medio milímetro, uno cada milímetro, entre la bisagra y la fila de las F,
  a lo ancho de las teclas. A 1280 mide unos 4 px de alto y se ve como una línea un poco más oscura que la base;
  de cerca, como rejilla. Sobre el gris oscuro los agujeros van casi negros. No se comprobó si tiembla mientras se mueve la laptop, ni cómo se ve en una pantalla Retina.
- **Brillo de la base** (`.brillo`, un `div` después del trackpad, para quedar encima de él y de las teclas): como
  en la maqueta, una franja de luz sin orilla (el aluminio es mate) que entra por enfrente a la izquierda, donde se
  apoyan las manos, el mismo lado del reflejo de la pantalla, y se apaga hacia la derecha y hacia atrás, casi sin
  llegar a las teclas (`::before`), más una línea de luz en la orilla de enfrente (`::after`). El canto de enfrente
  también va más claro de ese lado. En la parte negra baja un poco (`--oscuro`).
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

La laptop es gris oscuro (`--aluminio-*`, en `.laptop`), con las teclas negras de `teclado.webp` y orillas
pulidas de un gris más claro (`--pulido`), que la marcan sobre el negro. No baja de color en la parte negra: ya es
oscura y se perdería en el fondo. Fue plateada con teclas claras un tiempo; se compararon las dos en una página de
prueba y se quedó la oscura (la plateada está en el commit `b55967e`). No sigue al cursor: quieta, la sombra y la luz se pueden afinar para cada
pose del scroll. En la pose del centro va más chica y más arriba (`k` y `y` en `POSES`) para que el texto
«Presentamos nuestro nuevo software» quepa debajo sin pasarle encima.
La parte negra (`.noche`) no es negro plano: una luz gris suave detrás de la laptop, cargada a la derecha, y
el fondo que se aclara poquito hacia abajo, sin línea de piso. La luz sigue a la laptop de lado (`--luz-x`) y
su altura (`--luz-y`) no cambia; las dos variables las pone `escena.js`.
Todo es 3D real (`preserve-3d`); ver los comentarios en `style.css`.
Hasta que `escena.js` la acomoda por primera vez (pone `data-escena` en `<html>`), la laptop y el eslogan
están escondidos; si no, mientras baja el bundle se ve la pantalla azul a todo lo ancho.

## Dónde nos quedamos (24 de octubre de 2026)

Se pulió la laptop de la escena: esquinas redondas, sombra, quieta (sin cursor) y el fondo de la parte negra.
Al final se regresó al gris oscuro con teclas negras de antes, con todos los detalles. Después se le pusieron detalles, cada uno con su commit: grosor de la pantalla,
reflejo en el vidrio, bisagra, cámara en el marco, muesca de enfrente, puertos del costado, rejilla de las
bocinas y brillo de la base. Ya se probó y se descartó (no volver a proponerlo igual):

- Centrar la laptop completa en la pose del centro: se veía menos centrada; manda la pantalla.
- La laptop plateada con teclas claras: comparada lado a lado, se prefirió la oscura. Si se vuelve a probar, de
  noche el plateado bajaba un 20 % (al 42 % se notaba el cambio de color; sin bajar parecía tener luz propia).
- Un estudio con línea entre pared y piso: se veía demasiado definido.
- Pedir a la IA imágenes nuevas (teclas o detalles): no hace falta; las teclas son la imagen actual y los
  detalles son formas sencillas que salen mejor en CSS.
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
- En la plateada, un brillo de la base más tenue (con la mitad de fuerza casi no se notaba) o mucho más fuerte
  (la base se veía con neblina). En la oscura, una luz pareja sobre toda la base también daba neblina; por eso la
  franja de ahora se queda en el reposamanos.
- Un brillo de la base como el de la maqueta pero más fuerte (franja al 32 %, línea de la orilla al 70 %, canto al
  20 %): comparado con el de ahora (20, 45 y 12 %), se prefirió el suave.
- Una barra que empezara negra en el cambio a modo noche y se volviera transparente conforme se oscurece la
  escena (con el `--oscuro` de `escena.js`): se prefirió sencilla, transparente desde el cambio.
- La barra transparente en toda la página: en la hoja, las tarjetas y el footer el contenido sí pasa por debajo
  de ella. Ahí se queda blanca.
- Un azul de la pantalla con formas más redondas, burbujas que dejaban anillos y líneas finas medidas en píxeles,
  con los colores sacados del video entero: aunque los números cuadraban, no se parecía al video. Se quedó la
  primera versión de `pantalla.js`, más lenta y con la luz y lo oscuro que salen en su lugar.
- Acelerar el reloj de la luz para que lo claro durara menos: lo claro ya estaba bien; lo que se quedaba de más
  era lo oscuro.

Con eso la laptop ya tiene todos los detalles que se planearon, más el brillo de la base, que salió de compararla
con la maqueta (y después se hizo más parecido al de ella: una franja de luz y la orilla de enfrente brillante). En celular la escena de la laptop se va a cambiar por otra cosa, así que sus detalles se revisan
solo en escritorio.

La barra, sobre toda la escena (la portada blanca y la parte negra), es transparente y sin su línea: en
`style.css`, la regla de `:root[data-escena]:not([data-hoja])`. Blanca se veía como un bloque en el gris del paso a
la parte negra, y negra, sobre ese fondo que no es negro plano. La letra va negra mientras el fondo es claro y
blanca desde el cambio a modo noche (`data-noche`). Nada de la escena pasa por debajo de ella, ni en celular.
Sobre la hoja y lo que sigue es blanca con su línea, como antes; abierta, con su submenú, tiene fondo (blanco de
día, gris oscuro de noche). `data-escena` solo lo pone `escena.js`, así que en `nosotros.html` la barra sigue
blanca. Lo único que queda: en el tramo gris del paso a la parte negra, «Iniciar Sesión» (azul) se lee débil. Si
molesta, la idea es que ahí ese botón vaya con borde y letra blancos.

## Comandos

```sh
npm install
npm run build      # typecheck + bundle de React (esbuild) + Tailwind
```

- Solo hace falta compilar al cambiar algo en `components/`, `src/` o `styles/components.css`. Los cambios
  al HTML, a `style.css`, a `nosotros.css` o a los `.js` de la raíz no necesitan build.
- Para verla: `.claude/launch.json` tiene el servidor `fragmentless` (`python -m http.server 5510`).
  También sirve Live Server.
- Imágenes y video se comprimen con ffmpeg (ver `README.md`): fotos a WebP de 1200 px y video H.264 de 1280 px
  sin audio. La página ya no carga ningún video.
- Al cambiar `style.css` o un `.js` de la raíz, subir su `?v=` en `index.html` (por ejemplo `style.css?v=barra-transparente-2`),
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
  `panel-*.mp4`, `fondo-azul.mp4`) no deben subirse al hosting; `fondo-azul.webp` sí, porque es lo que se ve
  sin WebGL. `teclado-claro.webp` (las teclas de la laptop plateada) tampoco se
  carga, pero se queda en el repo con `scripts/teclas-claras.py`, por si se regresa a la plateada.
- `respaldos/2026-10-23-antes-de-portada/` tiene una copia de `index.html`, `style.css` y `escena.js` de antes
  de esconder la laptop hasta que carga; se puede borrar y no debe subirse al hosting.
- La sección `.clientes` de `index.html` está vacía hasta que haya logos de clientes reales.