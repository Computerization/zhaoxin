export class Sfx {
  private ctx: AudioContext | null = null;

  private audio(): AudioContext {
    if (!this.ctx) this.ctx = new AudioContext();
    return this.ctx;
  }

  private beep(freq: number, dur: number, type: OscillatorType, gain = 0.05): void {
    const ctx = this.audio();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  }

  key(ok: boolean): void {
    this.beep(ok ? 620 : 180, ok ? 0.04 : 0.12, ok ? "square" : "sawtooth", ok ? 0.03 : 0.05);
  }

  win(): void {
    this.beep(523, 0.12, "square", 0.06);
    setTimeout(() => this.beep(659, 0.12, "square", 0.06), 90);
    setTimeout(() => this.beep(784, 0.18, "square", 0.07), 180);
  }

  chaos(): void {
    this.beep(90, 0.2, "sawtooth", 0.06);
  }
}
