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
  const next = player.typed + ch;
  if (target.startsWith(next)) {
    player.typed = next;
    player.correct += 1;
    player.combo += 1;
    player.maxCombo = Math.max(player.maxCombo, player.combo);
  } else {
    player.typed = next;
    player.combo = 0;
  }
}

export function applyBackspace(player: PlayerState): void {
  if (!player.typed) return;
  player.typed = player.typed.slice(0, -1);
  player.combo = 0;
}

export function isCorrectSoFar(player: PlayerState, target: string): boolean {
  return target.startsWith(player.typed);
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
