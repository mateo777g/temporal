"use client";

// El respaldo de WebGL que importa animated-gradient.tsx (el «Animated Gradient» de 21st.dev): su prompt lo usa pero
// no lo trae, así que se hizo aquí. Si WebGL no está o el degradado falla, queda un recuadro vacío y se ve el negro del
// recuadro que lo contiene.
import { Component, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface WebGLErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

export class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function WebGLFallback({ className }: { className?: string }) {
  return <div className={cn(className)} aria-hidden="true" />;
}
