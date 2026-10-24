import { createRoot } from "react-dom/client";
import PanelShowcase from "@/components/panel-showcase";
import FeatureCards from "@/components/feature-cards";
import HalftoneWordmarkFooter from "@/components/ui/halftone-wordmark-footer";

const panel = document.getElementById("panel-showcase");
if (panel) createRoot(panel).render(<PanelShowcase />);

const features = document.getElementById("feature-cards");
if (features) createRoot(features).render(<FeatureCards />);

const footer = document.getElementById("site-footer");
if (footer) createRoot(footer).render(<HalftoneWordmarkFooter />);
