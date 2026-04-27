"use client";

const BLOBS: {
  r: number; g: number; b: number;
  w: number; h: number;
  top: string; left: string;
  anim: string; dur: string; delay: string;
  op: number;
}[] = [
  { r: 99,  g: 102, b: 241, w: 640, h: 520, top: "-10%", left: "2%",  anim: "mist-a", dur: "28s", delay: "0s",   op: 0.18 },
  { r: 139, g:  92, b: 246, w: 500, h: 440, top: "10%",  left: "60%", anim: "mist-b", dur: "34s", delay: "5s",   op: 0.14 },
  { r: 236, g:  72, b: 153, w: 380, h: 360, top: "55%",  left: "72%", anim: "mist-c", dur: "26s", delay: "11s",  op: 0.10 },
  { r:  59, g: 130, b: 246, w: 440, h: 360, top: "68%",  left: "5%",  anim: "mist-a", dur: "32s", delay: "4s",   op: 0.12 },
  { r: 99,  g: 102, b: 241, w: 320, h: 300, top: "38%",  left: "38%", anim: "mist-b", dur: "42s", delay: "8s",   op: 0.07 },
  { r: 167, g: 139, b: 250, w: 280, h: 320, top: "84%",  left: "52%", anim: "mist-c", dur: "22s", delay: "2s",   op: 0.10 },
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
            filter: "blur(72px)",
            animation: `${b.anim} ${b.dur} ease-in-out infinite`,
            animationDelay: b.delay,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}
