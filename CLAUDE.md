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

La laptop: `.laptop` contiene `.video` (pantalla), `.tapa` y `.teclado`. El teclado tiene el grosor de la
base: `.canto` (enfrente), `.canto-atras` (en la bisagra), `.costado-izq` y `.costado-der`, y `.esquina-*`
(dos tramos de 45° que cierran cada una de las cuatro esquinas redondas, igual de redondas que la tapa).
Debajo de la base van `.sombra` y `.piso` (un piso de luz gris que se enciende con la parte negra, con
`--oscuro` de `escena.js`); como están en el 3D del teclado, siguen a la laptop sin código extra.
La laptop es plateada, con teclas claras y orillas pulidas. Sus colores (`--plata-*`, `--pulido`) están en
`.laptop` y no en `:root`, porque se oscurecen con `--oscuro` en la parte negra. No sigue al cursor: quieta,
la sombra y la luz se pueden afinar para cada pose del scroll.
La parte negra (`.noche`) no es negro plano: una luz gris suave detrás de la laptop, cargada a la derecha, y
el fondo que se aclara poquito hacia abajo, sin línea de piso. La luz sigue a la laptop de lado (`--luz-x`) y
su altura (`--luz-y`) no cambia; las dos variables las pone `escena.js`. Todo es 3D real (`preserve-3d`); ver los comentarios en `style.css`.
Hasta que `escena.js` la acomoda por primera vez (pone `data-escena` en `<html>`), la laptop y el eslogan
están escondidos; si no, mientras baja el bundle se ve la pantalla azul a todo lo ancho.

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

## Convenciones

- Todo en español: nombres de clases, variables, funciones y comentarios (`pintar`, `pedirCuadro`, `.boton-primario`).
- Cada archivo empieza con un comentario de qué es, y los comentarios explican el *por qué*, en frases completas.
- Colores en variables de `:root` (`--azul: #1355E8`, `--tinta`, `--noche`, …). Letra: Inter.
- Respetar `prefers-reduced-motion` en toda animación nueva.
- Probar en escritorio y en celular (375 px) sin scroll horizontal, y revisar la consola.
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
- `respaldos/` tiene una copia de `index.html`, `style.css` y `escena.js` de antes de esconder la laptop
  hasta que carga; se puede borrar y no debe subirse al hosting.
- La sección `.clientes` de `index.html` está vacía hasta que haya logos de clientes reales.
- En la pose del centro (parte negra), el texto «Presentamos nuestro nuevo software» pasa encima del frente
  de la base plateada: el título se lee bien, pero el párrafo se lee regular donde cruza la orilla. Se
  arregla bajando un poco el texto o subiendo la laptop en esa pose (`POSES` en `escena.js`).
