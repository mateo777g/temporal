"use client";

import * as React from "react";

export interface FooterColumn { title: string; links: { label: string; href?: string }[] }
export interface HalftoneWordmarkFooterProps {
  wordmark?: string;
  columns?: FooterColumn[];
}

const defaultColumns: FooterColumn[] = [
  { title: "Productos", links: [{ label: "SaaS Restaurante", href: "./#sistema" }] },
  { title: "Soluciones", links: [{ label: "Planes" }] },
  { title: "Acerca de", links: [{ label: "Nosotros", href: "nosotros.html" }, { label: "Contáctanos" }] },
  { title: "Contacto", links: [{ label: "Instagram" }, { label: "WhatsApp" }] },
];

function FooterShortcut({ label, href, onClick, className = "", children }: {
  label: string; href?: string; onClick?: () => void; className?: string; children?: React.ReactNode;
}) {
  const [active, setActive] = React.useState(false);
  const letters = [...label];
  const props = {
    className: `${className} hwf-shortcut${active ? " hwf-shining" : ""}`,
    "aria-label": label,
    onPointerEnter: () => { if (matchMedia("(hover: hover)").matches) setActive(true); },
    onPointerLeave: () => setActive(false),
    onFocus: () => setActive(true),
    onBlur: () => setActive(false),
  };
  const text = <>{children}<span aria-hidden="true">{letters.map((letter, i) =>
    letter === " " ? " " : <span className="hwf-letter" key={i}
      style={{ "--i": i } as React.CSSProperties}
      onAnimationEnd={i === letters.length - 1 ? () => setActive(false) : undefined}>{letter}</span>
  )}</span></>;
  return onClick ? <button {...props} type="button" onClick={onClick}>{text}</button>
    : <a {...props} href={href || "#"}>{text}</a>;
}

function FooterWordmark({ label }: { label: string }) {
  const [active, setActive] = React.useState(false);
  const textRef = React.useRef<SVGTextElement>(null);
  const maskRef = React.useRef<ImageData | null>(null);
  const overInk = React.useRef(false);
  const letters = [...label];

  React.useEffect(() => {
    let disposed = false;
    const buildMask = () => {
      const text = textRef.current;
      if (disposed || !text) return;
      // SVG text hit testing includes glyph boxes, even with visiblePainted.
      // Sample actual glyph pixels instead, using the SVG's character positions.
      const canvas = document.createElement("canvas");
      canvas.width = 2000;
      canvas.height = 380;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      const style = getComputedStyle(text);
      ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ctx.letterSpacing = style.letterSpacing;
      ctx.fillStyle = "white";
      Array.from(text.children).forEach((span) => {
        const glyph = span as SVGTSpanElement;
        const start = glyph.getStartPositionOfChar(0);
        const end = glyph.getEndPositionOfChar(0);
        const value = glyph.textContent || "";
        const width = ctx.measureText(value).width;
        if (!width) return;
        ctx.save();
        ctx.scale(2, 2);
        ctx.translate(start.x, start.y);
        ctx.scale((end.x - start.x) / width, 1);
        ctx.fillText(value, 0, 0);
        ctx.restore();
      });
      maskRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    };
    void document.fonts.ready.then(buildMask);
    document.fonts.addEventListener("loadingdone", buildMask);
    return () => {
      disposed = true;
      document.fonts.removeEventListener("loadingdone", buildMask);
      maskRef.current = null;
    };
  }, [label]);

  return <svg className={`hwf-wordmark${active ? " hwf-shining" : ""}`} viewBox="0 0 1000 190" role="img" aria-label={label}>
    <text ref={textRef} x="0" y="180" textLength="1000" lengthAdjust="spacingAndGlyphs"
      onPointerMove={(event) => {
        const mask = maskRef.current;
        const matrix = event.currentTarget.getScreenCTM();
        if (!mask || !matrix) return;
        const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
        const x = Math.floor(point.x * 2);
        const y = Math.floor(point.y * 2);
        const hit = x >= 0 && y >= 0 && x < mask.width && y < mask.height && mask.data[(y * mask.width + x) * 4 + 3] >= 128;
        if (hit && !overInk.current && matchMedia("(hover: hover)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) setActive(true);
        overInk.current = hit;
      }}
      onPointerLeave={() => { overInk.current = false; }}>
      {letters.map((letter, i) => <tspan className="hwf-letter" key={i} style={{ "--i": i } as React.CSSProperties}
        onAnimationEnd={i === letters.length - 1 ? () => setActive(false) : undefined}>{letter}</tspan>)}
    </text>
  </svg>;
}

export default function HalftoneWordmarkFooter({ wordmark = "fragmentless", columns = defaultColumns }: HalftoneWordmarkFooterProps) {
  return <footer className="hwf-root">
    <div className="hwf-top">
      <div className="hwf-brand">
        <FooterShortcut href="./" className="hwf-brand-link" label="fragmentless"><img src="assets/fragmentless-fibras-dark.svg" alt="" width="24" height="23" /></FooterShortcut>
        <p>© 2026 Fragmentless. Todos los derechos reservados.</p>
      </div>
      {columns.map(col => <nav className="hwf-col" key={col.title} aria-label={col.title} id={col.title === "Contacto" ? "contacto" : undefined}>
        <h2>{col.title}</h2><ul>{col.links.map(link => <li key={link.label}><FooterShortcut href={link.href} label={link.label} /></li>)}</ul>
      </nav>)}
    </div>
    <div className="hwf-rule">
      <div className="hwf-legal"><FooterShortcut label="Aviso de privacidad" /><FooterShortcut label="Términos y condiciones" /></div>
      <FooterShortcut label="Volver arriba ↑" onClick={() => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })} />
    </div>
    <FooterWordmark label={wordmark} />
  </footer>;
}
