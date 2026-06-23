import { Y2K_GIFS } from "@/lib/retro-gifs";

export function RetroFireStrip() {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        overflow: "hidden",
        justifyContent: "center",
        marginBottom: 8,
      }}
    >
      {Array(20)
        .fill(0)
        .map((_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={Y2K_GIFS.fire}
            alt=""
            width={200}
            height={36}
            style={{ flexShrink: 0 }}
          />
        ))}
    </div>
  );
}
