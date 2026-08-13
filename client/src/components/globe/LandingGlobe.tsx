"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";

interface SelectedCountry { name: string; lat: number; lng: number; }
interface Props { selectedCountry: SelectedCountry | null; }

export default function LandingGlobe({ selectedCountry }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const router       = useRouter();
  const selectedRef  = useRef<SelectedCountry | null>(null);
  const routerRef    = useRef(router);

  useEffect(() => { selectedRef.current = selectedCountry; }, [selectedCountry]);
  useEffect(() => { routerRef.current = router; }, [router]);

  useEffect(() => {
    const container = containerRef.current;
    const overlay   = overlayRef.current;
    if (!container || !overlay) return;

    let W = container.clientWidth;
    let H = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 1000);
    camera.position.set(0, 0.18, 3.35);

    // ── Stars — simple round point particles, no rectangles ───────────────
    const STAR_COUNT = 3200;
    const starPos    = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      // More stars toward one side (hint of Milky Way density)
      const r = 220 + Math.random() * 30;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));

    // Round soft star texture
    const sc = document.createElement("canvas");
    sc.width = 32; sc.height = 32;
    const sx = sc.getContext("2d")!;
    const sg = sx.createRadialGradient(16, 16, 0, 16, 16, 16);
    sg.addColorStop(0,    "rgba(255,255,255,1.0)");
    sg.addColorStop(0.25, "rgba(220,232,255,0.7)");
    sg.addColorStop(0.55, "rgba(180,210,255,0.15)");
    sg.addColorStop(1,    "rgba(120,170,255,0.0)");
    sx.fillStyle = sg; sx.fillRect(0, 0, 32, 32);

    const starMat = new THREE.PointsMaterial({
      map: new THREE.CanvasTexture(sc),
      size: 1.4,
      transparent: true,
      opacity: 0.90,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Lighting ───────────────────────────────────────────────────────────
    const SUN_DIR = new THREE.Vector3(4.0, 1.0, 3.2).normalize();
    const sunLight = new THREE.DirectionalLight(0xfff4e0, 2.8);
    sunLight.position.copy(SUN_DIR.clone().multiplyScalar(10));
    scene.add(sunLight);
    scene.add(new THREE.AmbientLight(0x03060f, 0.5));

    // ── Earth — real texture + day/night terminator ───────────────────────
    const makeBlank = (r: number, g: number, b: number): THREE.Texture => {
      const t = new THREE.DataTexture(
        new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat
      );
      t.needsUpdate = true;
      return t as unknown as THREE.Texture;
    };

    const earthUniforms: Record<string, THREE.IUniform> = {
      sunDir:     { value: SUN_DIR },
      time:       { value: 0.0 },
      dayTex:     { value: makeBlank(8, 22, 68) },
      specTex:    { value: makeBlank(180, 180, 180) },
      hasRealTex: { value: 0.0 },
    };

    const texLoader = new THREE.TextureLoader();
    texLoader.load("/textures/earth-color.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      (earthUniforms.dayTex as THREE.IUniform).value    = tex;
      (earthUniforms.hasRealTex as THREE.IUniform).value = 1.0;
    });
    texLoader.load("/textures/earth-specular.jpg", (tex) => {
      (earthUniforms.specTex as THREE.IUniform).value = tex;
    }, undefined, () => {});

    const earthGeo = new THREE.SphereGeometry(1, 128, 64);
    const earthMat = new THREE.ShaderMaterial({
      uniforms: earthUniforms,
      vertexShader: `
        varying vec3 vNormal; varying vec2 vUv;
        void main(){
          vNormal=normalize(normalMatrix*normal); vUv=uv;
          gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
        }
      `,
      fragmentShader: `
        uniform vec3 sunDir; uniform float time; uniform float hasRealTex;
        uniform sampler2D dayTex; uniform sampler2D specTex;
        varying vec3 vNormal; varying vec2 vUv;

        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}

        void main(){
          vec3 N=normalize(vNormal);
          float sunDot=dot(N,sunDir);
          vec2 uv=vUv;

          // Real texture (boosted saturation + contrast)
          vec3 texDay=texture2D(dayTex,uv).rgb;
          float lum=dot(texDay,vec3(.299,.587,.114));
          texDay=mix(vec3(lum),texDay,1.45);
          texDay=pow(texDay,vec3(.88));

          // Procedural fallback before texture loads
          float c1=fbm(uv*3.7+vec2(2.1,.8)), c2=fbm(uv*2.2+vec2(5.4,4.2));
          float landP=smoothstep(.49,.535,c1*.62+c2*.38);
          float lat=abs(uv.y-.5)*2.; float ice=smoothstep(.76,.93,lat);
          landP=max(landP,ice);
          float det=fbm(uv*7.2+vec2(3.1,1.4));
          vec3 oceanP=mix(vec3(.01,.05,.20),vec3(.03,.13,.38),fbm(uv*4.5)*.7);
          vec3 terrP=mix(mix(vec3(.05,.17,.04),vec3(.10,.27,.06),det),
                         mix(vec3(.37,.27,.09),vec3(.52,.40,.16),det),
                         smoothstep(.33,.68,det)*.55);
          vec3 dayP=mix(oceanP,terrP,landP); dayP=mix(dayP,vec3(.83,.92,1.),ice*.9);

          vec3 dayCol=mix(dayP,texDay,hasRealTex);

          // Ocean specular
          float specMask=texture2D(specTex,uv).r;
          float oceanMask=mix(1.-landP,specMask,hasRealTex);
          float landFinal=mix(landP,1.-step(.35,specMask),hasRealTex);

          float diff=max(0.,sunDot);
          float spec=pow(max(0.,sunDot),60.)*oceanMask*.90;
          dayCol=dayCol*(0.02+diff*1.18)+vec3(1.,.96,.86)*spec;
          dayCol+=landFinal*diff*.08*vec3(1.,.94,.84);

          // Night city lights
          float cn=fbm(uv*13.)*fbm(uv*27.+vec2(2.,3.5));
          float cities=pow(max(0.,cn),1.7)*(1.-ice)*clamp(landFinal*2.2,0.,1.);
          vec3 cityGlow=mix(vec3(1.,.68,.26),vec3(1.,.90,.58),cn)*cities*4.2;

          float term=smoothstep(-.10,.14,sunDot);
          vec3 color=mix(cityGlow,dayCol,term);

          // Rim atmosphere
          float fr=pow(1.-abs(dot(N,vec3(0,0,1))),2.5);
          color+=vec3(.18,.44,1.)*fr*.24*max(0.,sunDot+.55);

          gl_FragColor=vec4(color,1.);
        }
      `,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // ── Clouds ────────────────────────────────────────────────────────────
    const cloudUniforms = { time: { value: 0.0 }, sunDir: { value: SUN_DIR } };
    const cloudGeo = new THREE.SphereGeometry(1.019, 96, 48);
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: cloudUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vUv; varying vec3 vN; void main(){vUv=uv;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        uniform float time; uniform vec3 sunDir;
        varying vec2 vUv; varying vec3 vN;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.2;a*=.45;}return v;}
        void main(){
          vec2 uv=vUv+vec2(time*.005,time*.0016);
          float c=fbm(uv*3.0);
          float alpha=smoothstep(.44,.63,c)*.78;
          float lit=max(0.,dot(normalize(vN),sunDir));
          vec3 col=mix(vec3(.52,.58,.72),vec3(1.,1.,1.),lit*.90+.10);
          gl_FragColor=vec4(col,alpha);
        }
      `,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // ── Atmosphere ────────────────────────────────────────────────────────
    const atmoGeo = new THREE.SphereGeometry(1.075, 64, 32);
    scene.add(new THREE.Mesh(atmoGeo, new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: SUN_DIR } },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `varying vec3 vN; void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        varying vec3 vN; uniform vec3 sunDir;
        void main(){
          float f=pow(1.-abs(dot(vN,vec3(0,0,1))),2.8);
          float s=max(0.,dot(vN,sunDir));
          vec3 col=mix(vec3(.06,.22,.88),vec3(.22,.55,1.),s*.8);
          col=mix(col,vec3(.88,.50,.18),pow(s,10.)*.28); // warm horizon glow
          gl_FragColor=vec4(col,f*.68);
        }
      `,
    })));

    // ── Helpers ───────────────────────────────────────────────────────────
    function latLngTo3D(lat: number, lng: number) {
      const phi   = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)
      ).normalize();
    }
    function ease(t: number) { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

    // ── Animation ─────────────────────────────────────────────────────────
    type Phase = "idle" | "rotating" | "zooming" | "done";
    let phase: Phase = "idle";
    let phaseStart = 0, prevTime = 0;
    let startQuat  = new THREE.Quaternion();
    let targetQuat = new THREE.Quaternion();
    let targetSlug = "";
    const ROTATE_DUR = 900, ZOOM_DUR = 2200;
    const CAM_FAR = 3.35, CAM_NEAR = 0.55;
    let raf: number;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (prevTime === 0) prevTime = now;
      prevTime = now;
      earthUniforms.time.value = now * 0.001;
      cloudUniforms.time.value = now * 0.001;

      if (phase === "idle") {
        earth.rotation.y     += 0.00088;
        cloudMesh.rotation.y += 0.00098;
        if (selectedRef.current) {
          phase = "rotating"; phaseStart = now;
          targetSlug = selectedRef.current.name.toLowerCase().replace(/\s+/g, "-");
          startQuat.copy(earth.quaternion);
          targetQuat.setFromUnitVectors(
            latLngTo3D(selectedRef.current.lat, selectedRef.current.lng),
            new THREE.Vector3(0, 0, 1)
          );
        }
      }
      if (phase === "rotating") {
        const t2 = Math.min((now - phaseStart) / ROTATE_DUR, 1);
        earth.quaternion.copy(startQuat).slerp(targetQuat, ease(t2));
        cloudMesh.rotation.y += 0.0005;
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
      camera.aspect = W / H; camera.updateProjectionMatrix();
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
      atmoGeo.dispose();
      starGeo.dispose();  starMat.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div ref={overlayRef} className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: 0 }} />
    </div>
  );
}
