"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import Lenis from "lenis";
import { ArrowUpRight } from "lucide-react";

type ExperienceHeroProps = {
  ctaHref: string;
  templateCount: number;
  userCount?: number | null;
};

const LiquidBackground = () => {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) }
    }),
    []
  );

  useFrame((state) => {
    const material = materialRef.current;
    if (!material) return;
    material.uniforms.uTime.value = state.clock.getElapsedTime();
    pointerRef.current.set(state.mouse.x, state.mouse.y);
    material.uniforms.uMouse.value.lerp(pointerRef.current, 0.05);
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={`
          uniform float uTime; uniform vec2 uMouse; varying vec2 vUv;
          void main() {
            vec2 uv = vUv; float t = uTime * 0.14;
            vec2 m = uMouse * 0.1;
            float wave = (sin(uv.x * 8.0 + t + m.x * 12.0) + sin(uv.y * 6.0 - t + m.y * 12.0)) * 0.5;
            float color = smoothstep(0.0, 1.0, wave * 0.5 + 0.5);
            gl_FragColor = vec4(mix(vec3(0.01, 0.02, 0.04), vec3(0.03, 0.05, 0.1), color), 1.0);
          }
        `}
      />
    </mesh>
  );
};

const Monolith = () => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.25;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[13, 1]} />
        <MeshDistortMaterial color="#03060d" speed={4} distort={0.4} roughness={0.1} metalness={0.95} />
      </mesh>
    </Float>
  );
};

export default function ExperienceHero({ ctaHref, templateCount, userCount }: ExperienceHeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLAnchorElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () => (typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false)
  );
  const [isMobile, setIsMobile] = useState(
    () => (typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false)
  );

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 1023px)");

    const handleReducedChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    const handleMobileChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    reducedQuery.addEventListener("change", handleReducedChange);
    mobileQuery.addEventListener("change", handleMobileChange);
    return () => {
      reducedQuery.removeEventListener("change", handleReducedChange);
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  const useInteractiveMotion = !reducedMotion && !isMobile;

  useEffect(() => {
    if (reducedMotion) return;
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true
    });

    let frameId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!revealRef.current) return;

      if (useInteractiveMotion) {
        gsap.fromTo(
          revealRef.current,
          { filter: "blur(26px)", opacity: 0, scale: 1.02 },
          { filter: "blur(0px)", opacity: 1, scale: 1, duration: 1.9, ease: "expo.out" }
        );

        gsap.from(".command-cell", {
          x: 60,
          opacity: 0,
          stagger: 0.1,
          duration: 1.3,
          ease: "power4.out",
          delay: 0.7,
          clearProps: "all"
        });
      } else {
        gsap.set(revealRef.current, { opacity: 1, filter: "blur(0px)", scale: 1 });
        gsap.set(".command-cell", { opacity: 1, x: 0 });
      }

      if (!useInteractiveMotion) return;

      const handleMouseMove = (event: MouseEvent) => {
        if (!ctaRef.current) return;
        const rect = ctaRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

        if (distance < 150) {
          gsap.to(ctaRef.current, {
            x: (event.clientX - centerX) * 0.25,
            y: (event.clientY - centerY) * 0.25,
            duration: 0.45,
            ease: "power3.out"
          });
        } else {
          gsap.to(ctaRef.current, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.28)" });
        }
      };

      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, containerRef);

    return () => ctx.revert();
  }, [useInteractiveMotion]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#03050b] selection:bg-white selection:text-black"
    >
      <div className="absolute inset-0 z-0">
        {useInteractiveMotion ? (
          <Canvas camera={{ position: [0, 0, 60], fov: 35 }}>
            <ambientLight intensity={0.35} />
            <spotLight position={[48, 48, 48]} intensity={2.4} />
            <LiquidBackground />
            <Monolith />
          </Canvas>
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_15%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(30,64,175,0.16),transparent_45%),linear-gradient(160deg,#02040a,#050915_45%,#03050b)]" />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[5] bento-mask opacity-25" />

      <div
        ref={revealRef}
        className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-10 px-6 py-8 md:flex-row md:items-stretch md:px-12 md:py-12 lg:px-16 lg:py-16"
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-12 pb-12 md:pb-8">
          <div className="flex items-center gap-3">
            <div className="relative h-2.5 w-2.5 rounded-full bg-white">
              <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />
            </div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white">
              DOSSIER CV BUILDER
            </span>
          </div>

          <div className="max-w-5xl md:-translate-y-8">
            <h1 className="text-[clamp(2.9rem,9vw,9rem)] font-black uppercase leading-[0.86] tracking-tight text-white">
              BUILD CVs THAT
              <br />
              <span className="text-outline">LOOK HIRED</span>
            </h1>
            <p className="mt-8 max-w-xl font-mono text-[11px] uppercase leading-relaxed tracking-[0.28em] text-white/45">
              Craft professional resumes with structured templates, local-first editing, and export-ready
              layouts for fintech, consulting, and project delivery roles.
            </p>
          </div>

          <Link
            href={ctaHref}
            ref={ctaRef}
            className="group inline-flex w-fit items-center gap-6 md:-translate-y-10"
          >
            <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/15 transition-all duration-500 group-hover:bg-white">
              <ArrowUpRight className="h-5 w-5 text-white transition-colors duration-500 group-hover:text-black" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              Browse Templates
            </span>
          </Link>
        </div>

        <aside className="z-20 flex w-full flex-shrink-0 flex-col justify-center gap-4 md:w-80 lg:w-96">
          {[
            {
              id: "001",
              title: "Template Library",
              value: `${templateCount}+ Styles`,
              detailA: "Fintech + Consulting",
              detailB: "Consistent PDF exports"
            },
            {
              id: "002",
              title: "Import + Export",
              value: "DOCX In / PDF Out",
              detailA: "Auto-map into sections",
              detailB: "Editable before export"
            },
            {
              id: "003",
              title: "Community",
              value: userCount !== null && userCount !== undefined ? `${userCount} Users` : "Live Count",
              detailA: "Unique visitors (local + cloud)",
              detailB: "Cloud remains per-user secured"
            }
          ].map((item) => (
            <article key={item.id} className="command-cell glass-panel p-6 sm:p-7">
              <span className="mb-3 block font-mono text-[9px] uppercase tracking-widest text-white/35">
                {`${item.id} // ${item.title}`}
              </span>
              <div className="mt-2 flex items-end justify-between gap-3">
                <h4 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{item.value}</h4>
                <div className="h-[2px] w-20 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[65%] bg-white animate-loading" />
                </div>
              </div>
              <div className="mt-4 space-y-2 font-mono text-[10px] text-white/55">
                <div className="flex items-center justify-between gap-3">
                  <span>{item.detailA}</span>
                </div>
                <div className="h-px w-full bg-white/10" />
                <div className="flex items-center justify-between gap-3">
                  <span>{item.detailB}</span>
                </div>
              </div>
            </article>
          ))}
        </aside>
      </div>
    </section>
  );
}
