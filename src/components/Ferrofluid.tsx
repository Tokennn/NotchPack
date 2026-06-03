import React, { useEffect, useRef } from 'react';

export interface FerrofluidProps {
  className?: string;
  dpr?: number;
  paused?: boolean;
  colors?: string[];
  backgroundColor?: string;
  speed?: number;
  scale?: number;
  turbulence?: number;
  fluidity?: number;
  rimWidth?: number;
  sharpness?: number;
  shimmer?: number;
  glow?: number;
  flowDirection?: 'up' | 'down' | 'left' | 'right';
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  mouseDampening?: number;
  mixBlendMode?: string;
}

type RGB = [number, number, number];
const MAX_COLORS = 8;

const hexToRGB = (hex: string): RGB => {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
};

const prepColors = (input?: string[]) => {
  const base = (input?.length ? input : ['#4F46E5', '#06B6D4', '#E0F2FE']).slice(0, MAX_COLORS);
  const count = base.length;
  const arr: RGB[] = Array.from({ length: MAX_COLORS }, (_, i) =>
    hexToRGB(base[Math.min(i, count - 1)])
  );
  const avg: RGB = arr.slice(0, count).reduce<RGB>(
    (a, c) => [a[0] + c[0] / count, a[1] + c[1] / count, a[2] + c[2] / count],
    [0, 0, 0]
  );
  return { arr, count, avg };
};

const flowVec = (d?: string): [number, number] => {
  switch (d) {
    case 'up':    return [0, 1];
    case 'left':  return [-1, 0];
    case 'right': return [1, 0];
    default:      return [0, -1];
  }
};

// ── Shaders ──────────────────────────────────────────────────────────────

const VERT = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec2  uFlow;
uniform float uSpeed;
uniform float uScale;
uniform float uTurbulence;
uniform float uFluidity;
uniform float uRimWidth;
uniform float uSharpness;
uniform float uShimmer;
uniform float uGlow;
uniform float uOpacity;
uniform float uMouseEnabled;
uniform float uMouseStrength;
uniform float uMouseRadius;

varying vec2 vUv;

#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount < 1 ? 1 : uColorCount;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}

float sinlerp(float a, float b, float w) {
  return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0);
}

float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s);
  vec2 relp  = mod(p, s);
  float g1 = hash(vec3(cellp, seed));
  float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed));
  float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx  = sinlerp(g1, g2, relp.x / s);
  float tx  = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}

float dbn(vec2 p, float s, float seed) {
  float o  = s / 2.0;
  float n0 = vn(p, s, seed);
  float n1 = vn(p + vec2(o,  o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2);
  float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o,-o), s, seed + 0.4);
  return (2.0*n0 + 1.5*n1 + 1.25*n2 + 1.125*n3 + n4) / 7.0;
}

void main() {
  float ref = 700.0 / max(uScale, 0.05);
  vec2 p = vUv * iResolution.xy / iResolution.y * ref;

  float spd = 200.0 * uSpeed;
  float t   = iTime;

  vec2 dir  = uFlow;
  vec2 perp = vec2(-dir.y, dir.x);

  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;

  float peaks  = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);

  float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));

  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2  mp = iMouse / iResolution.y * ref;
    float md = length(p - mp) / ref;
    float rr = max(uMouseRadius, 0.02);
    mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
  }

  float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
  float ltn  = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  ltn = pow(ltn, uSharpness) * uGlow;
  ltn *= clamp(1.0 - mGlow, 0.0, 1.0);

  float h   = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0);
  vec3  col = palette(h);
  vec3  outc = col * ltn;
  float a   = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
  gl_FragColor = vec4(outc, a * uOpacity);
}
`;

// ── Helpers ───────────────────────────────────────────────────────────────

function createShader(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(s));
  }
  return s;
}

function createProgram(gl: WebGLRenderingContext, vert: string, frag: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, createShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(p, createShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(p));
  }
  return p;
}

// ── Component ─────────────────────────────────────────────────────────────

const Ferrofluid: React.FC<FerrofluidProps> = ({
  className,
  dpr,
  paused = false,
  colors = ['#ffffff', '#ffffff', '#ffffff'],
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  rimWidth = 0.2,
  sharpness = 2.5,
  shimmer = 1.5,
  glow = 2,
  flowDirection = 'down',
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.35,
  mouseDampening = 0.15,
  mixBlendMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef       = useRef<number>(0);
  const mouseTarget  = useRef<[number, number]>([0, 0]);
  const mouseCurrent = useRef<[number, number]>([0, 0]);
  const lastT        = useRef<number>(0);
  const pausedRef    = useRef(paused);
  pausedRef.current  = paused;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pixelRatio = dpr ?? (window.devicePixelRatio || 1);

    // Canvas setup
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })!;
    if (!gl) return;

    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const prog = createProgram(gl, VERT, FRAG);
    gl.useProgram(prog);

    // Full-screen triangle
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'aPosition');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const U = (name: string) => gl.getUniformLocation(prog, name);
    const uRes      = U('iResolution');
    const uMouse    = U('iMouse');
    const uTime     = U('iTime');
    const uFlow     = U('uFlow');
    const uSpeed    = U('uSpeed');
    const uScale    = U('uScale');
    const uTurb     = U('uTurbulence');
    const uFluid    = U('uFluidity');
    const uRimW     = U('uRimWidth');
    const uSharp    = U('uSharpness');
    const uShimm    = U('uShimmer');
    const uGlow_    = U('uGlow');
    const uOpacity_ = U('uOpacity');
    const uMEn      = U('uMouseEnabled');
    const uMStr     = U('uMouseStrength');
    const uMRad     = U('uMouseRadius');
    const uCCount   = U('uColorCount');

    const { arr, count } = prepColors(colors);
    for (let i = 0; i < MAX_COLORS; i++) {
      gl.uniform3fv(U(`uColor${i}`), arr[i]);
    }
    gl.uniform1i(uCCount, count);

    const fv = flowVec(flowDirection);
    gl.uniform2fv(uFlow,  fv);
    gl.uniform1f(uSpeed,    speed);
    gl.uniform1f(uScale,    scale);
    gl.uniform1f(uTurb,     turbulence);
    gl.uniform1f(uFluid,    fluidity);
    gl.uniform1f(uRimW,     rimWidth);
    gl.uniform1f(uSharp,    sharpness);
    gl.uniform1f(uShimm,    shimmer);
    gl.uniform1f(uGlow_,    glow);
    gl.uniform1f(uOpacity_, opacity);
    gl.uniform1f(uMEn,      mouseInteraction ? 1 : 0);
    gl.uniform1f(uMStr,     mouseStrength);
    gl.uniform1f(uMRad,     mouseRadius);

    // Resize
    const resize = () => {
      const w = Math.floor(container.clientWidth  * pixelRatio);
      const h = Math.floor(container.clientHeight * pixelRatio);
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform3f(uRes, w, h, 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Mouse
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseTarget.current = [
        (e.clientX - rect.left) * pixelRatio,
        (rect.height - (e.clientY - rect.top)) * pixelRatio,
      ];
      if (mouseDampening <= 0) mouseCurrent.current = [...mouseTarget.current];
    };
    if (mouseInteraction) canvas.addEventListener('pointermove', onMove);

    // Render loop
    const loop = (t: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (pausedRef.current) return;

      const dt = lastT.current ? (t - lastT.current) / 1000 : 0;
      lastT.current = t;

      if (mouseDampening > 0 && dt > 0) {
        const tau = Math.max(1e-4, mouseDampening);
        const f   = 1 - Math.exp(-dt / tau);
        mouseCurrent.current[0] += (mouseTarget.current[0] - mouseCurrent.current[0]) * f;
        mouseCurrent.current[1] += (mouseTarget.current[1] - mouseCurrent.current[1]) * f;
      }

      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2fv(uMouse, mouseCurrent.current);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (mouseInteraction) canvas.removeEventListener('pointermove', onMove);
      ro.disconnect();
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, [
    dpr, colors, speed, scale, turbulence, fluidity, rimWidth, sharpness,
    shimmer, glow, flowDirection, opacity, mouseInteraction, mouseStrength,
    mouseRadius, mouseDampening,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-hidden ${className ?? ''}`}
      style={mixBlendMode ? { mixBlendMode: mixBlendMode as React.CSSProperties['mixBlendMode'] } : undefined}
    />
  );
};

export default Ferrofluid;
