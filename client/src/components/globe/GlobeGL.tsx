"use client";
import { useEffect, useRef } from "react";

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

      globe.pointOfView({ lat: 25, lng: 15, altitude: 2.0 }, 0);

      // IP geolocation → pulsing location marker
      try {
        const resp = await fetch("https://ipapi.co/json/");
        const data = await resp.json();
        if (!unmounted && data.latitude && data.longitude) {
          const lat: number = data.latitude;
          const lng: number = data.longitude;

          // Fly to user's city
          globe.pointOfView({ lat, lng, altitude: 1.9 }, 2800);

          // Static dot — red core
          globe
            .pointsData([{ lat, lng }])
            .pointColor(() => "#ff3b3b")
            .pointAltitude(0.012)
            .pointRadius(0.45)
            .pointsMerge(false);

          // Pulsing ring — radar/sonar animation
          globe
            .ringsData([{ lat, lng }])
            .ringColor(() => "rgba(255, 80, 60, 0.85)")
            .ringMaxRadius(4.5)
            .ringPropagationSpeed(3.5)
            .ringRepeatPeriod(1400);
        }
      } catch {}
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
