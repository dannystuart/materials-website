"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { clsx } from "@/lib/clsx";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import type { PointerTargetRef } from "./useSectionPointer";

const RING_COUNT = 5;

type Props = {
  className?: string;
  viewBox: [number, number];
  center: [number, number];
  radii: number[];
  baseAlphas?: number[];
  pointer?: PointerTargetRef;
  parallax?: [number, number];
};

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uCanvasSize;
  uniform vec2  uViewBox;
  uniform vec2  uCenter;
  uniform vec2  uPointer;
  uniform vec2  uParallax;
  uniform float uPxPerVb;
  uniform float uReduced;
  uniform float uRadii[${RING_COUNT}];
  uniform float uBaseAlphas[${RING_COUNT}];
  varying vec2 vUv;

  void main() {
    float s = uPxPerVb;
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uCanvasSize;
    vec2 lb = (uCanvasSize - uViewBox * s) * 0.5;
    vec2 vb = (px - lb) / s;

    vec2 p = vb - (uCenter + uPointer * uParallax);
    float d = length(p);
    float ang = atan(p.y, p.x);

    vec3 baseCol = vec3(0.655, 0.769, 0.910);
    vec3 hotCol  = vec3(0.96, 0.98, 1.00);
    vec3 warmCol = vec3(1.00, 0.62, 0.30);
    vec3 coolCol = vec3(0.42, 0.68, 1.00);

    float t = mix(uTime, 0.0, uReduced);
    float breathe = 0.85 + 0.15 * sin(t * 0.35);

    float cyclePeriod = 7.0;
    float phase = mod(t, cyclePeriod) / cyclePeriod;

    vec3 colOut = vec3(0.0);
    float aOut = 0.0;

    float halfThickPx = 0.55;
    float aaPx = 0.85;
    float bloomFalloffPx = 13.0;
    float wideFalloffPx = 36.0;

    for (int i = 0; i < ${RING_COUNT}; i++) {
      float r = uRadii[i];
      if (r <= 0.0) continue;
      float distPx = abs(d - r) * s;
      float band = 1.0 - smoothstep(halfThickPx, halfThickPx + aaPx, distPx);
      float bloom = exp(-distPx / bloomFalloffPx);
      float wide  = exp(-distPx / wideFalloffPx) * 0.8;

      float dir = mod(float(i), 2.0) < 0.5 ? 1.0 : -1.0;
      float rotSpeed = 0.06 + float(i) * 0.014;
      float a = ang + t * rotSpeed * dir;

      float aHi  = pow(0.5 + 0.5 * cos(a), 22.0);
      float aHi2 = pow(0.5 + 0.5 * cos(a + 3.14159), 80.0) * 0.45;

      float ringPhase = float(i) / float(${RING_COUNT});
      float slot = 1.0 / float(${RING_COUNT});
      float local = mod(phase - ringPhase + 1.0, 1.0);
      float riseEnd = slot * 0.22;
      float pulse = smoothstep(0.0, riseEnd, local) *
                    (1.0 - smoothstep(riseEnd, slot, local));
      pulse *= (1.0 - uReduced);

      // Alternate warm/cool chromatic bias per ring — touch of orange on
      // even rings, touch of blue on odd, white-hot core throughout.
      float warmBias = (mod(float(i), 2.0) < 0.5) ? 0.65 : 0.30;
      float coolBias = (mod(float(i), 2.0) < 0.5) ? 0.35 : 0.72;
      vec3 pulseTint   = mix(hotCol, warmCol, warmBias);
      vec3 shimmerTint = mix(hotCol, coolCol, coolBias);

      float shimmer = aHi * 0.85 + aHi2 * 1.10;
      float baseAlpha = uBaseAlphas[i] * band * breathe;

      // Alpha — hairline first, bumps from active highlights so the ring
      // reads sharper when it's lit.
      float a_contrib = baseAlpha
                      + band * pulse * 0.75
                      + band * shimmer * 0.32;

      // RGB — additive light. Bloom + wide falloff carry the glow out
      // beyond the hairline so bright moments actually emit.
      vec3 c_contrib = baseCol * baseAlpha;
      c_contrib += pulseTint   * (band * pulse   * 1.50
                                + bloom * pulse  * 1.35
                                + wide  * pulse  * 0.85);
      c_contrib += shimmerTint * (band * shimmer * 0.95
                                + bloom * shimmer * 0.85
                                + wide  * shimmer * 0.50);

      colOut += c_contrib;
      aOut = max(aOut, a_contrib);
    }

    gl_FragColor = vec4(colOut, clamp(aOut, 0.0, 1.0));
  }
`;

function padRadii(radii: number[]): Float32Array {
  const out = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) out[i] = radii[i] ?? 0;
  return out;
}

function padAlphas(alphas: number[] | undefined): Float32Array {
  const defaults = [0.32, 0.16, 0.3, 0.16, 0.26];
  const out = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) out[i] = alphas?.[i] ?? defaults[i] ?? 0.2;
  return out;
}

export function PitchOrbits({
  className,
  viewBox,
  center,
  radii,
  baseAlphas,
  pointer,
  parallax = [14, 8],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      });
    } catch {
      return; // No WebGL — fallback layer in JSX will cover.
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const cssSize = { w: container.clientWidth, h: container.clientHeight };

    const uniforms = {
      uTime: { value: 0 },
      uCanvasSize: {
        value: new THREE.Vector2(cssSize.w, cssSize.h),
      },
      uViewBox: { value: new THREE.Vector2(viewBox[0], viewBox[1]) },
      uCenter: { value: new THREE.Vector2(center[0], center[1]) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uParallax: { value: new THREE.Vector2(parallax[0], parallax[1]) },
      uPxPerVb: {
        value: Math.min(cssSize.w / viewBox[0], cssSize.h / viewBox[1]),
      },
      uReduced: { value: reduced ? 1 : 0 },
      uRadii: { value: padRadii(radii) },
      uBaseAlphas: { value: padAlphas(baseAlphas) },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer.setSize(cssSize.w, cssSize.h, false);
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    function applySize() {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === cssSize.w && h === cssSize.h) return;
      cssSize.w = w;
      cssSize.h = h;
      renderer.setSize(w, h, false);
      uniforms.uCanvasSize.value.set(w, h);
      uniforms.uPxPerVb.value = Math.min(w / viewBox[0], h / viewBox[1]);
    }

    const ro = new ResizeObserver(applySize);
    ro.observe(container);

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(container);

    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    const ptrSmoothed = new THREE.Vector2(0, 0);
    const ptrTmp = new THREE.Vector2(0, 0);

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;

      elapsed += dt;
      uniforms.uTime.value = elapsed;

      if (pointer && !reduced) {
        ptrTmp.set(pointer.current.x, pointer.current.y);
        ptrSmoothed.lerp(ptrTmp, Math.min(1, dt * 4.5));
        uniforms.uPointer.value.copy(ptrSmoothed);
      }

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (canvas.parentNode === container) container.removeChild(canvas);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [viewBox, center, radii, baseAlphas, pointer, parallax, reduced]);

  return (
    <div
      ref={containerRef}
      className={clsx("pointer-events-none", className)}
      aria-hidden="true"
    />
  );
}
