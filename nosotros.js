// nosotros.js — la página Nosotros de Fragmentless (nosotros.html).
// La primera vez que asoman al bajar (ya no se vuelven a ir), los textos como los del index (.ns-texto-escena) entran
// igual que allá, el cuadro de la estrella (.ns-crece) crece hasta su tamaño y las tarjetas de «Hacia dónde vamos»
// (.ns-tarjetas) entran una tras otra.
// La clase .ns-animada en <html> es la que los esconde (o achica) al principio: sin este script, todo se ve desde el
// inicio.
(() => {
  const bloques = [...document.querySelectorAll('.ns-texto-escena, .ns-crece, .ns-tarjetas')];
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
// su lugar en --i. Son los de la portada, los de las secciones del logo y de «Hacia dónde vamos» (.ns-texto-escena)
// y los de sus tarjetas (.ns-tarjeta; sus títulos, en lugar del brillo azul, pasan del gris al blanco letra por
// letra). Los títulos con .ns-sin-brillo («La historia detrás de nuestro logo.», «Nuestro concepto.», que va en su
// lugar en celular, y el eslogan de abajo de las tarjetas) no se parten: él les quitó el brillo; solo suben, como
// los demás.
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
  for (const titulo of document.querySelectorAll('.ns-portada h1, .ns-texto-escena h2:not(.ns-sin-brillo), .ns-tarjeta h3')) partirEnLetras(titulo);
  for (const parrafo of document.querySelectorAll('.ns-hero-texto p, .ns-texto-escena p:not(.ns-eslogan), .ns-tarjeta p')) partirEnPalabras(parrafo);
})();

// La barra se vuelve negra (con letra, logo y botones en blanco, como en la parte negra del index) mientras va encima
// de la sección negra («Hacia dónde vamos»): cuando la sección cubre la línea de en medio de la fila de la barra.
// data-barra-negra en <html>; los estilos, en style.css. En PC y en celular.
(() => {
  const negra = document.querySelector('.ns-vision');
  const fila = document.querySelector('.barra-fila');
  if (!negra || !fila) return;
  let cuadro = 0;
  const revisar = () => {
    cuadro = 0;
    const mitad = fila.offsetHeight / 2;
    const { top, bottom } = negra.getBoundingClientRect();
    document.documentElement.toggleAttribute('data-barra-negra', top <= mitad && bottom >= mitad);
  };
  const pedir = () => {
    if (!cuadro) cuadro = requestAnimationFrame(revisar);
  };
  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir);
  revisar();
})();
