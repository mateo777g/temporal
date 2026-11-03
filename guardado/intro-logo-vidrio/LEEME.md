# La entrada del logo en vidrio (guardada)

La entrada que tuvo Nosotros del 29 de octubre al 2 de noviembre de 2026: lo primero que se veía era el logo de
Fragmentless dentro del vidrio líquido del «Glass Reveal» de 21st.dev, a pantalla completa sobre gris, sin barra y
sin poder bajar. Una gota de vidrio crecía con el logo adentro (grande y doblado en las orillas, con su tornasol), lo
soltaba y quedaba el logo solo. Medio segundo después el logo subía a su lugar arriba de «Somos Fragmentless.»
mientras el fondo pasaba a blanco, bajaba la barra y subía el texto, con el brillo azul en el titular. Tardaba unos
6 s y salía en cada visita.

Se quitó de la página el 2 de noviembre, cuando la portada pasó al recuadro con la Tierra (como la de Scale). Se
guarda por si sirve después, por ejemplo para una app.

## Qué hay aquí

| Archivo | Qué es | Dónde iba |
| --- | --- | --- |
| `intro.html` | El script del `<head>` que arranca la entrada y la portada con el lienzo del logo | `nosotros.html` |
| `intro.css` | La portada blanca centrada y los pasos de la entrada (`data-intro`) | `nosotros.css` |
| `intro.js` | Lo que mide cuánto sube el logo, el titular letra por letra y el aviso si el bundle no carga | `nosotros.js` |

Los componentes siguen en su lugar, porque se compilan con el bundle:

- `components/logo-vidrio.tsx`: el logo en el vidrio, con la estrella oficial y sus colores, el paso de gris a
  blanco y el aviso de que terminó (pone `data-intro="sube"`).
- `components/ui/liquid-glass-logo-reveal.tsx`: el «Glass Reveal» de 21st.dev, copiado tal cual más el aviso
  `onEnd`.

`assets/og-imagen.jpg` (la imagen al compartir el enlace) es un cuadro de esta entrada, en el segundo 2.0.

## Cómo regresarla

1. En `src/wave-entry.tsx`, volver a montar el logo y compilar (`npm run build`):

   ```tsx
   import LogoVidrio from "@/components/logo-vidrio";

   const logoVidrio = document.getElementById("logo-vidrio");
   if (logoVidrio) createRoot(logoVidrio).render(<LogoVidrio className="h-full w-full" />);
   ```

2. Pasar los pedazos de `intro.html`, `intro.css` e `intro.js` a la página donde vaya.
3. Subir el `?v=` del bundle, del CSS y del JS en el HTML.

O verla tal cual estaba: en el commit `4e8503e`, `nosotros.html`, `nosotros.css`, `nosotros.js` y
`src/wave-entry.tsx` todavía la tienen.
