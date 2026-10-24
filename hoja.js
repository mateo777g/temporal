// hoja.js — la sección 3 de la página de Fragmentless (index.html).
// Una hoja blanca sube encima de la escena ya quieta, como entraban los planes en la página vieja
// (github.com/mateo777g/fragmentless-software): arranca al 90 % con las esquinas redondas, crece hasta
// llenar la pantalla y lo de adentro aparece a medio camino. Sigue con el scroll sin detenerse.
// Lo mueve el scroll, no el reloj: cada cuadro se calcula de dónde va la hoja.
(() => {
  const hoja = document.querySelector('.hoja');
  const filaBarra = document.querySelector('.barra-fila');
  const franja = document.querySelector('.franja');

  const limitar = (v) => Math.min(1, Math.max(0, v));

  // Dónde empieza la hoja en la página, sin contar su transform (offsetTop no lo ve).
  function arriba(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  let pendiente = false;

  function pintar() {
    pendiente = false;
    const altoPantalla = innerHeight;

    // 0 = su borde de arriba toca el de abajo de la pantalla; 1 = llegó hasta arriba.
    const subida = limitar((scrollY + altoPantalla - arriba(hoja)) / altoPantalla);
    hoja.style.setProperty('--subida', subida);
    hoja.style.setProperty('--aparecer', limitar((subida - 0.25) / 0.5));

    // Solo cambia el tema de la barra; su visibilidad depende de la dirección del scroll.
    const caja = hoja.getBoundingClientRect();
    const cajaFranja = franja.getBoundingClientRect();
    hoja.toggleAttribute('data-textos', subida >= .75 && cajaFranja.top > altoPantalla * .2);
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
