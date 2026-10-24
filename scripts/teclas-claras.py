# teclas-claras.py — saca las teclas claras de la laptop (prueba/teclado-claro.webp) de las negras
# (prueba/teclado.webp, generadas en Higgsfield). Así encajan exacto: misma forma, mismo hueco entre teclas.
#
# Cada pixel de las teclas se pinta según su luminancia: la orillita oscura de la tecla queda plateada
# sombreada (para que no pierdan el relieve), la superficie casi blanca y las letras gris oscuro. El alfa no
# cambia. Debajo se agrega la sombra de cada tecla, hecha con su propia forma: una pegada a la tecla y otra
# amplia y suave, cargadas hacia abajo (el frente de la laptop) como la sombra de la base.
# No se le pide la sombra al generador de imágenes: no da fondo transparente y una sombra sobre un color
# no se separa limpio.
#
# Uso: python scripts/teclas-claras.py   (necesita Pillow)
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = RAIZ / 'prueba' / 'teclado.webp'
SALIDA = RAIZ / 'prueba' / 'teclado-claro.webp'

ORILLA = (184, 186, 191)
TAPA = (238, 239, 242)
LETRA = (66, 68, 74)
# En las teclas negras la superficie mide unos 40 de luminancia; lo más oscuro es la orilla y lo claro, las letras.
SUPERFICIE = 40


def mezclar(c1, c2, t):
    return tuple(round(x + (y - x) * t) for x, y in zip(c1, c2))


def color(luminancia):
    if luminancia <= SUPERFICIE:
        return mezclar(ORILLA, TAPA, luminancia / SUPERFICIE)
    return mezclar(TAPA, LETRA, min(1, (luminancia - SUPERFICIE) / 170))


def sombra(alfa, dx, dy, radio, opacidad):
    forma = ImageChops.offset(alfa.filter(ImageFilter.GaussianBlur(radio)), dx, dy)
    capa = Image.new('RGBA', alfa.size, (18, 20, 26, 0))
    capa.putalpha(forma.point(lambda v: round(v * opacidad)))
    return capa


def main():
    negras = Image.open(ENTRADA).convert('RGBA')
    r, g, b, alfa = negras.split()
    luminancia = Image.merge('RGB', (r, g, b)).convert('L')
    tabla = [color(l) for l in range(256)]
    canales = [luminancia.point([tabla[l][i] for l in range(256)]) for i in range(3)]

    claras = Image.new('RGBA', negras.size, (0, 0, 0, 0))
    claras.alpha_composite(sombra(alfa, 2, 6, 7, 0.22))  # la amplia y suave
    claras.alpha_composite(sombra(alfa, 1, 2, 2, 0.30))  # la de contacto, pegada a la tecla
    claras.alpha_composite(Image.merge('RGBA', (*canales, alfa)))
    claras.save(SALIDA, 'WEBP', quality=90, method=6)
    print(f'Listo: {SALIDA.relative_to(RAIZ)} ({claras.width}x{claras.height})')


if __name__ == '__main__':
    main()
