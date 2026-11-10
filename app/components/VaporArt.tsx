import type { ReactNode } from "react";
import { Minus, Square, X } from "lucide-react";

const panelRidge = "M0 266 105 210 160 230 285 135 340 200 400 240V280H0Z";
const panelBars = [140, 156, 174, 194].map((y, i) => ({ y, h: 3 + i * 4 }));

export function WinBar({ title }: { title?: string }) {
  return (
    <span className="hud-panel__bar" aria-hidden="true">
      <span className="hud-panel__title">{title}</span>
      <span className="win-controls">
        <span className="win-btn"><Minus /></span>
        <span className="win-btn"><Square /></span>
        <span className="win-btn"><X /></span>
      </span>
    </span>
  );
}

export function SunMountain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sun-panel-sky" x2="0" y2="1"><stop stopColor="var(--sun-peach)" /><stop offset="1" stopColor="var(--accent)" /></linearGradient>
        <linearGradient id="sun-panel-glow" x2="0" y2="1"><stop stopColor="var(--spec-orange)" /><stop offset="1" stopColor="var(--sun-maroon)" /></linearGradient>
        <linearGradient id="sun-panel-mountain" x2="1" y2="1"><stop stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-strong)" /></linearGradient>
        <pattern id="sun-panel-hatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M-3 3 3 -3 M0 12 12 0 M9 15 15 9 M-3 9 3 15 M0 0 12 12 M9 -3 15 3" fill="none" stroke="var(--n-950)" strokeWidth="1" /></pattern>
        <clipPath id="sun-panel-right"><rect x="150" width="250" height="400" /></clipPath>
        <clipPath id="sun-panel-diamond"><path d="M200 280 390 280 200 390 10 280Z" /></clipPath>
        <mask id="sun-panel-bars"><rect width="400" height="400" fill="var(--n-50)" />{panelBars.map(({y,h}) => <rect key={y} x="180" y={y} width="180" height={h} fill="var(--n-950)" />)}</mask>
      </defs>
      <rect width="150" height="400" fill="var(--uv-deep)" /><rect x="150" width="250" height="400" fill="var(--sun-maroon)" />
      <rect width="150" height="280" fill="url(#sun-panel-sky)" />
      {[30, 58, 90, 122].map((y) => <path key={y} d={`M150 ${y}h250`} stroke="var(--sun-peach)" strokeWidth="2" />)}
      <path id="sun-panel-ridge" d={panelRidge} fill="url(#sun-panel-mountain)" />
      <path d={panelRidge} fill="url(#sun-panel-hatch)" clipPath="url(#sun-panel-right)" />
      <circle cx="270" cy="130" r="90" fill="url(#sun-panel-glow)" mask="url(#sun-panel-bars)" />
      <g clipPath="url(#sun-panel-diamond)" opacity="0.75"><g transform="translate(0 560) scale(1 -1)"><path d={panelRidge} fill="var(--accent)" /></g></g>
      {[292, 309, 328, 348, 370].map((y,i) => <rect key={y} x={14+i*19} y={y} width={372-i*38} height={8-i} fill="var(--uv-deep)" clipPath="url(#sun-panel-diamond)" />)}
      <path d="M150 4V396" stroke="var(--sun-peach)" strokeWidth="1.5" />
      <rect x="4" y="4" width="392" height="392" fill="none" stroke="var(--sun-peach)" strokeWidth="1.5" />
    </svg>
  );
}

export function WireCage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`wire-cage ${className ?? ""}`}>
    <svg className="wire-cage__back" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="76" height="76" fill="none" stroke="var(--spec-cyan)" vectorEffect="non-scaling-stroke" />
      {[0,1,2,3,4,5].map(i => <path key={i} d={`M${i*20} 100 50 74 M0 ${76+i*4}H100`} fill="none" stroke="var(--spec-cyan)" vectorEffect="non-scaling-stroke" />)}
    </svg>
    <div className="wire-cage__child">{children}</div>
    <svg className="wire-cage__front" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="var(--spec-cyan)" vectorEffect="non-scaling-stroke" />
      <path d="M1 1 12 12 M99 1 88 12 M1 99 12 88 M99 99 88 88" fill="none" stroke="var(--spec-cyan)" vectorEffect="non-scaling-stroke" />
      {[76,80,84,88,92,96].map((y,i) => <path key={y} d={`M1 ${y}H99`} stroke={`var(--spec-${i < 2 ? "red" : i < 4 ? "orange" : "yellow"})`} vectorEffect="non-scaling-stroke" />)}
    </svg>
  </div>;
}
