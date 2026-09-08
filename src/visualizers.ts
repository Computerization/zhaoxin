import type { VisualizerId } from "./types";

export interface VizFrame {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number;
  color: string;
  won: boolean;
}

export function renderVisualizer(id: VisualizerId, frame: VizFrame): void {
  const { ctx, w, h } = frame;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(243, 236, 218, 0.35)";
  ctx.fillRect(0, 0, w, h);
  switch (id) {
    case "logo":
      drawLogo(frame);
      break;
    case "sort":
      drawSort(frame);
      break;
    case "spiral":
      drawSpiral(frame);
      break;
    case "matrix":
      drawMatrix(frame);
      break;
    case "cow":
      drawCow(frame);
      break;
    case "life":
      drawLife(frame);
      break;
    case "tree":
      drawTree(frame);
      break;
    case "neon":
      drawNeon(frame);
      break;
    case "fireworks":
      drawFireworks(frame);
      break;
    case "pong":
      drawPong(frame);
      break;
  }
}

function drawLogo({ ctx, w, h, t, color }: VizFrame): void {
  const cx = w / 2;
  const cy = h / 2 - 10;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(0, 0, 52, 0, Math.PI * 2 * Math.min(1, t / 1.4));
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "800 64px Orbitron, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = Math.min(1, t / 0.8);
  ctx.fillText("C", 0, 4);
  ctx.globalAlpha = Math.min(1, Math.max(0, t - 0.8));
  ctx.font = "700 18px Noto Sans SC, sans-serif";
  ctx.fillText("Computerization", 0, 78);
  ctx.restore();
}

function drawSort({ ctx, w, h, t, color }: VizFrame): void {
  const values = [3, 1, 4, 1, 5, 9, 2, 6];
  const step = Math.min(28, Math.floor(t * 10));
  const arr = values.slice();
  let swaps = 0;
  for (let i = 0; i < arr.length && swaps < step; i++) {
    for (let j = 0; j < arr.length - i - 1 && swaps < step; j++) {
      if (arr[j]! > arr[j + 1]!) {
        const tmp = arr[j]!;
        arr[j] = arr[j + 1]!;
        arr[j + 1] = tmp;
        swaps += 1;
      }
    }
  }
  const bw = Math.min(42, (w - 80) / arr.length);
  arr.forEach((v, i) => {
    const bh = v * 18;
    const x = w / 2 - (arr.length * bw) / 2 + i * bw;
    const y = h - 40 - bh;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.fillRect(x + 4, y, bw - 8, bh);
    ctx.globalAlpha = 1;
  });
}

function drawSpiral({ ctx, w, h, t, color }: VizFrame): void {
  const fib = [1, 1, 2, 3, 5, 8, 13, 21];
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  let x = 0;
  let y = 0;
  let dir = 0;
  const scale = 4.2;
  const shown = Math.min(fib.length, Math.floor(t * 3) + 1);
  for (let i = 0; i < shown; i++) {
    const s = fib[i]! * scale;
    ctx.strokeRect(x, y, s, s);
    if (dir === 0) x += s;
    if (dir === 1) y -= s;
    if (dir === 2) x -= fib[i + 1] ? fib[i + 1]! * scale : s;
    if (dir === 3) y += fib[i - 1] ? 0 : 0;
    dir = (dir + 1) % 4;
    if (dir === 1) y -= s;
    if (dir === 2) x -= s;
    if (dir === 3) y += 0;
  }
  ctx.beginPath();
  ctx.arc(0, 0, 20 + (t * 40) % 80, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMatrix({ ctx, w, h, t, color }: VizFrame): void {
  const cols = Math.floor(w / 16);
  ctx.font = "14px JetBrains Mono, monospace";
  ctx.fillStyle = color;
  for (let i = 0; i < cols; i++) {
    const y = ((t * 80 + i * 37) % (h + 40)) - 20;
    const ch = "01C社招新"[i % 6]!;
    ctx.globalAlpha = 0.35 + (i % 3) * 0.2;
    ctx.fillText(ch, 8 + i * 16, y);
  }
  ctx.globalAlpha = 1;
}

function drawCow({ ctx, w, h, t, color }: VizFrame): void {
  ctx.fillStyle = color;
  ctx.font = "42px sans-serif";
  ctx.textAlign = "center";
  for (let i = 0; i < 8; i++) {
    const x = ((t * 180 + i * 90) % (w + 80)) - 40;
    const y = 70 + (i % 3) * 70 + Math.sin(t * 4 + i) * 8;
    ctx.fillText("🐄", x, y);
  }
  ctx.font = "700 28px Noto Sans SC, sans-serif";
  ctx.fillText("牛来!", w / 2, h - 36);
}

function drawLife({ ctx, w, h, t, color }: VizFrame): void {
  const size = 14;
  const cols = Math.floor(w / size);
  const rows = Math.floor(h / size);
  ctx.fillStyle = color;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const n = Math.sin(x * 0.7 + y * 0.5 + t * 2) + Math.cos(x * 0.2 - t);
      if (n > 0.3) {
        ctx.globalAlpha = 0.35 + (n + 1) * 0.2;
        ctx.fillRect(x * size, y * size, size - 2, size - 2);
      }
    }
  }
  ctx.globalAlpha = 1;
}

function drawTree({ ctx, w, h, t, color }: VizFrame): void {
  ctx.save();
  ctx.translate(w / 2, h - 16);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  branch(ctx, 0, 0, -Math.PI / 2, 18 + Math.min(7, t * 4), t);
  ctx.restore();
}

function branch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  depth: number,
  t: number,
): void {
  if (depth <= 0) return;
  const len = 7 + depth * 3;
  const x2 = x + Math.cos(angle) * len;
  const y2 = y + Math.sin(angle) * len;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const spread = 0.45 + Math.sin(t) * 0.05;
  branch(ctx, x2, y2, angle - spread, depth - 1, t);
  branch(ctx, x2, y2, angle + spread, depth - 1, t);
}

function drawNeon({ ctx, w, h, t, color }: VizFrame): void {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 12 + Math.sin(t * 6) * 10;
  ctx.fillStyle = color;
  ctx.font = "800 48px Noto Sans SC, sans-serif";
  ctx.fillText("C社招新", w / 2, h / 2 - 10);
  ctx.font = "600 16px Orbitron, sans-serif";
  ctx.fillText("COMPUTERIZATION", w / 2, h / 2 + 36);
}

function drawFireworks({ ctx, w, h, t, color }: VizFrame): void {
  const bursts = [
    { x: w * 0.3, y: h * 0.35 },
    { x: w * 0.7, y: h * 0.4 },
    { x: w * 0.5, y: h * 0.28 },
  ];
  ctx.fillStyle = color;
  for (const [bi, b] of bursts.entries()) {
    const local = t * 1.4 + bi * 0.4;
    const r = (local % 1.6) * 90;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      ctx.globalAlpha = Math.max(0, 1 - (local % 1.6) / 1.6);
      ctx.beginPath();
      ctx.arc(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawPong({ ctx, w, h, t, color }: VizFrame): void {
  const padH = 64;
  const y1 = h / 2 + Math.sin(t * 2) * 40 - padH / 2;
  const y2 = h / 2 + Math.cos(t * 2.2) * 48 - padH / 2;
  ctx.fillStyle = color;
  ctx.fillRect(18, y1, 8, padH);
  ctx.fillRect(w - 26, y2, 8, padH);
  const bx = w / 2 + Math.sin(t * 3) * (w / 2 - 50);
  const by = h / 2 + Math.cos(t * 4) * (h / 2 - 40);
  ctx.beginPath();
  ctx.arc(bx, by, 7, 0, Math.PI * 2);
  ctx.fill();
}
