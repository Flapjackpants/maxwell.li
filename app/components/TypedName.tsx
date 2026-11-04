"use client";

import { useEffect, useState } from "react";

const TYPE_INTERVAL = 90;

export function TypedName({ text }: { text: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const step = reduced ? text.length : 1;
    const id = window.setInterval(() => {
      setCount((c) => {
        const next = Math.min(c + step, text.length);
        if (next >= text.length) window.clearInterval(id);
        return next;
      });
    }, TYPE_INTERVAL);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <h1 className="hero__name" aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span className="hero__caret" aria-hidden="true" />
      <span className="hero__name-rest" aria-hidden="true">{text.slice(count)}</span>
    </h1>
  );
}
