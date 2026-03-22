"use client";

import { useEffect, useRef } from "react";

type Node = { x: number; y: number; vx: number; vy: number };

const NODE_COUNT = 52;
const LINK_DISTANCE = 155;
const BASE_SPEED = 0.28;

function readGraphTokens() {
  if (typeof document === "undefined") {
    return {
      lineRgb: "147, 197, 253",
      lineAlphaFactor: 0.42,
      nodeFill: "rgba(224, 242, 254, 0.9)",
    };
  }
  const r = document.documentElement;
  const s = getComputedStyle(r);
  return {
    lineRgb: (s.getPropertyValue("--graph-line-rgb").trim() || "147, 197, 253")
      .replace(/\s+/g, " ")
      .trim(),
    lineAlphaFactor: parseFloat(
      s.getPropertyValue("--graph-line-alpha-factor").trim() || "0.42",
    ),
    nodeFill: (
      s.getPropertyValue("--graph-node-fill").trim() ||
      "rgba(224, 242, 254, 0.9)"
    ).replace(/^["']|["']$/g, ""),
  };
}

/**
 * Fixed full-viewport stack: blue gradient, data grid, animated node graph,
 * vignette, light film grain. Tokens in globals.css (`:root` + `.portfolio-bg*`).
 */
export function PortfolioBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const raw = el.getContext("2d");
    if (!raw) return;
    const c2d: CanvasRenderingContext2D = raw;

    let nodes: Node[] = [];
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let graph = readGraphTokens();

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = Math.max(window.innerHeight, 1);
      c.width = Math.floor(w * dpr);
      c.height = Math.floor(h * dpr);
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      graph = readGraphTokens();
    }

    function seedNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * BASE_SPEED * 2,
        vy: (Math.random() - 0.5) * BASE_SPEED * 2,
      }));
    }

    function onResize() {
      resize();
      seedNodes();
    }

    resize();
    seedNodes();
    window.addEventListener("resize", onResize);

    let t = 0;
    function tick() {
      t += 0.008;
      c2d.clearRect(0, 0, w, h);

      for (const n of nodes) {
        n.x += n.vx + Math.sin(t + n.y * 0.002) * 0.08;
        n.y += n.vy + Math.cos(t * 0.9 + n.x * 0.002) * 0.08;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DISTANCE) {
            const alpha =
              (1 - dist / LINK_DISTANCE) * graph.lineAlphaFactor;
            c2d.strokeStyle = `rgba(${graph.lineRgb}, ${alpha})`;
            c2d.lineWidth = 1;
            c2d.beginPath();
            c2d.moveTo(a.x, a.y);
            c2d.lineTo(b.x, b.y);
            c2d.stroke();
          }
        }
      }

      for (const n of nodes) {
        c2d.fillStyle = graph.nodeFill;
        c2d.beginPath();
        c2d.arc(n.x, n.y, 2.4, 0, Math.PI * 2);
        c2d.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="portfolio-bg" aria-hidden>
      <div className="portfolio-bg__gradient" />
      <div className="portfolio-bg__grid" />
      <canvas ref={canvasRef} className="portfolio-bg__canvas" />
      <div className="portfolio-bg__vignette" />
      <div className="portfolio-bg__grain" />
    </div>
  );
}
