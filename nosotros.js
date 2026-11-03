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

// El titular de la portada, letra por letra, para el brillo azul que le pasa en cuanto termina de subir, y su
// párrafo, palabra por palabra, para que se enciendan una tras otra como en la portada del index (nosotros.css).
// La entrada del logo en vidrio que también iba aquí está guardada en guardado/intro-logo-vidrio/.
(() => {
  const titular = document.querySelector('.ns-portada h1');
  if (!titular) return;
  let letra = 0;
  titular.replaceChildren(...[...titular.textContent].map((caracter) => {
    if (caracter === ' ') return ' ';
    const span = document.createElement('span');
    span.className = 'brilla';
    span.style.setProperty('--i', letra++);
    span.textContent = caracter;
    return span;
  }));

  const parrafo = document.querySelector('.ns-hero-texto p');
  const palabras = parrafo.textContent.trim().split(/\s+/);
  parrafo.replaceChildren();
  palabras.forEach((palabra, i) => {
    const span = document.createElement('span');
    span.textContent = palabra;
    span.style.setProperty('--i', i);
    parrafo.append(span, i < palabras.length - 1 ? ' ' : '');
  });
})();
