"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/*  Text Scramble                                                      */
/* ------------------------------------------------------------------ */
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&";

export function useTextScramble(ref: React.RefObject<HTMLElement | null>, text: string, delay = 0) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) {
      if (el) el.textContent = text;
      return;
    }

    el.textContent = "";
    const chars = text.split("");
    const iterations = 12;
    let frame = 0;
    const totalFrames = chars.length * 3 + iterations;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        el.textContent = chars
          .map((char, i) => {
            if (char === " ") return " ";
            const revealAt = i * 3;
            if (frame > revealAt + iterations) return char;
            if (frame > revealAt) {
              return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
            }
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join("");

        frame++;
        if (frame > totalFrames) {
          clearInterval(interval);
          el.textContent = text;
        }
      }, 30);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [ref, text, delay]);
}

/* ------------------------------------------------------------------ */
/*  Word Reveal (clip-mask stagger)                                    */
/* ------------------------------------------------------------------ */
export function useWordReveal(containerRef: React.RefObject<HTMLElement | null>, delay = 0.3) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const words = container.querySelectorAll<HTMLElement>("[data-reveal-word]");
    if (words.length === 0) return;

    gsap.set(words, { yPercent: 110, opacity: 0 });

    const tl = gsap.timeline({ delay });
    tl.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      ease: "power4.out",
      stagger: 0.1,
    });

    return () => { tl.kill(); };
  }, [containerRef, delay]);
}

/* ------------------------------------------------------------------ */
/*  Outline Text Scale Reveal                                          */
/* ------------------------------------------------------------------ */
export function useOutlineReveal(ref: React.RefObject<HTMLElement | null>, delay = 1.0) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.set(el, { opacity: 0, scale: 0.92 });
    const tween = gsap.to(el, {
      opacity: 1,
      scale: 1,
      duration: 1.2,
      ease: "power3.out",
      delay,
    });

    return () => { tween.kill(); };
  }, [ref, delay]);
}

/* ------------------------------------------------------------------ */
/*  Fade Up                                                            */
/* ------------------------------------------------------------------ */
export function useFadeUp(ref: React.RefObject<HTMLElement | null>, delay = 1.4) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.set(el, { opacity: 0, y: 40 });
    const tween = gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      delay,
    });

    return () => { tween.kill(); };
  }, [ref, delay]);
}

/* ------------------------------------------------------------------ */
/*  Staggered Card Entrance                                            */
/* ------------------------------------------------------------------ */
export function useCardEntrance(containerRef: React.RefObject<HTMLElement | null>, delay = 1.2) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion()) return;

    const cards = container.querySelectorAll<HTMLElement>("[data-card]");
    if (cards.length === 0) return;

    gsap.set(cards, { opacity: 0, y: 60, scale: 0.97 });

    const tl = gsap.timeline({ delay });
    tl.to(cards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.15,
    });

    return () => { tl.kill(); };
  }, [containerRef, delay]);
}

/* ------------------------------------------------------------------ */
/*  3D Tilt on Hover                                                   */
/* ------------------------------------------------------------------ */
export function useCardTilt(cardRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const card = cardRef.current;
    if (!card || prefersReducedMotion()) return;

    const maxRotation = 4; // degrees

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotateY: x * maxRotation * 2,
        rotateX: -y * maxRotation * 2,
        duration: 0.4,
        ease: "power2.out",
        transformPerspective: 800,
      });

      // Glossy highlight
      const highlight = card.querySelector<HTMLElement>("[data-highlight]");
      if (highlight) {
        gsap.to(highlight, {
          opacity: 0.08,
          x: x * 80,
          y: y * 80,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    };

    const handleLeave = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "elastic.out(1,0.4)",
      });

      const highlight = card.querySelector<HTMLElement>("[data-highlight]");
      if (highlight) {
        gsap.to(highlight, { opacity: 0, duration: 0.4 });
      }
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);

    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, [cardRef]);
}

/* ------------------------------------------------------------------ */
/*  Magnetic Button                                                    */
/* ------------------------------------------------------------------ */
export function useMagnetic(ref: React.RefObject<HTMLElement | null>, strength = 0.3) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;

      gsap.to(el, {
        x: dx,
        y: dy,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1,0.3)",
      });
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [ref, strength]);
}

/* ------------------------------------------------------------------ */
/*  Number Counter                                                     */
/* ------------------------------------------------------------------ */
export function useCounter(ref: React.RefObject<HTMLElement | null>, target: number, delay = 1.5) {
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || counted.current) return;

    if (prefersReducedMotion()) {
      el.textContent = String(target);
      return;
    }

    const proxy = { value: 0 };
    counted.current = true;

    const tween = gsap.to(proxy, {
      value: target,
      duration: 1.8,
      delay,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(proxy.value));
      },
    });

    return () => { tween.kill(); };
  }, [ref, target, delay]);
}

/* ------------------------------------------------------------------ */
/*  Parallax Grid (mouse-reactive)                                     */
/* ------------------------------------------------------------------ */
export function useParallaxGrid(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;

      gsap.to(el, {
        x,
        y,
        duration: 1.2,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [ref]);
}

/* ------------------------------------------------------------------ */
/*  Blob Mouse Tracking                                                */
/* ------------------------------------------------------------------ */
export function useBlobMouseTracking(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const handleMove = (e: MouseEvent) => {
      // Calculate normalized mouse coordinates (-0.5 to 0.5)
      const x = (e.clientX / window.innerWidth - 0.5) * 80; // 80px max movement
      const y = (e.clientY / window.innerHeight - 0.5) * 80;

      gsap.to(el, {
        x,
        y,
        duration: 3, // Slow, fluid catching up
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [ref]);
}

/* ------------------------------------------------------------------ */
/*  Scroll Reveal (for below-fold sections)                            */
/* ------------------------------------------------------------------ */
export function useScrollReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.set(el, { opacity: 0, y: 50 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        });
      },
    });

    return () => { trigger.kill(); };
  }, [ref]);
}

/* ------------------------------------------------------------------ */
/*  Scroll Reveal with Stagger (children)                              */
/* ------------------------------------------------------------------ */
export function useScrollStagger(ref: React.RefObject<HTMLElement | null>, selector = "[data-stagger-item]") {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const children = el.querySelectorAll<HTMLElement>(selector);
    if (children.length === 0) return;

    gsap.set(children, { opacity: 0, y: 40 });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.1,
        });
      },
    });

    return () => { trigger.kill(); };
  }, [ref, selector]);
}

/* ------------------------------------------------------------------ */
/*  Clip-Path Heading Wipe                                             */
/* ------------------------------------------------------------------ */
export function useClipReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    gsap.set(el, { clipPath: "inset(0 100% 0 0)" });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      once: true,
      onEnter: () => {
        gsap.to(el, {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.9,
          ease: "power3.inOut",
        });
      },
    });

    return () => { trigger.kill(); };
  }, [ref]);
}

/* ------------------------------------------------------------------ */
/*  Cursor Follower                                                    */
/* ------------------------------------------------------------------ */
export function useCursorFollower() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (typeof window === "undefined") return;
    // Don't show on touch devices
    if (window.matchMedia("(hover: none)").matches) return;

    const dot = document.createElement("div");
    dot.id = "cursor-follower";
    dot.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      width: 8px; height: 8px;
      border-radius: 50%;
      background: white;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: difference;
      transition: width 0.3s, height 0.3s, margin-top 0.3s, margin-left 0.3s;
      will-change: transform;
    `;
    document.body.appendChild(dot);

    let mouseX = 0;
    let mouseY = 0;
    let dotX = 0;
    let dotY = 0;

    const handleMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [role='button'], [data-card]")) {
        dot.style.width = "40px";
        dot.style.height = "40px";
        dot.style.marginTop = "-16px";
        dot.style.marginLeft = "-16px";
        dot.style.background = "transparent";
        dot.style.border = "1px solid white";
      }
    };

    const handleOut = () => {
      dot.style.width = "8px";
      dot.style.height = "8px";
      dot.style.marginTop = "0px";
      dot.style.marginLeft = "0px";
      dot.style.background = "white";
      dot.style.border = "none";
    };

    let raf: number;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const tick = () => {
      dotX = lerp(dotX, mouseX, 0.12);
      dotY = lerp(dotY, mouseY, 0.12);
      dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
      cancelAnimationFrame(raf);
      dot.remove();
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Scroll Progress Bar                                                */
/* ------------------------------------------------------------------ */
export function useScrollProgress() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const bar = document.createElement("div");
    bar.id = "scroll-progress";
    bar.style.cssText = `
      position: fixed;
      top: 0; left: 0;
      height: 2px;
      width: 0%;
      background: rgba(255,255,255,0.6);
      z-index: 9998;
      pointer-events: none;
      transition: none;
    `;
    document.body.appendChild(bar);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${progress}%`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      bar.remove();
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Lenis Smooth Scroll                                                */
/* ------------------------------------------------------------------ */
export function useLenis() {
  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion()) return;

    let lenis: any;
    let raf: number;

    const init = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    };

    init();

    return () => {
      if (lenis) lenis.destroy();
    };
  }, []);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
