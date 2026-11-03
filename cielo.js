// cielo.js — el fondo de la estrella de Nosotros: un campo de estrellas que titilan sobre negro, en WebGL. Son las
// estrellas del «Earth Blaze» de 21st.dev, su sombreador tal cual y sus mismos números (1800 con la misma semilla,
// como mucho 30 cuadros por segundo), sin el planeta, sin el brillo del sol, sin la aurora y sin lo que se movía con
// el mouse. Tampoco lleva su nebulosa (la franja de nubes de colores): ya sale en la Tierra de la portada y aquí se
// veía repetida (3 de noviembre). Sin WebGL se queda el fondo negro de la página.
(() => {
  const lienzo = document.querySelector('.cielo');
  if (!lienzo) return;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = lienzo.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;

  // Las estrellas, tal cual pero sin lo del planeta: puntos de colores fríos y tibios que titilan; unas pocas, más
  // grandes, con cuatro rayos
  const ESTRELLAS_VERTICES = `
    precision highp float;
    attribute vec4 star;
    uniform vec2 resolution;
    uniform float clock;
    varying vec3 tint;
    varying float alpha;
    varying float sharp;
    void main() {
      vec2 p = star.xy * vec2(resolution.x / resolution.y, 1.);
      gl_Position = vec4(p.x / (resolution.x / resolution.y) * 2. - 1., 1. - p.y * 2., 0., 1.);
      sharp = step(.988, star.w);
      gl_PointSize = mix(star.z, 20. + star.w * 8., sharp) * max(1., resolution.y / 900.);
      float twinkle = .82 + .18 * sin(clock * (.45 + star.w) + star.w * 123.);
      alpha = (.24 + star.w * .58 + sharp * .55) * twinkle;
      tint = mix(vec3(.49, .70, 1.), vec3(1., .69, .49), smoothstep(.32, .90, fract(star.w * 13.7)));
      tint = mix(tint, vec3(.93, .77, 1.), step(.87, fract(star.w * 7.)));
    }
  `;
  const ESTRELLAS = `
    precision highp float;
    varying vec3 tint;
    varying float alpha;
    varying float sharp;
    void main() {
      vec2 p = gl_PointCoord - .5;
      float r = length(p);
      float ordinary = exp(-r * r * 23.);
      float core = exp(-r * r * 2100.);
      float rays = exp(-abs(p.x) * 260. - abs(p.y) * 13.) + exp(-abs(p.y) * 260. - abs(p.x) * 13.);
      float jewel = core * 2. + rays * .65 + exp(-r * r * 55.) * .035;
      gl_FragColor = vec4(tint * mix(ordinary, jewel, sharp), alpha);
    }
  `;

  function compilar(tipo, codigo) {
    const sombreador = gl.createShader(tipo);
    gl.shaderSource(sombreador, codigo);
    gl.compileShader(sombreador);
    if (!gl.getShaderParameter(sombreador, gl.COMPILE_STATUS)) {
      console.warn('cielo.js: no compiló el sombreador', gl.getShaderInfoLog(sombreador));
    }
    return sombreador;
  }
  function programa(vertices, fragmentos) {
    const p = gl.createProgram();
    gl.attachShader(p, compilar(gl.VERTEX_SHADER, vertices));
    gl.attachShader(p, compilar(gl.FRAGMENT_SHADER, fragmentos));
    gl.linkProgram(p);
    return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
  }
  const estrellas = programa(ESTRELLAS_VERTICES, ESTRELLAS);
  if (!estrellas) return;

  // Las 1800 estrellas del original, con su misma semilla: lugar, tamaño y un número que decide color y brillo
  const CANTIDAD = 1800;
  let semilla = 428731;
  const azar = () => { semilla = (Math.imul(semilla, 1664525) + 1013904223) >>> 0; return semilla / 4294967296; };
  const datos = new Float32Array(CANTIDAD * 4);
  for (let i = 0; i < CANTIDAD; i++) {
    const x = azar(), y = azar(), tamano = 1 + Math.pow(azar(), 2.4) * 2.6, cual = azar();
    datos.set([x, y, tamano, cual], i * 4);
  }
  const puntos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, puntos);
  gl.bufferData(gl.ARRAY_BUFFER, datos, gl.STATIC_DRAW);
  const lugarEstrella = gl.getAttribLocation(estrellas, 'star');

  const uEstrellas = { resolucion: gl.getUniformLocation(estrellas, 'resolution'), reloj: gl.getUniformLocation(estrellas, 'clock') };

  // Como el original: como mucho el doble de los píxeles de la pantalla y unos 3 millones de píxeles en total
  function medir() {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    if (!ancho || !alto) return;
    const escala = Math.min(devicePixelRatio || 1, 2, Math.sqrt(3000000 / (ancho * alto)));
    lienzo.width = Math.max(1, Math.round(ancho * escala));
    lienzo.height = Math.max(1, Math.round(alto * escala));
  }

  // Las estrellas titilan con su reloj. Sin movimiento, un cuadro quieto que se vuelve a dibujar solo si cambia el
  // tamaño. Fuera de la pantalla no dibuja.
  let reloj = 0;
  let antes = 0;
  let visible = true;
  let cuadro = 0;
  function dibujar(ahora) {
    cuadro = 0;
    if (!visible || document.hidden) return;
    const quieto = sinMovimiento.matches;
    // Como el original, a unos 30 cuadros por segundo: titilar no necesita más
    if (!quieto && antes && ahora - antes < 32) { pedir(); return; }
    reloj += Math.min((ahora - (antes || ahora - 16)) / 1000, 0.05);
    antes = ahora;

    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(estrellas);
    gl.uniform2f(uEstrellas.resolucion, lienzo.width, lienzo.height);
    gl.uniform1f(uEstrellas.reloj, quieto ? 0 : reloj);
    gl.bindBuffer(gl.ARRAY_BUFFER, puntos);
    gl.enableVertexAttribArray(lugarEstrella);
    gl.vertexAttribPointer(lugarEstrella, 4, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.drawArrays(gl.POINTS, 0, CANTIDAD);
    gl.disable(gl.BLEND);

    if (!quieto) pedir();
  }
  function pedir() {
    if (!cuadro) cuadro = requestAnimationFrame(dibujar);
  }

  medir();
  new ResizeObserver(() => { medir(); antes = 0; pedir(); }).observe(lienzo);
  new IntersectionObserver(([entrada]) => { visible = entrada.isIntersecting; antes = 0; pedir(); }).observe(lienzo);
  document.addEventListener('visibilitychange', () => { antes = 0; pedir(); });
  sinMovimiento.addEventListener('change', () => { antes = 0; pedir(); });
  pedir();
})();
