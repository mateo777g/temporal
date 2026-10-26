// El efecto «luma» de shader-reveal (de 21st.dev), en WebGL sin React ni framer-motion: listones de color que se
// jalan hacia arriba y abajo y pasan encima de algo mientras cambia. Del original solo se usa esta variante; el
// shader, los tiempos y las curvas son los suyos.

const DURACION = 1080;
const DESVANECER = 90;

const VERTICES = "attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }";
const FRAGMENTOS = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime;
uniform float uProgress;
uniform float uAlpha;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float progress = smoothstep(0.0, 1.0, uProgress);
  float lum = noise(uv * 5.0 + vec2(0.0, uTime * 0.22));
  float desplazada = uv.y + progress * (lum - 0.5) * 0.55;
  float listones = sin(desplazada * 58.0 + uTime * 1.25) * 0.5 + 0.5;
  float finos = sin(desplazada * 132.0 - uTime * 1.8) * 0.5 + 0.5;
  float ventana = smoothstep(0.03, 0.5, progress) * smoothstep(1.0, 0.72, progress);
  float mascara = (smoothstep(0.58, 0.92, listones) * 0.74 + smoothstep(0.76, 0.98, finos) * 0.22) * ventana;
  float brillo = smoothstep(0.84, 1.0, listones) * ventana;
  vec3 color = mix(vec3(1.0, 0.68, 0.22), vec3(1.0, 0.20, 0.62), lum);
  float salida = smoothstep(1.0, 0.76, uProgress);
  float entrada = smoothstep(0.0, 0.10, uProgress);
  float alfa = clamp((mascara * 0.76 + brillo * 0.24) * entrada * salida * uAlpha, 0.0, 0.92);
  gl_FragColor = vec4(color * alfa + vec3(1.0) * brillo * 0.16 * uAlpha, alfa);
}
`;

export interface Luma {
  dibujar: (progreso: number, alfa: number) => void;
  limpiar: () => void;
}

const compilar = (gl: WebGLRenderingContext, tipo: number, fuente: string) => {
  const shader = gl.createShader(tipo);
  if (!shader) return null;
  gl.shaderSource(shader, fuente);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
};

// Prepara el canvas. Devuelve null si no hay WebGL: entonces el cambio se hace sin efecto.
export function crearLuma(lienzo: HTMLCanvasElement): Luma | null {
  const gl = lienzo.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) return null;
  const vertices = compilar(gl, gl.VERTEX_SHADER, VERTICES);
  const fragmentos = compilar(gl, gl.FRAGMENT_SHADER, FRAGMENTOS);
  const programa = gl.createProgram();
  if (!(vertices && fragmentos && programa)) return null;
  gl.attachShader(programa, vertices);
  gl.attachShader(programa, fragmentos);
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return null;
  gl.useProgram(programa);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const a = gl.getAttribLocation(programa, "a");
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const uRes = gl.getUniformLocation(programa, "uRes");
  const uTime = gl.getUniformLocation(programa, "uTime");
  const uProgress = gl.getUniformLocation(programa, "uProgress");
  const uAlpha = gl.getUniformLocation(programa, "uAlpha");
  const inicio = performance.now();

  const limpiar = () => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  };

  return {
    // Mide el canvas en cada cuadro, así sigue bien aunque la tarjeta cambie de tamaño
    dibujar(progreso, alfa) {
      const caja = lienzo.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const ancho = Math.max(1, Math.round(caja.width * dpr));
      const alto = Math.max(1, Math.round(caja.height * dpr));
      if (lienzo.width !== ancho || lienzo.height !== alto) {
        lienzo.width = ancho;
        lienzo.height = alto;
      }
      gl.viewport(0, 0, ancho, alto);
      limpiar();
      gl.uniform2f(uRes, ancho, alto);
      gl.uniform1f(uTime, (performance.now() - inicio) / 1000);
      gl.uniform1f(uProgress, progreso);
      gl.uniform1f(uAlpha, alfa);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    limpiar,
  };
}

const salidaCuarta = (x: number) => 1 - (1 - x) ** 4;
const suaveCubica = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

// Una pasada del efecto, como en el original: avanza con salida cuártica, a la mitad llama a alMedio (lo de abajo
// cambia tapado por los listones) y al final el canvas se desvanece en 90 ms. Solo dibuja mientras dura.
// Devuelve con qué cancelarla.
export function destello(luma: Luma, alMedio: () => void): () => void {
  const inicio = performance.now();
  let cambio = false;
  let cuadro = 0;
  const paso = (ahora: number) => {
    const crudo = Math.min(1, Math.max(0, (ahora - inicio) / DURACION));
    const avance = salidaCuarta(crudo);
    if (!cambio && avance >= 0.5) {
      cambio = true;
      alMedio();
    }
    let alfa = 1;
    if (crudo >= 1) {
      const f = Math.min(1, (ahora - inicio - DURACION) / DESVANECER);
      alfa = 1 - suaveCubica(f);
      if (f >= 1) {
        luma.limpiar();
        return;
      }
    }
    luma.dibujar(avance, alfa);
    cuadro = requestAnimationFrame(paso);
  };
  cuadro = requestAnimationFrame(paso);
  return () => {
    cancelAnimationFrame(cuadro);
    luma.limpiar();
  };
}
