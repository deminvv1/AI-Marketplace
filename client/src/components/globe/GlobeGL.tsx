"use client";
import { useEffect, useRef } from "react";

type Loc = { lat: number; lng: number; city: string; country: string };

async function fetchIPLocation(): Promise<Loc | null> {
  // Try two services — ipwho.is first (no rate limit), ipapi.co as backup
  const attempts = [
    async (): Promise<Loc | null> => {
      const r = await fetch("https://ipwho.is/");
      const d = await r.json();
      if (!d.success || !d.latitude) return null;
      return { lat: d.latitude, lng: d.longitude, city: d.city || "", country: d.country_code || "" };
    },
    async (): Promise<Loc | null> => {
      const r = await fetch("https://ipapi.co/json/");
      const d = await r.json();
      if (d.error || !d.latitude) return null;
      return { lat: d.latitude, lng: d.longitude, city: d.city || "", country: d.country_code || "" };
    },
  ];

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result) return result;
    } catch {}
  }
  return null;
}

export default function GlobeGL() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let globe: any = null;
    let unmounted = false;

    const init = async () => {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      if (unmounted || !el) return;

      let GlobeClass: any;
      try {
        const mod = await import("globe.gl");
        GlobeClass = mod.default;
      } catch { return; }
      if (unmounted || !el) return;

      const W = el.offsetWidth || window.innerWidth;
      const H = el.offsetHeight || window.innerHeight;

      globe = GlobeClass()
        .width(W)
        .height(H)
        .backgroundColor("rgba(0,0,0,0)")
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .atmosphereColor("rgba(120,170,255,1)")
        .atmosphereAltitude(0.18)
        .enablePointerInteraction(false)(el);

      const ctrl = globe.controls();
      ctrl.autoRotate = true;
      ctrl.autoRotateSpeed = 0.45;
      ctrl.enableZoom = false;
      ctrl.enablePan = false;

      // Start globe at side view — low lat = equator-level camera
      globe.pointOfView({ lat: 15, lng: 15, altitude: 2.2 }, 0);

      // Fetch location then fly there
      const loc = await fetchIPLocation();
      if (unmounted || !loc) return;

      const { lat, lng, city, country } = loc;

      // Fly to user's longitude but keep camera at side-view angle
      globe.pointOfView({ lat: 15, lng, altitude: 1.85 }, 2800);

      // Red dot
      globe
        .pointsData([{ lat, lng }])
        .pointColor(() => "#ff3b3b")
        .pointAltitude(0.012)
        .pointRadius(0.45)
        .pointsMerge(false);

      // Pulsing ring
      globe
        .ringsData([{ lat, lng }])
        .ringColor(() => "rgba(255, 80, 60, 0.85)")
        .ringMaxRadius(4.5)
        .ringPropagationSpeed(3.5)
        .ringRepeatPeriod(1400);

    };

    init();

    const onResize = () => {
      if (globe && el) globe.width(el.offsetWidth).height(el.offsetHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      unmounted = true;
      window.removeEventListener("resize", onResize);
      try { globe?._destructor?.(); } catch {}
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: "100%", height: "100%", background: "transparent" }} />
  );
}
