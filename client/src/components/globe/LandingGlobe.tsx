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
  useEffect(() => { routerRef.current   = router; },         [router]);

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
    camera.position.set(0, 0.22, 3.35);

    // ── Milky Way background ──────────────────────────────────────────────
    const mwMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        varying vec2 vUv;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.1;a*=.5;}return v;}
        void main(){
          vec2 uv=vUv;
          float bY=uv.y-.40+sin(uv.x*3.14159)*.06;
          float band=exp(-bY*bY*13.)*0.6+exp(-bY*bY*3.8)*.28;
          band*=.5+fbm(vec2(uv.x*5.5,uv.y*14.));
          float s1=h(floor(uv*420.)),s2=h(floor(uv*175.)+vec2(4.2,7.1)),s3=h(floor(uv*720.)+vec2(1.3,3.7)),s4=h(floor(uv*1300.)+vec2(9.1,2.5));
          float stars=step(.983,s1)*.65+step(.989,s2)*1.3+step(.9968,s3)*2.5+step(.9992,s4)*4.;
          vec3 gc=mix(vec3(.50,.62,.96),vec3(1.,.82,.75),fbm(uv*2.3));
          vec3 sc=mix(vec3(.88,.94,1.),vec3(1.,.90,.70),h(floor(uv*75.)));
          vec3 col=gc*band*.18+sc*min(stars,3.)*.55;
          gl_FragColor=vec4(col,band*.25+min(stars,1.)*.92);
        }
      `,
    });
    const mwGeo  = new THREE.SphereGeometry(500, 64, 32);
    const mwMesh = new THREE.Mesh(mwGeo, mwMat);
    scene.add(mwMesh);

    // ── Sun direction (dramatic side light, like Universal Pictures) ───────
    const SUN_DIR = new THREE.Vector3(4.0, 1.0, 3.2).normalize();

    scene.add(new THREE.AmbientLight(0x04091a, 0.6));
    const sunLight = new THREE.DirectionalLight(0xfff2d8, 3.0);
    sunLight.position.copy(SUN_DIR.clone().multiplyScalar(10));
    scene.add(sunLight);

    // ── Earth — texture + day/night shader ────────────────────────────────
    // 1-pixel default textures so shader runs before real textures load
    const makeBlank = (r: number, g: number, b: number) => {
      const t = new THREE.DataTexture(new Uint8Array([r, g, b, 255]), 1, 1, THREE.RGBAFormat);
      t.needsUpdate = true;
      return t;
    };

    const earthUniforms = {
      sunDir:     { value: SUN_DIR },
      time:       { value: 0.0 },
      dayTex:     { value: makeBlank(10, 30, 80) },   // ocean blue fallback
      specTex:    { value: makeBlank(200, 200, 200) }, // all shiny fallback
      hasRealTex: { value: 0.0 },
    };

    const texLoader = new THREE.TextureLoader();
    texLoader.load("/textures/earth-color.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      earthUniforms.dayTex.value    = tex;
      earthUniforms.hasRealTex.value = 1.0;
    });
    texLoader.load("/textures/earth-specular.jpg", (tex) => {
      earthUniforms.specTex.value = tex;
    }, undefined, () => {/* optional */});

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

          // ── Day color: real texture OR procedural fallback ──────────────
          vec3 texDay=pow(texture2D(dayTex,uv).rgb, vec3(1.0));

          // Boost texture contrast and saturation for cinematic look
          float lum=dot(texDay,vec3(.299,.587,.114));
          texDay=mix(vec3(lum),texDay,1.4); // saturate
          texDay=pow(texDay,vec3(0.85));    // slight gamma lift

          // Procedural fallback (visible before texture loads)
          float c1=fbm(uv*3.7+vec2(2.1,.8)), c2=fbm(uv*2.2+vec2(5.4,4.2));
          float landP=smoothstep(.490,.535,c1*.62+c2*.38);
          float lat=abs(uv.y-.5)*2.; float ice=smoothstep(.76,.93,lat); landP=max(landP,ice);
          float det=fbm(uv*7.2+vec2(3.1,1.4));
          vec3 oceanP=mix(vec3(.01,.05,.20),vec3(.03,.13,.38),fbm(uv*5.)*.7);
          vec3 grassP=mix(vec3(.05,.17,.04),vec3(.10,.27,.06),det);
          vec3 desP  =mix(vec3(.37,.27,.09),vec3(.52,.40,.16),det);
          vec3 terrP =mix(grassP,desP,smoothstep(.33,.68,det)*.55);
          vec3 dayP  =mix(oceanP,terrP,landP); dayP=mix(dayP,vec3(.83,.92,1.),ice*.9);

          vec3 dayCol=mix(dayP, texDay, hasRealTex);

          // ── Ocean specular ──────────────────────────────────────────────
          // specTex: white=ocean/shiny, dark=land/matte
          float specMask=texture2D(specTex,uv).r;
          // For procedural: ocean is 1-landP
          float oceanMask=mix(1.-landP, specMask, hasRealTex);

          float diff=max(0.,sunDot);
          float spec=pow(max(0.,sunDot),60.)*oceanMask*.85;
          dayCol=dayCol*(0.025+diff*1.18)+vec3(1.,.96,.86)*spec;

          // Slightly brighten land on day side (more vivid continents)
          float landMaskFinal=mix(landP, 1.-step(.35,specMask), hasRealTex);
          dayCol+=landMaskFinal*diff*0.08*vec3(1.,.95,.85);

          // ── Night city lights ────────────────────────────────────────────
          float cn=fbm(uv*13.5)*fbm(uv*27.+vec2(2.,3.5));
          float cities=pow(max(0.,cn),1.65)*(1.-ice)*clamp(landMaskFinal*2.2,0.,1.);
          vec3 cityGlow=mix(vec3(1.,.68,.26),vec3(1.,.90,.58),cn)*cities*4.5;

          // ── Terminator ───────────────────────────────────────────────────
          float term=smoothstep(-.09,.14,sunDot);
          vec3 color=mix(cityGlow,dayCol,term);

          // ── Atmospheric rim scatter ──────────────────────────────────────
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
    const cloudGeo = new THREE.SphereGeometry(1.020, 96, 48);
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: cloudUniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: `varying vec2 vUv; varying vec3 vNormal; void main(){vUv=uv;vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        uniform float time; uniform vec3 sunDir;
        varying vec2 vUv; varying vec3 vNormal;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
        float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.2;a*=.45;}return v;}
        void main(){
          vec2 uv=vUv+vec2(time*.0052,time*.0017);
          float c=fbm(uv*3.0);
          float alpha=smoothstep(.43,.63,c)*.82;
          float lit=max(0.,dot(normalize(vNormal),sunDir));
          // Bright lit side, grey dark side
          vec3 col=mix(vec3(.55,.60,.72),vec3(1.,1.,1.),lit*.88+.12);
          gl_FragColor=vec4(col,alpha);
        }
      `,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // ── Atmosphere ────────────────────────────────────────────────────────
    const atmoGeo = new THREE.SphereGeometry(1.075, 64, 32);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { sunDir: { value: SUN_DIR } },
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `varying vec3 vNormal; void main(){vNormal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        varying vec3 vNormal; uniform vec3 sunDir;
        void main(){
          float f=pow(1.-abs(dot(vNormal,vec3(0,0,1))),2.8);
          float s=max(0.,dot(vNormal,sunDir));
          vec3 col=mix(vec3(.08,.26,.88),vec3(.28,.58,1.),s*.75);
          // Add warm horizon on sun side
          col=mix(col,vec3(.9,.55,.2),pow(s,8.)*.35);
          gl_FragColor=vec4(col,f*.65);
        }
      `,
    });
    scene.add(new THREE.Mesh(atmoGeo, atmoMat));

    // ── Orbital ring ──────────────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(1.46, 0.0020, 8, 256);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x7788cc, transparent: true, opacity: 0.38 });
    const ring    = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.12;
    ring.rotation.z = Math.PI * 0.04;
    scene.add(ring);

    // ── Sun glow sprite ───────────────────────────────────────────────────
    const gc = document.createElement("canvas");
    gc.width = 64; gc.height = 64;
    const gx = gc.getContext("2d")!;
    const gr = gx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0,    "rgba(255,245,200,1)");
    gr.addColorStop(0.25, "rgba(255,235,160,0.5)");
    gr.addColorStop(1,    "rgba(255,200,100,0)");
    gx.fillStyle = gr; gx.fillRect(0, 0, 64, 64);
    const sunSprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(gc),
      transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    sunSprite.scale.set(2.8, 2.8, 1);
    sunSprite.position.copy(SUN_DIR.clone().multiplyScalar(9));
    scene.add(sunSprite);

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
    let phaseStart = 0;
    let startQuat  = new THREE.Quaternion();
    let targetQuat = new THREE.Quaternion();
    let targetSlug = "";
    let prevTime   = 0;
    const ROTATE_DUR = 900, ZOOM_DUR = 2200;
    const CAM_FAR = 3.35, CAM_NEAR = 0.55;
    let raf: number;

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (prevTime === 0) prevTime = now;
      prevTime = now;

      const t = now * 0.001;
      earthUniforms.time.value = t;
      cloudUniforms.time.value = t;

      if (phase === "idle") {
        earth.rotation.y     += 0.00092;
        cloudMesh.rotation.y += 0.00102;
        ring.rotation.y      += 0.00036;

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
      atmoGeo.dispose();  atmoMat.dispose();
      ringGeo.dispose();  ringMat.dispose();
      mwGeo.dispose();    mwMat.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={containerRef} className="absolute inset-0">
      <div ref={overlayRef} className="absolute inset-0 bg-white pointer-events-none" style={{ opacity: 0 }} />
    </div>
  );
}
