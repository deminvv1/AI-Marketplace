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

  useEffect(() => {
    selectedRef.current = selectedCountry;
  }, [selectedCountry]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

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
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.01, 500);
    camera.position.set(0, 0, 3.6);

    // ── Stars ──────────────────────────────────────────────────────────────
    const starPos = new Float32Array(6000 * 3);
    for (let i = 0; i < 6000; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 80 + Math.random() * 60;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMesh = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.2, sizeAttenuation: true, transparent: true, opacity: 0.85 })
    );
    scene.add(starMesh);

    // ── Lights ─────────────────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xfff6e8, 2.2);
    sunLight.position.set(5, 2, 5);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x1a2a4a, 0.5));

    // ── Earth ──────────────────────────────────────────────────────────────
    const earthGeo = new THREE.SphereGeometry(1, 96, 96);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1a3a6a,   // ocean fallback before texture loads
      shininess: 14,
      specular: new THREE.Color(0x113366),
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    const texLoader = new THREE.TextureLoader();
    // Main color texture — place in client/public/textures/earth-color.jpg
    texLoader.load("/textures/earth-color.jpg", (tex) => {
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    });
    // Specular map — white = shiny ocean, black = matte land (optional)
    texLoader.load("/textures/earth-specular.jpg", (tex) => {
      earthMat.specularMap = tex;
      earthMat.specular.set(0x4477bb);
      earthMat.needsUpdate = true;
    }, undefined, () => { /* optional — ignore if missing */ });

    // ── Clouds ─────────────────────────────────────────────────────────────
    const cloudUniforms = { time: { value: 0.0 }, opacity: { value: 0.65 } };
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: cloudUniforms,
      vertexShader: /* glsl */`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;

        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = smoothstep(0.0,1.0,fract(p));
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
        }
        float fbm(vec2 p) {
          float v=0.0; float a=0.5;
          for(int i=0;i<5;i++){v+=a*noise(p);p*=2.2;a*=0.45;}
          return v;
        }

        void main() {
          vec2 uv = vUv + vec2(time * 0.007, time * 0.002);
          float cloud = fbm(uv * 3.5);
          float alpha = smoothstep(0.44, 0.68, cloud) * opacity;
          gl_FragColor = vec4(0.88, 0.94, 1.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(1.022, 64, 64), cloudMat);
    scene.add(cloudMesh);

    // ── Atmosphere ─────────────────────────────────────────────────────────
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 64),
      new THREE.ShaderMaterial({
        vertexShader: /* glsl */`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */`
          varying vec3 vNormal;
          void main() {
            float f = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
            gl_FragColor = vec4(0.25, 0.55, 1.0, pow(f, 4.5) * 0.45);
          }
        `,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    ));

    // ── Brand Text Ring ────────────────────────────────────────────────────
    const BRAND_TEXT = "AI  MARKETPLACE  ·  AI  MARKETPLACE  ·  ";
    const RING_R = 1.3;
    const brandRing = new THREE.Group();
    brandRing.rotation.x = 0.18; // slight Saturn-like tilt

    const letterMeshes: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial }[] = [];

    [...BRAND_TEXT].forEach((char, i) => {
      const cvs = document.createElement("canvas");
      cvs.width = 80; cvs.height = 80;
      const ctx = cvs.getContext("2d")!;
      ctx.fillStyle = char === "·" ? "rgba(139,92,246,0.95)" : "rgba(200,180,255,0.95)";
      ctx.font = `bold 46px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(char, 36, 38);

      const tex = new THREE.CanvasTexture(cvs);
      const mat = new THREE.MeshBasicMaterial({
        map: tex, transparent: true, side: THREE.FrontSide, depthWrite: false,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.085, 0.085), mat);

      const angle = -(i / BRAND_TEXT.length) * Math.PI * 2;
      mesh.position.set(-Math.sin(angle) * RING_R, 0, Math.cos(angle) * RING_R);
      mesh.rotation.y = -angle;

      brandRing.add(mesh);
      letterMeshes.push({ mesh, mat });
    });
    scene.add(brandRing);

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

    function ease(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ── Animation State ────────────────────────────────────────────────────
    type Phase = "idle" | "rotating" | "zooming" | "done";
    let phase: Phase = "idle";
    let phaseStart = 0;
    let startQuat = new THREE.Quaternion();
    let targetQuat = new THREE.Quaternion();
    let targetSlug = "";
    let prevTime = 0;

    const ROTATE_DUR = 900;
    const ZOOM_DUR = 2000;
    const CAM_FAR = 3.6;
    const CAM_NEAR = 0.6;

    let raf: number;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (prevTime === 0) prevTime = now;
      const dt = Math.min(now - prevTime, 50);
      prevTime = now;

      cloudUniforms.time.value += dt * 0.001;

      if (phase === "idle") {
        earth.rotation.y -= 0.0012;
        brandRing.rotation.y -= 0.0028;

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
        const t = Math.min((now - phaseStart) / ROTATE_DUR, 1);
        earth.quaternion.copy(startQuat).slerp(targetQuat, ease(t));
        brandRing.rotation.y -= 0.0008;

        if (t >= 1) {
          phase = "zooming";
          phaseStart = now;
        }
      }

      if (phase === "zooming") {
        const t = Math.min((now - phaseStart) / ZOOM_DUR, 1);

        // Accelerating zoom (ease-in)
        const zoomT = t * t;
        camera.position.z = CAM_FAR + (CAM_NEAR - CAM_FAR) * zoomT;

        // Clouds thicken as we approach
        const cloudBoost = Math.max(0, (t - 0.4) / 0.4);
        cloudUniforms.opacity.value = 0.3 + cloudBoost * 0.7;

        // Stars fade out
        (starMesh.material as THREE.PointsMaterial).opacity = Math.max(0, 0.85 - t * 0.85);

        // White haze overlay — starts when very close to surface
        const fadeT = Math.max(0, (t - 0.78) / 0.22);
        overlay!.style.opacity = String(fadeT);

        if (t >= 1) {
          phase = "done";
          routerRef.current.push(`/welcome/${targetSlug}`);
        }
      }

      renderer.render(scene, camera);
    }

    raf = requestAnimationFrame(tick);

    const onResize = () => {
      W = container.clientWidth;
      H = container.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      // Dispose resources
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      cloudMat.dispose();
      starGeo.dispose();
      letterMeshes.forEach(({ mat }) => {
        mat.map?.dispose();
        mat.dispose();
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="absolute inset-0">
      {/* Cloud/white fade overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-white pointer-events-none"
        style={{ opacity: 0 }}
      />
    </div>
  );
}
