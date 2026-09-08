import { interpretKey, describeIncoming } from "./mapping";
import type { InputAction } from "./mapping";
import type { PlayerId } from "./types";

export interface InputHub {
  practiceLane: PlayerId | "auto";
  lastRaw: string;
  onAction: (action: NonNullable<InputAction>, event: KeyboardEvent) => void;
  attach(): void;
  detach(): void;
}

export function createInputHub(
  onAction: InputHub["onAction"],
): InputHub {
  const hub: InputHub = {
    practiceLane: "auto",
    lastRaw: "等待按键…",
    onAction,
    attach() {
      window.addEventListener("keydown", onKeyDown, true);
    },
    detach() {
      window.removeEventListener("keydown", onKeyDown, true);
    },
  };

  function onKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    if (target?.closest("input, textarea, select")) return;
    if (e.repeat && e.key !== "Backspace") return;
    hub.lastRaw = describeIncoming(e);
    const action = interpretKey(e, hub.practiceLane);
    if (!action) return;
    const typing = ["char", "backspace", "enter", "tab"].includes(action.kind);
    if (typing) {
      e.preventDefault();
      e.stopPropagation();
    }
    hub.onAction(action, e);
  }

  return hub;
}
