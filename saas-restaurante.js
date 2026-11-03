// saas-restaurante.js — el anuncio de saas-restaurante.html. Arranca solo, sin sonido y en ciclo (los navegadores
// solo dejan arrancar solo un video sin sonido); el botón de la esquina le pone o le quita el sonido. Con «reducir
// movimiento» no arranca solo: se queda en su primer cuadro con los controles del navegador, para darle play a mano.
(() => {
  const anuncio = document.querySelector('.sr-anuncio');
  const sonido = document.querySelector('.sr-sonido');
  if (!anuncio || !sonido) return;

  const aMano = () => {
    anuncio.controls = true;
    sonido.hidden = true;
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    aMano();
    return;
  }
  // Si el navegador no lo deja arrancar (por ejemplo, el ahorro de batería del iPhone), que se pueda poner a mano
  anuncio.play().catch(aMano);

  sonido.addEventListener('click', () => {
    anuncio.muted = !anuncio.muted;
    sonido.setAttribute('aria-pressed', String(!anuncio.muted));
    if (anuncio.paused) anuncio.play().catch(aMano);
  });
})();
