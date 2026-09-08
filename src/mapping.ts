import type { PlayerId } from "./types";

/**
 * 乙键盘通过 Karabiner 把按键变成 Option 层字符（a → а），
 * 游戏再把这些字符还原成「乙打的 ASCII」。
 * 键位对应见 RU2P-keymap.md（系统需切到 RU2P 输入法）。
 *
 * 两个人可以同时打：浏览器只有一个焦点，但每个 keydown 独立分流到左/右，
 * 不靠两个输入框。甲走内置键盘的普通字母；乙走外接键盘被 Karabiner
 * 叠上 Option 后、由 RU2P 布局翻译出的 Cyrillic / 汉字。
 *
 * 乙的外接键盘的 Option 默认常按，所以 Karabiner 只要给每个键叠 Option，
 * 不再加 Control。RU2P 也不再有 e/i/n/u 死键。空格/回车/Tab/退格同样只走
 * Option，会被翻译成「空 / 回 / 表 / 退」，下面 interpretKey 里识别。
 */
export const OPTION_TO_ASCII: Record<string, string> = {
  // Cyrillic 小写（RU2P Option 层）
  "а": "a",
  "б": "b",
  "в": "v",
  "г": "g",
  "д": "d",
  "е": "e",
  "з": "z",
  "и": "i",
  "й": "j",
  "к": "k",
  "л": "l",
  "м": "m",
  "н": "n",
  "о": "o",
  "п": "p",
  "р": "r",
  "с": "s",
  "т": "t",
  "у": "u",
  "ф": "f",
  "х": "x",
  "ц": "c",
  "ч": "h",
  "ш": "w",
  "ы": "y",
  "я": "q",

  // Cyrillic 大写
  "А": "A",
  "Б": "B",
  "В": "V",
  "Г": "G",
  "Д": "D",
  "Е": "E",
  "З": "Z",
  "И": "I",
  "Й": "J",
  "К": "K",
  "Л": "L",
  "М": "M",
  "Н": "N",
  "О": "O",
  "П": "P",
  "Р": "R",
  "С": "S",
  "Т": "T",
  "У": "U",
  "Ф": "F",
  "Х": "X",
  "Ц": "C",
  "Ч": "H",
  "Ш": "W",
  "Ы": "Y",
  "Я": "Q",

  // 标点（RU2P）
  "方": "[",
  "花": "{",
  "框": "]",
  "华": "}",
  "反": "\\",
  "竖": "|",
  "分": ";",
  "冒": ":",
  "撇": "'",
  "引": '"',
  "逗": ",",
  "小": "<",
  "句": ".",
  "大": ">",
  "正": "/",
  "问": "?",

  // 数字（RU2P）
  "一": "1",
  "叹": "!",
  "二": "2",
  "艾": "@",
  "三": "3",
  "井": "#",
  "四": "4",
  "刀": "$",
  "五": "5",
  "百": "%",
  "六": "6",
  "尖": "^",
  "七": "7",
  "和": "&",
  "八": "8",
  "星": "*",
  "九": "9",
  "圆": "(",
  "零": "0",
  "园": ")",

  // 等号 / 减号 / 反引号
  "等": "=",
  "加": "+",
  "减": "-",
  "线": "_",
  "钩": "`",
  "波": "~",

  // 空格（RU2P Option+Space → 「空」）
  "空": " ",
  "\u3000": " ",
};

// RU2P Option 层对回车/Tab/退格的输出，作为乙的特殊键
const B_SPECIAL_KEYS: Record<string, "enter" | "tab" | "backspace"> = {
  "回": "enter",
  "表": "tab",
  "退": "backspace",
};

const FULLWIDTH_START = 0xff01;
const ASCII_START = 0x21;

export type InputAction =
  | { player: PlayerId; kind: "char"; value: string }
  | { player: PlayerId; kind: "backspace" }
  | { player: PlayerId; kind: "enter" }
  | { player: PlayerId; kind: "tab" }
  | { player: PlayerId; kind: "left" }
  | { player: PlayerId; kind: "right" }
  | null;

// 方向键 / RU2P 映射：左 → λ / 左；右 → ρ / 右。
// 乙的外接键盘走 Option 层，会输出「左 / 右」，所以三种 key 都能识别。
const ARROW_HORIZONTAL: Record<string, "left" | "right"> = {
  "ArrowLeft": "left",
  "ArrowRight": "right",
  "λ": "left",
  "ρ": "right",
  "左": "left",
  "右": "right",
};

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
  const bSpecial = B_SPECIAL_KEYS[e.key];
  const arrowDir = ARROW_HORIZONTAL[e.key];

  let player: PlayerId;
  if (practiceLane !== "auto") {
    player = practiceLane;
  } else if (bMods || optionMapped || fullwidth || bSpecial || e.altKey) {
    player = "B";
  } else {
    player = "A";
  }

  if (arrowDir) {
    return { player, kind: arrowDir };
  }

  const special = bSpecial
    ?? (e.key === "Backspace" ? "backspace"
      : e.key === "Enter" ? "enter"
      : e.key === "Tab" ? "tab"
      : null);
  if (special === "backspace") return { player, kind: "backspace" };
  if (special === "enter") return { player, kind: "enter" };
  if (special === "tab") return { player, kind: "tab" };

  if (e.key.length !== 1) return null;
  if (e.key === "Escape") return null;

  const value = optionMapped ?? fullwidth ?? e.key;
  if (value === "\n") return { player, kind: "enter" };
  return { player, kind: "char", value };
}

export function describeIncoming(e: KeyboardEvent): string {
  const optionMapped = OPTION_TO_ASCII[e.key];
  if (optionMapped) return `乙 · ${JSON.stringify(e.key)} → ${optionMapped}`;
  if (B_SPECIAL_KEYS[e.key]) return `乙 · RU2P ${e.key} → ${B_SPECIAL_KEYS[e.key]}`;
  if (isPlayerBModifier(e)) return `乙 · Ctrl+Option ${e.key}`;
  const fullwidth = fromFullwidth(e.key);
  if (fullwidth) return `乙 · 全角 ${e.key} → ${fullwidth}`;
  if (ARROW_HORIZONTAL[e.key]) return `${e.altKey ? "乙" : "甲"} · ${e.key}`;
  return `甲 · ${e.key}`;
}
