import { createRoot } from "react-dom/client";
import PanelShowcase from "@/components/panel-showcase";
import FeatureCards from "@/components/feature-cards";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";
import { EarthBlaze } from "@/components/ui/earth-blaze";
import { AnimatedGradient } from "@/components/ui/animated-gradient";

const panel = document.getElementById("panel-showcase");
if (panel) createRoot(panel).render(<PanelShowcase />);

const features = document.getElementById("feature-cards");
if (features) createRoot(features).render(<FeatureCards />);

// La entrada del logo en vidrio de Nosotros (components/logo-vidrio.tsx) ya no se monta: está guardada, con cómo
// regresarla, en guardado/intro-logo-vidrio/.

// La Tierra del «Earth Blaze» de 21st.dev en la portada de Nosotros: llena el recuadro que le toca, como en su demo,
// sin su proporción de 16:10. Quieta: sin la luz que sigue al mouse ni la aurora del clic. Y sin la foto del planeta
// (el Blue Marble de la NASA, que solo se veía al aclararlo con el mouse): el planeta queda oscuro, con su orilla de
// luz, y no se descarga nada de fuera.
const tierra = document.getElementById("tierra");
if (tierra) createRoot(tierra).render(
  <EarthBlaze interactive={false} textureUrl="" style={{ position: "absolute", inset: 0, height: "100%", aspectRatio: "auto" }} />,
);

// El recuadro negro del final de Nosotros: el «Animated Gradient» de 21st.dev con su preset «Aurora» tal cual, nada
// más que con el azul de la marca (--azul) en lugar de su rosa (#f20089). Las esquinas las recorta el recuadro.
const degradado = document.getElementById("degradado");
if (degradado) createRoot(degradado).render(
  <AnimatedGradient
    config={{
      preset: "custom",
      color1: "#0a001a",
      color2: "#1a0b2e",
      color3: "#1355E8",
      rotation: -45,
      proportion: 60,
      scale: 0.6,
      speed: 15,
      distortion: 40,
      swirl: 80,
      swirlIterations: 10,
      softness: 100,
      offset: 200,
      shape: "Edge",
      shapeSize: 50,
    }}
  />,
);

const footer = document.getElementById("site-footer");
if (footer) createRoot(footer).render(<HalftoneWordmarkFooter />);
