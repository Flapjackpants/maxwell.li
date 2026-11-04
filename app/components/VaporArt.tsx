import Image from "next/image";
import { Fragment, type ReactNode } from "react";
import { Minus, Square, X } from "lucide-react";

const panelRidge = "M0 266 105 210 160 230 285 135 340 200 400 240V280H0Z";
const panelBars = [140, 156, 174, 194].map((y, i) => ({ y, h: 3 + i * 4 }));
const horizonBars = [150, 175, 203, 234, 267, 302, 338, 375].map((y, i) => ({ y, h: [3, 5, 7, 9, 12, 15, 18, 22][i] }));
const horizonRidge = "M0 380 150 330 260 350 440 255 555 330 700 300 805 205 940 324 1050 280 1190 345 1380 270 1600 370";
const floorBars = [382, 386, 391, 397, 404, 412, 421, 431, 442, 454, 467, 479];

const SPECIMENS = [
  {
    name: "lake",
    base: "/specimen-lake.png",
    pixels: "/specimen-lake-pixel.png",
    aspect: "1042 / 834",
    regions: [
      { title: "TREELINE.BMP", x: 55, y: 37, w: 24, h: 15, to: [90, 15], hex: "#C8862A" },
      { title: "LOG.BMP", x: 44, y: 64, w: 24, h: 16, to: [90, 72], hex: "#6E7A3A" },
      { title: "CANOE.BMP", x: 4, y: 80, w: 26, h: 17, to: [48, 94], hex: "#1F3A6E" },
    ],
  },
  {
    name: "forest",
    base: "/specimen-forest.png",
    pixels: "/specimen-forest-pixel.png",
    aspect: "1042 / 1116",
    regions: [
      { title: "SKY.BMP", x: 40, y: 3, w: 20, h: 18, to: [82, 10], hex: "#B9A6FF" },
      { title: "LEAF.BMP", x: 52, y: 30, w: 20, h: 17, to: [90, 46], hex: "#9FB45A" },
      { title: "FIG.BMP", x: 32, y: 62, w: 18, h: 18, to: [24, 88], hex: "#0B0F0A" },
    ],
  },
] as const;

export function WinBar({ title }: { title: string }) {
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

export function SunMountain({ variant = "panel", className }: { variant?: "panel" | "horizon"; className?: string }) {
  if (variant === "horizon") {
    return (
      <svg className={className} viewBox="0 0 1600 480" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="sun-horizon-glow" x2="0" y2="1"><stop stopColor="var(--accent-strong)" /><stop offset="0.35" stopColor="var(--accent)" /><stop offset="0.7" stopColor="var(--n-500)" /><stop offset="1" stopColor="var(--n-700)" /></linearGradient>
          <pattern id="sun-horizon-hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V16" stroke="var(--accent)" strokeWidth="2" opacity="0.25" /></pattern>
          <clipPath id="sun-horizon-mountains"><path d={`${horizonRidge}V480H0Z`} /></clipPath>
          <mask id="sun-horizon-bars"><rect width="1600" height="480" fill="var(--n-50)" />{horizonBars.map(({y,h}) => <rect key={y} x="570" y={y} width="460" height={h} fill="var(--n-950)" />)}</mask>
        </defs>
        <circle cx="800" cy="250" r="200" fill="url(#sun-horizon-glow)" mask="url(#sun-horizon-bars)" />
        <path d={`${horizonRidge}V480H0Z`} fill="var(--n-950)" />
        <rect x="800" y="200" width="800" height="180" fill="url(#sun-horizon-hatch)" clipPath="url(#sun-horizon-mountains)" />
        <path d={horizonRidge} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <rect y="380" width="1600" height="100" fill="var(--n-950)" />
        {floorBars.map((y, i) => <rect key={y} x={90 + i * 55} y={y} width={1420 - i * 110} height="2" fill="var(--accent)" opacity={1 - i * 0.075} />)}
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sun-panel-sky" x2="0" y2="1"><stop stopColor="var(--n-200)" /><stop offset="1" stopColor="var(--accent)" /></linearGradient>
        <linearGradient id="sun-panel-glow" x2="0" y2="1"><stop stopColor="var(--accent-strong)" /><stop offset="1" stopColor="var(--n-500)" /></linearGradient>
        <linearGradient id="sun-panel-mountain" x2="1" y2="1"><stop stopColor="var(--accent)" /><stop offset="1" stopColor="var(--accent-strong)" /></linearGradient>
        <pattern id="sun-panel-hatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M-3 3 3 -3 M0 12 12 0 M9 15 15 9 M-3 9 3 15 M0 0 12 12 M9 -3 15 3" fill="none" stroke="var(--n-950)" strokeWidth="1" /></pattern>
        <clipPath id="sun-panel-right"><rect x="150" width="250" height="400" /></clipPath>
        <clipPath id="sun-panel-diamond"><path d="M200 280 390 280 200 390 10 280Z" /></clipPath>
        <mask id="sun-panel-bars"><rect width="400" height="400" fill="var(--n-50)" />{panelBars.map(({y,h}) => <rect key={y} x="180" y={y} width="180" height={h} fill="var(--n-950)" />)}</mask>
      </defs>
      <rect width="150" height="400" fill="var(--uv-deep)" /><rect x="150" width="250" height="400" fill="var(--n-800)" />
      <rect width="150" height="280" fill="url(#sun-panel-sky)" />
      {[30, 58, 90, 122].map((y) => <path key={y} d={`M150 ${y}h250`} stroke="var(--n-400)" strokeWidth="2" />)}
      <path id="sun-panel-ridge" d={panelRidge} fill="url(#sun-panel-mountain)" />
      <path d={panelRidge} fill="url(#sun-panel-hatch)" clipPath="url(#sun-panel-right)" />
      <circle cx="270" cy="130" r="90" fill="url(#sun-panel-glow)" mask="url(#sun-panel-bars)" />
      <g clipPath="url(#sun-panel-diamond)" opacity="0.75"><g transform="translate(0 560) scale(1 -1)"><path d={panelRidge} fill="var(--accent)" /></g></g>
      {[292, 309, 328, 348, 370].map((y,i) => <rect key={y} x={14+i*19} y={y} width={372-i*38} height={8-i} fill="var(--uv-deep)" clipPath="url(#sun-panel-diamond)" />)}
      <path d="M150 4V396" stroke="var(--n-400)" strokeWidth="1.5" />
      <rect x="4" y="4" width="392" height="392" fill="none" stroke="var(--n-400)" strokeWidth="1.5" />
    </svg>
  );
}

export function WireCage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={`wire-cage ${className ?? ""}`}>
    <svg className="wire-cage__back" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="76" height="76" fill="none" stroke="var(--n-400)" vectorEffect="non-scaling-stroke" />
      {[0,1,2,3,4,5].map(i => <path key={i} d={`M${i*20} 100 50 74 M0 ${76+i*4}H100`} fill="none" stroke="var(--n-400)" vectorEffect="non-scaling-stroke" />)}
    </svg>
    <div className="wire-cage__child">{children}</div>
    <svg className="wire-cage__front" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="98" height="98" fill="none" stroke="var(--n-400)" vectorEffect="non-scaling-stroke" />
      <path d="M1 1 12 12 M99 1 88 12 M1 99 12 88 M99 99 88 88" fill="none" stroke="var(--n-400)" vectorEffect="non-scaling-stroke" />
      {[76,80,84,88,92,96].map((y) => <path key={y} d={`M1 ${y}H99`} stroke="var(--accent)" vectorEffect="non-scaling-stroke" />)}
    </svg>
  </div>;
}

export function SpecimenBand() {
  return (
    <div className="specimen" aria-hidden="true">
      {SPECIMENS.map(({ name, base, pixels, aspect, regions }) => (
        <div key={name} className={`specimen__plate specimen__plate--${name}`} style={{ aspectRatio: aspect }}>
          <Image src={base} alt="" fill className="img-cover specimen__base" sizes="(max-width: 768px) 100vw, 50vw" />
          <svg className="specimen__lines" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
            {regions.map(({ title, x, y, h, to }) => <path key={title} d={`M${x} ${y + h}L${to[0]} ${to[1]}`} vectorEffect="non-scaling-stroke" />)}
          </svg>
          {regions.map(({ title, x, y, w, h, to, hex }) => (
            <Fragment key={title}>
              <span className="specimen__mark" style={{ left: `${to[0]}%`, top: `${to[1]}%` }}>{hex}</span>
              <div className="specimen__callout" style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}>
                <div className="specimen__bar"><WinBar title={title} /></div>
                <div className="specimen__zoom">
                  <div className="specimen__pixels" style={{ backgroundImage: `url(${pixels})`, width: `${10000 / w}%`, height: `${10000 / h}%`, left: `${(-x * 100) / w}%`, top: `${(-y * 100) / h}%` }} />
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
