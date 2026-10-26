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
| `index.html` | Inicio. Portada → escena de la laptop (scroll), que termina con zoom a su pantalla → sección del panel (`#sistema`) → tarjetas → clientes → footer |
| `style.css` | Estilos de `index.html` y de lo compartido: barra, botones (`.boton`, `.boton-borde`, `.boton-primario`), footer |
| `escena.js` | La laptop 3D que se encoge, gira, se va al lado y se cierra con el scroll; luego la cámara la ve de frente, se reabre en blanco y avanza hasta que su pantalla llena todo |
| `pantalla.js` | El azul de la pantalla de la laptop, dibujado en vivo con WebGL (antes era un video) |
| `barra.js` | La barra de arriba y sus submenús. Abierta con el mouse no frena el scroll; con dedo o teclado sí |
| `hoja.js` | La sección del panel: marca cuándo llega (`data-llego`) para que entren su fila curva y sus textos, y cuándo se van los textos (`data-textos`) |
| `nosotros.html`, `nosotros.css`, `nosotros.js` | Página Nosotros: portada, misión, el nombre, hacia dónde vamos (negra), cómo trabajamos, primer producto (azul) |
| `src/wave-entry.tsx` | Entrada React: monta `#panel-showcase`, `#feature-cards` y `#site-footer` |
| `components/` | Componentes React (fila curva de capturas con OGL, tarjetas que cambian de color con el efecto luma, footer con brillo) |
| `assets/` | Bundle compilado (`wave-background.js`, `components.css`), logos, `og-imagen.jpg` |
| `prueba/` | Imágenes que usa la página (a pesar del nombre, son las de verdad) |

La laptop: `.laptop` contiene `.video` (pantalla), `.grosor-pantalla` y `.teclado`.

- **Pantalla** (`.video`, el nombre es de cuando tenía un video): el marco negro, recortados por dentro el
  azul en vivo (`.pantalla-azul`, un `canvas`), la captura del panel encima y, encima de todo, la pantalla en
  blanco de la sección 3 (`.pantalla-seccion`, solo con `data-seccion`), la cámara al centro del marco de
  arriba (`.video::before`) y el reflejo del vidrio (`.video::after`, una diagonal tenue arriba a la izquierda;
  sobre el blanco se quita).
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
La parte negra (`.noche`) en realidad es gris muy oscuro (`--noche-escena`, de `#141415` arriba a `#252527` abajo;
`--noche`, el negro total, se quedó para la sección negra de Nosotros). Tampoco es plana: una luz gris suave detrás
de la laptop, cargada a la derecha, y el fondo que se aclara poquito hacia abajo, sin línea de piso. La luz sigue a la laptop de lado (`--luz-x`) y
su altura (`--luz-y`) no cambia; las dos variables las pone `escena.js`.
Todo es 3D real (`preserve-3d`); ver los comentarios en `style.css`.

**El paso a la sección 3 (la cámara).** La escena mide 700vh: las 3.5 pantallas de antes, 1.5 para la cámara, la
fija y la de la sección 3. En `escena.js` todo lo de antes se cuenta sin las de la cámara (`recorrido`), y el
cierre y la cámara en pantallas contadas desde el final del recorrido (`despues`): la laptop se cierra de lado
(`CIERRE`), la cámara gira hasta verla de frente (`GIRO`, `FRENTE_CERRADA`: desde unos 40° y con más
perspectiva, `PROFUNDIDAD_FRENTE`, para que se vea su fondo), se vuelve a abrir con la pantalla en blanco
(`REABRIR`, `FRENTE_ABIERTA`: desde unos 34°, con la tapa y la perspectiva de siempre, centrada con su teclado) y
la cámara avanza (`ZOOM`, la escala en veces, como una cámara) hasta que lo de adentro del marco cubre la pantalla
(`kLlena`). Con eso la barra regresa a letra negra. Un poco después la sección 3 llega arriba (`CAMARA + 1`):
`.hoja` ya no tiene fondo ni sube como hoja con esquinas; el blanco es la pantalla de la laptop y luego el de la
página. `hoja.js` le pone `data-llego` y la fila curva (`.panel-reel > [aria-hidden]`, de TiltedGridHero) y los
textos entran a la vez, con las animaciones de siempre (el título se pinta de azul claro a azul y a negro); al
regresar se desvanecen juntos en 0.35 s. Las posiciones de frente se midieron a 1280, 1440 y 1920 (el espacio
de arriba y el de abajo quedan casi iguales).
Hasta que `escena.js` la acomoda por primera vez (pone `data-escena` en `<html>`), la laptop y el eslogan
están escondidos; si no, mientras baja el bundle se ve la pantalla azul a todo lo ancho.

## Dónde nos quedamos (26 de octubre de 2026)

El 26 se cambió el paso de la sección 2 a la 3: la hoja blanca que subía se veía pobre junto al cierre de la
laptop, y cualquier transición aparte (se probaron un desvanecido a blanco, un círculo blanco que salía de la
laptop y varias de 21st.dev) quedaba fuera de lugar. Va la idea del usuario: la cámara gira a ver la laptop de
frente, se reabre y hace zoom a la pantalla (ver «El paso a la sección 3» arriba). Ya se probó y se descartó:

- Echar la tapa más hacia atrás al reabrirse (128°, con la cámara más abajo y más perspectiva): va la de siempre.
- El título de la sección 3 en la pantalla de la laptop, cuadrado al pixel con el de verdad: va toda blanca.
- Que la fila curva entrara antes que los textos: entran juntos. Si el bloque entero se desvanece a la vez que
  los textos, el azul del título se pierde y parece salir en seco; por eso solo se desvanece la fila curva.

También el 26, las tarjetas del producto (`.franja`): la parte de los textos ya no es gris con un azul que subía
con el mouse. Siempre es de color, con los tres degradados del efecto «luma» de 21st.dev (shader-reveal): azul
(cian a índigo), verde (a amarillo) y naranja (a rosa), en ese orden, en `--degradado-*`. Cada vez que el mouse
entra a la imagen pasa al siguiente, con los listones del efecto encima (en celular, al tocar la imagen); el
clic con mouse no hace nada. Letra blanca y una sombra suave en la tarjeta completa. El efecto está en
`components/ui/luma-transicion.ts` (el shader del original, solo esa variante, sin React ni framer-motion); el
WebGL se prepara la primera vez que hace falta. Se compararon en una página de prueba con selector y se
descartaron: el azul que sube con los listones en su orilla, el efecto en toda la tarjeta al pasar el mouse con
regreso a gris, y un color fijo por tarjeta («que del azul cambie al tal color», como en el video del ejemplo).
Sin resolver: el blanco sobre el verde a amarillo se lee poco (así viene en el ejemplo).

Del 24 de octubre:

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
- La parte negra en negro total (como estaba) o en un gris más claro (de `#1E1E1F` a `#313132`, el de la página
  donde se compararon la plateada y la oscura): se comparó en una página de prueba y se quedó el gris oscuro.
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

- **Poses por scroll:** `recorrido = .escena.offsetHeight - 3.5 × .escena-fija.offsetHeight`. Portada: 0; centro:
  0.35 del recorrido; derecha: 0.76; a medio cierre: el recorrido menos 0.6 pantallas; cerrada: menos 0.2.
  La cámara, en pantallas después del recorrido: de frente cerrada, 0.5; abierta, 1.17; pantalla llena, 2.4;
  llega la sección 3, 2.5. Usar `scrollTo({ top, behavior: 'instant' })`, porque `html` tiene
  `scroll-behavior: smooth`.
- **Animaciones cuadro por cuadro:** justo después de lo que las dispara, `document.getAnimations()` (filtrando por
  el elemento), `pause()` a todas y luego `currentTime = 120`, `250`… con una captura en cada una. Así se comparó
  la entrada del título de la sección 3 con la de antes.
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
- `prueba/` podría renombrarse (por ejemplo, `media/`). Ya solo tiene lo que carga la página (`fondo-azul.webp`
  es lo que se ve sin WebGL). El 24 de octubre se borraron los respaldos, las fotos y videos viejos que ya no se
  cargaban y las teclas claras de la plateada (`teclado-claro.webp` y `scripts/teclas-claras.py`); si hacen falta,
  siguen en el historial de git (por ejemplo, en el commit `ceb8af1`).
- La sección `.clientes` de `index.html` está vacía hasta que haya logos de clientes reales.