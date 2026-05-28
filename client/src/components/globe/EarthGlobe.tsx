"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  lat: number;
  lng: number;
  onReady?: () => void;
}

export default function EarthGlobe({ lat, lng, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let W = container.clientWidth;
    let H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 500);
    camera.position.z = 3.5;

    // ── Stars ────────────────────────────────────────────────────
    const starPos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 100 + Math.random() * 50;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(
      new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({
          color: 0xffffff,
          size: 0.18,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.85,
        })
      )
    );

    // ── Lights ──────────────────────────────────────────────────
    const sunLight = new THREE.DirectionalLight(0xfff6e8, 2.2);
    sunLight.position.set(5, 2, 5);
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x1a2a4a, 0.5));

    // ── Earth ────────────────────────────────────────────────────
    const earthGeo = new THREE.SphereGeometry(1, 96, 96);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x1a3a6a,
      shininess: 14,
      specular: new THREE.Color(0x113366),
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    const texLoader = new THREE.TextureLoader();
    texLoader.load("/textures/earth-color.jpg", (tex) => {
      earthMat.map = tex;
      earthMat.color.set(0xffffff);
      earthMat.needsUpdate = true;
    });
    texLoader.load("/textures/earth-specular.jpg", (tex) => {
      earthMat.specularMap = tex;
      earthMat.specular.set(0x4477bb);
      earthMat.needsUpdate = true;
    }, undefined, () => {});

    // ── Atmosphere ───────────────────────────────────────────────
    scene.add(
      new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 64, 64),
        new THREE.ShaderMaterial({
          vertexShader: /* glsl */ `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: /* glsl */ `
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
      )
    );

    // ── Country Marker ───────────────────────────────────────────
    function latLngTo3D(lat: number, lng: number): THREE.Vector3 {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      ).normalize();
    }

    const dir = latLngTo3D(lat, lng);
    const markerGroup = new THREE.Group();
    markerGroup.position.copy(dir.clone().multiplyScalar(1.016));
    markerGroup.lookAt(dir.clone().multiplyScalar(5));
    earth.add(markerGroup);

    // Core dot
    markerGroup.add(
      new THREE.Mesh(
        new THREE.CircleGeometry(0.022, 32),
        new THREE.MeshBasicMaterial({ color: 0xbfdbfe, side: THREE.DoubleSide })
      )
    );

    // Staggered pulse rings
    const rings: { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; t: number }[] = [];
    for (let i = 0; i < 3; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.RingGeometry(0.022, 0.042, 32), mat);
      markerGroup.add(mesh);
      rings.push({ mesh, mat, t: i / 3 });
    }

    // ── Animation setup ──────────────────────────────────────────
    const startQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0.12, 1.5, 0.06)
    );
    const targetQuat = new THREE.Quaternion().setFromUnitVectors(
      dir,
      new THREE.Vector3(0, 0, 1)
    );
    earth.quaternion.copy(startQuat);

    const autoRot = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      -0.0004
    );

    const ROTATE_DURATION = 2400;
    const ZOOM_DELAY = 400;
    const ZOOM_DURATION = 2400;
    const CAM_START = 3.5;
    const CAM_END = 2.1;

    let t0: number | null = null;
    let done = false;
    let raf: number;

    function ease(t: number): number {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (!t0) t0 = now;
      const el = now - t0;

      if (!done) {
        // Rotate earth to face country
        const rotT = ease(Math.min(el / ROTATE_DURATION, 1));
        earth.quaternion.copy(startQuat).slerp(targetQuat, rotT);

        // Zoom camera in
        const zoomEl = Math.max(0, el - ZOOM_DELAY);
        const zoomT = ease(Math.min(zoomEl / ZOOM_DURATION, 1));
        camera.position.z = CAM_START + (CAM_END - CAM_START) * zoomT;

        if (el >= ROTATE_DURATION + 400) {
          done = true;
          onReadyRef.current?.();
        }
      } else {
        earth.quaternion.premultiply(autoRot);
      }

      // Pulse rings
      for (const r of rings) {
        r.t = (r.t + 0.016) % 1;
        r.mesh.scale.setScalar(1 + r.t * 2.2);
        r.mat.opacity = 0.75 * (1 - r.t);
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
      renderer.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      starGeo.dispose();
    };
  }, [lat, lng]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
