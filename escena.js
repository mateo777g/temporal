// escena.js — la escena del video en la página de Fragmentless (index.html).
// Al bajar, el hueco del video se encoge y se gira de lado, el fondo se oscurece (y sobre el video azul
// aparece la captura del panel) y sale el texto del centro; luego la tarjeta se va a la derecha
// y sale el texto de la izquierda con su botón. La tarjeta no sigue al cursor: quieta, su sombra y su
// luz se ven siempre igual en cada pose.
// La tarjeta es la pantalla de una laptop: mientras se encoge le sale el marco y el teclado se desdobla
// desde su orilla de abajo, y la laptop entera hace los mismos movimientos. Cuando sube la hoja de la
// sección 3, la laptop se cierra y sus videos se pausan.
// La tarjeta y el fondo los mueve el scroll: cada cuadro se calcula de cuánto has bajado dentro de la
// escena. Los textos no: al llegar a su momento entran solos, con el reloj (style.css), y al pasarlo se van.
(() => {
  const escena = document.querySelector('.escena');
  const fija = escena.querySelector('.escena-fija');
  const noche = escena.querySelector('.noche');
  const laptop = escena.querySelector('.laptop');
  const video = laptop.querySelector('.video');
  const teclado = laptop.querySelector('.teclado');
  const videos = [...video.querySelectorAll('video')];
  const portada = escena.querySelector('.portada-copy');
  const videoNoche = video.querySelector('.video-noche');
  const panelSistema = video.querySelector('.panel-sistema');
  const centro = escena.querySelector('.texto-centro');
  const lado = escena.querySelector('.texto-lado');
  const celular = matchMedia('(max-width: 760px)');
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

  // Poses de la tarjeta, medidas del video de referencia (pantalla de 1896×916).
  // x, y: dónde queda su centro (fracción de la pantalla). ancho, alto: lo más que puede medir
  // ya encogida. rx, ry, rz: giros en grados (ry negativo = el lado izquierdo se va hacia atrás).
  // k: cuánto se encoge al irse al lado, respecto a la pose del centro.
  // La del lado iba más abajo (y: 0.495) y el teclado se cortaba con la orilla de la pantalla: ahora se
  // queda a la altura de la del centro, así se va derecho a la derecha sin bajar y se ve entera.
  const POSES = {
    escritorio: {
      centro: { x: 0.5, y: 0.413, ancho: 0.497, alto: 0.462, rx: 0, ry: -53, rz: 0 },
      lado: { x: 0.645, y: 0.413, k: 0.9, rx: -9.6, ry: -47.2, rz: 1.8 },
    },
    // En celular la tarjeta no se va a la derecha: se queda arriba y los textos salen debajo.
    celular: {
      centro: { x: 0.5, y: 0.36, ancho: 0.62, alto: 0.42, rx: 0, ry: -40, rz: 0 },
      lado: { x: 0.5, y: 0.34, k: 0.9, rx: -9.6, ry: -47.2, rz: 1.8 },
    },
  };
  // La perspectiva mide 3.75 veces el ancho de la tarjeta encogida (también medido).
  const PROFUNDIDAD = 3.75;
  // La bisagra: grados entre la pantalla y el teclado. Arriba, a todo lo ancho, el teclado está doblado
  // hacia atrás, de canto detrás de la pantalla (no se ve); mientras la tarjeta se encoge baja y se abre.
  // Al final se cierra: la pantalla baja sobre el teclado.
  const BISAGRA = { doblada: 270, abierta: 110, cerrada: 0 };

  // Tramos del recorrido: 0 es arriba de la escena y 1 el final.
  const TRAMOS = {
    encoger: [0.025, 0.25],
    eslogan: [0.025, 0.13],
    noche: [0.06, 0.25],
    irseAlLado: [0.48, 0.72],
  };
  // Cuándo se cierra la laptop, en pantallas de scroll contadas desde que la hoja de la sección 3 asoma por
  // abajo (0; en 1 ya llegó arriba): empieza casi una pantalla antes, al terminar de irse al lado,
  // y queda cerrada un cuarto de pantalla antes de que asome la hoja.
  const CIERRE = [-0.95, -0.25];
  // El bloque lateral también sale; reutiliza el mismo desvanecimiento que el texto central.
  const TEXTOS = {
    centro: [0.25, 0.48],
    lado: [0.62, 0.80],
  };

  // Cada palabra de los párrafos que se encienden y de los títulos que se pintan va en su propio <span>
  // (ver .se-enciende y .se-pinta en style.css), con su lugar en --i.
  const partirEnPalabras = (elemento) => {
    const palabras = elemento.textContent.trim().split(/\s+/);
    elemento.replaceChildren();
    palabras.forEach((palabra, i) => {
      const span = document.createElement('span');
      span.textContent = palabra;
      span.style.setProperty('--i', i);
      elemento.append(span, i < palabras.length - 1 ? ' ' : '');
    });
    return palabras.length;
  };
  // El texto entero sabe cuántas palabras tiene su párrafo, para que sus botones salgan después de la última.
  for (const p of escena.querySelectorAll('.se-enciende')) {
    p.parentElement.style.setProperty('--n', partirEnPalabras(p));
  }
  for (const titulo of escena.querySelectorAll('.se-pinta')) partirEnPalabras(titulo);

  // La introducción se ejecuta una vez; no interfiere al abrir un enlace interno.
  const introInicio = performance.now();
  let introTerminada = sinMovimiento.matches || scrollY > 8 || Boolean(location.hash);
  if (!introTerminada) {
    const titulo = portada.querySelector('h1');
    let indice = 0;
    for (const nodo of [...titulo.childNodes]) {
      if (nodo.nodeType !== Node.TEXT_NODE) continue;
      const fragmento = document.createDocumentFragment();
      for (const parte of nodo.textContent.split(/(\s+)/)) {
        if (!parte) continue;
        if (/^\s+$/.test(parte)) fragmento.append(parte);
        else {
          const palabra = document.createElement('span');
          palabra.textContent = parte;
          palabra.style.setProperty('--i', indice++);
          fragmento.append(palabra);
        }
      }
      nodo.replaceWith(fragmento);
    }
    partirEnPalabras(portada.querySelector('.portada-resumen'));
    document.documentElement.classList.add('intro-activa');
  }

  const limitar = (v) => Math.min(1, Math.max(0, v));
  const tramo = (p, [desde, hasta]) => limitar((p - desde) / (hasta - desde));
  const adentro = (p, [desde, hasta]) => p >= desde && p < hasta;
  const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  // Más pareja que suave(): a medio camino va a la mitad de su prisa
  const delicada = (t) => (1 - Math.cos(Math.PI * t)) / 2;
  const mezclar = (a, b, t) => {
    const r = {};
    for (const clave in a) r[clave] = a[clave] + (b[clave] - a[clave]) * t;
    return r;
  };

  // Cerrada, la laptop pausa sus videos para que no se sigan reproduciendo ni bajando; al abrirse, siguen.
  let videosPausados = true;
  function pausarVideos(pausar) {
    videosPausados = pausar;
    for (const v of videos) {
      if (pausar) v.pause();
      else v.play().catch((error) => {
        // Si se vuelve a cerrar antes de que arranque, play() se cancela: eso no es una falla.
        if (error.name !== 'AbortError') console.warn('No se pudo reanudar el video', v.currentSrc, error);
      });
    }
  }

  let pendiente = false;

  function pintar() {
    pendiente = false;
    const anchoPantalla = fija.clientWidth; // sin la barra de desplazamiento
    const altoPantalla = innerHeight;
    // La última pantalla de la escena no cuenta: en ella la hoja de la sección 3 sube encima (hoja.js).
    const recorrido = escena.offsetHeight - fija.offsetHeight * 2;
    const bajado = -escena.getBoundingClientRect().top;
    const p = recorrido > 0 ? limitar(bajado / recorrido) : 0;
    const introTiempo = performance.now() - introInicio;
    if (!introTerminada && (introTiempo >= 1900 || p > .025 || sinMovimiento.matches)) {
      introTerminada = true;
      document.documentElement.classList.remove('intro-activa');
    }
    const abrirIntro = introTerminada ? 1 : suave(limitar((introTiempo - 200) / 1500));
    // Cuánto ha subido la hoja, en pantallas (antes de que asome es negativo; 1 = llegó arriba).
    const subida = (bajado - recorrido) / fija.offsetHeight;

    // La tarjeta: del hueco a todo lo ancho, a la pose del centro y de ahí a la del lado.
    // Se mide la laptop, que es del tamaño de la pantalla (el teclado cuelga de su orilla de abajo).
    const poses = celular.matches ? POSES.celular : POSES.escritorio;
    const ancho = laptop.offsetWidth;
    const alto = laptop.offsetHeight;
    const x0 = laptop.offsetLeft + ancho / 2;
    const y0 = laptop.offsetTop + alto / 2;
    const k = Math.min(poses.centro.ancho * anchoPantalla / ancho, poses.centro.alto * altoPantalla / alto);
    const giro = sinMovimiento.matches ? 0 : 1;
    const hueco = celular.matches
      ? { x: anchoPantalla * .57, y: altoPantalla * .60, k, rx: poses.centro.rx * giro, ry: poses.centro.ry * giro, rz: poses.centro.rz * giro }
      : { x: anchoPantalla * .72, y: altoPantalla * .43, k, rx: poses.centro.rx * giro, ry: poses.centro.ry * giro, rz: poses.centro.rz * giro };
    const enCentro = {
      x: poses.centro.x * anchoPantalla, y: poses.centro.y * altoPantalla, k,
      rx: poses.centro.rx * giro, ry: poses.centro.ry * giro, rz: poses.centro.rz * giro,
    };
    const alLado = {
      x: poses.lado.x * anchoPantalla, y: poses.lado.y * altoPantalla, k: k * poses.lado.k,
      rx: poses.lado.rx * giro, ry: poses.lado.ry * giro, rz: poses.lado.rz * giro,
    };
    const encogida = suave(tramo(p, TRAMOS.encoger));
    const pose = mezclar(mezclar(hueco, enCentro, encogida), alLado, suave(tramo(p, TRAMOS.irseAlLado)));

    // Mientras se encoge, a la pantalla le sale el marco y el teclado se desdobla hasta quedar abierto.
    // Al subir la hoja se cierra: la pantalla gira sobre su orilla de abajo (la bisagra) hacia el teclado,
    // y el teclado gira lo mismo al revés para quedarse quieto.
    laptop.style.setProperty('--marco', 1);
    const desdoblada = BISAGRA.abierta;
    const cierre = delicada(tramo(subida, CIERRE));
    const apertura = (desdoblada + (BISAGRA.cerrada - BISAGRA.abierta) * cierre) * abrirIntro;
    teclado.style.transform = `rotateX(${180 - apertura}deg)`;

    // scale3d y no scale: scale() no encoge lo hondo, y el teclado saldría al frente el doble de lo que mide.
    laptop.style.transform =
      `translate(${pose.x - x0}px, ${pose.y - y0}px) perspective(${PROFUNDIDAD * k * ancho}px) ` +
      `rotateX(${pose.rx}deg) rotateY(${pose.ry}deg) rotateZ(${pose.rz}deg) ` +
      `scale3d(${pose.k}, ${pose.k}, ${pose.k}) ` +
      `translateY(${alto / 2}px) rotateX(${apertura - desdoblada}deg) translateY(${-alto / 2}px)`;
    laptop.style.setProperty('--k', pose.k);

    const pausar = cierre >= 1;
    if (pausar !== videosPausados) pausarVideos(pausar);

    // El eslogan se va.
    const quedaEslogan = 1 - tramo(p, TRAMOS.eslogan);
    portada.style.opacity = quedaEslogan;
    portada.style.transform = `translateY(${-24 * (1 - quedaEslogan)}px)`;
    portada.inert = quedaEslogan < .1;
    portada.style.visibility = quedaEslogan === 0 ? 'hidden' : 'visible';

    // El panel aparece sobre el video azul mientras el fondo pasa a negro.
    const oscuro = delicada(tramo(p, TRAMOS.noche));
    noche.style.opacity = oscuro;
    laptop.style.setProperty('--oscuro', oscuro); // enciende el piso de luz debajo de la laptop
    // La luz del fondo (style.css): de alto, un poco arriba de la bisagra de la pose del centro, y no se
    // mueve; de lado sigue a la laptop, al centro de su silueta (el teclado sale hacia la izquierda de la
    // pantalla, por eso se corre de pose.x).
    noche.style.setProperty('--luz-y', `${enCentro.y + alto * enCentro.k / 2 - altoPantalla * 0.07}px`);
    noche.style.setProperty('--luz-x', `${pose.x - ancho * pose.k * 0.2}px`);
    if (videoNoche) videoNoche.style.opacity = 1;
    if (panelSistema) panelSistema.style.opacity = oscuro;
    document.documentElement.toggleAttribute('data-noche', oscuro >= 0.5);

    // Los textos: aquí solo se decide si están dentro; la animación la hace style.css. El del centro
    // se va cuando la tarjeta empieza a moverse, y el de la izquierda entra cuando ya va llegando.
    centro.toggleAttribute('data-dentro', adentro(p, TEXTOS.centro));
    lado.toggleAttribute('data-dentro', adentro(p, TEXTOS.lado));

    // Mientras dura la entrada (va con el reloj, no con el scroll), sigue en el siguiente cuadro.
    if (!introTerminada) pedirCuadro();
  }

  function pedirCuadro() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(pintar);
  }

  addEventListener('scroll', pedirCuadro, { passive: true });
  addEventListener('resize', pedirCuadro);
  celular.addEventListener('change', pedirCuadro);
  sinMovimiento.addEventListener('change', pedirCuadro);
  pintar();
  // Ya acomodada la laptop, se muestra (style.css la esconde hasta aquí).
  document.documentElement.setAttribute('data-escena', '');
})();
