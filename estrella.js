// estrella.js — la estrella naciendo de Nosotros, en 3D y en vivo con WebGL (como el azul de la pantalla de la
// laptop, pantalla.js). No es una foto: es un volumen de gas y polvo que se recorre rayo por rayo. Tiene lo que tiene
// una estrella que nace, como HH 30: la estrella al centro, un disco de polvo que la tapa visto de canto (el corte
// oscuro), la luz que escapa por arriba y por abajo del disco, un chorro delgado que sale de un polo y nubes sueltas
// alrededor. Se ve siempre en la pose de la foto, como la laptop del index: cada lado del corte se arma con su propia
// vista (ver main), así que no se puede rodear.
// Desde fuera se maneja con el propio lienzo: lienzo.dataset.paleta ('logo' o 'foto').
(() => {
  const lienzo = document.querySelector('.estrella-3d');
  // Escondida (en celular, en Nosotros, donde va en imagen) ni arranca: en vivo iba trabadísima
  if (!lienzo || !lienzo.getClientRects().length) return;
  const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)');
  const gl = lienzo.getContext('webgl', {
    alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance',
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
uniform vec2 u_tamano;   // píxeles del lienzo
uniform float u_tiempo;  // segundos
uniform mat3 u_giro;     // de la cámara a la estrella
uniform vec3 u_camara;   // dónde está la cámara, contada desde la estrella
uniform mat3 u_giroAbajo;   // los mismos dos, de la cámara del lado de la hoja de abajo (ver main)
uniform vec3 u_camaraAbajo;
uniform vec3 u_color[11]; // la paleta (ver PALETAS abajo)

// La estrella: su eje (por donde sale el chorro) es y, y el disco está en el plano xz.
const float FOCO = 1.6;    // con la cámara a 3.4, cabe un poco más de 1 hacia cada lado
const float RADIO = 1.15;  // todo lo de la estrella cabe en esta esfera; fuera de ella no se calcula nada
const int PASOS = 64;      // muestras por rayo
// Las dos hojas de luz, «) (» de canto: su altura sobre el disco es SEPARACION + curva × r². SEPARACION es el hueco
// entre ellas y el corte (con 0.04 y 0.028 se veía grande). La de arriba se abre un poco más, como en HH 30.
const float SEPARACION = 0.016;
const float CURVA_ARRIBA = 1.15;
const float CURVA_ABAJO = 0.9;
// El chorro corto de abajo: qué tan largo y qué tan fuerte (ver chorro). Con 0.22 se perdía entre las tiras de la hoja
// de abajo, y con 0.55 ya se veía marcado.
const float CHORRO_ABAJO_LARGO = 0.38;
const float CHORRO_ABAJO_FUERZA = 0.42;
// Qué tan ancha es la junta entre las dos vistas, en el corte, y cuánto se aparta cada una de él (ver main)
const float JUNTA = 0.012;
const float APARTE = 0.012;
// El velo que le quita el azul a la hoja de abajo (ver abajo): plano como el disco y corrido hacia ese lado
const float VELO_BAJO = 0.12;
const float VELO_ANCHO = 0.3;
const float VELO_ALTO = 0.1;

// Tres números al azar, de -1 a 1, para cada esquina de una cuadrícula en 3D (el de pantalla.js)
vec3 azar3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0;
}

// Ruido de gradientes en 3D, más o menos de -0.7 a 0.7 (el de pantalla.js)
float ruido3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = dot(azar3(i), f);
  float b = dot(azar3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0));
  float c = dot(azar3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0));
  float d = dot(azar3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0));
  float e = dot(azar3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0));
  float g = dot(azar3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0));
  float h = dot(azar3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0));
  float k = dot(azar3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0));
  return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z);
}

// Tres capas de ruido, cada una del doble de detalle y la mitad de fuerza: el gas, que no es liso
float capas3(vec3 p) {
  float v = 0.0;
  float fuerza = 0.5;
  for (int i = 0; i < 3; i++) {
    v += fuerza * ruido3(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    fuerza *= 0.5;
  }
  return v;
}

// El humo de las hojas y de la nube: las ondas del «Waves» de 21st.dev (fintech-waves), tal cual: su ruido, su
// paleta de cuatro colores (negro, azul, cian y gris azulado) y su forma, con sus números (intensidad 0.55, escala
// 1.5, reloj al 0.86). q va de 0 a 1 a lo largo (x) y a lo ancho (y) de la hoja o la nube. Se usa solo su luz, no su
// color (humo, abajo): con su color las hojas se veían turquesa.
float hashOndas(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float ruidoOndas(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hashOndas(i), hashOndas(i + vec2(1.0, 0.0)), u.x),
    mix(hashOndas(i + vec2(0.0, 1.0)), hashOndas(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbmOndas(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * ruidoOndas(p);
    p = p * 2.03 + vec2(17.0, 9.2);
    a *= 0.5;
  }
  return v;
}
vec3 paletaOndas(float x) {
  float f = clamp(x, 0.0, 1.0) * 3.0;
  vec3 c = mix(vec3(0.0), vec3(0.1216, 0.3176, 1.0), smoothstep(0.0, 1.0, clamp(f, 0.0, 1.0)));
  c = mix(c, vec3(0.0, 0.898, 1.0), smoothstep(0.0, 1.0, clamp(f - 1.0, 0.0, 1.0)));
  return mix(c, vec3(0.4275, 0.4784, 0.6078), smoothstep(0.0, 1.0, clamp(f - 2.0, 0.0, 1.0)));
}
vec3 ondas(vec2 q, float tiempo) {
  vec2 p = (q - 0.5) * 1.5;
  float y = q.y + sin(q.x * (3.0 + 0.55 * 9.0) + tiempo * 0.8) * 0.08
    + (fbmOndas(p * 2.0 + tiempo * 0.1) - 0.5) * 0.55 * 0.6;
  return paletaOndas(y);
}
// Qué tan clara está la onda, de 0 (en lo negro) a 1 (en el cian)
float humo(vec2 q, float tiempo) {
  return dot(ondas(q, tiempo), vec3(0.299, 0.587, 0.114)) / 0.64;
}

// Un número al azar por píxel, para no empezar todos los rayos en el mismo lugar (si no, salen rayas)
float azarPixel(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}

// El tramo del rayo dentro de la esfera de la estrella (vacío si x >= y)
vec2 tramo(vec3 ro, vec3 rd) {
  float b = dot(ro, rd);
  float choque = b * b - dot(ro, ro) + RADIO * RADIO;
  if (choque <= 0.0) return vec2(0.0);
  float s = sqrt(choque);
  return vec2(max(-b - s, 0.0), -b + s);
}

// El chorro y la estrella son demasiado delgados para las muestras del rayo: se suman aparte, con la cuenta exacta de
// cuánta luz cruza el rayo, y se tapan con lo que haya entre ellos y la cámara. Dónde pasa el rayo más cerca del eje
// (x en el rayo, y en el eje; z, qué tan de lado lo cruza) y de la estrella (w, en el rayo).
vec4 ejes(vec3 ro, vec3 rd) {
  float de = dot(rd, ro);
  float sen2 = max(1.0 - rd.y * rd.y, 0.06);
  return vec4((rd.y * ro.y - de) / sen2, (ro.y - rd.y * de) / sen2, sen2, -de);
}

// El gas de la estrella, en su tramo del rayo: la luz que manda hacia la cámara, y cuánta deja pasar hasta el chorro y
// hasta la estrella (pasoChorro y pasoCentro).
vec3 gas(vec3 ro, vec3 rd, vec2 segmento, float paso, float t, vec4 e, out float pasoChorro, out float pasoCentro) {
  vec3 color = vec3(0.0);
  float tChorro = e.x;
  float tCentro = e.w;
  pasoChorro = 1.0;
  pasoCentro = 1.0;
  float transparencia = 1.0;
  float r0 = segmento.x + paso * azarPixel(gl_FragCoord.xy);
  for (int i = 0; i < PASOS; i++) {
    float tr = r0 + paso * float(i);
    if (tr > segmento.y) break;
    vec3 p = ro + rd * tr;
    float r = length(p.xz);
    float h = p.y;
    float ah = abs(h);
    float d2 = dot(p, p);
    float dist = sqrt(d2);
    // Qué tan lejos del eje, en ángulo: 0 sobre el eje y 1.57 en el plano del disco
    float angulo = atan(r, ah);
    // La luz de la estrella baja con la distancia al cuadrado; lejos ya casi no ilumina nada, así que el disco
    // no se recorta contra un resplandor de fondo
    float luz = 1.0 / (d2 * 4.0 + 0.03);
    // Cuánta de esa luz sale hacia la cámara: el polvo la manda casi toda hacia adelante
    float frente = dot(p / max(dist, 1e-3), -rd);
    float fase = 0.3 + 1.4 * pow(0.5 + 0.5 * frente, 3.0);
    // El gas se mueve despacio, hacia afuera
    float n = capas3(p * 3.2 + vec3(0.02 * t, -0.05 * t, 0.03 * t));

    // El disco: delgado en el centro y más grueso hacia la orilla, con un hueco chico alrededor de la estrella.
    // Es polvo: tapa todo lo de atrás. Su grueso es el del hueco entre las dos hojas de luz, porque tapa la parte
    // de ellas que queda dentro; más grueso, el hueco se veía grande.
    float grueso = 0.009 + 0.045 * pow(r, 1.3);
    float zona = smoothstep(0.36, 0.2, r + 0.06 * n) * smoothstep(0.02, 0.05, r);
    float disco = exp(-0.5 * h * h / (grueso * grueso)) * zona;
    // Su superficie, de los dos lados, donde todavía le llega la luz: dos hojas de luz azul pegadas al corte. Se
    // abren hacia la orilla, así que de canto se ven curvas, «) (»: el centro pegado al corte y las puntas hacia
    // afuera, como en HH 30 (subiendo con el grueso del disco casi no se abrían y se veían planas). Delgadas, para
    // que el arco se lea limpio.
    float desvio = ah - SEPARACION - (h > 0.0 ? CURVA_ARRIBA : CURVA_ABAJO) * r * r;
    // De un lado del eje al otro: para que las dos mitades de cada hoja no salgan iguales
    float lado = p.x / max(r, 1e-3);
    // Tiras: las dos hojas, la luz de dentro y el gas se rompen en tiras que salen del centro como rayos, de anchos al
    // azar (dos tamaños de ruido alrededor del eje), por imperfección. Él las vio en la hoja de abajo cuando se podía
    // inclinar la estrella con el mouse y las pidió en las dos. En la de abajo van más finas y más marcadas (oscuras
    // entre una y otra), como en su captura; parejas con las de arriba casi no se notaban. Nada en el centro, y lejos
    // ya no hay nada que rayar.
    float tiras = 1.0;
    if (r < 0.45) {
      vec3 pt = vec3(p.xz / max(r, 1e-3) * (h > 0.0 ? 10.0 : 15.0), r * 1.5 + (h > 0.0 ? 0.0 : 21.0) + 0.02 * t);
      float tira = smoothstep(-0.25, 0.35, ruido3(pt) + 0.6 * ruido3(pt * vec3(2.6, 2.6, 1.0) + 7.7));
      tiras = mix(1.0, h > 0.0 ? 0.25 + 1.3 * tira : 2.4 * tira, smoothstep(0.05, 0.18, r));
    }
    // Su orilla ondula: la hoja sube y baja un poco a lo largo, para que el arco no salga perfecto (nada en el
    // centro)
    if (abs(desvio) < 0.12) {
      desvio += 0.05 * smoothstep(0.05, 0.2, r)
        * capas3(vec3(r * 3.0, h > 0.0 ? 4.0 : 9.0, lado * 1.7) + vec3(-0.05 * t, 0.0, 0.02 * t));
    }
    float capa = exp(-pow(desvio / 0.032, 2.0)) * smoothstep(0.45, 0.22, r);
    if (capa > 0.01) {
      // El humo de las ondas del «Waves» (arriba): corre a lo largo de la hoja, de una punta a la otra, y le da más
      // luz donde la onda está clara y menos donde está oscura. Cada hoja con el suyo, y nada en el centro.
      float humoCapa = humo(vec2(0.5 + p.x / 0.9 + (h > 0.0 ? 0.0 : 1.3), 0.5 + desvio / 0.128), t * 0.86);
      capa *= mix(1.0, 0.3 + 1.1 * humoCapa, smoothstep(0.08, 0.22, r));
      // Con los mismos hilos de la nube (abajo), igual de marcados, estirados a lo largo de la hoja: lisa, o con
      // los hilos suaves, se veía demasiado perfecta. No cambian a lo hondo (el rayo cruza la hoja por delante y
      // por detrás, y si no, se promediaban hasta no verse). Nada en el centro, para que el blanco quede limpio.
      float hiloCapa = 1.0 - abs(capas3(vec3(r * 2.2, desvio * 5.0 + (h > 0.0 ? 0.0 : 13.0), lado * 1.7)
        + vec3(-0.06 * t, 0.0, 0.03 * t))) * 3.0;
      capa *= mix(1.0, 0.12 + 1.6 * pow(max(hiloCapa, 0.0), 3.0), smoothstep(0.06, 0.2, r)) * tiras;
    }
    // Por dentro de cada hoja, entre ella y el disco, una luz suave que se apaga hacia el corte: de canto llena el
    // hueco de la «(» y la hace ver como la orilla de un tazón, con volumen, como en HH 30 (con la hoja sola se veía
    // plana). En la de abajo, al doble: vista desde abajo queda oscura por dentro y sus tiras no se notaban.
    float dentro = (h > 0.0 ? 1.0 : 2.0) * exp(-pow(desvio / (desvio < 0.0 ? 0.08 : 0.025), 2.0))
      * smoothstep(0.4, 0.15, r) * smoothstep(1.2, 2.4, ah / grueso) * tiras;
    // El gas encima y debajo del disco, que baja con la altura y con la distancia
    float halo = exp(-ah / 0.2 - r / 0.22) * smoothstep(1.2, 2.4, ah / grueso) * max(0.0, 0.7 + 1.1 * n) * tiras;
    // Las paredes de los dos huecos que abre el chorro, uno arriba y otro abajo: desde la estrella se ven como una X
    float pared = exp(-pow((angulo - 0.6) / 0.18, 2.0)) * exp(-dist * 3.0) * smoothstep(0.03, 0.12, ah)
      * max(0.0, 0.5 + 1.6 * n);

    // La nube: filamentos (donde el ruido pasa por cero) que son la hoja de abajo alargada más allá de su punta,
    // por donde se ve arriba a la izquierda: sigue la misma curva «)» y se va doblando hacia la izquierda, como en
    // HH 30. Se probó suelta (no encajaba) y en línea recta ensanchándose al final (se veía chueca).
    // La curva es la de la hoja, y = -(SEPARACION + CURVA_ABAJO x²) en el plano z = 0, del lado de x negativo. Su
    // punto más cercano sale con dos pasos de Newton desde la x del punto.
    float u = -p.x;
    for (int k = 0; k < 2; k++) {
      vec3 tk = vec3(-1.0, -2.0 * CURVA_ABAJO * u, 0.0);
      u += dot(p - vec3(-u, -SEPARACION - CURVA_ABAJO * u * u, 0.0), tk) / dot(tk, tk);
    }
    vec3 q = p - vec3(-u, -SEPARACION - CURVA_ABAJO * u * u, 0.0);
    // Del mismo grueso de punta a punta, apenas más delgada al final
    float grosorNube = mix(0.07, 0.05, smoothstep(0.3, 0.85, u));
    float grumos = 1.0;
    // Jirones: ya lejos de la punta de la hoja, el humo se tuerce y se rompe, con la orilla irregular, más gruesa y
    // más delgada a tramos y con grumos más claros, como en HH 30 (lisa se veía como una pincelada). El ruido que
    // la tuerce va estirado a lo largo de la curva, así que salen hebras largas; parejo en todas direcciones, se
    // enchinaba en bolitas.
    float jiron = smoothstep(0.28, 0.55, u);
    if (jiron > 0.0 && dot(q, q) < 0.05) {
      vec3 normal0 = normalize(vec3(2.0 * CURVA_ABAJO * u, -1.0, 0.0));
      vec3 pj = vec3(u * 4.0, dot(q, normal0) * 8.0, q.z * 8.0) + vec3(-0.08 * t, 0.0, 0.03 * t);
      vec2 tuerce = vec2(ruido3(pj), ruido3(pj + vec3(5.2, 1.3, 2.8)));
      pj = pj * 2.3 + vec3(3.1, 7.7, 1.9);
      tuerce += 0.5 * vec2(ruido3(pj), ruido3(pj + vec3(5.2, 1.3, 2.8)));
      q += jiron * 0.2 * (normal0 * tuerce.x + vec3(0.0, 0.0, tuerce.y));
      grosorNube *= 1.0 + 0.6 * jiron * ruido3(vec3(u * 6.0, 2.5, 0.01 * t));
      grumos = mix(1.0, 0.25 + 1.5 * smoothstep(-0.35, 0.35, ruido3(vec3(u * 5.0, 7.3, 0.02 * t))), jiron);
    }
    // Empieza donde todavía se ve la punta de la hoja, para que no quede hueco
    float cuerpo = exp(-(q.x * q.x + q.y * q.y + 0.49 * q.z * q.z) / (grosorNube * grosorNube))
      * smoothstep(0.22, 0.32, u) * smoothstep(0.9, 0.6, u) * grumos;
    float nube = 0.0;
    if (cuerpo > 0.01) {
      // El ruido, estirado a lo largo de la curva: hilos largos y no manchas
      vec3 normal = normalize(vec3(2.0 * CURVA_ABAJO * u, -1.0, 0.0));
      vec3 pn = vec3(u * 2.2, dot(q, normal) * 5.0, q.z * 5.0);
      float hilo = 1.0 - abs(capas3(pn + vec3(-0.06 * t, 0.0, 0.03 * t))) * 3.0;
      nube = cuerpo * pow(max(hilo, 0.0), 3.0);
      // Y el mismo humo de las hojas, a lo largo de su curva
      nube *= 0.3 + 1.1 * humo(vec2((u - 0.25) / 0.65 + 2.6, 0.5 + dot(q, normal) / (grosorNube * 4.0)), t * 0.86);
    }

    // Blanco en el centro, que poco a poco se hace cian y luego el azul de las puntas. Antes el cian iba encima del
    // blanco, en el centro mismo (todo cian, las hojas se veían turquesa), y no se veía el paso de un color a otro.
    vec3 cian = vec3(0.0, 0.85, 1.0);
    vec3 tono = h > 0.0
      ? mix(mix(u_color[0], cian, smoothstep(0.02, 0.1, dist)), u_color[1], smoothstep(0.1, 0.24, dist))
      : mix(mix(u_color[2], cian, smoothstep(0.02, 0.1, dist)), u_color[3], smoothstep(0.1, 0.24, dist));
    // Las dos hojas de luz son largas, como en HH 30: su luz baja más despacio que la del gas alrededor. En el centro
    // no tan fuerte: con más luz se lavaba a blanco en casi toda la hoja y no se veían sus colores.
    float luzCapa = 1.0 / (r * 1.5 + 0.3);
    vec3 emite = (tono * capa * 5.0 + tono * (dentro * 1.2 + halo * 1.5)) * luzCapa * fase + tono * pared * luz * fase
      + u_color[6] * nube * 12.0;
    color += transparencia * emite * paso;

    if (tr < tChorro) pasoChorro = transparencia;
    if (tr < tCentro) pasoCentro = transparencia;
    transparencia *= exp(-(45.0 * disco + 0.8 * (halo + nube)) * paso);
    if (transparencia < 0.01) break;
  }
  if (tChorro > segmento.y) pasoChorro = transparencia;
  if (tCentro > segmento.y) pasoCentro = transparencia;
  return color;
}

// El chorro: un tubo de luz en el eje, más largo de un lado, con nudos que salen de la estrella y lo hacen
// desvanecerse a tramos. El de arriba es más ancho en la base y se afila hacia la punta, como una aguja (ensanchándose
// parecía un bate); el corto de abajo se ensancha hacia afuera y es tenue, una mancha más que una línea, como en HH 30
// (más largo y fuerte se veía muy marcado). e son los ejes del rayo (ver ejes).
vec3 chorro(vec3 ro, vec3 rd, vec4 e, float t) {
  float a = abs(e.y);
  bool arriba = e.y > 0.0;
  float largo = arriba ? 1.1 : CHORRO_ABAJO_LARGO;
  float ancho = arriba ? mix(0.055, 0.008, pow(min(a / largo, 1.0), 0.8)) : 0.03 + 0.045 * a;
  float cerca = length(ro + rd * e.x - vec3(0.0, e.y, 0.0));
  float nudos = 0.55 + 0.6 * ruido3(vec3(a * 9.0 - 0.5 * t, arriba ? 0.0 : 7.0, 0.3 * t));
  // En el de arriba, lo que se angosta no se apaga del todo: si no, la punta desaparecía antes de afilarse
  float columna = arriba ? sqrt(ancho * 0.055) : ancho;
  // La orilla del de arriba, difusa: un núcleo y un velo más ancho y tenue alrededor. Con el núcleo solo, y más
  // fuerte, se veía sólido, con la orilla marcada.
  float nucleo = exp(-cerca * cerca / (ancho * ancho));
  float perfil = arriba ? 0.7 * nucleo + 0.3 * exp(-cerca * cerca / (4.0 * ancho * ancho)) : nucleo;
  float brillo = smoothstep(0.03, 0.12, a) * smoothstep(largo, (arriba ? 0.6 : 0.45) * largo, a) * max(nudos, 0.0)
    * perfil * columna * 1.77 / sqrt(e.z) * (arriba ? 0.6 : CHORRO_ABAJO_FUERZA);
  // De la base a la punta: lila junto a la hoja, rojo en medio y azul violeta en la punta, como en HH 30 (de rojo a
  // morado nada más, le faltaba lo azul)
  float k = a / largo;
  vec3 tono = mix(u_color[10], u_color[4], smoothstep(0.12, 0.3, k));
  tono = mix(tono, u_color[5], smoothstep(0.5, 0.8, k));
  return tono * brillo * 40.0;
}

// La estrella vista desde ro hacia rd: el gas, los chorros, la estrella, el velo y el resplandor (la luz sumada, antes
// de pasarla a color)
vec3 vista(vec3 ro, vec3 rd, float t) {
  vec2 segmento = tramo(ro, rd);
  if (segmento.y <= segmento.x) return vec3(0.0);
  float paso = (segmento.y - segmento.x) / float(PASOS);
  vec4 e = ejes(ro, rd);
  float pasoChorro, pasoCentro;
  vec3 color = gas(ro, rd, segmento, paso, t, e, pasoChorro, pasoCentro);
  color += pasoChorro * chorro(ro, rd, e, t);

  // La estrella: solo se ve si nada la tapa (de canto, el disco la tapa toda). Su brillo se apaga rápido: si se abre
  // mucho, deja un velo gris en todo el cuadro.
  float centro = length(ro + rd * e.w);
  color += pasoCentro * u_color[7] * 0.002 / (centro * centro + 0.0004) * exp(-centro * centro * 60.0);

  // Del lado de la hoja de abajo, un velo de polvo encima que se come primero el azul, como el cielo al atardecer: ahí
  // la hoja se ve crema y naranja, como en HH 30, y la de arriba queda azul. Es un elipsoide plano como el disco,
  // corrido hacia ese lado por el eje, y se cuenta exacto cuánto de él cruza el rayo. Corriendo el resplandor hacia
  // abajo no bastaba: las hojas brillan tanto que su luz encima solo las aclaraba.
  vec3 escala = vec3(1.0 / VELO_ANCHO, 1.0 / VELO_ALTO, 1.0 / VELO_ANCHO);
  vec3 mv = (ro + vec3(0.0, VELO_BAJO, 0.0)) * escala;
  vec3 dv = rd * escala;
  float dd = dot(dv, dv);
  float dm = dot(dv, mv);
  float velo = exp(-(dot(mv, mv) - dm * dm / dd)) / (sqrt(dd) * VELO_ANCHO);
  color *= exp(-velo * u_color[9]);

  // Un resplandor tibio y difuso encima de toda la estrella, también del centro y del corte. Es el mismo que estaba
  // dentro del gas, pero allá el disco lo tapaba y dejaba las orillas del corte oscuras.
  return color + u_color[8] * exp(-centro * centro / 0.09) * 1.3;
}

void main() {
  // El lado corto del lienzo mide 1
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_tamano) / min(u_tamano.x, u_tamano.y);

  // Cada lado del corte se ve desde su lado del disco, como dos fotos juntas: el de la hoja de arriba desde u_camara,
  // un poco encima del disco, y el de la hoja de abajo desde u_camaraAbajo, más abajo (ver VISTA_ABAJO). Así las dos
  // hojas se ven por dentro y su centro sale redondo, como en HH 30: con una sola cámara, la hoja del otro lado se ve
  // de canto, plana. Se juntan en la línea del corte (por el centro, de través al eje), donde todo es oscuro; solo ahí
  // se dibujan las dos, así que cuesta casi lo mismo que una. Por eso la estrella ya no se puede rodear.
  // Cada vista se aparta un poco del corte (APARTE), para que las dos hojas no se toquen en el centro: así el corte
  // queda oscuro de punta a punta. Más apartadas salían líneas raras en medio, y engrosar el disco casi no las separaba.
  // Deja unos piquitos de luz en el centro (la orilla cercana de cada hoja cruza la línea del corte y se asoma en la
  // junta); cubrirlos con el dorado del corte le quitaba al centro sus puntos claros y las hojas perdían forma.
  vec2 eje = normalize((vec3(0.0, 1.0, 0.0) * u_giro).xy);
  float deArriba = smoothstep(-JUNTA, JUNTA, dot(uv, eje));
  vec3 color = vec3(0.0);
  if (deArriba > 0.0) {
    color += deArriba * vista(u_camara, u_giro * normalize(vec3(uv - eje * APARTE, -FOCO)), u_tiempo);
  }
  if (deArriba < 1.0) {
    color += (1.0 - deArriba) * vista(u_camaraAbajo, u_giroAbajo * normalize(vec3(uv + eje * APARTE, -FOCO)), u_tiempo);
  }

  // De la luz sumada al color: lo muy brillante se vuelve blanco y lo tenue conserva su color, como en una foto
  color = 1.0 - exp(-color);
  gl_FragColor = vec4(color, 1.0);
}`;

  // Los colores, en el orden de u_color: la luz de arriba del disco (cerca y lejos de la estrella), la de abajo
  // (cerca y lejos), el chorro (en medio y en su punta), las nubes, la estrella, el resplandor de encima, cuánto se
  // come el velo de abajo de cada color (rojo, verde y azul) y el chorro en su base, junto a la hoja. Ya no lleva
  // destello en medio del corte: se probó y se quitó.
  const PALETAS = {
    // Los azules del logo (#0A2470, #1355E8, #4FA3FF, #9FE6FF), con el centro blanco
    logo: [
      [0.85, 0.95, 1.0], [0.16, 0.45, 1.0],
      [0.9, 0.97, 1.0], [0.25, 0.55, 1.0],
      [0.62, 0.9, 1.0], [0.12, 0.35, 0.95],
      [0.07, 0.25, 0.9],
      [1.0, 1.0, 1.0],
      [0.04, 0.14, 0.44],
      [0.0, 0.0, 0.0],
      [0.85, 0.95, 1.0],
    ],
    // Los de la foto de HH 30: las dos hojas de luz iguales, blancas en el centro y del mismo azul hacia las puntas
    // (en cian, la de arriba se veía turquesa), el chorro rojo con la punta azul violeta, las nubes azules, un
    // resplandor amarillo dorado encima de todo (en naranja se veía naranjoso), el velo de abajo, que se come el azul
    // y la mitad de eso del verde, y el chorro lila en su base
    foto: [
      [0.8, 0.92, 1.0], [0.08, 0.38, 1.0],
      [0.8, 0.92, 1.0], [0.08, 0.38, 1.0],
      [1.0, 0.06, 0.12], [0.5, 0.2, 1.0],
      [0.05, 0.35, 1.0],
      [1.0, 0.97, 0.9],
      [1.0, 0.62, 0.22],
      [0.0, 1.0, 2.0],
      [0.9, 0.55, 1.0],
    ],
  };

  function compilar(tipo, codigo) {
    const sombreador = gl.createShader(tipo);
    gl.shaderSource(sombreador, codigo);
    gl.compileShader(sombreador);
    if (!gl.getShaderParameter(sombreador, gl.COMPILE_STATUS)) {
      console.warn('estrella.js: no compiló el sombreador', gl.getShaderInfoLog(sombreador));
    }
    return sombreador;
  }
  const programa = gl.createProgram();
  gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTICES));
  gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENTOS));
  gl.linkProgram(programa);
  if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) return;
  gl.useProgram(programa);

  // Un triángulo que tapa todo el lienzo (y le sobra por fuera)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const lugar = gl.getAttribLocation(programa, 'a_lugar');
  gl.enableVertexAttribArray(lugar);
  gl.vertexAttribPointer(lugar, 2, gl.FLOAT, false, 0, 0);
  const uTamano = gl.getUniformLocation(programa, 'u_tamano');
  const uTiempo = gl.getUniformLocation(programa, 'u_tiempo');
  const uGiro = gl.getUniformLocation(programa, 'u_giro');
  const uCamara = gl.getUniformLocation(programa, 'u_camara');
  const uGiroAbajo = gl.getUniformLocation(programa, 'u_giroAbajo');
  const uCamaraAbajo = gl.getUniformLocation(programa, 'u_camaraAbajo');
  const uColor = gl.getUniformLocation(programa, 'u_color');

  // La pose de la foto: el eje inclinado 50° a la derecha (el chorro apunta arriba a la derecha, como la punta del
  // logo) y la cámara apenas encima del plano del disco, del lado del chorro: así se ve un poco dentro de la hoja de
  // arriba y su centro sale redondo, como en HH 30. Con la cámara apenas debajo (-0.07) ese centro se veía plano.
  // El lado de la hoja de abajo se ve desde VISTA_ABAJO más abajo (ver main en el sombreador): así esa hoja también
  // sale redonda y se ve un poco por dentro, con sus rayitas, como se veía bajando la estrella con el mouse cuando
  // todavía se podía rodear (con -0.25 se veía menos de adentro).
  const GIRO_PANTALLA = -50 * Math.PI / 180;
  const INCLINACION = 0.08;
  const VISTA_ABAJO = -0.4;
  const DISTANCIA = 3.4;

  // Matrices de 3 × 3 en filas
  const multiplicar = (a, b) => a.map((fila) => [0, 1, 2].map((j) => fila[0] * b[0][j] + fila[1] * b[1][j] + fila[2] * b[2][j]));
  const giroX = (a) => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]];
  const giroZ = (a) => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]];

  // De cada cámara a la estrella: se deshacen, en orden, el giro en la pantalla y la inclinación. Son fijas, así que
  // se ponen una vez.
  for (const [uGiroCamara, uLugar, inclinacion] of [[uGiro, uCamara, INCLINACION], [uGiroAbajo, uCamaraAbajo, INCLINACION + VISTA_ABAJO]]) {
    const m = multiplicar(giroX(-inclinacion), giroZ(-GIRO_PANTALLA));
    gl.uniformMatrix3fv(uGiroCamara, false, [m[0][0], m[1][0], m[2][0], m[0][1], m[1][1], m[2][1], m[0][2], m[1][2], m[2][2]]);
    gl.uniform3f(uLugar, m[0][2] * DISTANCIA, m[1][2] * DISTANCIA, m[2][2] * DISTANCIA);
  }

  let paleta = '';
  function ponerPaleta() {
    const nombre = PALETAS[lienzo.dataset.paleta] ? lienzo.dataset.paleta : 'logo';
    if (nombre === paleta) return;
    paleta = nombre;
    gl.uniform3fv(uColor, PALETAS[nombre].flat());
  }

  // Es difusa, así que no hace falta dibujarla a todos los píxeles: como mucho 720 del lado largo. Cada píxel
  // recorre su rayo entero, y a todos los de una pantalla grande la tarjeta de video no alcanzaría.
  function medir() {
    const ancho = lienzo.clientWidth;
    const alto = lienzo.clientHeight;
    if (!ancho || !alto) return;
    const escala = Math.min(720 / Math.max(ancho, alto), devicePixelRatio || 1);
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);
    gl.viewport(0, 0, lienzo.width, lienzo.height);
    gl.uniform2f(uTamano, lienzo.width, lienzo.height);
  }

  // Sin movimiento, el gas se queda quieto en este momento (se ve bien) y se dibuja una sola vez, y de nuevo si cambia
  // de tamaño o de paleta. Fuera de la pantalla no dibuja.
  const QUIETO = 20;
  const inicio = performance.now();
  let visible = true;
  let cuadro = 0;
  function dibujar(ahora) {
    cuadro = 0;
    if (!visible) return;
    const quieto = sinMovimiento.matches;
    ponerPaleta();
    gl.uniform1f(uTiempo, quieto ? QUIETO : QUIETO + (ahora - inicio) / 1000);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!quieto) pedir();
  }
  function pedir() {
    if (!cuadro) cuadro = requestAnimationFrame(dibujar);
  }

  medir();
  dibujar(performance.now());
  new ResizeObserver(() => { medir(); pedir(); }).observe(lienzo);
  new IntersectionObserver(([entrada]) => { visible = entrada.isIntersecting; pedir(); }).observe(lienzo);
  new MutationObserver(pedir).observe(lienzo, { attributes: true, attributeFilter: ['data-paleta'] });
  sinMovimiento.addEventListener('change', pedir);
})();
