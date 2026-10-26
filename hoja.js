// hoja.js — la sección 3 de la página de Fragmentless (index.html).
// Llega cuando la laptop de la escena, de frente, hizo zoom hasta que su pantalla en blanco llena todo
// (escena.js): en ese momento la sección toca el borde de arriba de la pantalla. No tiene fondo (style.css),
// así que no se ve llegar; aquí solo se marca que llegó (data-llego), para que entren la fila curva y los
// textos, y cuándo se van los textos porque se acercan las tarjetas (data-textos). Sigue con el scroll sin
// detenerse.
(() => {
  const hoja = document.querySelector('.hoja');
  const filaBarra = document.querySelector('.barra-fila');
  const franja = document.querySelector('.franja');

  let pendiente = false;

  function pintar() {
    pendiente = false;
    const altoPantalla = innerHeight;
    const caja = hoja.getBoundingClientRect();

    // Llegó con su borde de arriba en el de la pantalla (un pixel de margen por el redondeo del scroll);
    // para entonces la pantalla de la laptop ya cubre todo desde hace un rato.
    hoja.toggleAttribute('data-llego', caja.top <= 1);
    hoja.toggleAttribute('data-textos', franja.getBoundingClientRect().top > altoPantalla * .2);

    // Solo cambia el tema de la barra; su visibilidad depende de la dirección del scroll.
    const mitadBarra = filaBarra.offsetHeight / 2;
    document.documentElement.toggleAttribute('data-hoja', caja.top <= mitadBarra);
  }

  function pedirCuadro() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(pintar);
  }

  addEventListener('scroll', pedirCuadro, { passive: true });
  addEventListener('resize', pedirCuadro);
  pintar();
})();
