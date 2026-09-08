interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
}

export class Confetti {
  private particles: Particle[] = [];
  private running = false;

  burst(width: number, _height: number, color: string): void {
    const palette = [color, "#fff7d6", "#ffd166", "#ffffff", "#ff4d6d"];
    for (let i = 0; i < 140; i++) {
      this.particles.push({
        x: width * (0.2 + Math.random() * 0.6),
        y: -20 - Math.random() * 80,
        vx: (Math.random() - 0.5) * 8,
        vy: 2 + Math.random() * 5,
        w: 6 + Math.random() * 10,
        h: 18 + Math.random() * 28,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
        color: palette[i % palette.length]!,
        life: 1,
      });
    }
    this.running = true;
  }

  draw(ctx: CanvasRenderingContext2D, _w: number, h: number): void {
    if (!this.running) return;
    this.particles = this.particles.filter((p) => p.life > 0 && p.y < h + 40);
    for (const p of this.particles) {
      p.vy += 0.12;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life -= 0.004;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (this.particles.length === 0) this.running = false;
  }
}
