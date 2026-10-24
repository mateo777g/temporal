// barra.js — la barra de la página de Fragmentless (index.html).
// Al pasar el mouse o tocar un atajo, la barra crece y muestra su menú. Al bajar se esconde.
(() => {
  const barra = document.querySelector('.barra');
  const nav = barra.querySelector('.atajos');
  const atajos = [...barra.querySelectorAll('.atajo')];
  const velo = document.querySelector('.velo');
  const conMouse = matchMedia('(hover: hover)');

  // El brillo recorre cada enlace de izquierda a derecha, también si tiene una sola palabra.
  for (const enlace of barra.querySelectorAll('.submenu a')) {
    const texto = enlace.textContent.trim();
    const brillo = document.createElement('span');
    brillo.className = 'submenu-brillo';
    brillo.setAttribute('aria-hidden', 'true');
    [...texto].forEach((letra, i) => {
      if (letra === ' ') { brillo.append(' '); return; }
      const span = document.createElement('span');
      span.textContent = letra;
      span.style.setProperty('--i', i);
      brillo.append(span);
    });
    enlace.setAttribute('aria-label', texto);
    enlace.replaceChildren(brillo);
    const encender = () => {
      enlace.classList.remove('brillando');
      // Reinicia el barrido al volver a entrar, aunque el anterior no haya terminado.
      void enlace.offsetWidth;
      enlace.classList.add('brillando');
    };
    enlace.addEventListener('pointerenter', () => { if (conMouse.matches) encender(); });
    enlace.addEventListener('focus', encender);
    enlace.addEventListener('pointerleave', () => enlace.classList.remove('brillando'));
    enlace.addEventListener('blur', () => enlace.classList.remove('brillando'));
    brillo.addEventListener('animationend', (e) => {
      if (e.target === brillo.lastElementChild) enlace.classList.remove('brillando');
    });
  }

  // Los submenús empiezan donde empiezan los atajos.
  function alinear() {
    barra.style.setProperty('--inicio-atajos', nav.getBoundingClientRect().left + 'px');
  }

  // Abierta con el dedo o el teclado, la página no se mueve: ni con el dedo, ni con la rueda (salvo Ctrl + rueda,
  // que es el zoom), ni con las teclas de bajar. No se le quita el scroll a la página para que su barra de scroll
  // no desaparezca y nada brinque de lado. Abierta con el mouse no se frena nada: basta pasar el cursor por los
  // atajos para abrirla, y la página no debe atorarse; si se baja con ella abierta, se cierra.
  const TECLAS_SCROLL = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown']);
  let frenada = false;

  function frenar(e) {
    if (!e.ctrlKey) e.preventDefault();
  }

  function frenarTeclas(e) {
    if (!TECLAS_SCROLL.has(e.key)) return;
    if (e.key === ' ' && e.target.closest('button')) return; // con la barra de espacio se pica el botón
    e.preventDefault();
  }

  function bloquearScroll(bloquear) {
    frenada = bloquear;
    if (bloquear) {
      addEventListener('wheel', frenar, { passive: false });
      addEventListener('touchmove', frenar, { passive: false });
      addEventListener('keydown', frenarTeclas);
    } else {
      removeEventListener('wheel', frenar);
      removeEventListener('touchmove', frenar);
      removeEventListener('keydown', frenarTeclas);
    }
  }

  function abrir(atajo, frenar) {
    for (const a of atajos) {
      const activo = a === atajo;
      a.setAttribute('aria-expanded', String(activo));
      document.getElementById(a.getAttribute('aria-controls')).hidden = !activo;
    }
    alinear();
    barra.dataset.abierto = '';
    bloquearScroll(frenar);
  }

  function cerrar() {
    delete barra.dataset.abierto;
    for (const a of atajos) a.setAttribute('aria-expanded', 'false');
    bloquearScroll(false);
  }

  for (const a of atajos) {
    a.addEventListener('mouseenter', () => { if (conMouse.matches) abrir(a, false); });
    a.addEventListener('click', (e) => {
      // Con mouse el clic solo abre; con dedo o teclado abre y cierra.
      const conClic = conMouse.matches && e.detail > 0;
      const yaAbierto = a.getAttribute('aria-expanded') === 'true';
      if (yaAbierto && !conClic) cerrar();
      else abrir(a, !conClic);
    });
  }

  barra.addEventListener('mouseleave', () => { if (conMouse.matches) cerrar(); });
  barra.addEventListener('focusout', (e) => { if (!barra.contains(e.relatedTarget)) cerrar(); });
  velo.addEventListener('click', cerrar);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !('abierto' in barra.dataset)) return;
    const activo = atajos.find((a) => a.getAttribute('aria-expanded') === 'true');
    cerrar();
    if (activo) activo.focus();
  });
  addEventListener('resize', alinear);

  // Al bajar, la barra se esconde hacia arriba; al subir, regresa. Abierta o con el foco
  // del teclado adentro, se queda. Los saltitos de menos de 4 px no cuentan.
  let ultimaY = scrollY;
  addEventListener('scroll', () => {
    if ('abierto' in barra.dataset && !frenada) cerrar();
    const y = scrollY;
    if (Math.abs(y - ultimaY) < 4) return;
    const bajando = y > ultimaY;
    ultimaY = y;
    if (bajando && y > barra.offsetHeight && !('abierto' in barra.dataset) && !barra.contains(document.activeElement)) {
      barra.dataset.escondida = '';
    } else if (!bajando) {
      delete barra.dataset.escondida;
    }
  }, { passive: true });
  barra.addEventListener('focusin', () => { delete barra.dataset.escondida; });
})();
