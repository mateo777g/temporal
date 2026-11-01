// nosotros.js — la página Nosotros de Fragmentless (nosotros.html).
// Cada bloque con .aparece entra (sube y aparece) la primera vez que asoma al bajar; ya no se vuelve a ir.
// La clase .ns-animada en <html> es la que los esconde al principio: sin este script, todo se ve desde el inicio.
(() => {
  const bloques = [...document.querySelectorAll('.aparece')];
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.documentElement.classList.add('ns-animada');
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      entrada.target.setAttribute('data-visto', '');
      observador.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -10% 0px' });
  for (const bloque of bloques) observador.observe(bloque);
})();

// La estrella (la sección negra del nombre y el logo): mientras su escena cruza la pantalla se queda fija, y el
// scroll elige cuál de sus cuatro pasos se cuenta. Aquí solo se pone el paso (data-paso en la escena, data-activo
// en su texto y data-hecho en sus marcas); lo que cambia con él está en nosotros.css. Sin el script, la sección se
// ve como lista, con la foto.
(() => {
  const escena = document.querySelector('.ns-estrella-escena');
  if (!escena) return;
  const fija = escena.querySelector('.ns-estrella-fija');
  const pasos = [...escena.querySelectorAll('.ns-estrella-pasos > li')];
  const marcas = [...escena.querySelectorAll('.ns-estrella-marcas > span')];
  document.documentElement.classList.add('ns-estrella-viva');

  let actual = -1;
  const medir = () => {
    // Cuánto lleva recorrido la escena fija, de 0 (acaba de llegar arriba) a 1 (está por irse)
    const recorrido = escena.offsetHeight - fija.offsetHeight;
    const avance = Math.min(1, Math.max(0, -escena.getBoundingClientRect().top / recorrido));
    const paso = Math.min(pasos.length - 1, Math.floor(avance * pasos.length));
    if (paso === actual) return;
    actual = paso;
    escena.dataset.paso = paso;
    pasos.forEach((li, i) => li.toggleAttribute('data-activo', i === paso));
    marcas.forEach((marca, i) => marca.toggleAttribute('data-hecho', i <= paso));
  };
  addEventListener('scroll', medir, { passive: true });
  addEventListener('resize', medir);
  medir();
})();

// La entrada del logo (components/logo-vidrio.tsx): mide cuánto tiene que subir el logo, del centro de la pantalla
// al lugar que le aparta .ns-logo-lugar arriba del texto, y lo vuelve a medir si cambia el tamaño.
(() => {
  const logo = document.getElementById('logo-vidrio');
  const lugar = document.querySelector('.ns-logo-lugar');
  if (!logo || !lugar) return;
  const medir = () => {
    const sube = lugar.offsetTop + lugar.offsetHeight / 2 - (logo.offsetTop + logo.offsetHeight / 2);
    logo.style.setProperty('--sube', `${sube}px`);
  };
  medir();
  new ResizeObserver(medir).observe(lugar.parentElement);

  // El titular, letra por letra, para el brillo azul que le pasa al terminar la entrada (nosotros.css)
  const titular = lugar.parentElement.querySelector('h1');
  let letra = 0;
  titular.replaceChildren(...[...titular.textContent].map((caracter) => {
    if (caracter === ' ') return ' ';
    const span = document.createElement('span');
    span.className = 'brilla';
    span.style.setProperty('--i', letra++);
    span.textContent = caracter;
    return span;
  }));

  // Si el bundle no llega a montar el logo, la entrada nunca terminaría y la página se quedaría trabada en gris
  setTimeout(() => {
    const raiz = document.documentElement;
    if (raiz.dataset.intro === 'logo' && !logo.childElementCount) raiz.dataset.intro = 'sube';
  }, 5000);
})();
