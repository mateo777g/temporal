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
