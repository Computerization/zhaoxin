import type { PlayerId } from "./types";

/**
 * 乙键盘通过 Karabiner 把按键变成 Option 层字符（a → å），
 * 游戏再把这些字符还原成「乙打的 ASCII」。
 *
 * 两个人可以同时打：浏览器只有一个焦点，但每个 keydown 独立分流到左/右，
 * 不靠两个输入框。甲走内置键盘的普通字母；乙走外接键盘被改写后的 å。
 *
 * Karabiner Devices 里只给乙的外接键盘勾 Modify events，内置键盘不要勾。
 * 这样 Option 只出现在乙的虚拟键上，甲的按键不会被带上 Option。
 *
 * 死键（e/i/n/u/`）无法走 Option 方案，Karabiner 会改成 Control+Option。
 * 退格 / 回车 / Tab 同样走 Control+Option，避免触发系统快捷键。
 */
export const OPTION_TO_ASCII: Record<string, string> = {
  "å": "a",
  "Å": "A",
  "ß": "s",
  "Í": "S",
  "∂": "d",
  "Î": "D",
  "ƒ": "f",
  "Ï": "F",
  "©": "g",
  "\u02dd": "G",
  "˙": "h",
  "Ó": "H",
  "∆": "j",
  "Ô": "J",
  "˚": "k",
  "": "K",
  "¬": "l",
  "Ò": "L",
  "µ": "m",
  "Â": "M",
  "ø": "o",
  "Ø": "O",
  "π": "p",
  "∏": "P",
  "œ": "q",
  "Œ": "Q",
  "®": "r",
  "‰": "R",
  "†": "t",
  "Ê": "T",
  "√": "v",
  "◊": "V",
  "∫": "b",
  "ı": "B",
  "ç": "c",
  "Ç": "C",
  "∑": "w",
  "„": "W",
  "≈": "x",
  "\u02db": "X",
  "¥": "y",
  "Á": "Y",
  "Ω": "z",
  "¸": "Z",
  "¡": "1",
  "⁄": "!",
  "™": "2",
  "€": "@",
  "£": "3",
  "‹": "#",
  "¢": "4",
  "›": "$",
  "∞": "5",
  "\ufb01": "%",
  "§": "6",
  "\ufb02": "^",
  "¶": "7",
  "‡": "&",
  "•": "8",
  "°": "*",
  "ª": "9",
  "·": "(",
  "º": "0",
  "‚": ")",
  "–": "-",
  "—": "_",
  "≠": "=",
  "±": "+",
  "“": "[",
  "”": "{",
  "‘": "]",
  "’": "}",
  "«": "\\",
  "»": "|",
  "…": ";",
  "Ú": ":",
  "æ": "'",
  "Æ": '"',
  "≤": ",",
  "¯": "<",
  "≥": ".",
  "˘": ">",
  "÷": "/",
  "¿": "?",
  "\u00a0": " ",
};

const FULLWIDTH_START = 0xff01;
const ASCII_START = 0x21;

export type InputAction =
  | { player: PlayerId; kind: "char"; value: string }
  | { player: PlayerId; kind: "backspace" }
  | { player: PlayerId; kind: "enter" }
  | { player: PlayerId; kind: "tab" }
  | null;

function isPlayerBModifier(e: KeyboardEvent): boolean {
  return e.ctrlKey && e.altKey && !e.metaKey;
}

function fromFullwidth(key: string): string | null {
  if (key.length !== 1) return null;
  const code = key.charCodeAt(0);
  if (code >= FULLWIDTH_START && code <= 0xff5e) {
    return String.fromCharCode(code - FULLWIDTH_START + ASCII_START);
  }
  if (code === 0x3000) return " ";
  return null;
}

export function interpretKey(
  e: KeyboardEvent,
  practiceLane: PlayerId | "auto",
): InputAction {
  if (e.isComposing || e.key === "Process") return null;
  if (e.metaKey && !e.ctrlKey) return null;

  const bMods = isPlayerBModifier(e);
  const optionMapped = OPTION_TO_ASCII[e.key];
  const fullwidth = fromFullwidth(e.key);

  let player: PlayerId;
  if (practiceLane !== "auto") {
    player = practiceLane;
  } else if (bMods || optionMapped || fullwidth) {
    player = "B";
  } else {
    player = "A";
  }

  if (e.key === "Backspace") {
    return { player, kind: "backspace" };
  }
  if (e.key === "Enter") {
    return { player, kind: "enter" };
  }
  if (e.key === "Tab") {
    return { player, kind: "tab" };
  }

  if (e.key.length !== 1) return null;
  if (e.key === "Escape") return null;

  const value = optionMapped ?? fullwidth ?? e.key;
  if (value === "\n") return { player, kind: "enter" };
  return { player, kind: "char", value };
}

export function describeIncoming(e: KeyboardEvent): string {
  const optionMapped = OPTION_TO_ASCII[e.key];
  if (optionMapped) return `乙 · ${JSON.stringify(e.key)} → ${optionMapped}`;
  if (isPlayerBModifier(e)) return `乙 · Ctrl+Option ${e.key}`;
  const fullwidth = fromFullwidth(e.key);
  if (fullwidth) return `乙 · 全角 ${e.key} → ${fullwidth}`;
  return `甲 · ${e.key}`;
}
