import { chaosBlocksInput, rollChaos } from "./chaos";
import { emptyPlayer, type MatchState, type PlayerId, type PlayerState, type Snippet } from "./types";

export function createMatch(snippet: Snippet, names: Record<PlayerId, string>): MatchState {
  return {
    snippet,
    players: {
      A: emptyPlayer("A", names.A),
      B: emptyPlayer("B", names.B),
    },
    startedAt: performance.now(),
    winner: null,
    chaos: null,
    nextChaosAt: performance.now() + 4500 + Math.random() * 2500,
  };
}

export function applyChar(player: PlayerState, ch: string, target: string): void {
  player.strokes += 1;
  player.lastHitAt = performance.now();
  const before = player.typed.slice(0, player.cursor);
  const after = player.typed.slice(player.cursor);
  player.typed = before + ch + after;
  if (target[player.cursor] === ch) {
    player.correct += 1;
    player.combo += 1;
    player.maxCombo = Math.max(player.maxCombo, player.combo);
  } else {
    player.combo = 0;
  }
  player.cursor += 1;
}

export function applyBackspace(player: PlayerState): void {
  if (player.cursor === 0) return;
  player.typed = player.typed.slice(0, player.cursor - 1) + player.typed.slice(player.cursor);
  player.cursor -= 1;
  player.combo = 0;
}

export function applyCursorLeft(player: PlayerState): void {
  if (player.cursor === 0) return;
  player.cursor -= 1;
}

export function applyCursorRight(player: PlayerState): void {
  if (player.cursor >= player.typed.length) return;
  player.cursor += 1;
}

export function isCorrectSoFar(player: PlayerState, target: string): boolean {
  for (let i = 0; i < player.typed.length; i++) {
    if (player.typed[i] !== target[i]) return false;
  }
  return true;
}

export function finished(player: PlayerState, target: string): boolean {
  return player.typed === target;
}

export function accuracy(player: PlayerState): number {
  if (player.strokes === 0) return 100;
  return Math.round((player.correct / player.strokes) * 100);
}

export function wpm(player: PlayerState, startedAt: number, now: number): number {
  const minutes = Math.max(0.02, (now - startedAt) / 60000);
  return Math.round(player.correct / 5 / minutes);
}

export function progress(player: PlayerState, target: string): number {
  let n = 0;
  while (n < player.typed.length && player.typed[n] === target[n]) n += 1;
  return target.length === 0 ? 1 : n / target.length;
}

export function tickMatch(match: MatchState, now: number): void {
  if (match.winner) return;
  if (match.chaos && now > match.chaos.until) {
    match.chaos = null;
    match.nextChaosAt = now + 3500 + Math.random() * 4000;
  }
  if (!match.chaos && now >= match.nextChaosAt) {
    match.chaos = rollChaos(now);
  }
}

export function canType(match: MatchState, now: number): boolean {
  return !match.winner && !chaosBlocksInput(match.chaos, now);
}

export function tryWin(match: MatchState, player: PlayerId): void {
  if (match.winner) return;
  if (finished(match.players[player], match.snippet.code)) {
    match.winner = player;
  }
}
