"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/components/hero/useReducedMotion";
import type {
  ElementCategoryCode,
  ElementCategoryName,
} from "./ElementBox";

type Props = {
  id: string;
  symbol: ElementCategoryCode;
  category: ElementCategoryName;
  size?: number;
  decorative?: boolean;
  className?: string;
};

export function ElementBox3D({
  id,
  symbol,
  category,
  size = 88,
  decorative = true,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    let cancelled = false;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 10);
    camera.position.z = 2.6;

    const faceW = 1.35;
    const faceH = 1.35;
    const depth = 0.28;
    const geometry = new THREE.BoxGeometry(faceW, faceH, depth);

    let faceTexture = makeFaceTexture(id, symbol, category);

    const frontMat = new THREE.MeshBasicMaterial({
      map: faceTexture,
      transparent: true,
    });
    const sideMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      transparent: true,
      opacity: 0.95,
    });
    const backMat = new THREE.MeshBasicMaterial({
      color: 0x070707,
      transparent: true,
      opacity: 0.95,
    });

    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
    const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
    const mesh = new THREE.Mesh(geometry, materials);

    const edgeGeometry = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
    });
    const wire = new THREE.LineSegments(edgeGeometry, lineMat);
    mesh.add(wire);
    scene.add(mesh);

    const entered = { value: reducedMotion };

    if (reducedMotion) {
      mesh.scale.setScalar(1);
      mesh.rotation.set(0, 0, 0);
    } else {
      mesh.scale.setScalar(0.0001);
      mesh.rotation.set(-0.45, -0.7, 0);
    }

    if (typeof document !== "undefined" && document.fonts) {
      const fontSpec = '600 180px "Plus Jakarta Sans"';
      if (!document.fonts.check(fontSpec)) {
        document.fonts.ready.then(() => {
          if (cancelled) return;
          const next = makeFaceTexture(id, symbol, category);
          frontMat.map = next;
          frontMat.needsUpdate = true;
          faceTexture.dispose();
          faceTexture = next;
        });
      }
    }

    const t0 = performance.now();
    let raf = 0;
    const render = () => {
      if (cancelled) return;
      if (!reducedMotion && entered.value) {
        const t = (performance.now() - t0) / 1000;
        mesh.rotation.y = 0.28 * Math.sin(t * 0.55);
        mesh.rotation.x = 0.14 * Math.sin(t * 0.4 + 1.0);
        mesh.rotation.z = 0.06 * Math.sin(t * 0.32 + 2.2);
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    let scaleTween: gsap.core.Tween | null = null;
    let rotTween: gsap.core.Tween | null = null;
    let io: IntersectionObserver | null = null;
    if (!reducedMotion) {
      const fire = () => {
        if (scaleTween || rotTween) return;
        entered.value = true;
        scaleTween = gsap.fromTo(
          mesh.scale,
          { x: 0.0001, y: 0.0001, z: 0.0001 },
          { x: 1, y: 1, z: 1, duration: 1.1, ease: "power3.out" },
        );
        rotTween = gsap.fromTo(
          mesh.rotation,
          { x: -0.45, y: -0.7 },
          { x: 0, y: 0, duration: 1.3, ease: "power3.out" },
        );
      };
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              fire();
              io?.disconnect();
              io = null;
              break;
            }
          }
        },
        { rootMargin: "0px 0px -15% 0px", threshold: 0 },
      );
      io.observe(host);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      scaleTween?.kill();
      rotTween?.kill();
      geometry.dispose();
      edgeGeometry.dispose();
      faceTexture.dispose();
      frontMat.dispose();
      sideMat.dispose();
      backMat.dispose();
      lineMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [id, symbol, category, size, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden={decorative || undefined}
      role={decorative ? "presentation" : undefined}
      data-element-box-3d
    />
  );
}

function makeFaceTexture(
  id: string,
  symbol: string,
  category: string,
): THREE.CanvasTexture {
  const px = 512;
  const canvas = document.createElement("canvas");
  canvas.width = px;
  canvas.height = px;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, px, px);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, px - 4, px - 4);

  const pad = 56;
  const family = '"Plus Jakarta Sans", system-ui, sans-serif';

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 64px ${family}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  drawTrackedText(ctx, id, pad, pad, 0.12, 64);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 180px ${family}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(symbol, pad, px - pad - 90);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 52px ${family}`;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  drawTrackedText(ctx, category.toUpperCase(), pad, px - pad, 0.18, 52);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function drawTrackedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  trackingEm: number,
  fontPx: number,
) {
  const extra = trackingEm * fontPx;
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + extra;
  }
}
