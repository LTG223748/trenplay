// components/RocketAcrossHeader.tsx
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/** Props
 *  - intervalMs: relaunch cadence (default 60s)
 *  - size: rocket size in px (default 64)
 *  - fixedTopPct: vertical position as % of header height (default 50 = centered)
 *  - rotateDeg: rotate the sprite so it faces right; your asset looks best at 45°
 */
export default function RocketAcrossHeader({
  intervalMs = 60_000,
  size = 64,
  fixedTopPct = 50,
  rotateDeg = 45, // <-- your requested rotation
}: {
  intervalMs?: number;
  size?: number;
  fixedTopPct?: number;
  rotateDeg?: number;
}) {
  const [launchKey, setLaunchKey] = useState(0);
  const reduceRef = useRef(false);

  useEffect(() => {
    reduceRef.current =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduceRef.current) return;

    const relaunch = () => setLaunchKey((k) => k + 1);
    const t = setTimeout(relaunch, 500);
    const id = setInterval(relaunch, intervalMs);

    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [intervalMs]);

  if (reduceRef.current) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible">
      <div
        key={launchKey}
        className="tp-rocket-run"
        style={{
          top: `${fixedTopPct}%`,
          left: 0,
          width: size,
          height: size,
        }}
      >
        <Image
          src="/images/rocket-blue.png"
          alt="Rocket"
          width={size}
          height={size}
          priority
          draggable={false}
          style={{
            transform: `rotate(${rotateDeg}deg)`,
            transformOrigin: "50% 50%",
          }}
        />
      </div>

      <style jsx>{`
        .tp-rocket-run {
          position: absolute;
          /* X-only motion; Y stays centered */
          transform: translateX(-12vw) translateY(-50%);
          animation: tp-fly-x-only 5.5s linear forwards;
          filter: drop-shadow(0 0 18px rgba(111, 76, 255, 0.55))
                  drop-shadow(0 0 28px rgba(0, 219, 255, 0.35));
          will-change: transform;
        }

        @keyframes tp-fly-x-only {
          0%   { opacity: 0; transform: translateX(-12vw) translateY(-50%) scale(0.95); }
          10%  { opacity: 1; }
          60%  { transform: translateX(55vw) translateY(-50%) scale(1.02); }
          100% { opacity: 0; transform: translateX(120vw) translateY(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
