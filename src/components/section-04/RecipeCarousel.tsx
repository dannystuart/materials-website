"use client";

import { Canvas } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { gsap } from "@/lib/gsap";
import * as THREE from "three";
import type { RecipeMaterial } from "./materials";

type Props = {
  materials: RecipeMaterial[];
  activeIndex: number;
  variant?: "desktop" | "mobile";
};

type Pose = {
  y: number;
  scale: number;
  z: number;
  rotX: number; // degrees
  brightness: number;
};

// Three.js convention: +Y is up, +Z toward camera. We render an orthographic
// camera so 1 world unit = 1 CSS pixel. Cards stack with z controlling depth
// for the GPU's depth buffer — no compositor flattening, no popping. Rotation
// gives the fanned-deck arc.
const POSES_DESKTOP: Pose[] = [
  { y: 0, scale: 1.0, z: 0, rotX: 0, brightness: 1.0 },
  { y: 132, scale: 0.7, z: -60, rotX: 18, brightness: 0.7 },
  { y: 231, scale: 0.45, z: -130, rotX: 30, brightness: 0.45 },
];
const POSES_MOBILE: Pose[] = [
  { y: 0, scale: 1.0, z: 0, rotX: 0, brightness: 1.0 },
  { y: 84, scale: 0.7, z: -40, rotX: 18, brightness: 0.7 },
  { y: 147, scale: 0.45, z: -82, rotX: 30, brightness: 0.45 },
];

const ACTIVE_SIZE_DESKTOP = 220;
const CONTAINER_H_DESKTOP = 550;
const ACTIVE_SIZE_MOBILE = 140;
const CONTAINER_H_MOBILE = 360;

const TWEEN_DURATION = 1.2;
const TWEEN_EASE = "power3.out";
const STAGGER_PER_RING = 0.04;
const DEG2RAD = Math.PI / 180;

// Shadow plane is larger than the card to let the blur bleed past the edges.
const SHADOW_SCALE = 1.6;
// Multiplier on each pose's brightness — back cards get fainter shadows.
const SHADOW_OPACITY_FACTOR = 0.55;

function poseFor(offset: number, poses: Pose[]): Pose {
  const abs = Math.abs(offset);
  const clamped = Math.min(abs, poses.length - 1);
  const base = poses[clamped];
  const sign = Math.sign(offset);
  // Positive offset = visually below centre. Three.js Y is up, so negate y.
  // Cards face camera (fanned arc): below-centre tilts top forward (-rotX).
  return {
    ...base,
    y: -sign * base.y,
    rotX: -sign * base.rotX,
  };
}

function initialOffset(i: number, N: number): number {
  const maxPositive = Math.ceil((N - 1) / 2);
  return i <= maxPositive ? i : i - N;
}

// SDF-based rounded-rect shader. Discards fragments outside the rounded
// shape so depth writes match the visible silhouette — adjacent cards
// interpenetrate cleanly along their actual edges, not their bounding box.
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAGMENT_SHADER = /* glsl */ `
  uniform sampler2D map;
  uniform float uBrightness;
  uniform float uRadius;
  varying vec2 vUv;

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 centred = (vUv - 0.5) * 2.0;
    float d = sdRoundedBox(centred, vec2(1.0, 1.0), uRadius);
    float aa = fwidth(d) * 1.2;
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    if (alpha < 0.02) discard;
    vec4 tex = texture2D(map, vUv);
    gl_FragColor = vec4(tex.rgb * uBrightness, alpha);
  }
`;

function makeCardMaterial(texture: THREE.Texture): THREE.ShaderMaterial {
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      uBrightness: { value: 1.0 },
      uRadius: { value: 0.18 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    // Opaque queue + alphaToCoverage: depth ordering is purely depth-buffer
    // driven (no per-frame sort), and MSAA samples drive edge AA from the
    // fragment alpha. Strictly stable ordering, smooth rounded edges.
    transparent: false,
    depthWrite: true,
    depthTest: true,
  });
  mat.alphaToCoverage = true;
  return mat;
}

// Soft rounded-rect SDF as a drop shadow. Rendered transparent behind each
// card; depth-tested so the card occludes the centre and the shadow only
// reads where it bleeds past the card silhouette onto neighbours behind it.
const SHADOW_FRAGMENT_SHADER = /* glsl */ `
  uniform float uOpacity;
  varying vec2 vUv;

  float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 centred = (vUv - 0.5) * 2.0;
    // Shape sized to roughly match the card silhouette inside the larger
    // shadow plane, with a broad soft falloff for the deep-but-subtle feel.
    float d = sdRoundedBox(centred, vec2(0.45, 0.45), 0.15);
    float alpha = 1.0 - smoothstep(-0.2, 0.55, d);
    // Square for a slower, deeper falloff curve.
    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha * alpha * uOpacity);
  }
`;

function makeShadowMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uOpacity: { value: 0.0 },
    },
    vertexShader: VERTEX_SHADER,
    fragmentShader: SHADOW_FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });
}

function CarouselScene({
  materials,
  activeIndex,
  poses,
  cardSize,
}: {
  materials: RecipeMaterial[];
  activeIndex: number;
  poses: Pose[];
  cardSize: number;
}) {
  const urls = useMemo(() => materials.map((m) => m.image), [materials]);
  const textures = useTexture(urls);

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 8;
      t.needsUpdate = true;
    });
  }, [textures]);

  const cardMaterials = useMemo(
    () => textures.map((t) => makeCardMaterial(t)),
    [textures],
  );
  const shadowMaterials = useMemo(
    () => materials.map(() => makeShadowMaterial()),
    [materials],
  );

  useEffect(() => {
    return () => {
      cardMaterials.forEach((m) => m.dispose());
      shadowMaterials.forEach((m) => m.dispose());
    };
  }, [cardMaterials, shadowMaterials]);

  const N = materials.length;
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const offsetsRef = useRef<number[]>(
    materials.map((_, i) => initialOffset(i, N)),
  );
  const initializedRef = useRef(false);
  const prevActiveRef = useRef(activeIndex);

  useEffect(() => {
    offsetsRef.current = materials.map((_, i) => initialOffset(i, N));
    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const pose = poseFor(offsetsRef.current[i], poses);
      mesh.position.set(0, pose.y, pose.z);
      mesh.rotation.x = pose.rotX * DEG2RAD;
      mesh.scale.setScalar(pose.scale);
      const mat = mesh.material as THREE.ShaderMaterial;
      mat.uniforms.uBrightness.value = pose.brightness;
      shadowMaterials[i].uniforms.uOpacity.value =
        pose.brightness * SHADOW_OPACITY_FACTOR;
    });
    initializedRef.current = true;
    prevActiveRef.current = 0;
  }, [N, poses, materials, shadowMaterials]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (prevActiveRef.current === activeIndex) return;

    let steps = activeIndex - prevActiveRef.current;
    if (steps < 0) steps += N;
    if (steps === 0) return;

    const minVisibleOffset = -Math.floor((N - 1) / 2);
    const lastPose = poses[poses.length - 1];
    const offTopY = lastPose.y + 220;
    const offBottomY = -lastPose.y - 220;
    const transitZ = lastPose.z - 80;

    meshRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const orig = offsetsRef.current[i];
      let next = orig - steps;
      let wrapped = false;
      while (next < minVisibleOffset) {
        next += N;
        wrapped = true;
      }
      offsetsRef.current[i] = next;
      const pose = poseFor(next, poses);
      const mat = mesh.material as THREE.ShaderMaterial;
      const bright = mat.uniforms.uBrightness;
      const shadow = shadowMaterials[i].uniforms.uOpacity;
      const shadowTarget = pose.brightness * SHADOW_OPACITY_FACTOR;

      // Single timeline per card so all channels (position, rotation, scale,
      // brightness, shadow) start at the exact same tick and progress lock-step.
      // Stagger by origin-ring: the card leaving centre moves first so the
      // slot is clear by the time the incoming card arrives — no overtaking.
      gsap.killTweensOf([mesh.position, mesh.rotation, mesh.scale, bright, shadow]);
      const tl = gsap.timeline({ delay: Math.abs(orig) * STAGGER_PER_RING });

      if (wrapped) {
        // Quick invisible exit above the top mask, longer graceful descent
        // through the bottom mask. Brightness fades to 0 at the midpoint so
        // the card emerges from black, not a half-lit pop.
        const upDur = TWEEN_DURATION * 0.35;
        const downDur = TWEEN_DURATION * 0.65;
        tl.to(
          mesh.position,
          { y: offTopY, z: transitZ, duration: upDur, ease: "power2.in" },
          0,
        )
          .to(mesh.rotation, { x: 0, duration: upDur, ease: "power2.in" }, 0)
          .to(
            mesh.scale,
            {
              x: pose.scale,
              y: pose.scale,
              z: pose.scale,
              duration: upDur,
              ease: "power2.in",
            },
            0,
          )
          .to(
            bright,
            { value: 0, duration: upDur, ease: "power2.in" },
            0,
          )
          .to(
            shadow,
            { value: 0, duration: upDur, ease: "power2.in" },
            0,
          )
          .set(mesh.position, { y: offBottomY }, upDur)
          .to(
            mesh.position,
            { y: pose.y, z: pose.z, duration: downDur, ease: TWEEN_EASE },
            upDur,
          )
          .to(
            mesh.rotation,
            { x: pose.rotX * DEG2RAD, duration: downDur, ease: TWEEN_EASE },
            upDur,
          )
          .to(
            bright,
            { value: pose.brightness, duration: downDur, ease: TWEEN_EASE },
            upDur,
          )
          .to(
            shadow,
            { value: shadowTarget, duration: downDur, ease: TWEEN_EASE },
            upDur,
          );
      } else {
        tl.to(
          mesh.position,
          { y: pose.y, z: pose.z, duration: TWEEN_DURATION, ease: TWEEN_EASE },
          0,
        )
          .to(
            mesh.rotation,
            {
              x: pose.rotX * DEG2RAD,
              duration: TWEEN_DURATION,
              ease: TWEEN_EASE,
            },
            0,
          )
          .to(
            mesh.scale,
            {
              x: pose.scale,
              y: pose.scale,
              z: pose.scale,
              duration: TWEEN_DURATION,
              ease: TWEEN_EASE,
            },
            0,
          )
          .to(
            bright,
            {
              value: pose.brightness,
              duration: TWEEN_DURATION,
              ease: TWEEN_EASE,
            },
            0,
          )
          .to(
            shadow,
            {
              value: shadowTarget,
              duration: TWEEN_DURATION,
              ease: TWEEN_EASE,
            },
            0,
          );
      }
    });

    prevActiveRef.current = activeIndex;
  }, [activeIndex, N, poses]);

  return (
    <>
      {materials.map((m, i) => (
        <mesh
          key={m.id}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
          material={cardMaterials[i]}
        >
          <planeGeometry args={[cardSize, cardSize]} />
          <mesh
            material={shadowMaterials[i]}
            position={[0, 0, -1]}
            renderOrder={-1}
          >
            <planeGeometry
              args={[cardSize * SHADOW_SCALE, cardSize * SHADOW_SCALE]}
            />
          </mesh>
        </mesh>
      ))}
    </>
  );
}

export function RecipeCarousel({
  materials,
  activeIndex,
  variant = "desktop",
}: Props) {
  const poses = variant === "desktop" ? POSES_DESKTOP : POSES_MOBILE;
  const activeSize =
    variant === "desktop" ? ACTIVE_SIZE_DESKTOP : ACTIVE_SIZE_MOBILE;
  const containerH =
    variant === "desktop" ? CONTAINER_H_DESKTOP : CONTAINER_H_MOBILE;

  return (
    <div
      className="relative shrink-0"
      style={{
        width: activeSize,
        height: containerH,
        maskImage:
          "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)",
      }}
      aria-hidden="true"
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 5000 }}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CarouselScene
            materials={materials}
            activeIndex={activeIndex}
            poses={poses}
            cardSize={activeSize}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
