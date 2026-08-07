"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

interface SelectedCountry {
  name: string;
  lat: number;
  lng: number;
}

interface Props {
  selectedCountry: SelectedCountry | null;
}

export default function LandingGlobe({ selectedCountry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const selectedRef = useRef<SelectedCountry | null>(null);
  const routerRef = useRef(router);

  useEffect(() => { selectedRef.current = selectedCountry; }, [selectedCountry]);
  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    let W = container.clientWidth;
    let H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.01, 1000);
    camera.position.set(0, 0.18, 3.4);

    // ── Milky Way background sphere ────────────────────────────────────────
    const milkyWayMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: `
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y);
        }
        float fbm(vec2 p) {
          float v=0.,a=.5; for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=.5;} return v;
        }
        void main() {
          vec2 uv = vUv;
          // Galaxy band (tilted strip)
          float bY = uv.y - 0.40 + sin(uv.x * 3.14159) * 0.06;
          float band = exp(-bY*bY*14.0)*0.55 + exp(-bY*bY*4.0)*0.25;
          band *= 0.5 + fbm(vec2(uv.x*5.5, uv.y*14.0));
          // Stars — multiple density layers
          float s1 = hash(floor(uv*420.0));
          float s2 = hash(floor(uv*170.0) + vec2(4.2,7.1));
          float s3 = hash(floor(uv*700.0) + vec2(1.3,3.7));
          float s4 = hash(floor(uv*1200.0) + vec2(9.1,2.5));
          float stars = step(0.983,s1)*0.65 + step(0.989,s2)*1.3 + step(0.9968,s3)*2.5 + step(0.9991,s4)*4.0;
          // Color variation: blue-white stars, warm stars
          vec3 galCol = mix(vec3(0.50,0.62,0.95), vec3(1.0,0.82,0.75), fbm(uv*2.3));
          vec3 starCol = mix(vec3(0.88,0.94,1.00), vec3(1.0,0.90,0.70), hash(floor(uv*75.0)));
          vec3 color = galCol * band * 0.18 + starCol * min(stars, 3.0) * 0.55;
          float alpha = band * 0.25 + min(stars, 1.0) * 0.90;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const milkyWayGeo = new THREE.SphereGeometry(500, 64, 32);
    const milkyWayMesh = new THREE.Mesh(milkyWayGeo, milkyWayMat);
    scene.add(milkyWayMesh);

    // ── Lighting ───────────────────────────────────────────────────────────
    const SUN_DIR = new THREE.Vector3(3.5, 1.2, 2.8).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff3e0, 2.7);
    sunLight.position.copy(SUN_DIR.clone().multiplyScalar(10));
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x060c1e, 0.5));

    // ── Earth — procedural day/night shader ────────────────────────────────
    const earthGeo = new THREE.SphereGeometry(1, 128, 64);
    const earthUniforms = { sunDir: { value: SUN_DIR }, time: { value: 0.0 } };

    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: `
        varying vec3 vNormal; varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal); vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal; varying vec2 vUv;
        uniform vec3 sunDir; uniform float time;

        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){
          vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
        }
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.1;a*=.5;}return v;}

        void main() {
          vec3 N = normalize(vNormal);
          float sunDot = dot(N, sunDir);
          vec2 uv = vUv;

          // Continent mask (two-octave blend for varied coastlines)
          float c1 = fbm(uv * 3.7 + vec2(2.1, 0.8));
          float c2 = fbm(uv * 2.2 + vec2(5.4, 4.2));
          float land = smoothstep(0.490, 0.535, c1*0.62 + c2*0.38);

          // Polar ice caps
          float lat = abs(uv.y - 0.5) * 2.0;
          float ice = smoothstep(0.76, 0.93, lat);
          land = max(land, ice);

          float detail  = fbm(uv * 7.2 + vec2(3.1, 1.4));
          float mountain = smoothstep(0.555, 0.625, fbm(uv * 4.6 + vec2(1.8, 6.3)));

          // Day palette
          vec3 deepOcean  = mix(vec3(0.01,0.05,0.20), vec3(0.03,0.13,0.38), fbm(uv*5.0)*0.7);
          vec3 grass      = mix(vec3(0.05,0.17,0.04), vec3(0.10,0.27,0.06), detail);
          vec3 desert     = mix(vec3(0.37,0.27,0.09), vec3(0.52,0.40,0.16), detail);
          vec3 terrain    = mix(grass, desert, smoothstep(0.33,0.68,detail)*0.55);
          terrain         = mix(terrain, vec3(0.23,0.20,0.17), mountain*0.68);
          vec3 iceCol     = vec3(0.83, 0.92, 1.00);

          vec3 dayCol = mix(deepOcean, terrain, land);
          dayCol = mix(dayCol, iceCol, ice * 0.90);

          // Sunlight + ocean specular
          float diff = max(0.0, sunDot);
          float spec = pow(max(0.0, sunDot), 55.0) * (1.0 - land) * 0.68;
          dayCol = dayCol * (0.028 + diff * 1.14) + vec3(1.0, 0.96, 0.86) * spec;

          // Night city lights
          float cn = fbm(uv*13.5) * fbm(uv*26.0 + vec2(2.0,3.5));
          float cities = pow(max(0.0, cn), 1.65) * (1.0 - ice) * clamp(land * 2.2, 0.0, 1.0);
          vec3 cityGlow = mix(vec3(1.0,0.70,0.28), vec3(1.0,0.90,0.58), cn) * cities * 4.0;

          // Terminator smooth blend
          float term = smoothstep(-0.09, 0.14, sunDot);
          vec3 color = mix(cityGlow, dayCol, term);

          // Limb atmospheric scatter (day side only)
          float fresnel = pow(1.0 - abs(dot(N, vec3(0,0,1))), 2.6);
          color += vec3(0.20, 0.46, 1.0) * fresnel * 0.22 * max(0.0, sunDot + 0.55);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });

    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // ── Clouds ─────────────────────────────────────────────────────────────
    const cloudUniforms = { time: { value: 0.0 }, sunDir: { value: SUN_DIR } };
    const cloudGeo = new THREE.SphereGeometry(1.019, 96, 48);
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: cloudUniforms,
      vertexShader: `
        varying vec2 vUv; varying vec3 vNormal;
        void main() {
          vUv = uv; vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time; uniform vec3 sunDir;
        varying vec2 vUv; varying vec3 vNormal;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.2;a*=.45;}return v;}
        void main() {
          vec2 uv = vUv + vec2(time * 0.0055, time * 0.0018);
          float c = fbm(uv * 3.1);
          float alpha = smoothstep(0.44, 0.64, c) * 0.80;
          float lit = max(0.0, dot(normalize(vNormal), sunDir));
          vec3 col = mix(vec3(0.62, 0.70, 0.84), vec3(1.0, 1.0, 1.0), lit * 0.85 + 0.15);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // ── Atmosphere ─────────────────────────────────────────────────────────
    const atmoGeo = new THREE.SphereGeometry(1.068, 64, 32);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: SUN_DIR } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal; uniform vec3 sunDir;
        void main() {
          float f = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 3.0);
          float s = max(0.0, dot(vNormal, sunDir));
          vec3 col = mix(vec3(0.10,0.30,0.90), vec3(0.32,0.62,1.0), s*0.7);
          gl_FragColor = vec4(col, f * 0.60);
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // ── Orbital ring ───────────────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(1.44, 0.0022, 8, 256);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x8899dd,
      transparent: true,
      opacity: 0.40,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.10;
    ring.rotation.z = Math.PI * 0.04;
    scene.add(ring);

    // ── Sun glow sprite ────────────────────────────────────────────────────
    const glowCvs = document.createElement("canvas");
    glowCvs.width = 64; glowCvs.height = 64;
    const glowCtx = glowCvs.getContext("2d")!;
    const grad = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,    "rgba(255,248,210,1.0)");
    grad.addColorStop(0.28, "rgba(255,238,170,0.5)");
    grad.addColorStop(1,    "rgba(255,210,120,0.0)");
    glowCtx.fillStyle = grad;
    glowCtx.fillRect(0, 0, 64, 64);
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(glowCvs),
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }));
    sunSprite.scale.set(2.4, 2.4, 1);
    sunSprite.position.copy(SUN_DIR.clone().multiplyScalar(9));
    scene.add(sunSprite);

    // ── Helpers ────────────────────────────────────────────────────────────
    function latLngTo3D(lat: number, lng: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).normalize();
    }

    function ease(t: number) {
      return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    }

    // ── Animation state ────────────────────────────────────────────────────
    type Phase = "idle" | "rotating" | "zooming" | "done";
    let phase: Phase = "idle";
    let phaseStart = 0;
    let startQuat = new THREE.Quaternion();
    let targetQuat = new THREE.Quaternion();
    let targetSlug = "";
    let prevTime = 0;

    const ROTATE_DUR = 900;
    const ZOOM_DUR   = 2200;
    const CAM_FAR    = 3.4;
    const CAM_NEAR   = 0.55;

    let raf: number;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (prevTime === 0) prevTime = now;
      prevTime = now;

      const t = now * 0.001;
      earthUniforms.time.value = t;
      cloudUniforms.time.value = t;

      if (phase === "idle") {
        earth.rotation.y  += 0.00095;
        cloudMesh.rotation.y += 0.00105;
        ring.rotation.y   += 0.00038;

        if (selectedRef.current !== null) {
          phase = "rotating";
          phaseStart = now;
          targetSlug = selectedRef.current.name.toLowerCase().replace(/\s+/g, "-");
          startQuat.copy(earth.quaternion);
          const dir = latLngTo3D(selectedRef.current.lat, selectedRef.current.lng);
          targetQuat.setFromUnitVectors(dir, new THREE.Vector3(0, 0, 1));
        }
      }

      if (phase === "rotating") {
        const t2 = Math.min((now - phaseStart) / ROTATE_DUR, 1);
        earth.quaternion.copy(startQuat).slerp(targetQuat, ease(t2));
        cloudMesh.rotation.y += 0.0005;
        ring.rotation.y      += 0.0002;
        if (t2 >= 1) { phase = "zooming"; phaseStart = now; }
      }

      if (phase === "zooming") {
        const t2 = Math.min((now - phaseStart) / ZOOM_DUR, 1);
        camera.position.z = CAM_FAR + (CAM_NEAR - CAM_FAR) * t2 * t2;
        overlay!.style.opacity = String(Math.max(0, (t2 - 0.78) / 0.22));
        if (t2 >= 1) { phase = "done"; routerRef.current.push(`/welcome/${targetSlug}`); }
      }

      renderer.render(scene, camera);
    }

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      W = container.clientWidth; H = container.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
      earthGeo.dispose(); earthMat.dispose();
      cloudGeo.dispose(); cloudMat.dispose();
      atmoGeo.dispose();  atmoMat.dispose();
      ringGeo.dispose();  ringMat.dispose();
      milkyWayGeo.dispose(); milkyWayMat.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-white pointer-events-none"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
