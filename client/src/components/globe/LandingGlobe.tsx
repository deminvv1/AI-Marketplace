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

    // ── Milky Way — realistic with galactic core, dust lanes, varied stars ──
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
          // Galaxy band with slight warp (realistic tilt)
          float bY=uv.y-.42+sin(uv.x*6.2832)*.045;
          // Multi-scale band: narrow bright core + wider diffuse halo
          float band=exp(-bY*bY*22.)*0.90+exp(-bY*bY*6.)*0.50+exp(-bY*bY*1.8)*0.22;
          // Dust lanes: dark streaks inside the band
          float dust=fbm(vec2(uv.x*9.,uv.y*28.));
          band*=0.38+dust*0.85;
          // Galactic core: bright warm bulge (center of galaxy, x≈0.62)
          float cX=uv.x-.62, cY=bY;
          float core=exp(-(cX*cX*18.+cY*cY*55.))*1.8;
          float coreWarm=exp(-(cX*cX*8.+cY*cY*30.))*0.9;
          band+=core;
          // Stars: 5 density layers for depth
          float s1=h(floor(uv*520.));
          float s2=h(floor(uv*210.)+vec2(4.2,7.1));
          float s3=h(floor(uv*880.)+vec2(1.3,3.7));
          float s4=h(floor(uv*1500.)+vec2(9.1,2.5));
          float s5=h(floor(uv*85.) +vec2(3.3,6.8));  // very bright rare stars
          float stars=step(.981,s1)*.55+step(.988,s2)*1.25+step(.9963,s3)*2.3+step(.9991,s4)*5.0+step(.9982,s5)*8.0;
          // Color: core=warm yellow-orange, band=blue-purple, bg stars=blue/white/warm
          vec3 coreCol=mix(vec3(1.,.80,.40),vec3(1.,.92,.60),coreWarm/(core+.001));
          vec3 bandCol=mix(vec3(.45,.60,.96),vec3(.80,.65,.95),fbm(uv*2.1));
          vec3 bgCol  =mix(bandCol,coreCol,clamp(core*0.8,0.,1.));
          // Star color: warm/cool variation + rare vivid blue stars
          vec3 starCol=mix(vec3(.88,.94,1.),vec3(1.,.90,.62),h(floor(uv*60.)));
          starCol=mix(starCol,vec3(.55,.80,1.),step(.9985,h(floor(uv*220.)+vec2(5.,3.)))*0.8);
          // Combine: galaxy band uses bgCol, stars use starCol
          vec3 col=bgCol*band*.32+starCol*min(stars,5.)*.62;
          float alpha=band*.44+min(stars*.5,1.)*.95;
          gl_FragColor=vec4(col,alpha);
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

    const earthUniforms: Record<string, THREE.IUniform> = {
      sunDir:     { value: SUN_DIR },
      time:       { value: 0.0 },
      dayTex:     { value: makeBlank(10, 30, 80) as THREE.Texture },
      specTex:    { value: makeBlank(200, 200, 200) as THREE.Texture },
      hasRealTex: { value: 0.0 },
    };

    const texLoader = new THREE.TextureLoader();
    texLoader.load("/textures/earth-color.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (earthUniforms.dayTex as any).value    = tex;
      earthUniforms.hasRealTex.value = 1.0;
    });
    texLoader.load("/textures/earth-specular.jpg", (tex) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (earthUniforms.specTex as any).value = tex;
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

    // ── Comet ─────────────────────────────────────────────────────────────
    // Canvas: nucleus (right) + fading tail (left) → sprite rotated to travel dir
    const cometCvs = document.createElement("canvas");
    cometCvs.width = 320; cometCvs.height = 28;
    const cx = cometCvs.getContext("2d")!;

    // Tail — soft blue-white gradient
    const tailG = cx.createLinearGradient(0, 14, 320, 14);
    tailG.addColorStop(0,    "rgba(140,200,255,0.00)");
    tailG.addColorStop(0.35, "rgba(160,215,255,0.10)");
    tailG.addColorStop(0.65, "rgba(190,228,255,0.35)");
    tailG.addColorStop(0.85, "rgba(220,240,255,0.70)");
    tailG.addColorStop(1,    "rgba(255,255,255,0.85)");
    cx.fillStyle = tailG;
    // Narrow elongated shape
    cx.beginPath();
    cx.moveTo(0, 14);
    cx.bezierCurveTo(80, 10, 200, 9, 308, 6);
    cx.lineTo(320, 14);
    cx.bezierCurveTo(200, 19, 80, 18, 0, 14);
    cx.fill();

    // Nucleus glow
    const nucG = cx.createRadialGradient(310, 14, 0, 310, 14, 12);
    nucG.addColorStop(0,   "rgba(255,255,255,1.0)");
    nucG.addColorStop(0.25,"rgba(230,242,255,0.95)");
    nucG.addColorStop(0.6, "rgba(180,220,255,0.55)");
    nucG.addColorStop(1,   "rgba(140,200,255,0.00)");
    cx.fillStyle = nucG;
    cx.fillRect(295, 2, 25, 24);

    const cometMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(cometCvs),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const cometSprite = new THREE.Sprite(cometMat);
    cometSprite.scale.set(9, 0.55, 1);
    cometSprite.visible = false;
    scene.add(cometSprite);

    // Comet paths (start → end in world space, z deep behind earth)
    const COMET_PATHS = [
      { s: new THREE.Vector3(7, 3.5, -8),   e: new THREE.Vector3(-4, -1.5, -8) },
      { s: new THREE.Vector3(-6, 4.2, -10), e: new THREE.Vector3(5,  0.5, -10) },
      { s: new THREE.Vector3(4, -3.5, -9),  e: new THREE.Vector3(-5, 2.8, -9)  },
      { s: new THREE.Vector3(6, 2,   -11),  e: new THREE.Vector3(-2, -3,  -11) },
    ];
    const COMET_DUR    = 3200;   // ms to cross screen
    const COMET_PERIOD = 18000;  // ms between comets
    let cometStart     = -COMET_PERIOD + 5000; // first comet after ~5 s
    let cometPathIdx   = 0;

    function updateComet(now: number) {
      const elapsed = now - cometStart;

      if (elapsed < 0 || elapsed > COMET_DUR) {
        cometSprite.visible = false;
        if (elapsed > COMET_PERIOD) {
          cometStart   = now;
          cometPathIdx = (cometPathIdx + 1) % COMET_PATHS.length;
        }
        return;
      }

      const t    = elapsed / COMET_DUR; // 0 → 1
      const path = COMET_PATHS[cometPathIdx];
      const pos  = path.s.clone().lerp(path.e, t);
      cometSprite.position.copy(pos);

      // Rotate sprite so tail faces direction of travel (project to screen)
      const sp = path.s.clone().project(camera);
      const ep = path.e.clone().project(camera);
      const angle = Math.atan2(ep.y - sp.y, ep.x - sp.x);
      cometMat.rotation = angle;

      // Fade in/out
      const fade = t < 0.10 ? t / 0.10 : t > 0.85 ? (1 - t) / 0.15 : 1;
      cometMat.opacity = fade * 0.95;
      cometSprite.visible = true;
    }

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
      updateComet(now);

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
