import type { Snippet } from "./types";

export const SNIPPETS: Snippet[] = [
  {
    id: "hello-c",
    title: "C 社开机动画",
    blurb: "把社名打完，屏幕会把 C 字标拼出来。",
    language: "js",
    difficulty: "warm",
    visualizer: "logo",
    code: `console.log("Computerization");`,
  },
  {
    id: "neon",
    title: "霓虹招新",
    blurb: "先完成的人点亮灯牌。",
    language: "css",
    difficulty: "warm",
    visualizer: "neon",
    code: `.sign { color: #7cffd4; text-shadow: 0 0 18px cyan; }`,
  },
  {
    id: "niu",
    title: "牛来了",
    blurb: "抽象但合法的 JavaScript。打完会真的牛来。",
    language: "js",
    difficulty: "warm",
    visualizer: "cow",
    code: `function niuLai() { return "moo".repeat(8); }
niuLai();`,
  },
  {
    id: "sort",
    title: "冒泡社招",
    blurb: "把数组排好，柱状图会自己跳完。",
    language: "js",
    difficulty: "heat",
    visualizer: "sort",
    code: `function bubble(a) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - i - 1; j++) {
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    }
  }
  return a;
}
bubble([3, 1, 4, 1, 5, 9, 2, 6]);`,
  },
  {
    id: "fib",
    title: "黄金螺旋",
    blurb: "斐波那契不只是数列。",
    language: "js",
    difficulty: "heat",
    visualizer: "spiral",
    code: `function fib(n) {
  return n < 2 ? n : fib(n - 1) + fib(n - 2);
}
const seq = [...Array(10)].map((_, i) => fib(i));`,
  },
  {
    id: "tree",
    title: "递归种树",
    blurb: "代码是树，屏幕上也是树。",
    language: "js",
    difficulty: "heat",
    visualizer: "tree",
    code: `function grow(depth) {
  if (depth === 0) return "*";
  return grow(depth - 1) + "/" + grow(depth - 1);
}
grow(4);`,
  },
  {
    id: "matrix",
    title: "黑入招新表",
    blurb: "没什么实际意义，但很赛博。",
    language: "js",
    difficulty: "abstract",
    visualizer: "matrix",
    code: `const rain = (s) => [...s].map((c) => c.charCodeAt(0) % 2 ? "0" : "1");
rain("join computerization");`,
  },
  {
    id: "life",
    title: "元胞自动机",
    blurb: "打完这段，格子会自己活过来。",
    language: "js",
    difficulty: "abstract",
    visualizer: "life",
    code: `const next = (alive, n) => (alive && n === 2) || n === 3;
let cells = [0, 1, 1, 0, 1, 1, 1, 0];
cells = cells.map((c, i) => next(c, cells[i - 1] + cells[i + 1]) ? 1 : 0);`,
  },
  {
    id: "fireworks",
    title: "release 烟花",
    blurb: "谁先 merge，谁先放烟花。",
    language: "js",
    difficulty: "heat",
    visualizer: "fireworks",
    code: `function boom(n) {
  return Array.from({ length: n }, (_, i) => ({
    x: Math.cos(i), y: Math.sin(i),
  }));
}
boom(24);`,
  },
  {
    id: "pong",
    title: "乒乓 bug",
    blurb: "打完代码，球会自己弹。",
    language: "js",
    difficulty: "heat",
    visualizer: "pong",
    code: `let x = 0, v = 1;
function tick() {
  x += v;
  if (x > 10 || x < 0) v *= -1;
}
tick();`,
  },
];

export function snippetById(id: string): Snippet {
  return SNIPPETS.find((s) => s.id === id) ?? SNIPPETS[0]!;
}
