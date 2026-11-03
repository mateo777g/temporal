// nosotros.js — la página Nosotros de Fragmentless (nosotros.html).
// Cada bloque con .aparece entra (sube y aparece) la primera vez que asoma al bajar; ya no se vuelve a ir. Los
// textos como los del index (.ns-texto-escena) entran igual que allá, también la primera vez que asoman.
// La clase .ns-animada en <html> es la que los esconde al principio: sin este script, todo se ve desde el inicio.
(() => {
  const bloques = [...document.querySelectorAll('.aparece, .ns-texto-escena')];
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

// Los títulos, letra por letra, para el brillo azul que les pasa en cuanto terminan de subir, y sus párrafos,
// palabra por palabra, para que se enciendan una tras otra como en el index (nosotros.css): cada una en su span, con
// su lugar en --i. Son los de la portada y los de la sección del logo (.ns-texto-escena).
// La entrada del logo en vidrio que también iba aquí está guardada en guardado/intro-logo-vidrio/.
(() => {
  const partirEnLetras = (elemento) => {
    let letra = 0;
    elemento.replaceChildren(...[...elemento.textContent].map((caracter) => {
      if (caracter === ' ') return ' ';
      const span = document.createElement('span');
      span.className = 'brilla';
      span.style.setProperty('--i', letra++);
      span.textContent = caracter;
      return span;
    }));
  };
  const partirEnPalabras = (elemento) => {
    const palabras = elemento.textContent.trim().split(/\s+/);
    elemento.replaceChildren();
    palabras.forEach((palabra, i) => {
      const span = document.createElement('span');
      span.textContent = palabra;
      span.style.setProperty('--i', i);
      elemento.append(span, i < palabras.length - 1 ? ' ' : '');
    });
  };
  for (const titulo of document.querySelectorAll('.ns-portada h1, .ns-texto-escena h2')) partirEnLetras(titulo);
  for (const parrafo of document.querySelectorAll('.ns-hero-texto p, .ns-texto-escena p')) partirEnPalabras(parrafo);
})();
