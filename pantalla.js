// pantalla.js — el fondo azul de la pantalla de la laptop (index.html), dibujado en vivo con WebGL.
// Son manchas azul marino que se deforman en su lugar, con líneas que brillan en azul claro, como agua con
// luz. Sale de un ruido suave deformado por otro ruido (domain warping); el tiempo cambia las deformaciones,
// así que las formas se transforman casi donde están, como en el video que había antes.
// Sin WebGL, el lienzo deja ver su fondo de CSS, una imagen fija del mismo azul.
(() => {
  const lienzo = document.querySelector('.pantalla-azul');
  if (!lienzo) return;
  const panel = document.querySelector('.video .panel-sistema');
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = lienzo.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power',
  });
  if (!gl) return;

  const VERTICES = `
attribute vec2 a_lugar;
void main() { gl_Position = vec4(a_lugar, 0.0, 1.0); }`;

  const FRAGMENTOS = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_tamano;  // píxeles del lienzo
uniform float u_tiempo; // segundos

// Dos números al azar, de 0 a 1, para cada esquina de la cuadrícula del ruido. Sin sin(), que en algunas
// tarjetas pierde precisión y deja rayas.
vec2 azar(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

// Ruido de gradientes: ondas suaves, más o menos de -0.7 a 0.7
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(azar(i) * 2.0 - 1.0, f);
  float b = dot(azar(i + vec2(1.0, 0.0)) * 2.0 - 1.0, f - vec2(1.0, 0.0));
  float c = dot(azar(i + vec2(0.0, 1.0)) * 2.0 - 1.0, f - vec2(0.0, 1.0));
  float d = dot(azar(i + vec2(1.0, 1.0)) * 2.0 - 1.0, f - vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Tres capas de ruido, cada una del doble de detalle y menos de un tercio de fuerza, giradas para que no se
// alineen. Con más capas, o más fuertes, las orillas salían picadas y el video es liso.
float capas(vec2 p) {
  const mat2 giro = mat2(0.8, 0.6, -0.6, 0.8);
  float v = 0.0;
  float fuerza = 0.5;
  for (int i = 0; i < 3; i++) {
    v += fuerza * ruido(p);
    p = giro * p * 2.0 + vec2(3.1, 1.7);
    fuerza *= 0.3;
  }
  return v;
}

// Los azules del video, de lo más oscuro (0) a lo más claro (1)
vec3 paleta(float x) {
  vec3 c = mix(vec3(0.043, 0.075, 0.263), vec3(0.055, 0.141, 0.424), smoothstep(0.0, 0.25, x));
  c = mix(c, vec3(0.055, 0.212, 0.604), smoothstep(0.25, 0.5, x));
  c = mix(c, vec3(0.090, 0.388, 0.863), smoothstep(0.5, 0.7, x));
  c = mix(c, vec3(0.275, 0.631, 0.965), smoothstep(0.7, 0.85, x));
  c = mix(c, vec3(0.514, 0.784, 0.988), smoothstep(0.85, 1.0, x));
  return c;
}

void main() {
  // El lado corto del lienzo mide 2: caben unas tres manchas de alto, como en el video
  vec2 p = (gl_FragCoord.xy - 0.5 * u_tamano) / u_tamano.y * 2.0;
  // Dos tercios de la velocidad del video (0.45, medida cuadro contra cuadro): igual que el video se veía rápido
  float t = u_tiempo * 0.3;
  // Las manchas: un ruido deformado por otro, que se mueve con el tiempo
  vec2 q = vec2(capas(p + vec2(0.0, t)), capas(p + vec2(5.2, 1.3) - vec2(t, 0.0)));
  float n = capas(p + q + vec2(0.3 * t, -0.2 * t));
  // Qué tanto brillan las líneas aquí: unas fuertes y otras apenas, como en el video
  float fuerza = smoothstep(-0.3, 0.35, ruido(p * 0.55 + vec2(7.1 - 0.4 * t, 3.3 + 0.3 * t)));
  // Una luz amplia y suave aparte de las líneas, que aclara algunas zonas
  float charco = smoothstep(-0.15, 0.45, capas(p * 0.7 + 1.5 * q + vec2(3.3, 7.7) + 0.5 * t));

  // Las líneas que brillan van donde el ruido pasa por cero: una fina y su halo, más claros que los dos
  // lados. Lo de abajo de cero es lo oscuro de las manchas, y lo de arriba, el azul medio.
  float d = abs(n);
  float linea = 0.6 * exp(-d * 22.0) + 0.3 * exp(-d * 5.0);
  float brillo = 0.5 * smoothstep(-0.25, 0.35, n) + 0.45 * charco + linea * (0.3 + 0.7 * fuerza);
  gl_FragColor = vec4(paleta(clamp(brillo, 0.0, 1.0)), 1.0);
}`;

  function compilar(tipo, codigo) {
    const sombreador = gl.createShader(tipo);
    gl.shaderSource(sombreador, codigo);
    gl.compileShader(sombreador);
    if (!gl.getShaderParameter(sombreador, gl.COMPILE_STATUS)) {
      console.warn('pantalla.js: no compiló el sombreador', gl.getShaderInfoLog(sombreador));
    }
    return sombreador;
  }
  const programa = gl.createProgram();
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICES));
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTOS));
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return; // se queda la imagen fija de CSS
  gl.useProgram(programa);

  // Un triángulo que tapa todo el lienzo (y le sobra por fuera): es más simple que dos
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const lugar = gl.getAttribLocation(programa, 'a_lugar');
  gl.enableVertexAttribArray(lugar);
  gl.vertexAttribPointer(lugar, 2, gl.FLOAT, false, 0, 0);
  const uTamano = gl.getUniformLocation(programa, 'u_tamano');
  const uTiempo = gl.getUniformLocation(programa, 'u_tiempo');

  // Como mucho 1280 de ancho, lo mismo que medía el video: el azul es difuso, así que no se nota, y la
  // tarjeta de video trabaja mucho menos que a todos los píxeles de la pantalla.
  function medir() {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    if (!ancho || !alto) return;
    const escala = Math.min(1280 / ancho, devicePixelRatio || 1);
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.uniform2f(uTamano, lienzo.width, lienzo.height);
  }

  // Sin movimiento, un solo cuadro quieto (este momento se ve bien), que se vuelve a dibujar solo si cambia
  // el tamaño.
  const QUIETO = 40;
  const inicio = performance.now();
  let cuadro = 0;
  function dibujar(ahora) {
    cuadro = 0;
    const quieto = sinMovimiento.matches;
    // Mientras la tapa la captura del panel (toda la parte negra, y la laptop cerrada) no dibuja, que es lo
    // que cuesta, pero sigue revisando cada cuadro para volver en cuanto se destape. Esperar al scroll no
    // servía: este cuadro corre antes que el de escena.js, que es el que destapa.
    const tapado = panel && panel.style.opacity === '1';
    if (!tapado || quieto) {
      gl.uniform1f(uTiempo, quieto ? QUIETO : QUIETO + (ahora - inicio) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    if (!quieto) pedir();
  }
  function pedir() {
    if (!cuadro) cuadro = requestAnimationFrame(dibujar);
  }

  medir();
  dibujar(performance.now()); // el primero de inmediato, para que no se vea el lienzo vacío
  new ResizeObserver(() => { medir(); pedir(); }).observe(lienzo);
  sinMovimiento.addEventListener('change', pedir);
})();
