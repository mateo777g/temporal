// cielo.js — el fondo de la estrella de Nosotros: una nebulosa tenue en una franja diagonal y un campo de estrellas
// que titilan, en WebGL. Es el fondo del «Earth Blaze» de 21st.dev, sin el planeta, sin el brillo del sol en su
// orilla, sin la aurora y sin lo que se movía con el mouse: sus sombreadores tal cual, con solo lo del cielo, y sus
// mismos números (1800 estrellas con la misma semilla, la nebulosa de 1536 × 1024, como mucho 30 cuadros por segundo).
// La nebulosa se dibuja una sola vez en una textura; cada cuadro solo la copia y dibuja las estrellas encima.
// Sin WebGL se queda el fondo negro de la página.
(() => {
  const lienzo = document.querySelector('.cielo');
  if (!lienzo) return;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = lienzo.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;

  const VERTICES = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0., 1.); }
  `;

  // El cielo: la nebulosa ya dibujada, con un tramado de menos de un tono para que no salgan escalones en lo oscuro.
  // El original la estira a todo el lienzo, pensado para uno ancho (16:10); en un celular a lo alto salía estirada
  // hacia arriba, en vetas. Aquí tapa el lienzo sin deformarse (con sus proporciones de 1536 × 1024) y se recorta lo
  // que sobra.
  const FONDO = `
    precision highp float;
    uniform vec2 resolution;
    uniform sampler2D cosmos;
    float grain(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(.06711056, .00583715)))); }
    void main() {
      const float textura = 1536. / 1024.;
      float lienzo = resolution.x / resolution.y;
      vec2 skyUV = gl_FragCoord.xy / resolution;
      skyUV = .5 + (skyUV - .5) * (lienzo > textura ? vec2(1., textura / lienzo) : vec2(lienzo / textura, 1.));
      vec3 color = texture2D(cosmos, skyUV).rgb;
      float light = max(color.r, max(color.g, color.b));
      color += (grain(gl_FragCoord.xy) - .5) / 255. * smoothstep(.001, .015, light);
      gl_FragColor = vec4(clamp(color, 0., 1.), 1.);
    }
  `;

  // La nebulosa, tal cual: polvo en una franja diagonal, de azul a morado y verde, con vetas oscuras
  const NEBULOSA = `
    precision highp float;
    uniform vec2 resolution;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float f = 0., a = .5;
      for (int i = 0; i < 6; i++) { f += a * noise(p); p = mat2(.8, -.6, .6, .8) * p * 2.07 + 17.3; a *= .5; }
      return f;
    }
    void main() {
      vec2 uv = vec2(gl_FragCoord.x / resolution.x, 1. - gl_FragCoord.y / resolution.y);
      vec2 p = uv * vec2(2.1, 1.);
      vec2 warp = vec2(fbm(p * 3.1), fbm(p * 3.1 + 9.7));
      float gas = fbm(p * 7. + warp * 4.);
      float lace = fbm(p * 23. + warp * 7.);
      float rift = abs(uv.y - (.58 - uv.x * .65 + .065 * sin(uv.x * 7.)) + (gas - .5) * .19);
      float band = exp(-pow(rift / .15, 2.));
      float dust = smoothstep(.28, .68, fbm(p * 11. + warp * 5. + 30.));
      float clouds = pow(gas, 2.3) * (.28 + lace * 1.1) * band;
      vec3 cold = mix(vec3(.018, .13, .26), vec3(.28, .045, .16), smoothstep(.14, .80, warp.x));
      cold = mix(cold, vec3(.022, .22, .18), smoothstep(.47, .66, warp.y) * .65);
      vec3 col = cold * clouds * (1. - dust * .82) * 2.4;
      col += vec3(.08, .10, .15) * pow(lace, 4.) * band * .50;
      col += vec3(.005, .007, .014) * pow(fbm(p * 4. + 80.), 2.);
      float speck = pow(hash(gl_FragCoord.xy), 34.) * band * .029;
      col += vec3(.7, .8, 1.) * speck;
      gl_FragColor = vec4(col, 1.);
    }
  `;

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
  const fondo = programa(VERTICES, FONDO);
  const nebulosa = programa(VERTICES, NEBULOSA);
  const estrellas = programa(ESTRELLAS_VERTICES, ESTRELLAS);
  if (!fondo || !nebulosa || !estrellas) return;

  // Un triángulo que tapa todo el lienzo (y le sobra por fuera)
  const triangulo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangulo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  function tapar(p) {
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangulo);
    const lugar = gl.getAttribLocation(p, 'position');
    gl.enableVertexAttribArray(lugar);
    gl.vertexAttribPointer(lugar, 2, gl.FLOAT, false, 0, 0);
  }

  // La nebulosa, una sola vez, en una textura de 1536 × 1024
  const textura = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textura);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1536, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const cuadroNebulosa = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, cuadroNebulosa);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textura, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return;
  tapar(nebulosa);
  gl.viewport(0, 0, 1536, 1024);
  gl.uniform2f(gl.getUniformLocation(nebulosa, 'resolution'), 1536, 1024);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(cuadroNebulosa);

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

  const uFondo = { resolucion: gl.getUniformLocation(fondo, 'resolution'), cosmos: gl.getUniformLocation(fondo, 'cosmos') };
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
    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(lugarEstrella);
    tapar(fondo);
    gl.uniform2f(uFondo.resolucion, lienzo.width, lienzo.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textura);
    gl.uniform1i(uFondo.cosmos, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

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
