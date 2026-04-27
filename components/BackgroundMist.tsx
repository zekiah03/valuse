"use client";

const BLOBS = [
  // indigo cluster — top-left
  { r: 99,  g: 102, b: 241, w: 700, h: 600, top: "-12%", left: "-5%",  anim: "mist-a", dur: "28s", delay: "0s",  op: 0.20 },
  { r: 99,  g: 102, b: 241, w: 350, h: 300, top: "5%",   left: "20%",  anim: "mist-c", dur: "38s", delay: "6s",  op: 0.10 },
  // violet — center-right
  { r: 139, g:  92, b: 246, w: 560, h: 480, top: "8%",   left: "58%",  anim: "mist-b", dur: "34s", delay: "4s",  op: 0.16 },
  { r: 139, g:  92, b: 246, w: 280, h: 260, top: "32%",  left: "78%",  anim: "mist-a", dur: "22s", delay: "9s",  op: 0.10 },
  // pink — bottom-right
  { r: 236, g:  72, b: 153, w: 460, h: 400, top: "58%",  left: "68%",  anim: "mist-c", dur: "26s", delay: "12s", op: 0.12 },
  { r: 244, g: 114, b: 182, w: 240, h: 280, top: "82%",  left: "50%",  anim: "mist-b", dur: "20s", delay: "2s",  op: 0.09 },
  // blue — bottom-left
  { r:  59, g: 130, b: 246, w: 500, h: 420, top: "62%",  left: "2%",   anim: "mist-a", dur: "32s", delay: "5s",  op: 0.14 },
  { r:  96, g: 165, b: 250, w: 280, h: 240, top: "44%",  left: "18%",  anim: "mist-c", dur: "44s", delay: "14s", op: 0.08 },
  // teal — mid
  { r:  20, g: 184, b: 166, w: 340, h: 300, top: "28%",  left: "42%",  anim: "mist-b", dur: "30s", delay: "7s",  op: 0.09 },
  { r:  45, g: 212, b: 191, w: 200, h: 220, top: "75%",  left: "34%",  anim: "mist-a", dur: "18s", delay: "1s",  op: 0.07 },
  // lavender extras
  { r: 167, g: 139, b: 250, w: 320, h: 360, top: "50%",  left: "88%",  anim: "mist-c", dur: "36s", delay: "10s", op: 0.10 },
  { r: 192, g: 132, b: 252, w: 250, h: 200, top: "18%",  left: "-2%",  anim: "mist-b", dur: "24s", delay: "3s",  op: 0.09 },
];

export default function BackgroundMist() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {BLOBS.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            width: b.w,
            height: b.h,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, rgba(${b.r},${b.g},${b.b},${b.op}) 0%, transparent 70%)`,
            filter: "blur(80px)",
            animation: `${b.anim} ${b.dur} ease-in-out infinite`,
            animationDelay: b.delay,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
