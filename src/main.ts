import "./styles.css";
import { Sfx } from "./audio";
import { chaosBlocksInput } from "./chaos";
import { Confetti } from "./confetti";
import {
  accuracy,
  applyBackspace,
  applyChar,
  canType,
  createMatch,
  progress,
  tickMatch,
  tryWin,
  wpm,
} from "./engine";
import { createInputHub } from "./input";
import { SNIPPETS, snippetById } from "./snippets";
import type { MatchState, PlayerId, PlayerState, Screen, Snippet } from "./types";
import { renderVisualizer } from "./visualizers";

const app = document.querySelector("#app")!;
const fx = document.querySelector("#fx") as HTMLCanvasElement;
const sfx = new Sfx();
const confetti = new Confetti();

const names: Record<PlayerId, string> = { A: "甲", B: "乙" };
let screen: Screen = "title";
let snippet: Snippet = SNIPPETS[0]!;
let match: MatchState | null = null;
let countdown = 3;
let probe = "按下任意键，识别甲 / 乙";
let finishAt = 0;
let lastChaosKey = "";
const testPads: Record<PlayerId, string> = { A: "", B: "" };

const hub = createInputHub((action) => {
  if (screen === "setup") {
    probe = hub.lastRaw;
    if (action.kind === "char") testPads[action.player] += action.value;
    if (action.kind === "backspace") {
      testPads[action.player] = testPads[action.player].slice(0, -1);
    }
    render();
  } else if (screen === "title" || screen === "lobby") {
    probe = hub.lastRaw;
    render();
  }
  if (screen !== "play" || !match) return;
  const now = performance.now();
  if (!canType(match, now)) return;
  const player = match.players[action.player];
  const target = match.snippet.code;
  if (action.kind === "backspace") {
    applyBackspace(player);
  } else if (action.kind === "enter") {
    applyChar(player, "\n", target);
  } else if (action.kind === "tab") {
    applyChar(player, nextIndent(target, player.typed), target);
  } else {
    applyChar(player, action.value, target);
  }
  const ok = target.startsWith(player.typed);
  sfx.key(ok);
  tryWin(match, action.player);
  if (match.winner) {
    sfx.win();
    const color = match.winner === "A" ? "#7cffd4" : "#ff7ab8";
    confetti.burst(window.innerWidth, window.innerHeight, color);
    finishAt = performance.now();
    screen = "finish";
  }
  render();
});

function nextIndent(target: string, typed: string): string {
  const rest = target.slice(typed.length);
  if (rest.startsWith("\t")) return "\t";
  if (rest.startsWith("  ")) return "  ";
  return "  ";
}

function go(next: Screen): void {
  screen = next;
  if (next === "countdown") {
    countdown = 3;
    tickCountdown();
  }
  if (next === "play") {
    match = createMatch(snippet, names);
    lastChaosKey = "";
  }
  render();
}

function tickCountdown(): void {
  render();
  if (countdown <= 0) {
    setTimeout(() => go("play"), 450);
    return;
  }
  setTimeout(() => {
    countdown -= 1;
    tickCountdown();
  }, 700);
}

hub.attach();

function renderCode(player: PlayerState, target: string): string {
  let good = 0;
  while (good < player.typed.length && player.typed[good] === target[good]) good += 1;
  const ok = escapeHtml(player.typed.slice(0, good));
  const bad = escapeHtml(player.typed.slice(good));
  const rest = escapeHtml(target.slice(good));
  return `<span class="ok">${ok}</span><span class="bad">${bad}</span><span class="caret"></span><span class="rest">${rest}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function lane(player: PlayerState, target: string, now: number): string {
  const pct = Math.round(progress(player, target) * 100);
  return `
    <section class="lane ${player.id}">
      <div class="diff">
        <h2>${player.name}</h2>
        <span class="pill">${player.id === "A" ? "内置键盘" : "乙 · å"}</span>
      </div>
      <div class="meta">${player.id === "A" ? "正常输入" : "Karabiner / Option 层"}</div>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <div class="code">${renderCode(player, target)}</div>
      <div class="stats">
        <span>${pct}%</span>
        <span>${wpm(player, match?.startedAt ?? now, now)} WPM</span>
        <span>${accuracy(player)}%</span>
        <span>COMBO ${player.combo}</span>
      </div>
    </section>
  `;
}

function chaosLayer(now: number): string {
  if (!match?.chaos || now > match.chaos.until) return "";
  const c = match.chaos;
  if (c.id === "niu") {
    const cows = Array.from({ length: 10 }, (_, i) => {
      return `<span class="cow" style="top:${12 + (i % 5) * 16}%; animation-delay:${i * 0.12}s">🐄</span>`;
    }).join("");
    return `<div class="chaos niu"><div class="herd">${cows}</div><div><h3>牛来了</h3><p>${c.subtitle}</p></div></div>`;
  }
  if (c.id === "npm") {
    return `<div class="chaos"><div><h3>npm install</h3><div class="npmbar"><i></i></div><p>${c.subtitle}</p></div></div>`;
  }
  return `<div class="chaos"><div><h3>${c.title}</h3><p>${c.subtitle}</p></div></div>`;
}

function render(): void {
  const now = performance.now();
  if (screen === "title") {
    app.innerHTML = `
      <div class="screen hero">
        <div>
          <div class="kicker">Computerization 信息化社</div>
          <h1>对码<span>DUALTYPE · 招新赛</span></h1>
          <p class="lede">一台电脑，两把键盘。甲按 a 就是 a；乙的键盘被 Karabiner 改掉，a 变成 å，再翻译成「乙打的 a」。先把代码打完的人，彩带落下，程序在屏幕上跑起来。</p>
          <div class="actions">
            <button class="primary" id="to-setup">接入双键盘</button>
            <button id="to-lobby">先看题库</button>
          </div>
        </div>
      </div>`;
    bind("#to-setup", () => go("setup"));
    bind("#to-lobby", () => go("lobby"));
    return;
  }

  if (screen === "setup") {
    app.innerHTML = `
      <div class="screen">
        <div class="topbar"><div class="brand">DUALTYPE SETUP</div><button id="back">返回</button></div>
        <div class="names">
          <label>甲 <input id="name-a" value="${names.A}" /></label>
          <label>乙 <input id="name-b" value="${names.B}" /></label>
          <label>练习模式
            <select id="lane">
              <option value="auto" ${hub.practiceLane === "auto" ? "selected" : ""}>自动识别双键盘</option>
              <option value="A" ${hub.practiceLane === "A" ? "selected" : ""}>单键盘 · 全部算甲</option>
              <option value="B" ${hub.practiceLane === "B" ? "selected" : ""}>单键盘 · 全部算乙</option>
            </select>
          </label>
        </div>
        <div class="probe">${probe}</div>
        <div class="pads">
          <div class="pad A"><div class="pill">甲 · 内置键盘</div><pre>${escapeHtml(testPads.A) || "（同时打，字出现在这边）"}</pre></div>
          <div class="pad B"><div class="pill">乙 · å 键盘</div><pre>${escapeHtml(testPads.B) || "（乙的 a 会变成 å，再译回 a）"}</pre></div>
        </div>
        <p class="help">
          <strong>两个人可以同时打。</strong>系统只有一个焦点，游戏按每个键是普通字母还是
          <span class="kbd">å</span> 分到左/右，所以左右是两条独立进度。
          Karabiner → Devices：只给<strong>外接键盘</strong>勾 Modify events，内置键盘不要勾，避免 Option 串到甲。
          导入 <span class="kbd">public/karabiner/computerization-typeduel.json</span>。
          甲打 <span class="kbd">a</span> 应进左栏；乙打 <span class="kbd">a</span> 变成 <span class="kbd">å</span> 进右栏。
        </p>
        <div class="actions">
          <button id="clear-pads">清空测试</button>
          <button class="primary" id="next">题库</button>
        </div>
      </div>`;
    bind("#back", () => go("title"));
    bind("#next", () => go("lobby"));
    bind("#clear-pads", () => {
      testPads.A = "";
      testPads.B = "";
      probe = "测试已清空";
      render();
    });
    document.querySelector("#name-a")?.addEventListener("input", (e) => {
      names.A = (e.target as HTMLInputElement).value || "甲";
    });
    document.querySelector("#name-b")?.addEventListener("input", (e) => {
      names.B = (e.target as HTMLInputElement).value || "乙";
    });
    document.querySelector("#lane")?.addEventListener("change", (e) => {
      hub.practiceLane = (e.target as HTMLSelectElement).value as "auto" | PlayerId;
    });
    return;
  }

  if (screen === "lobby") {
    app.innerHTML = `
      <div class="screen">
        <div class="topbar">
          <div class="brand">SELECT PATCH</div>
          <div>${names.A} vs ${names.B}</div>
        </div>
        <div class="grid">
          ${SNIPPETS.map(
            (s) => `
            <button class="card ${s.id === snippet.id ? "active" : ""}" data-id="${s.id}">
              <div class="pill">${s.difficulty} · ${s.language}</div>
              <strong>${s.title}</strong>
              <div><small>${s.blurb}</small></div>
            </button>`,
          ).join("")}
        </div>
        <div class="actions">
          <button id="back">设置</button>
          <button class="primary" id="fight">3 2 1 对码</button>
        </div>
      </div>`;
    bind("#back", () => go("setup"));
    bind("#fight", () => go("countdown"));
    app.querySelectorAll<HTMLButtonElement>(".card").forEach((el) => {
      el.addEventListener("click", () => {
        snippet = snippetById(el.dataset.id ?? "");
        render();
      });
    });
    return;
  }

  if (screen === "countdown") {
    app.innerHTML = `<div class="screen count">${countdown === 0 ? "敲" : countdown}</div>`;
    return;
  }

  if (screen === "play" && match) {
    const freeze = chaosBlocksInput(match.chaos, now);
    const mirror = match.chaos?.id === "mirror" && now <= match.chaos.until;
    const shake = match.chaos?.id === "segfault" && now <= match.chaos.until;
    app.innerHTML = `
      <div class="screen ${mirror ? "mirror" : ""} ${shake ? "shake" : ""} ${freeze ? "freeze" : ""}">
        <div class="topbar">
          <div class="brand">对码 LIVE</div>
          <div>${match.snippet.title}</div>
          <div>${hub.lastRaw}</div>
        </div>
        <div class="split">
          ${lane(match.players.A, match.snippet.code, now)}
          ${lane(match.players.B, match.snippet.code, now)}
        </div>
        ${chaosLayer(now)}
      </div>`;
    return;
  }

  if (screen === "finish" && match) {
    const winner = match.players[match.winner ?? "A"];
    const color = match.winner === "B" ? "pink" : "primary";
    app.innerHTML = `
      <div class="screen finish">
        <div class="banner">
          <div class="kicker">WINNER</div>
          <h2 style="color:${match.winner === "B" ? "var(--b)" : "var(--a)"}">${winner.name} 先完成</h2>
          <p class="lede">代码正在运行。彩带是赢的人的，可视化是这段程序的抽象执行。</p>
          <p class="stats"><span>${accuracy(winner)}%</span><span>COMBO ${winner.maxCombo}</span><span>${match.snippet.title}</span></p>
          <div class="actions">
            <button class="${color}" id="again">再来一局</button>
            <button id="lobby">换题</button>
          </div>
        </div>
        <canvas class="viz" id="viz"></canvas>
      </div>`;
    bind("#again", () => go("countdown"));
    bind("#lobby", () => go("lobby"));
  }
}

function bind(sel: string, fn: () => void): void {
  document.querySelector(sel)?.addEventListener("click", fn);
}

function loop(): void {
  const now = performance.now();
  const ctx = fx.getContext("2d");
  if (ctx) {
    fx.width = window.innerWidth;
    fx.height = window.innerHeight;
    ctx.clearRect(0, 0, fx.width, fx.height);
    confetti.draw(ctx, fx.width, fx.height);
  }
  if (screen === "play" && match) {
    tickMatch(match, now);
    const chaosKey =
      match.chaos && now <= match.chaos.until ? `${match.chaos.id}:${match.chaos.until}` : "";
    if (chaosKey !== lastChaosKey) {
      if (chaosKey) sfx.chaos();
      lastChaosKey = chaosKey;
      render();
    }
  }
  if (screen === "finish" && match) {
    const viz = document.querySelector("#viz") as HTMLCanvasElement | null;
    if (viz) {
      const box = viz.getBoundingClientRect();
      viz.width = box.width;
      viz.height = box.height;
      const vctx = viz.getContext("2d");
      if (vctx) {
        renderVisualizer(match.snippet.visualizer, {
          ctx: vctx,
          w: viz.width,
          h: viz.height,
          t: (now - finishAt) / 1000,
          color: match.winner === "B" ? "#ff7ab8" : "#7cffd4",
          won: true,
        });
      }
    }
  }
  requestAnimationFrame(loop);
}

render();
loop();
