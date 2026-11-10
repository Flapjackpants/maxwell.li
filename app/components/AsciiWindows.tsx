"use client";

import { AsciiCanvas } from "./AsciiCanvas";
import { WinBar } from "./VaporArt";

export function TerminalWindow({
  src,
  textSize = 7,
  className,
}: {
  src: string;
  textSize?: number;
  className?: string;
}) {
  return (
    <div className={`hud-panel terminal ${className ?? ""}`} aria-hidden="true">
      <WinBar />
      <div className="terminal__body">
        <p className="terminal__prompt">{`C:\\> asciiify ${src.slice(1)}`}</p>
        <AsciiCanvas src={src} textSize={textSize} className="terminal__canvas" />
      </div>
    </div>
  );
}
