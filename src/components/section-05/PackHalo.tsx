"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { clsx } from "@/lib/clsx";
import { useIsRendered } from "@/lib/useIsRendered";
import { useReducedMotion } from "@/components/hero/useReducedMotion";

const RING_COUNT = 3;

export type HaloPalette = {
  base: [number, number, number];
  hot: [number, number, number];
  warm: [number, number, number];
  cool: [number, number, number];
};

type Props = {
  className?: string;
  palette: HaloPalette;
  restingIntensity: number;
  viewBox: [number, number];
  center: [number, number];
  radii: [number, number, number];
  phaseOffset?: number;
  /** When set to 1, halo brightens to ~1.5× resting. Lerps asymmetrically. */
  boostRef?: React.MutableRefObject<number>;
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
  uniform float uPxPerVb;
  uniform float uReduced;
  uniform float uIntensity;
  uniform float uPhaseOffset;
  uniform vec3  uBaseCol;
  uniform vec3  uHotCol;
  uniform vec3  uWarmCol;
  uniform vec3  uCoolCol;
  uniform float uRadii[${RING_COUNT}];
  uniform float uBaseAlphas[${RING_COUNT}];
  varying vec2 vUv;

  void main() {
    float s = uPxPerVb;
    vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uCanvasSize;
    vec2 lb = (uCanvasSize - uViewBox * s) * 0.5;
    vec2 vb = (px - lb) / s;

    vec2 p = vb - uCenter;
    float d = length(p);
    float ang = atan(p.y, p.x);

    float t = mix(uTime, 0.0, uReduced);
    float breathe = 0.85 + 0.15 * sin(t * 0.35);

    float cyclePeriod = 10.0;
    float phase = mod(t + uPhaseOffset * cyclePeriod, cyclePeriod) / cyclePeriod;

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

      float warmBias = (mod(float(i), 2.0) < 0.5) ? 0.65 : 0.30;
      float coolBias = (mod(float(i), 2.0) < 0.5) ? 0.35 : 0.72;
      vec3 pulseTint   = mix(uHotCol, uWarmCol, warmBias);
      vec3 shimmerTint = mix(uHotCol, uCoolCol, coolBias);

      float shimmer = aHi * 0.85 + aHi2 * 1.10;
      float baseAlpha = uBaseAlphas[i] * band * breathe;

      float a_contrib = baseAlpha
                      + band * pulse * 0.75
                      + band * shimmer * 0.32;

      vec3 c_contrib = uBaseCol * baseAlpha;
      c_contrib += pulseTint   * (band * pulse   * 1.50
                                + bloom * pulse  * 1.35
                                + wide  * pulse  * 0.85);
      c_contrib += shimmerTint * (band * shimmer * 0.95
                                + bloom * shimmer * 0.85
                                + wide  * shimmer * 0.50);

      colOut += c_contrib;
      aOut = max(aOut, a_contrib);
    }

    gl_FragColor = vec4(colOut * uIntensity, clamp(aOut * uIntensity, 0.0, 1.0));
  }
`;

function padRadii(radii: [number, number, number]): Float32Array {
  const out = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) out[i] = radii[i] ?? 0;
  return out;
}

function defaultAlphas(): Float32Array {
  const defaults = [0.32, 0.18, 0.26];
  const out = new Float32Array(RING_COUNT);
  for (let i = 0; i < RING_COUNT; i++) out[i] = defaults[i] ?? 0.2;
  return out;
}

export function PackHalo({
  className,
  palette,
  restingIntensity,
  viewBox,
  center,
  radii,
  phaseOffset = 0,
  boostRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rendered = useIsRendered(containerRef);

  useEffect(() => {
    if (!rendered) return;
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
      return;
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
      uCanvasSize: { value: new THREE.Vector2(cssSize.w, cssSize.h) },
      uViewBox: { value: new THREE.Vector2(viewBox[0], viewBox[1]) },
      uCenter: { value: new THREE.Vector2(center[0], center[1]) },
      uPxPerVb: {
        value: Math.min(cssSize.w / viewBox[0], cssSize.h / viewBox[1]),
      },
      uReduced: { value: reduced ? 1 : 0 },
      uIntensity: { value: restingIntensity },
      uPhaseOffset: { value: phaseOffset },
      uBaseCol: { value: new THREE.Vector3(...palette.base) },
      uHotCol: { value: new THREE.Vector3(...palette.hot) },
      uWarmCol: { value: new THREE.Vector3(...palette.warm) },
      uCoolCol: { value: new THREE.Vector3(...palette.cool) },
      uRadii: { value: padRadii(radii) },
      uBaseAlphas: { value: defaultAlphas() },
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
    let smoothedIntensity = restingIntensity;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;

      elapsed += dt;
      uniforms.uTime.value = elapsed;

      const boost = boostRef?.current ?? 0;
      const target = restingIntensity * (1 + 0.5 * boost);
      // Asymmetric lerp — fast brighten on enter, slow decay on leave.
      const lerpRate = boost > 0 ? 4 : 1.7;
      smoothedIntensity += (target - smoothedIntensity) * Math.min(1, dt * lerpRate);
      uniforms.uIntensity.value = smoothedIntensity;

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
  }, [palette, restingIntensity, viewBox, center, radii, phaseOffset, boostRef, reduced, rendered]);

  return (
    <div
      ref={containerRef}
      className={clsx("pointer-events-none", className)}
      aria-hidden="true"
    />
  );
}
