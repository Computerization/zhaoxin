export type PlayerId = "A" | "B";

export type Screen =
  | "title"
  | "setup"
  | "lobby"
  | "countdown"
  | "play"
  | "finish";

export type VisualizerId =
  | "logo"
  | "sort"
  | "spiral"
  | "matrix"
  | "cow"
  | "life"
  | "tree"
  | "neon"
  | "fireworks"
  | "pong";

export interface Snippet {
  id: string;
  title: string;
  blurb: string;
  language: string;
  code: string;
  visualizer: VisualizerId;
  difficulty: "warm" | "heat" | "abstract";
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  typed: string;
  combo: number;
  maxCombo: number;
  strokes: number;
  correct: number;
  lastHitAt: number;
}

export interface ChaosState {
  id: string;
  title: string;
  subtitle: string;
  until: number;
}

export interface MatchState {
  snippet: Snippet;
  players: Record<PlayerId, PlayerState>;
  startedAt: number;
  winner: PlayerId | null;
  chaos: ChaosState | null;
  nextChaosAt: number;
}

export function emptyPlayer(id: PlayerId, name: string): PlayerState {
  return {
    id,
    name,
    typed: "",
    combo: 0,
    maxCombo: 0,
    strokes: 0,
    correct: 0,
    lastHitAt: 0,
  };
}
