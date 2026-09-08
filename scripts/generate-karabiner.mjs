#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const letters = "abcdefghijklmnopqrstuvwxyz".split("");
const dead = new Set(["e", "i", "n", "u"]);
const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const punctuation = [
  "hyphen",
  "equal_sign",
  "open_bracket",
  "close_bracket",
  "backslash",
  "semicolon",
  "quote",
  "comma",
  "period",
  "slash",
];

const conditions = [
  {
    type: "device_unless",
    identifiers: [{ is_built_in_keyboard: true }],
  },
];

function rule(fromKey, toMods, shift) {
  const from = {
    key_code: fromKey,
    modifiers: shift
      ? { mandatory: ["shift"], optional: ["caps_lock"] }
      : { optional: ["caps_lock"] },
  };
  const toModsOut = shift ? [...toMods, "left_shift"] : toMods;
  return {
    type: "basic",
    from,
    to: [{ key_code: fromKey, modifiers: toModsOut }],
    conditions,
  };
}

const manipulators = [];

for (const key of letters) {
  const mods = dead.has(key) ? ["right_control", "right_option"] : ["right_option"];
  manipulators.push(rule(key, mods, false));
  manipulators.push(rule(key, mods, true));
}

for (const key of [...digits, ...punctuation]) {
  manipulators.push(rule(key, ["right_option"], false));
  manipulators.push(rule(key, ["right_option"], true));
}

manipulators.push(rule("grave_accent_and_tilde", ["right_control", "right_option"], false));
manipulators.push(rule("grave_accent_and_tilde", ["right_control", "right_option"], true));

for (const key of ["spacebar", "return_or_enter", "delete_or_backspace", "tab"]) {
  manipulators.push({
    type: "basic",
    from: { key_code: key, modifiers: { optional: ["caps_lock"] } },
    to: [{ key_code: key, modifiers: ["right_control", "right_option"] }],
    conditions,
  });
}

const json = {
  title: "Computerization 对码 · 乙键盘",
  rules: [
    {
      description:
        "仅修改非内置键盘为乙选手（a→å）。Devices 里只给这把外接键盘勾 Modify events，这样两人可以同时打、Option 不会串到甲。",
      manipulators,
    },
  ],
};

const out = join(dirname(fileURLToPath(import.meta.url)), "../public/karabiner/computerization-typeduel.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(json, null, 2) + "\n");
console.log(`wrote ${out} (${manipulators.length} manipulators)`);
