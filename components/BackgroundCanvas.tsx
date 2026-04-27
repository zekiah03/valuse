"use client";

import { useEffect, useRef } from "react";

const PALETTE: [number, number, number][] = [
  [99,  102, 241],   // indigo
  [139,  92, 246],   // violet
  [236,  72, 153],   // pink
  [ 59, 130, 246],   // blue
  [167, 139, 250],   // lavender
  [ 20, 184, 166],   // teal
  [244, 114, 182],   // rose
];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  baseSize: number;
  color: [number, number, number];
  opacity: number;
  phase: number;
  phaseSpeed: number;
}

interface Ring {
  cx: number; cy: number;
  r: number;
  angle: number;
  speed: number;
  color: [number, number, number];
  dash: number;
  gap: number;
}

const CONNECT_DIST = 170;
const N_PARTICLES  = 80;
const N_RINGS      = 5;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickColor(): [number, number, number] {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)];
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = document.documentElement.scrollHeight;

    const resize = () => {
      W = window.innerWidth;
      H = document.documentElement.scrollHeight;
      canvas.width  = W;
      canvas.height = H;
    };
    resize();

    // ── Particles ─────────────────────────────────────────
    const particles: Particle[] = Array.from({ length: N_PARTICLES }, () => ({
      x: rand(0, W),
      y: rand(0, H),
      vx: rand(-0.35, 0.35),
      vy: rand(-0.25, 0.25),
      baseSize: rand(0.8, 2.6),
      color: pickColor(),
      opacity: rand(0.15, 0.55),
      phase: rand(0, Math.PI * 2),
      phaseSpeed: rand(0.008, 0.025),
    }));

    // ── Rings ─────────────────────────────────────────────
    const rings: Ring[] = Array.from({ length: N_RINGS }, () => {
      const big = rand(200, 500);
      return {
        cx: rand(W * 0.1, W * 0.9),
        cy: rand(H * 0.05, H * 0.95),
        r: big,
        angle: rand(0, Math.PI * 2),
        speed: rand(0.0002, 0.0008) * (Math.random() < 0.5 ? 1 : -1),
        color: pickColor(),
        dash: rand(20, 80),
        gap: rand(10, 40),
      };
    });

    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── Draw rings ──────────────────────────────────────
      for (const ring of rings) {
        ring.angle += ring.speed;
        ctx.save();
        ctx.translate(ring.cx, ring.cy);
        ctx.rotate(ring.angle);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        const [r, g, b] = ring.color;
        ctx.strokeStyle = `rgba(${r},${g},${b},0.06)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([ring.dash, ring.gap]);
        ctx.stroke();
        ctx.setLineDash([]);
        // inner ring
        ctx.beginPath();
        ctx.arc(0, 0, ring.r * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      }

      // ── Update + draw particles ─────────────────────────
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.phaseSpeed;

        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      }

      // ── Connection lines ────────────────────────────────
      for (let i = 0; i < N_PARTICLES; i++) {
        for (let j = i + 1; j < N_PARTICLES; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            const [r, g, b] = particles[i].color;
            ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // ── Draw dots ───────────────────────────────────────
      for (const p of particles) {
        const pulse = 1 + Math.sin(p.phase) * 0.35;
        const [r, g, b] = p.color;

        // glow
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.baseSize * pulse * 4);
        grd.addColorStop(0, `rgba(${r},${g},${b},${p.opacity * 0.4})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseSize * pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.baseSize * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => { resize(); };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.85 }}
    />
  );
}
