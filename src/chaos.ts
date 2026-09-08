import type { ChaosState } from "./types";

interface ChaosKind {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
}

const KINDS: ChaosKind[] = [
  {
    id: "niu",
    title: "牛来了",
    subtitle: "视野被牛占满。键还在，字暂时看不见。",
    duration: 2800,
  },
  {
    id: "gc",
    title: "GC pause",
    subtitle: "世界停了 0.8 秒。别慌，堆还在。",
    duration: 800,
  },
  {
    id: "npm",
    title: "npm install",
    subtitle: "node_modules 正在膨胀……",
    duration: 2200,
  },
  {
    id: "mirror",
    title: "镜像编译",
    subtitle: "代码左右翻转。手指不要跟着翻。",
    duration: 3200,
  },
  {
    id: "segfault",
    title: "Segmentation fault",
    subtitle: "屏幕在抖。进度还在，手别抖。",
    duration: 1400,
  },
  {
    id: "sudo",
    title: "sudo 抢权",
    subtitle: "权限被借走了一小会。继续打。",
    duration: 1600,
  },
];

export function rollChaos(now: number): ChaosState {
  const pool = KINDS;
  const kind = pool[Math.floor(Math.random() * pool.length)] ?? KINDS[0]!;
  return {
    id: kind.id,
    title: kind.title,
    subtitle: kind.subtitle,
    until: now + kind.duration,
  };
}

export function chaosBlocksInput(chaos: ChaosState | null, now: number): boolean {
  if (!chaos || now > chaos.until) return false;
  return chaos.id === "gc" || chaos.id === "sudo";
}
