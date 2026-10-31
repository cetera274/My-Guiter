// File: app.js
"use strict";

/* =========================================================
   定数
   ========================================================= */
const SHARP_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const INTERVAL_LABELS = ["R", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
const MAJOR_REF = [0, 2, 4, 5, 7, 9, 11];
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];
const STANDARD = [40, 45, 50, 55, 59, 64];
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

const TUNINGS = [
  ["スタンダード (EADGBE)", [40, 45, 50, 55, 59, 64]],
  ["半音下げ (Eb Ab Db Gb Bb Eb)", [39, 44, 49, 54, 58, 63]],
  ["ドロップD (DADGBE)", [38, 45, 50, 55, 59, 64]],
  ["DADGAD", [38, 45, 50, 55, 57, 62]],
  ["オープンG (DGDGBD)", [38, 43, 50, 55, 59, 62]],
  ["オープンD (DADF#AD)", [38, 45, 50, 54, 57, 62]],
];

const CHORD_QUALITY_LIST = [
  ["", "メジャー", [0, 4, 7]],
  ["m", "マイナー", [0, 3, 7]],
  ["7", "セブンス", [0, 4, 7, 10]],
  ["m7", "マイナーセブンス", [0, 3, 7, 10]],
  ["maj7", "メジャーセブンス", [0, 4, 7, 11]],
  ["mM7", "マイナーメジャーセブンス", [0, 3, 7, 11]],
  ["6", "シックス", [0, 4, 7, 9]],
  ["9", "ナインス", [0, 4, 7, 10, 14]],
  ["add9", "アドナインス", [0, 4, 7, 14]],
  ["sus2", "サスツー", [0, 2, 7]],
  ["sus4", "サスフォー", [0, 5, 7]],
  ["5", "パワーコード", [0, 7]],
  ["dim", "ディミニッシュ", [0, 3, 6]],
  ["dim7", "ディミニッシュセブンス", [0, 3, 6, 9]],
  ["aug", "オーギュメント", [0, 4, 8]],
  ["m7b5", "マイナーセブンス・フラットファイブ", [0, 3, 6, 10]],
];
const QUALITY = Object.fromEntries(CHORD_QUALITY_LIST.map(([q, name, iv]) => [q, { name, iv }]));

const SHAPES = {
  "": [["E", [0, 2, 2, 1, 0, 0]], ["A", [null, 0, 2, 2, 2, 0]]],
  "m": [["E", [0, 2, 2, 0, 0, 0]], ["A", [null, 0, 2, 2, 1, 0]]],
  "7": [["E", [0, 2, 0, 1, 0, 0]], ["A", [null, 0, 2, 0, 2, 0]]],
  "m7": [["E", [0, 2, 0, 0, 0, 0]], ["A", [null, 0, 2, 0, 1, 0]]],
  "maj7": [["E", [0, null, 1, 1, 0, null]], ["A", [null, 0, 2, 1, 2, 0]]],
  "mM7": [["E", [0, 2, 1, 0, 0, 0]], ["A", [null, 0, 2, 1, 1, 0]]],
  "6": [["E", [0, null, -1, 1, 0, null]], ["A", [null, 0, 2, 2, 2, 2]]],
  "9": [["E", [0, null, 0, 1, 0, 2]], ["A", [null, 0, -1, 0, 0, 0]]],
  "add9": [["E", [0, 2, 4, 1, 0, 0]], ["A", [null, 0, 2, 4, 2, 0]]],
  "sus2": [["A", [null, 0, 2, 2, 0, 0]]],
  "sus4": [["E", [0, 2, 2, 2, 0, 0]], ["A", [null, 0, 2, 2, 3, 0]]],
  "5": [["E", [0, 2, 2, null, null, null]], ["A", [null, 0, 2, 2, null, null]]],
  "dim": [["E", [0, 1, 2, 0, null, null]], ["A", [null, 0, 1, 2, 1, null]]],
  "dim7": [["E", [0, null, -1, 0, -1, null]], ["A", [null, 0, 1, -1, 1, null]]],
  "aug": [["E", [0, 3, 2, 1, 1, 0]], ["A", [null, 0, 3, 2, 2, 1]]],
  "m7b5": [["E", [0, null, 0, 0, -1, null]], ["A", [null, 0, 1, 0, 1, null]]],
};

const OPEN_CHORDS = {
  "0|": [null, 3, 2, 0, 1, 0],
  "0|maj7": [null, 3, 2, 0, 0, 0],
  "0|7": [null, 3, 2, 3, 1, 0],
  "0|add9": [null, 3, 2, 0, 3, 0],
  "2|": [null, null, 0, 2, 3, 2],
  "2|m": [null, null, 0, 2, 3, 1],
  "2|7": [null, null, 0, 2, 1, 2],
  "2|maj7": [null, null, 0, 2, 2, 2],
  "2|sus4": [null, null, 0, 2, 3, 3],
  "2|sus2": [null, null, 0, 2, 3, 0],
  "5|maj7": [null, null, 3, 2, 1, 0],
  "7|": [3, 2, 0, 0, 0, 3],
  "7|7": [3, 2, 0, 0, 0, 1],
  "11|7": [null, 2, 1, 2, 0, 2],
};

const SCALES = [
  ["メジャー (アイオニアン)", [0, 2, 4, 5, 7, 9, 11]],
  ["ナチュラルマイナー (エオリアン)", [0, 2, 3, 5, 7, 8, 10]],
  ["メジャーペンタトニック", [0, 2, 4, 7, 9]],
  ["マイナーペンタトニック", [0, 3, 5, 7, 10]],
  ["ブルース", [0, 3, 5, 6, 7, 10]],
  ["ドリアン", [0, 2, 3, 5, 7, 9, 10]],
  ["フリジアン", [0, 1, 3, 5, 7, 8, 10]],
  ["リディアン", [0, 2, 4, 6, 7, 9, 11]],
  ["ミクソリディアン", [0, 2, 4, 5, 7, 9, 10]],
  ["ロクリアン", [0, 1, 3, 5, 6, 8, 10]],
  ["ハーモニックマイナー", [0, 2, 3, 5, 7, 8, 11]],
  ["メロディックマイナー", [0, 2, 3, 5, 7, 9, 11]],
  ["ホールトーン", [0, 2, 4, 6, 8, 10]],
  ["ディミニッシュ (半音-全音)", [0, 1, 3, 4, 6, 7, 9, 10]],
  ["クロマチック", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
];

const TRIAD_MAP = { "4,7": "", "3,7": "m", "3,6": "dim", "4,8": "aug" };
const SEVENTH_MAP = {
  "4,7,11": "maj7",
  "4,7,10": "7",
  "3,7,10": "m7",
  "3,6,10": "m7b5",
  "3,7,11": "mM7",
  "3,6,9": "dim7",
  "4,8,11": "augM7",
  "4,8,10": "aug7",
};

const MAJOR_PRESETS = [
  ["王道進行 (IV→V→IIIm→VIm)", [3, 4, 2, 5]],
  ["4コード進行 (I→V→VIm→IV)", [0, 4, 5, 3]],
  ["小室進行 (VIm→IV→V→I)", [5, 3, 4, 0]],
  ["カノン進行", [0, 4, 5, 2, 3, 0, 3, 4]],
  ["50年代進行 (I→VIm→IV→V)", [0, 5, 3, 4]],
  ["ツーファイブワン (IIm→V→I)", [1, 4, 0]],
];
const MINOR_PRESETS = [
  ["Im→♭VI→♭III→♭VII", [0, 5, 2, 6]],
  ["Im→♭VII→♭VI→♭VII", [0, 6, 5, 6]],
  ["Im→IVm→Vm→Im", [0, 3, 4, 0]],
  ["Im→IVm→♭VII→♭III", [0, 3, 6, 2]],
];
const BLUES_PATTERN = [0, 0, 0, 0, 5, 5, 0, 0, 7, 5, 0, 7];

const INTERVALS = [
  [1, "短2度"], [2, "長2度"], [3, "短3度"], [4, "長3度"],
  [5, "完全4度"], [6, "増4度/減5度"], [7, "完全5度"], [8, "短6度"],
  [9, "長6度"], [10, "短7度"], [11, "長7度"], [12, "完全8度"],
];

const EASY_SHAPES = new Set([
  "C", "D", "E", "G", "A", "Am", "Em", "Dm", "E7", "A7", "D7", "G7",
  "C7", "B7", "Am7", "Em7", "Dm7", "Cmaj7", "Fmaj7", "Amaj7", "Dmaj7",
  "Asus2", "Asus4", "Dsus2", "Dsus4", "Esus4", "Cadd9",
]);

const TIPS = [
  "練習の最初は遅いテンポから始め、正確に弾けるようになってから少しずつBPMを上げましょう。",
  "コードチェンジは、次のコードの指の形を頭の中で準備してから動かすとスムーズになります。",
  "スケール練習では音名だけでなく度数（R, 3, 5など）も意識すると、アドリブに活かしやすくなります。",
  "弦は消耗品です。音がこもったりチューニングが安定しなくなったら交換を検討しましょう。",
  "短時間でも毎日続けることが上達の近道です。練習記録で継続日数を伸ばしましょう。",
  "メトロノームの裏拍（8分音符）を意識すると、リズムの安定感が大きく向上します。",
  "耳トレで音程を聴き分けられるようになると、耳コピが格段に楽になります。",
  "スピードトレーナーを使うと、少しずつテンポを上げる練習を自動化できます。",
];

const PRACTICE_CATEGORIES = ["コード練習", "スケール", "曲練習", "リズム/メトロノーム", "耳トレ", "即興", "その他"];
const LOG_KEY = "myGuiter.practiceLog";

/* =========================================================
   ユーティリティ
   ========================================================= */
const mod = (n, m) => ((n % m) + m) % m;
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const pad2 = (n) => String(n).padStart(2, "0");
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const signed = (v, d = 1) => (v >= 0 ? "+" : "") + v.toFixed(d);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function isoDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("localStorageに保存できませんでした", e);
  }
}

function metric(label, value, sub = "") {
  return `<div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div>${sub ? `<div class="metric-sub">${sub}</div>` : ""}</div>`;
}

function tabsHtml(tabs, active) {
  return `<div class="tabs">${tabs.map(([k, l]) => `<button class="tab${k === active ? " active" : ""}" data-tab="${k}">${l}</button>`).join("")}</div>`;
}

function bindTabs(view, state) {
  $$(".tab", view).forEach((b) => b.addEventListener("click", () => {
    state.tab = b.dataset.tab;
    render();
  }));
}

/* =========================================================
   設定
   ========================================================= */
const settings = {
  useFlat: lsGet("myGuiter.flat", false),
  tuningIndex: lsGet("myGuiter.tuning", 0),
};
if (!TUNINGS[settings.tuningIndex]) settings.tuningIndex = 0;

const noteNames = () => (settings.useFlat ? FLAT_NAMES : SHARP_NAMES);
const nm = (pc) => noteNames()[mod(pc, 12)];
const midiName = (m) => `${nm(m)}${Math.floor(m / 12) - 1}`;
const tuning = () => TUNINGS[settings.tuningIndex][1];
const tuningName = () => TUNINGS[settings.tuningIndex][0];
const isStandard = () => tuning().every((v, i) => v === STANDARD[i]);
const midiToFreq = (m, a4 = 440) => a4 * Math.pow(2, (m - 69) / 12);

function noteOptions(selected) {
  return Array.from({ length: 12 }, (_, i) => `<option value="${i}"${i === selected ? " selected" : ""}>${nm(i)}</option>`).join("");
}

/* =========================================================
   音楽理論
   ========================================================= */
function intervalLabel(i) {
  return i === 14 ? "9" : INTERVAL_LABELS[i % 12];
}

function chordPcs(root, quality) {
  return new Set(QUALITY[quality].iv.map((i) => mod(root + i, 12)));
}

function isValidVoicing(frets, root, quality) {
  const pcs = chordPcs(root, quality);
  const played = frets
    .map((f, i) => (f === null ? null : mod(STANDARD[i] + f, 12)))
    .filter((p) => p !== null);
  if (!played.length) return false;
  const distinct = new Set(played);
  return played[0] === root && [...distinct].every((p) => pcs.has(p)) && distinct.size >= Math.min(3, pcs.size);
}

function getVoicings(root, quality) {
  if (!QUALITY[quality]) return [];
  const results = [];
  const seen = new Set();
  const add = (label, frets) => {
    const key = frets.map((f) => (f === null ? "x" : f)).join(",");
    if (seen.has(key)) return;
    if (isValidVoicing(frets, root, quality)) {
      seen.add(key);
      results.push({ label, frets: [...frets] });
    }
  };
  const open = OPEN_CHORDS[`${root}|${quality}`];
  if (open) add("オープンコード", open);
  for (const [shape, offsets] of SHAPES[quality] || []) {
    const baseIdx = shape === "E" ? 0 : 1;
    let r = mod(root - STANDARD[baseIdx], 12);
    const played = offsets.filter((o) => o !== null);
    if (r + Math.min(...played) < 0) r += 12;
    const frets = offsets.map((o) => (o === null ? null : r + o));
    const lowest = Math.min(...frets.filter((f) => f !== null));
    add(lowest === 0 ? `${shape}フォーム（開放）` : `${shape}フォーム（${r}フレット）`, frets);
    if (r + 12 + Math.max(...played) <= 17) {
      add(`${shape}フォーム（${r + 12}フレット）`, offsets.map((o) => (o === null ? null : r + 12 + o)));
    }
  }
  return results;
}

function fretsToStr(frets) {
  const sep = frets.some((f) => f !== null && f > 9) ? "-" : "";
  return frets.map((f) => (f === null ? "x" : String(f))).join(sep);
}

const encFrets = (frets) => frets.map((f) => (f === null ? "x" : f)).join(",");
const decFrets = (s) => s.split(",").map((v) => (v === "x" ? null : Number(v)));

function diatonicChords(root, iv) {
  const n = iv.length;
  const rows = [];
  for (let i = 0; i < n; i++) {
    const r = iv[i];
    const third = mod(iv[(i + 2) % n] - r, 12);
    const fifth = mod(iv[(i + 4) % n] - r, 12);
    const seventh = mod(iv[(i + 6) % n] - r, 12);
    const diff = r - MAJOR_REF[i];
    const acc = { "-2": "𝄫", "-1": "♭", "0": "", "1": "♯" }[String(diff)] ?? "";
    rows.push({
      root: mod(root + r, 12),
      roman: acc + ROMAN[i],
      triad: TRIAD_MAP[`${third},${fifth}`] ?? "?",
      seventh: SEVENTH_MAP[`${third},${fifth},${seventh}`] ?? "?",
    });
  }
  return rows;
}

function identifyChord(frets, tune) {
  const notes = frets.map((f, i) => (f === null ? null : tune[i] + f)).filter((n) => n !== null);
  if (notes.length < 2) return [];
  const pcs = new Set(notes.map((n) => mod(n, 12)));
  const bass = mod(Math.min(...notes), 12);
  const out = [];
  const seen = new Set();
  for (let root = 0; root < 12; root++) {
    for (const [q, name, iv] of CHORD_QUALITY_LIST) {
      const cp = new Set(iv.map((i) => mod(root + i, 12)));
      const subset = [...pcs].every((p) => cp.has(p));
      const exact = subset && cp.size === pcs.size;
      let omit5 = false;
      if (!exact && subset && iv.includes(7) && cp.size - 1 === pcs.size && pcs.size >= 2) {
        omit5 = !pcs.has(mod(root + 7, 12)) && pcs.has(root);
      }
      if (!exact && !omit5) continue;
      const symbol = nm(root) + q + (bass !== root ? `/${nm(bass)}` : "");
      if (seen.has(symbol)) continue;
      seen.add(symbol);
      out.push({
        symbol,
        desc: name + (omit5 ? "（5度省略）" : "") + (bass !== root ? ` ・ ベース ${nm(bass)}` : ""),
        score: (bass === root ? 0 : 2) + (omit5 ? 1 : 0),
      });
    }
  }
  return out.sort((a, b) => a.score - b.score);
}

const NOTE_RE = /^([A-G])([#b♯♭]?)(.*)$/;
const BASS_RE = /^([A-G])([#b♯♭]?)$/;

function notePc(letter, acc) {
  return mod(LETTER_PC[letter] + ({ "#": 1, "♯": 1, "b": -1, "♭": -1 }[acc] || 0), 12);
}

function transposeSymbol(sym, n, nameList) {
  const slash = sym.lastIndexOf("/");
  if (slash > 0) {
    const bm = sym.slice(slash + 1).match(BASS_RE);
    if (bm) {
      const main = transposeSymbol(sym.slice(0, slash), n, nameList);
      if (main === null) return null;
      return `${main}/${nameList[mod(notePc(bm[1], bm[2]) + n, 12)]}`;
    }
  }
  const m = sym.match(NOTE_RE);
  if (!m) return null;
  return nameList[mod(notePc(m[1], m[2]) + n, 12)] + m[3];
}

function transposeText(text, n, nameList) {
  return text.split(/(\s+|\|)/).map((p) => {
    if (!p || /^\s+$/.test(p) || p === "|") return p;
    const t = transposeSymbol(p, n, nameList);
    return t === null ? p : t;
  }).join("");
}

function extractChords(text) {
  return text.split(/[\s|]+/).filter((p) => p && NOTE_RE.test(p));
}

/* =========================================================
   オーディオエンジン（Web Audio API）
   ========================================================= */
let actx = null;
let master = null;
const bufCache = new Map();
const activeSources = new Set();

function ac() {
  if (!actx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    actx = new Ctx();
    const comp = actx.createDynamicsCompressor();
    master = actx.createGain();
    master.gain.value = 0.8;
    master.connect(comp);
    comp.connect(actx.destination);
  }
  if (actx.state === "suspended") actx.resume();
  return actx;
}

function ksBuffer(midi, dur) {
  const key = `${midi}|${Math.round(dur * 100)}`;
  const cached = bufCache.get(key);
  if (cached) return cached;
  const ctx = ac();
  const sr = ctx.sampleRate;
  const n = Math.max(1, Math.floor(sr * dur));
  const period = Math.max(2, Math.round(sr / midiToFreq(midi) - 0.5));
  const ring = new Float32Array(period);
  let mean = 0;
  for (let i = 0; i < period; i++) {
    ring[i] = Math.random() * 2 - 1;
    mean += ring[i];
  }
  mean /= period;
  for (let i = 0; i < period; i++) ring[i] -= mean;
  const data = new Float32Array(n);
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const nx = idx + 1 === period ? 0 : idx + 1;
    const v = ring[idx];
    data[i] = v;
    ring[idx] = 0.498 * (v + ring[nx]);
    idx = nx;
  }
  const fade = Math.min(n, Math.floor(sr * 0.06));
  for (let i = 0; i < fade; i++) data[n - 1 - i] *= i / fade;
  const buffer = ctx.createBuffer(1, n, sr);
  buffer.getChannelData(0).set(data);
  if (bufCache.size > 600) bufCache.clear();
  bufCache.set(key, buffer);
  return buffer;
}

function playBuffer(buffer, when, gain) {
  const ctx = ac();
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(g);
  g.connect(master);
  src.start(Math.max(when, ctx.currentTime));
  activeSources.add(src);
  src.onended = () => activeSources.delete(src);
}

function stopAllSounds() {
  activeSources.forEach((s) => {
    try {
      s.stop();
    } catch (e) {
      /* 既に停止済み */
    }
  });
  activeSources.clear();
}

function playNote(midi, when, dur = 2, gain = 0.7) {
  const ctx = ac();
  playBuffer(ksBuffer(midi, dur), when === undefined ? ctx.currentTime : when, gain);
}

function playStrum(frets, when, dur = 2.5, up = false, gain = 1, tune = STANDARD) {
  const ctx = ac();
  const t0 = when === undefined ? ctx.currentTime : when;
  let strings = frets.map((f, i) => [i, f]).filter(([, f]) => f !== null);
  if (up) strings = strings.reverse();
  const g = (gain * 0.9) / Math.sqrt(Math.max(strings.length, 1));
  strings.forEach(([i, f], k) => playBuffer(ksBuffer(tune[i] + f, dur), t0 + k * 0.012, g));
}

function playArpeggio(frets, tune = STANDARD) {
  const ctx = ac();
  const t0 = ctx.currentTime;
  frets.map((f, i) => [i, f]).filter(([, f]) => f !== null).forEach(([i, f], k) => {
    playBuffer(ksBuffer(tune[i] + f, 2.5), t0 + k * 0.18, 0.6);
  });
}

function playRefTone(freq, dur = 3) {
  const ctx = ac();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const wave = ctx.createPeriodicWave(
    new Float32Array([0, 0, 0, 0, 0]),
    new Float32Array([0, 1, 0.5, 0.25, 0.12])
  );
  osc.setPeriodicWave(wave);
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.4, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
  activeSources.add(osc);
  osc.onended = () => activeSources.delete(osc);
}

function playClick(t, freq, amp) {
  if (amp <= 0.0001) return;
  const ctx = ac();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(amp, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  o.connect(g);
  g.connect(master);
  o.start(t);
  o.stop(t + 0.06);
}

function playScale(root, iv) {
  const ctx = ac();
  const notes = iv.map((i) => 48 + root + i).concat([60 + root]);
  const seq = notes.concat(notes.slice(0, -1).reverse());
  const t0 = ctx.currentTime + 0.05;
  seq.forEach((m, k) => playNote(m, t0 + k * 0.3, 1.0, 0.7));
}

function startScheduler(stepFn) {
  const ctx = ac();
  let next = ctx.currentTime + 0.08;
  let stopped = false;
  const timeouts = new Set();
  const later = (t, fn) => {
    const id = setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, Math.max(0, (t - ctx.currentTime) * 1000));
    timeouts.add(id);
  };
  const tick = () => {
    while (!stopped && next < ctx.currentTime + 0.12) {
      const r = stepFn(next, later);
      if (r === null) {
        stopped = true;
        clearInterval(timer);
        return;
      }
      next = r;
    }
  };
  const timer = setInterval(tick, 25);
  tick();
  return () => {
    stopped = true;
    clearInterval(timer);
    timeouts.forEach(clearTimeout);
    timeouts.clear();
  };
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-strum],[data-arp],[data-midi],[data-ref],[data-chord]");
  if (!el || el.disabled) return;
  const tuneAttr = el.getAttribute("data-tune");
  const tune = tuneAttr ? tuneAttr.split(",").map(Number) : STANDARD;
  if (el.hasAttribute("data-strum")) {
    playStrum(decFrets(el.getAttribute("data-strum")), undefined, 2.5, false, 1, tune);
  } else if (el.hasAttribute("data-arp")) {
    playArpeggio(decFrets(el.getAttribute("data-arp")), tune);
  } else if (el.hasAttribute("data-midi")) {
    playNote(Number(el.getAttribute("data-midi")));
  } else if (el.hasAttribute("data-ref")) {
    playRefTone(Number(el.getAttribute("data-ref")));
  } else if (el.hasAttribute("data-chord")) {
    const [pc, q] = el.getAttribute("data-chord").split("|");
    const v = getVoicings(Number(pc), q)[0];
    if (v) playStrum(v.frets);
  }
});

/* =========================================================
   ピッチ検出（McLeod Pitch Method 簡易版）
   ========================================================= */
function detectPitch(buf, sr) {
  const N = buf.length;
  let sum = 0;
  for (let i = 0; i < N; i++) sum += buf[i] * buf[i];
  const rms = Math.sqrt(sum / N);
  if (rms < 0.01) return null;
  const minLag = Math.floor(sr / 1200);
  const maxLag = Math.min(N - 2, Math.ceil(sr / 60));
  const nsdf = new Float32Array(maxLag + 2);
  for (let lag = 0; lag <= maxLag + 1; lag++) {
    let acf = 0;
    let m = 0;
    for (let i = 0; i < N - lag; i++) {
      const a = buf[i];
      const b = buf[i + lag];
      acf += a * b;
      m += a * a + b * b;
    }
    nsdf[lag] = m > 0 ? (2 * acf) / m : 0;
  }
  const peaks = [];
  let lag = 1;
  while (lag < maxLag && nsdf[lag] > 0) lag++;
  while (lag < maxLag) {
    while (lag < maxLag && nsdf[lag] <= 0) lag++;
    let best = -1;
    let bestVal = -Infinity;
    while (lag < maxLag && nsdf[lag] > 0) {
      if (nsdf[lag] > bestVal) {
        bestVal = nsdf[lag];
        best = lag;
      }
      lag++;
    }
    if (best >= minLag) peaks.push(best);
  }
  if (!peaks.length) return null;
  const maxVal = Math.max(...peaks.map((p) => nsdf[p]));
  if (maxVal < 0.6) return null;
  const chosen = peaks.find((p) => nsdf[p] >= 0.9 * maxVal);
  const a = nsdf[chosen - 1];
  const b = nsdf[chosen];
  const c = nsdf[chosen + 1];
  const denom = a - 2 * b + c;
  const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
  return { freq: sr / (chosen + shift), rms };
}

/* =========================================================
   SVG描画
   ========================================================= */
function chordSvg(frets, title, tune = STANDARD) {
  const left = 35;
  const top = 62;
  const sgap = 30;
  const fgap = 34;
  const pos = frets.filter((f) => f !== null && f > 0);
  const maxPos = pos.length ? Math.max(...pos) : 0;
  const base = !pos.length || maxPos <= 5 ? 1 : Math.min(...pos);
  const nf = Math.max(5, maxPos - base + 1);
  const width = left * 2 + sgap * 5;
  const height = top + fgap * nf + 40;
  const font = 'font-family="sans-serif" text-anchor="middle"';
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  p.push(`<rect width="${width}" height="${height}" fill="#ffffff" rx="8"/>`);
  p.push(`<text x="${width / 2}" y="24" ${font} font-size="20" font-weight="bold" fill="#222">${esc(title)}</text>`);
  for (let j = 0; j <= nf; j++) {
    const y = top + j * fgap;
    const sw = j === 0 && base === 1 ? 5 : 1.5;
    p.push(`<line x1="${left}" y1="${y}" x2="${left + 5 * sgap}" y2="${y}" stroke="#333" stroke-width="${sw}"/>`);
  }
  for (let i = 0; i < 6; i++) {
    const x = left + i * sgap;
    p.push(`<line x1="${x}" y1="${top}" x2="${x}" y2="${top + nf * fgap}" stroke="#555" stroke-width="${1 + (5 - i) * 0.3}"/>`);
  }
  if (base > 1) {
    p.push(`<text x="${left + 5 * sgap + 8}" y="${top + fgap / 2 + 4}" font-family="sans-serif" font-size="12" fill="#333">${base}fr</text>`);
  }
  frets.forEach((f, i) => {
    const x = left + i * sgap;
    if (f === null) {
      p.push(`<text x="${x}" y="${top - 8}" ${font} font-size="16" fill="#c00">×</text>`);
      return;
    }
    if (f === 0) {
      p.push(`<circle cx="${x}" cy="${top - 14}" r="6" fill="none" stroke="#222" stroke-width="1.8"/>`);
    } else {
      const cy = top + (f - base + 0.5) * fgap;
      p.push(`<circle cx="${x}" cy="${cy}" r="10" fill="#222"/>`);
    }
    p.push(`<text x="${x}" y="${top + nf * fgap + 22}" ${font} font-size="11" fill="#444">${nm(tune[i] + f)}</text>`);
  });
  p.push("</svg>");
  return p.join("");
}

function chordCard(frets, title, label, tune = STANDARD) {
  const enc = encFrets(frets);
  const t = tune.join(",");
  return `<div class="chord-card">
    ${chordSvg(frets, title, tune)}
    <div class="caption">${label ? esc(label) + "<br>" : ""}${fretsToStr(frets)}</div>
    <div class="btn-row">
      <button class="btn small" data-strum="${enc}" data-tune="${t}">▶ ストローク</button>
      <button class="btn small ghost" data-arp="${enc}" data-tune="${t}">♪ アルペジオ</button>
    </div>
  </div>`;
}

function fretboardSvg(tune, marks, start = 0, end = 15, clickable = true) {
  const fw = 52;
  const sg = 28;
  const ml = 45;
  const mt = 25;
  const ncols = end - start + 1;
  const width = ml + ncols * fw + 20;
  const height = mt + 5 * sg + 50;
  const font = 'font-family="sans-serif" text-anchor="middle"';
  const p = [`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`];
  p.push(`<rect x="${ml}" y="${mt - 10}" width="${ncols * fw}" height="${5 * sg + 20}" fill="#f3e3c3" rx="4"/>`);
  for (let f = Math.max(start, 1); f <= end; f++) {
    const cx = ml + (f - start + 0.5) * fw;
    if ([3, 5, 7, 9].includes(f % 12)) {
      p.push(`<circle cx="${cx}" cy="${mt + 2.5 * sg}" r="6" fill="#c9b48a"/>`);
    } else if (f % 12 === 0) {
      p.push(`<circle cx="${cx}" cy="${mt + 1.5 * sg}" r="6" fill="#c9b48a"/>`);
      p.push(`<circle cx="${cx}" cy="${mt + 3.5 * sg}" r="6" fill="#c9b48a"/>`);
    }
  }
  if (start > 0) {
    p.push(`<line x1="${ml}" y1="${mt - 10}" x2="${ml}" y2="${mt + 5 * sg + 10}" stroke="#888" stroke-width="2"/>`);
  }
  for (let f = start; f <= end; f++) {
    const x = ml + (f - start + 1) * fw;
    const w = f === 0 ? 6 : 2;
    const color = f === 0 ? "#444" : "#999";
    p.push(`<line x1="${x}" y1="${mt - 10}" x2="${x}" y2="${mt + 5 * sg + 10}" stroke="${color}" stroke-width="${w}"/>`);
  }
  for (let k = 0; k < 6; k++) {
    const si = 5 - k;
    const y = mt + k * sg;
    p.push(`<line x1="${ml}" y1="${y}" x2="${ml + ncols * fw}" y2="${y}" stroke="#666" stroke-width="${1 + k * 0.4}"/>`);
    p.push(`<text x="${ml - 22}" y="${y + 4}" ${font} font-size="12" font-weight="bold" fill="#333">${nm(tune[si])}</text>`);
  }
  for (let f = start; f <= end; f++) {
    const cx = ml + (f - start + 0.5) * fw;
    p.push(`<text x="${cx}" y="${mt + 5 * sg + 32}" ${font} font-size="11" fill="#555">${f}</text>`);
  }
  if (clickable) {
    for (let si = 0; si < 6; si++) {
      for (let f = start; f <= end; f++) {
        const x = ml + (f - start) * fw;
        const y = mt + (5 - si) * sg - sg / 2;
        p.push(`<rect class="fb-cell" x="${x}" y="${y}" width="${fw}" height="${sg}" fill="transparent" data-midi="${tune[si] + f}"><title>${midiName(tune[si] + f)}</title></rect>`);
      }
    }
  }
  for (const [si, f, label, color] of marks) {
    if (f < start || f > end) continue;
    const cx = ml + (f - start + 0.5) * fw;
    const cy = mt + (5 - si) * sg;
    p.push(`<circle cx="${cx}" cy="${cy}" r="11" fill="${color}" pointer-events="none"/>`);
    p.push(`<text x="${cx}" y="${cy + 4}" ${font} font-size="10" font-weight="bold" fill="#fff" pointer-events="none">${esc(label)}</text>`);
  }
  p.push("</svg>");
  return p.join("");
}

function buildMarks(tune, labels, root, start, end, show) {
  const marks = [];
  for (let si = 0; si < 6; si++) {
    for (let f = start; f <= end; f++) {
      const pc = mod(tune[si] + f, 12);
      if (labels.has(pc)) {
        const label = show === "度数" ? labels.get(pc) : nm(pc);
        marks.push([si, f, label, pc === root ? "#d62728" : "#1f4e79"]);
      }
    }
  }
  return marks;
}

function mountFretboard(container, state, getData) {
  container.innerHTML = `
    <div class="row">
      <label>表示
        <select class="fb-show">
          <option${state.show === "度数" ? " selected" : ""}>度数</option>
          <option${state.show === "音名" ? " selected" : ""}>音名</option>
        </select>
      </label>
      <label>開始フレット<input type="number" class="fb-start" min="0" max="23" value="${state.start}"></label>
      <label>終了フレット<input type="number" class="fb-end" min="1" max="24" value="${state.end}"></label>
    </div>
    <div class="fb-wrap"></div>
    <p class="caption">赤 = ルート音 / 指板をクリックするとその音が鳴ります</p>`;
  const draw = () => {
    const { labels, root } = getData();
    const tune = tuning();
    $(".fb-wrap", container).innerHTML = fretboardSvg(
      tune,
      buildMarks(tune, labels, root, state.start, state.end, state.show),
      state.start,
      state.end,
      true
    );
  };
  $(".fb-show", container).addEventListener("change", (e) => {
    state.show = e.target.value;
    draw();
  });
  const onRange = () => {
    let a = parseInt($(".fb-start", container).value, 10);
    let b = parseInt($(".fb-end", container).value, 10);
    if (Number.isNaN(a)) a = 0;
    if (Number.isNaN(b)) b = 15;
    a = clamp(a, 0, 23);
    b = clamp(b, 1, 24);
    if (b <= a) b = Math.min(24, a + 1);
    state.start = a;
    state.end = b;
    $(".fb-start", container).value = a;
    $(".fb-end", container).value = b;
    draw();
  };
  $(".fb-start", container).addEventListener("change", onRange);
  $(".fb-end", container).addEventListener("change", onRange);
  draw();
}

function barChartSvg(labels, values, labelEvery = 1) {
  const n = labels.length;
  const W = Math.max(320, n * 26 + 60);
  const H = 230;
  const ml = 44;
  const mr = 10;
  const mt = 12;
  const mb = 44;
  const cw = W - ml - mr;
  const chh = H - mt - mb;
  const steps = [20, 40, 60, 80, 120, 160, 240, 320, 480, 640];
  const max = Math.max(1, ...values);
  const top = steps.find((s) => max <= s) || Math.ceil(max / 160) * 160;
  const bw = cw / n;
  let s = `<svg class="chart" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%" preserveAspectRatio="xMinYMin meet">`;
  for (let k = 0; k <= 4; k++) {
    const y = mt + chh - (chh * k) / 4;
    s += `<line x1="${ml}" y1="${y}" x2="${W - mr}" y2="${y}" stroke="#e5e5e5"/>`;
    s += `<text x="${ml - 6}" y="${y + 4}" font-size="11" text-anchor="end" fill="#777">${(top * k) / 4}</text>`;
  }
  values.forEach((v, i) => {
    const h = (chh * v) / top;
    const x = ml + i * bw + bw * 0.15;
    s += `<rect x="${x}" y="${mt + chh - h}" width="${bw * 0.7}" height="${h}" fill="#e4572e" rx="2"><title>${esc(labels[i])}: ${v}分</title></rect>`;
    if (i % labelEvery === 0) {
      s += `<text x="${ml + i * bw + bw / 2}" y="${H - mb + 16}" font-size="10" text-anchor="middle" fill="#555">${esc(labels[i])}</text>`;
    }
  });
  return s + "</svg>";
}

/* =========================================================
   練習記録データ
   ========================================================= */
function loadLog() {
  const v = lsGet(LOG_KEY, []);
  if (!Array.isArray(v)) return [];
  return v.filter((e) => e && typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && Number.isFinite(e.minutes));
}

function saveLog(entries) {
  lsSet(LOG_KEY, entries);
}

function logStats(entries) {
  const today = new Date();
  const todayIso = isoDate(today);
  const total = entries.reduce((a, e) => a + e.minutes, 0);
  const todayMin = entries.filter((e) => e.date === todayIso).reduce((a, e) => a + e.minutes, 0);
  const days = new Set(entries.map((e) => e.date));
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!days.has(isoDate(d))) d.setDate(d.getDate() - 1);
  let streak = 0;
  while (days.has(isoDate(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return { total, todayMin, streak };
}

/* =========================================================
   ページ: ホーム
   ========================================================= */
function renderHome(view) {
  const { total, todayMin, streak } = logStats(loadLog());
  const now = new Date();
  const dayNumber = Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
  const tip = TIPS[mod(dayNumber, TIPS.length)];
  view.innerHTML = `
    <h1>🎸 My Guiter</h1>
    <p class="caption">ギタリストのためのオールインワン練習ツール</p>
    <div class="metrics">
      ${metric("今日の練習時間", `${todayMin} 分`)}
      ${metric("連続練習日数", `${streak} 日`)}
      ${metric("累計練習時間", `${Math.floor(total / 60)} 時間 ${total % 60} 分`)}
    </div>
    <h2>💡 今日のヒント</h2>
    <div class="info">${esc(tip)}</div>
    <h2>機能一覧</h2>
    <div class="cards">
      ${PAGES.filter((p) => p.id !== "home").map((p) => `
        <a class="card" href="#${p.id}">
          <div class="card-title">${p.label}</div>
          <div class="card-desc">${p.desc}</div>
        </a>`).join("")}
    </div>`;
}

/* =========================================================
   ページ: コード辞典
   ========================================================= */
const chordState = {
  tab: "dict",
  root: 0,
  quality: "",
  show: "度数",
  start: 0,
  end: 15,
  idFrets: [null, 3, 2, 0, 1, 0],
};

function renderChords(view) {
  view.innerHTML = `
    <h1>🎼 コード辞典</h1>
    ${tabsHtml([["dict", "コード辞典"], ["identify", "コード判定"]], chordState.tab)}
    <div id="chordBody"></div>`;
  bindTabs(view, chordState);
  const body = $("#chordBody", view);
  if (chordState.tab === "dict") chordDict(body);
  else chordIdentify(body);
}

function chordDict(body) {
  const s = chordState;
  body.innerHTML = `
    <div class="row">
      <label>ルート<select id="cRoot">${noteOptions(s.root)}</select></label>
      <label>コードタイプ
        <select id="cQual">
          ${CHORD_QUALITY_LIST.map(([q, n]) => `<option value="${esc(q)}"${q === s.quality ? " selected" : ""}>${q || "(なし)"}  -  ${n}</option>`).join("")}
        </select>
      </label>
    </div>
    <div id="cInfo"></div>
    <h2>指板上の構成音</h2>
    <div id="cFb"></div>`;
  const draw = () => {
    const { name, iv } = QUALITY[s.quality];
    const symbol = nm(s.root) + s.quality;
    const vs = getVoicings(s.root, s.quality);
    $("#cInfo", body).innerHTML = `
      <h2>${esc(symbol)} <span class="muted">(${name})</span></h2>
      <p>構成音: ${iv.map((i) => `${nm(s.root + i)} (${intervalLabel(i)})`).join(" / ")}</p>
      ${isStandard() ? "" : '<div class="info">コードフォームはスタンダードチューニング基準で表示しています。</div>'}
      ${vs.length
        ? `<div class="chord-grid">${vs.map((v) => chordCard(v.frets, symbol, v.label)).join("")}</div>`
        : '<div class="warn">このコードのフォームは登録されていません。</div>'}`;
    mountFretboard($("#cFb", body), s, () => ({
      labels: new Map(iv.map((i) => [mod(s.root + i, 12), intervalLabel(i)])),
      root: s.root,
    }));
  };
  $("#cRoot", body).addEventListener("change", (e) => {
    s.root = Number(e.target.value);
    draw();
  });
  $("#cQual", body).addEventListener("change", (e) => {
    s.quality = e.target.value;
    draw();
  });
  draw();
}

function chordIdentify(body) {
  const s = chordState;
  const tune = tuning();
  const fretValues = ["x"].concat(Array.from({ length: 16 }, (_, k) => k));
  body.innerHTML = `
    <p>各弦のフレットを選ぶと、コード名を判定します（チューニング: ${esc(tuningName())}）。</p>
    <div class="string-selects">
      ${tune.map((m, i) => `
        <label>${6 - i}弦 (${nm(m)})
          <select data-si="${i}">
            ${fretValues.map((v) => {
              const val = v === "x" ? null : v;
              return `<option value="${v}"${s.idFrets[i] === val ? " selected" : ""}>${v === "x" ? "×" : v}</option>`;
            }).join("")}
          </select>
        </label>`).join("")}
    </div>
    <div class="btn-row"><button class="btn ghost small" id="idClear">すべてミュート</button></div>
    <div id="idResult"></div>`;
  const draw = () => {
    const res = identifyChord(s.idFrets, tune);
    const played = s.idFrets.some((f) => f !== null);
    const notes = s.idFrets.map((f, i) => (f === null ? null : midiName(tune[i] + f))).filter(Boolean);
    let html = "";
    if (played) {
      html += `<div class="chord-grid">${chordCard(s.idFrets, res.length ? res[0].symbol : "?", "選択したフォーム", tune)}</div>`;
      html += `<p>構成音: ${notes.join("  ")}</p>`;
    }
    if (res.length) {
      html += `<h3>判定結果</h3><ul class="result-list">${res.map((r) => `<li><b>${esc(r.symbol)}</b>  <span class="muted">${esc(r.desc)}</span></li>`).join("")}</ul>`;
    } else if (notes.length >= 2) {
      html += '<div class="warn">該当するコードが見つかりませんでした。</div>';
    } else {
      html += '<div class="info">2本以上の弦を選んでください。</div>';
    }
    $("#idResult", body).innerHTML = html;
  };
  $$("select[data-si]", body).forEach((sel) => sel.addEventListener("change", (e) => {
    const v = e.target.value;
    s.idFrets[Number(e.target.dataset.si)] = v === "x" ? null : Number(v);
    draw();
  }));
  $("#idClear", body).addEventListener("click", () => {
    s.idFrets = [null, null, null, null, null, null];
    render();
  });
  draw();
}

/* =========================================================
   ページ: スケール & 指板
   ========================================================= */
const scaleState = { root: 0, scale: 0, show: "度数", start: 0, end: 15 };

function chordChip(pc, q) {
  const has = getVoicings(pc, q).length > 0;
  return `<button class="chip" ${has ? `data-chord="${pc}|${esc(q)}"` : "disabled"}>${esc(nm(pc) + q)}</button>`;
}

function diatonicTable(dia) {
  return `<div class="table-wrap"><table class="data">
    <thead><tr><th>度数</th><th>トライアド</th><th>セブンス</th></tr></thead>
    <tbody>${dia.map((d) => `<tr><td>${d.roman}</td><td>${chordChip(d.root, d.triad)}</td><td>${chordChip(d.root, d.seventh)}</td></tr>`).join("")}</tbody>
  </table></div>
  <p class="caption">コード名をクリックすると試聴できます。</p>`;
}

function renderScales(view) {
  const s = scaleState;
  view.innerHTML = `
    <h1>🎹 スケール & 指板</h1>
    <div class="row">
      <label>ルート<select id="sRoot">${noteOptions(s.root)}</select></label>
      <label>スケール
        <select id="sScale">${SCALES.map(([n], i) => `<option value="${i}"${i === s.scale ? " selected" : ""}>${n}</option>`).join("")}</select>
      </label>
    </div>
    <div id="sInfo"></div>
    <div id="sFb"></div>
    <div id="sDia"></div>`;
  const draw = () => {
    const iv = SCALES[s.scale][1];
    $("#sInfo", view).innerHTML = `
      <p>構成音: ${iv.map((i) => nm(s.root + i)).join("  ")}<br>度数: ${iv.map((i) => INTERVAL_LABELS[i]).join("  ")}</p>
      <div class="btn-row">
        <button class="btn" id="sPlay">▶ スケール試聴（上行→下行）</button>
        <button class="btn ghost" id="sStop">■ 停止</button>
      </div>`;
    $("#sPlay", view).addEventListener("click", () => {
      stopAllSounds();
      playScale(s.root, iv);
    });
    $("#sStop", view).addEventListener("click", stopAllSounds);
    mountFretboard($("#sFb", view), s, () => ({
      labels: new Map(iv.map((i) => [mod(s.root + i, 12), INTERVAL_LABELS[i]])),
      root: s.root,
    }));
    $("#sDia", view).innerHTML = iv.length === 7
      ? `<h2>ダイアトニックコード</h2>${diatonicTable(diatonicChords(s.root, iv))}`
      : "";
  };
  $("#sRoot", view).addEventListener("change", (e) => {
    s.root = Number(e.target.value);
    draw();
  });
  $("#sScale", view).addEventListener("change", (e) => {
    s.scale = Number(e.target.value);
    draw();
  });
  draw();
}

/* =========================================================
   ページ: コード進行
   ========================================================= */
const progState = {
  key: 0,
  major: true,
  seventh: false,
  preset: MAJOR_PRESETS[0][0],
  custom: "1 6 4 5",
  bpm: 90,
  beats: 4,
  eighth: false,
  loop: true,
  click: false,
};

function buildProgression() {
  const s = progState;
  const dia = diatonicChords(s.key, s.major ? MAJOR_SCALE : MINOR_SCALE);
  if (s.preset === "12小節ブルース") {
    const map = s.major
      ? { 0: ["7", "I7"], 5: ["7", "IV7"], 7: ["7", "V7"] }
      : { 0: ["m7", "Im7"], 5: ["m7", "IVm7"], 7: ["7", "V7"] };
    return {
      dia,
      chords: BLUES_PATTERN.map((o) => ({ pc: mod(s.key + o, 12), q: map[o][0], roman: map[o][1] })),
    };
  }
  let degrees;
  if (s.preset === "カスタム") {
    const tokens = s.custom.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length || !tokens.every((t) => /^[1-7]$/.test(t))) {
      return { dia, error: "1〜7の数字をスペース区切りで入力してください。" };
    }
    degrees = tokens.map((t) => Number(t) - 1);
  } else {
    const list = s.major ? MAJOR_PRESETS : MINOR_PRESETS;
    degrees = (list.find((p) => p[0] === s.preset) || list[0])[1];
  }
  return {
    dia,
    chords: degrees.map((d) => {
      const q = s.seventh ? dia[d].seventh : dia[d].triad;
      return { pc: dia[d].root, q, roman: dia[d].roman + q };
    }),
  };
}

function renderProgression(view) {
  const s = progState;
  const presetNames = (s.major ? MAJOR_PRESETS : MINOR_PRESETS).map((p) => p[0]).concat(["12小節ブルース", "カスタム"]);
  if (!presetNames.includes(s.preset)) s.preset = presetNames[0];
  view.innerHTML = `
    <h1>🔄 コード進行</h1>
    <div class="row">
      <label>キー<select id="pKey">${noteOptions(s.key)}</select></label>
      <label>モード
        <select id="pMode">
          <option value="maj"${s.major ? " selected" : ""}>メジャー</option>
          <option value="min"${s.major ? "" : " selected"}>マイナー</option>
        </select>
      </label>
      <label class="check"><input type="checkbox" id="pSev"${s.seventh ? " checked" : ""}> セブンスコードにする</label>
    </div>
    <details class="box">
      <summary>ダイアトニックコードと関係調</summary>
      <div id="pDia"></div>
    </details>
    <div class="row">
      <label>進行パターン
        <select id="pPreset">${presetNames.map((n) => `<option${n === s.preset ? " selected" : ""}>${esc(n)}</option>`).join("")}</select>
      </label>
      <label id="pCustomWrap"${s.preset === "カスタム" ? "" : ' style="display:none"'}>度数（1〜7をスペース区切り）
        <input type="text" id="pCustom" value="${esc(s.custom)}">
      </label>
    </div>
    <div id="pSeq"></div>
    <div id="pDiagrams"></div>
    <h2>伴奏</h2>
    <div class="row">
      <label>BPM: <span id="pBpmVal">${s.bpm}</span><input type="range" id="pBpm" min="50" max="200" value="${s.bpm}"></label>
      <label>1コードの拍数
        <select id="pBeats">${[2, 4, 8].map((b) => `<option value="${b}"${b === s.beats ? " selected" : ""}>${b}</option>`).join("")}</select>
      </label>
      <label>ストローク
        <select id="pStroke">
          <option value="down"${s.eighth ? "" : " selected"}>ダウン (4分)</option>
          <option value="du"${s.eighth ? " selected" : ""}>ダウン・アップ (8分)</option>
        </select>
      </label>
      <label class="check"><input type="checkbox" id="pLoop"${s.loop ? " checked" : ""}> ループ再生</label>
      <label class="check"><input type="checkbox" id="pClick"${s.click ? " checked" : ""}> クリック音</label>
    </div>
    <div class="btn-row">
      <button class="btn" id="pPlay">▶ 再生</button>
      <button class="btn ghost" id="pStop">■ 停止</button>
    </div>
    <p class="caption">BPMとクリック音は再生中にも変更できます。</p>`;

  let stopFn = null;
  let current = buildProgression();

  const highlight = (ci) => {
    $$(".prog-chord", view).forEach((el) => el.classList.toggle("active", Number(el.dataset.idx) === ci));
  };
  const stop = () => {
    if (stopFn) {
      stopFn();
      stopFn = null;
    }
    stopAllSounds();
    highlight(-1);
    $("#pPlay", view).disabled = false;
  };
  onCleanup(() => {
    if (stopFn) stopFn();
  });

  const drawContent = () => {
    current = buildProgression();
    const { dia, chords, error } = current;
    $("#pDia", view).innerHTML = diatonicTable(dia) + (s.major
      ? `<p>平行調: ${nm(s.key + 9)}m / 属調: ${nm(s.key + 7)} / 下属調: ${nm(s.key + 5)}</p>`
      : `<p>平行調: ${nm(s.key + 3)} / 属調: ${nm(s.key + 7)}m / 下属調: ${nm(s.key + 5)}m</p>`);
    if (error) {
      $("#pSeq", view).innerHTML = `<div class="error">${esc(error)}</div>`;
      $("#pDiagrams", view).innerHTML = "";
      $("#pPlay", view).disabled = true;
      return;
    }
    $("#pPlay", view).disabled = false;
    $("#pSeq", view).innerHTML = `<div class="prog-seq">${chords.map((c, i) => `
      ${i > 0 ? '<span class="prog-arrow">→</span>' : ""}
      <span class="prog-chord" data-idx="${i}"><b>${esc(nm(c.pc) + c.q)}</b><small>${esc(c.roman)}</small></span>`).join("")}</div>`;
    const unique = [];
    chords.forEach((c) => {
      if (!unique.some((u) => u.pc === c.pc && u.q === c.q)) unique.push(c);
    });
    $("#pDiagrams", view).innerHTML = `<div class="chord-grid">${unique.map((c) => {
      const v = getVoicings(c.pc, c.q)[0];
      return v ? chordCard(v.frets, nm(c.pc) + c.q, "") : `<div class="chord-card"><b>${esc(nm(c.pc) + c.q)}</b></div>`;
    }).join("")}</div>`;
  };

  const start = () => {
    stop();
    const { chords, error } = current;
    if (error || !chords.length) return;
    const eighth = s.eighth;
    const stepsPer = s.beats * (eighth ? 2 : 1);
    const total = chords.length * stepsPer;
    const voicings = chords.map((c) => {
      const v = getVoicings(c.pc, c.q)[0];
      return v ? v.frets : null;
    });
    const loop = s.loop;
    let counter = 0;
    $("#pPlay", view).disabled = true;
    stopFn = startScheduler((t, later) => {
      if (!loop && counter >= total) {
        later(t + 2.5, () => {
          stopFn = null;
          highlight(-1);
          $("#pPlay", view).disabled = false;
        });
        return null;
      }
      const step = 60 / s.bpm / (eighth ? 2 : 1);
      const pos = counter % total;
      const ci = Math.floor(pos / stepsPer);
      const st = pos % stepsPer;
      const frets = voicings[ci];
      const isLast = !loop && counter === total - 1;
      const up = eighth && st % 2 === 1;
      if (frets) {
        const gain = st === 0 ? 1 : up ? 0.55 : 0.8;
        const dur = isLast ? 2.5 : Math.round((step + 0.15) * 20) / 20;
        playStrum(frets, t, dur, up, gain);
      }
      if (s.click && !up) playClick(t, st === 0 ? 1600 : 1000, 0.3);
      if (st === 0) later(t, () => highlight(ci));
      counter++;
      return t + step;
    });
  };

  const changeAndRedraw = () => {
    stop();
    drawContent();
  };

  $("#pKey", view).addEventListener("change", (e) => {
    s.key = Number(e.target.value);
    changeAndRedraw();
  });
  $("#pMode", view).addEventListener("change", (e) => {
    s.major = e.target.value === "maj";
    render();
  });
  $("#pSev", view).addEventListener("change", (e) => {
    s.seventh = e.target.checked;
    changeAndRedraw();
  });
  $("#pPreset", view).addEventListener("change", (e) => {
    s.preset = e.target.value;
    $("#pCustomWrap", view).style.display = s.preset === "カスタム" ? "" : "none";
    changeAndRedraw();
  });
  $("#pCustom", view).addEventListener("input", (e) => {
    s.custom = e.target.value;
    changeAndRedraw();
  });
  $("#pBpm", view).addEventListener("input", (e) => {
    s.bpm = Number(e.target.value);
    $("#pBpmVal", view).textContent = s.bpm;
  });
  $("#pBeats", view).addEventListener("change", (e) => {
    s.beats = Number(e.target.value);
    stop();
  });
  $("#pStroke", view).addEventListener("change", (e) => {
    s.eighth = e.target.value === "du";
    stop();
  });
  $("#pLoop", view).addEventListener("change", (e) => {
    s.loop = e.target.checked;
    stop();
  });
  $("#pClick", view).addEventListener("change", (e) => {
    s.click = e.target.checked;
  });
  $("#pPlay", view).addEventListener("click", start);
  $("#pStop", view).addEventListener("click", stop);
  drawContent();
}

/* =========================================================
   ページ: チューナー
   ========================================================= */
const tunerState = { a4: clamp(Number(lsGet("myGuiter.a4", 440)) || 440, 415, 466) };

function renderTuner(view) {
  view.innerHTML = `
    <h1>🎚️ チューナー</h1>
    <div class="row">
      <label>A4 基準周波数 (Hz)<input type="number" id="tA4" min="415" max="466" step="1" value="${tunerState.a4}"></label>
      <div class="muted">チューニング: ${esc(tuningName())}</div>
    </div>
    <h2>リアルタイムチューナー</h2>
    <div class="tuner-box" id="tBox">
      <div class="tuner-note" id="tNote">--</div>
      <div class="tuner-freq" id="tFreq">-- Hz</div>
      <div class="meter">
        <div class="meter-zone"></div>
        <div class="meter-center"></div>
        <div class="meter-needle" id="tNeedle"></div>
      </div>
      <div class="meter-labels"><span>-50</span><span>-25</span><span>0</span><span>+25</span><span>+50</span></div>
      <div class="tuner-cents" id="tCents">マイクを開始してください</div>
      <div class="tuner-string" id="tString"></div>
      <div class="level"><div class="level-bar" id="tLevel"></div></div>
      <button class="btn big-btn" id="tStart">🎤 マイクを開始</button>
    </div>
    <p class="caption">マイクの利用にはHTTPS（GitHub Pagesは対応済み）またはlocalhostでの表示が必要です。単音をはっきり鳴らしてください。</p>
    <h2>基準音</h2>
    <div id="tRef"></div>`;

  const drawRef = () => {
    const tune = tuning();
    const a4 = tunerState.a4;
    $("#tRef", view).innerHTML = `
      <div class="ref-grid">
        ${tune.map((m, i) => {
          const f = midiToFreq(m, a4);
          return `<button class="ref-btn" data-ref="${f.toFixed(4)}"><b>${6 - i}弦</b><span>${midiName(m)}</span><small>${f.toFixed(2)} Hz</small></button>`;
        }).join("")}
      </div>
      <h2>周波数一覧</h2>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>弦</th><th>音名</th><th>周波数 (Hz)</th></tr></thead>
        <tbody>${tune.map((m, i) => `<tr><td>${6 - i}弦</td><td>${midiName(m)}</td><td>${midiToFreq(m, a4).toFixed(2)}</td></tr>`).join("")}</tbody>
      </table></div>`;
  };

  $("#tA4", view).addEventListener("change", (e) => {
    let v = Number(e.target.value);
    if (!Number.isFinite(v)) v = 440;
    v = clamp(v, 415, 466);
    e.target.value = v;
    tunerState.a4 = v;
    lsSet("myGuiter.a4", v);
    drawRef();
  });

  let stopTuner = null;

  const showPitch = (freq) => {
    const tune = tuning();
    const mf = 69 + 12 * Math.log2(freq / tunerState.a4);
    const nearest = Math.round(mf);
    const cents = (mf - nearest) * 100;
    const inTune = Math.abs(cents) <= 5;
    $("#tNote", view).textContent = midiName(nearest);
    $("#tFreq", view).textContent = `${freq.toFixed(2)} Hz`;
    $("#tNeedle", view).style.left = `${clamp(50 + cents, 0, 100)}%`;
    $("#tCents", view).textContent = inTune ? `✅ ${signed(cents)} cent` : `${signed(cents)} cent ${cents < 0 ? "♭ 低め" : "♯ 高め"}`;
    $("#tBox", view).classList.toggle("in-tune", inTune);
    let si = 0;
    tune.forEach((m, i) => {
      if (Math.abs(mf - m) < Math.abs(mf - tune[si])) si = i;
    });
    const diff = (mf - tune[si]) * 100;
    let advice = "OK";
    if (diff < -5) advice = "締めて上げる";
    else if (diff > 5) advice = "緩めて下げる";
    $("#tString", view).textContent = `最も近い弦: ${6 - si}弦 (${midiName(tune[si])})  ${signed(diff)} cent → ${advice}`;
  };

  const startTuner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $("#tCents", view).textContent = "このブラウザ環境ではマイクを利用できません（HTTPSが必要です）。";
      return;
    }
    let stream;
    try {
      const ctx = ac();
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096;
      src.connect(analyser);
      const buf = new Float32Array(analyser.fftSize);
      let history = [];
      let silent = 0;
      let raf = 0;
      let last = 0;
      const loop = (ts) => {
        raf = requestAnimationFrame(loop);
        if (ts - last < 70) return;
        last = ts;
        analyser.getFloatTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
        const level = Math.sqrt(sum / buf.length);
        $("#tLevel", view).style.width = `${clamp(level * 400, 0, 100)}%`;
        const r = detectPitch(buf, ctx.sampleRate);
        if (r) {
          silent = 0;
          if (history.length && Math.abs(12 * Math.log2(r.freq / history[history.length - 1])) > 0.5) history = [];
          history.push(r.freq);
          if (history.length > 5) history.shift();
          const sorted = [...history].sort((a, b) => a - b);
          showPitch(sorted[Math.floor(sorted.length / 2)]);
        } else {
          silent++;
          if (silent > 12) {
            history = [];
            $("#tBox", view).classList.remove("in-tune");
            $("#tCents", view).textContent = "音を鳴らしてください";
          }
        }
      };
      raf = requestAnimationFrame(loop);
      stopTuner = () => {
        cancelAnimationFrame(raf);
        src.disconnect();
        stream.getTracks().forEach((t) => t.stop());
        stopTuner = null;
      };
      $("#tStart", view).textContent = "■ マイクを停止";
      $("#tCents", view).textContent = "音を鳴らしてください";
    } catch (err) {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      $("#tCents", view).textContent = `マイクを開始できませんでした: ${err.message || err.name}`;
    }
  };

  $("#tStart", view).addEventListener("click", () => {
    if (stopTuner) {
      stopTuner();
      $("#tStart", view).textContent = "🎤 マイクを開始";
      $("#tCents", view).textContent = "マイクを開始してください";
      $("#tLevel", view).style.width = "0%";
    } else {
      startTuner();
    }
  });
  onCleanup(() => {
    if (stopTuner) stopTuner();
  });
  drawRef();
}

/* =========================================================
   ページ: メトロノーム
   ========================================================= */
const metState = {
  bpm: 100,
  beats: 4,
  subdiv: 1,
  accent: true,
  volume: 0.8,
  trainer: false,
  trainerStep: 5,
  trainerBars: 4,
  trainerMax: 160,
};

function renderMetronome(view) {
  const s = metState;
  view.innerHTML = `
    <h1>⏱️ メトロノーム</h1>
    <div class="met-box">
      <div class="met-bpm">
        <button class="btn round ghost" id="mMinus">−</button>
        <div><div class="big" id="mBpmVal">${s.bpm}</div><div class="muted">BPM</div></div>
        <button class="btn round ghost" id="mPlus">＋</button>
      </div>
      <input type="range" id="mBpm" min="30" max="300" value="${s.bpm}">
      <div class="beat-dots" id="mDots"></div>
      <div class="btn-row center">
        <button class="btn big-btn" id="mStart">▶ スタート</button>
        <button class="btn ghost big-btn" id="mTap">TAP</button>
      </div>
      <p class="caption">TAPを一定間隔で数回押すとテンポを設定できます。</p>
    </div>
    <h2>設定</h2>
    <div class="row">
      <label>拍子（1小節の拍数）<input type="number" id="mBeats" min="1" max="12" value="${s.beats}"></label>
      <label>細分化
        <select id="mSub">
          ${[[1, "4分音符"], [2, "8分音符"], [3, "3連符"], [4, "16分音符"]].map(([v, l]) => `<option value="${v}"${v === s.subdiv ? " selected" : ""}>${l}</option>`).join("")}
        </select>
      </label>
      <label>音量<input type="range" id="mVol" min="0" max="100" value="${Math.round(s.volume * 100)}"></label>
      <label class="check"><input type="checkbox" id="mAccent"${s.accent ? " checked" : ""}> 1拍目にアクセント</label>
    </div>
    <details class="box"${s.trainer ? " open" : ""}>
      <summary>スピードトレーナー</summary>
      <p class="caption">指定した小節数ごとにBPMを自動で上げます。</p>
      <label class="check"><input type="checkbox" id="mTr"${s.trainer ? " checked" : ""}> 有効にする</label>
      <div class="row">
        <label>上げ幅 (BPM)<input type="number" id="mTrStep" min="1" max="50" value="${s.trainerStep}"></label>
        <label>何小節ごと<input type="number" id="mTrBars" min="1" max="64" value="${s.trainerBars}"></label>
        <label>最大BPM<input type="number" id="mTrMax" min="30" max="300" value="${s.trainerMax}"></label>
      </div>
    </details>`;

  let stopFn = null;
  const taps = [];

  const drawDots = () => {
    $("#mDots", view).innerHTML = Array.from({ length: s.beats }, (_, i) => `<div class="dot${i === 0 ? " first" : ""}" data-beat="${i}"></div>`).join("");
  };
  const lightDot = (beat) => {
    $$(".dot", view).forEach((d) => d.classList.toggle("on", Number(d.dataset.beat) === beat));
  };
  const setBpm = (v) => {
    s.bpm = clamp(Math.round(v), 30, 300);
    $("#mBpmVal", view).textContent = s.bpm;
    $("#mBpm", view).value = s.bpm;
  };
  const stop = () => {
    if (stopFn) {
      stopFn();
      stopFn = null;
    }
    lightDot(-1);
    $("#mStart", view).textContent = "▶ スタート";
  };
  const start = () => {
    stop();
    let counter = 0;
    let bar = 0;
    const beats = s.beats;
    const subdiv = s.subdiv;
    stopFn = startScheduler((t, later) => {
      const sub = counter % subdiv;
      const beatTotal = Math.floor(counter / subdiv);
      const beat = beatTotal % beats;
      if (sub === 0 && beat === 0 && beatTotal > 0) {
        bar++;
        if (s.trainer && bar % s.trainerBars === 0 && s.bpm < s.trainerMax) {
          const nb = Math.min(s.trainerMax, s.bpm + s.trainerStep);
          s.bpm = nb;
          later(t, () => setBpm(nb));
        }
      }
      if (sub === 0) {
        if (beat === 0 && s.accent) playClick(t, 1600, s.volume);
        else playClick(t, 1000, 0.75 * s.volume);
        later(t, () => lightDot(beat));
      } else {
        playClick(t, 800, 0.35 * s.volume);
      }
      counter++;
      return t + 60 / s.bpm / subdiv;
    });
    $("#mStart", view).textContent = "■ ストップ";
  };
  const restartIfRunning = () => {
    if (stopFn) start();
  };
  const readInt = (el, lo, hi, fallback) => {
    let v = parseInt(el.value, 10);
    if (Number.isNaN(v)) v = fallback;
    v = clamp(v, lo, hi);
    el.value = v;
    return v;
  };

  $("#mStart", view).addEventListener("click", () => (stopFn ? stop() : start()));
  $("#mMinus", view).addEventListener("click", () => setBpm(s.bpm - 1));
  $("#mPlus", view).addEventListener("click", () => setBpm(s.bpm + 1));
  $("#mBpm", view).addEventListener("input", (e) => setBpm(Number(e.target.value)));
  $("#mTap", view).addEventListener("click", () => {
    const now = performance.now();
    if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
    taps.push(now);
    if (taps.length > 5) taps.shift();
    if (taps.length >= 2) {
      const avg = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
      setBpm(60000 / avg);
    }
  });
  $("#mBeats", view).addEventListener("change", (e) => {
    s.beats = readInt(e.target, 1, 12, 4);
    drawDots();
    restartIfRunning();
  });
  $("#mSub", view).addEventListener("change", (e) => {
    s.subdiv = Number(e.target.value);
    restartIfRunning();
  });
  $("#mVol", view).addEventListener("input", (e) => {
    s.volume = Number(e.target.value) / 100;
  });
  $("#mAccent", view).addEventListener("change", (e) => {
    s.accent = e.target.checked;
  });
  $("#mTr", view).addEventListener("change", (e) => {
    s.trainer = e.target.checked;
  });
  $("#mTrStep", view).addEventListener("change", (e) => {
    s.trainerStep = readInt(e.target, 1, 50, 5);
  });
  $("#mTrBars", view).addEventListener("change", (e) => {
    s.trainerBars = readInt(e.target, 1, 64, 4);
  });
  $("#mTrMax", view).addEventListener("change", (e) => {
    s.trainerMax = readInt(e.target, 30, 300, 160);
  });
  onCleanup(() => {
    if (stopFn) stopFn();
  });
  drawDots();
}

/* =========================================================
   ページ: 移調 & カポ
   ========================================================= */
const trState = { text: "C G Am F | Dm7 G7 Cmaj7", n: 0 };

function renderTranspose(view) {
  const s = trState;
  view.innerHTML = `
    <h1>🔀 移調 & カポ</h1>
    <label class="full">コード進行を入力（スペースや | で区切り）
      <textarea id="trText">${esc(s.text)}</textarea>
    </label>
    <div class="row">
      <label>移調（半音）: <span id="trVal">${signed(s.n, 0)}</span>
        <input type="range" id="trN" min="-11" max="11" value="${s.n}">
      </label>
    </div>
    <h2>移調結果</h2>
    <pre class="output" id="trOut"></pre>
    <div class="btn-row"><button class="btn ghost small" id="trCopy">📋 コピー</button></div>
    <h2>カポタスト提案</h2>
    <p class="caption">入力したコードを実音として、各カポ位置で押さえるフォームを表示します。</p>
    <div id="trCapo"></div>`;

  const draw = () => {
    $("#trVal", view).textContent = signed(s.n, 0);
    $("#trOut", view).textContent = transposeText(s.text, s.n, noteNames());
    const chords = extractChords(s.text);
    if (!chords.length) {
      $("#trCapo", view).innerHTML = '<div class="info">コードを入力してください。</div>';
      return;
    }
    const rows = [];
    for (let capo = 0; capo < 8; capo++) {
      const sharp = chords.map((c) => transposeSymbol(c, -capo, SHARP_NAMES));
      const disp = chords.map((c) => transposeSymbol(c, -capo, noteNames()));
      const easy = sharp.filter((x) => x && EASY_SHAPES.has(x.split("/")[0])).length;
      rows.push({ capo, shapes: disp.filter(Boolean).join(" "), easy });
    }
    const best = rows.reduce((a, b) => (b.easy > a.easy ? b : a));
    $("#trCapo", view).innerHTML = `
      <div class="success">おすすめ: カポ ${best.capo}  →  ${esc(best.shapes)}</div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>カポ</th><th>押さえるフォーム</th><th>簡単なフォームの割合</th></tr></thead>
        <tbody>${rows.map((r) => `<tr><td>${r.capo}</td><td>${esc(r.shapes)}</td><td>${r.easy}/${chords.length}</td></tr>`).join("")}</tbody>
      </table></div>`;
  };

  $("#trText", view).addEventListener("input", (e) => {
    s.text = e.target.value;
    draw();
  });
  $("#trN", view).addEventListener("input", (e) => {
    s.n = Number(e.target.value);
    draw();
  });
  $("#trCopy", view).addEventListener("click", async () => {
    const btn = $("#trCopy", view);
    try {
      await navigator.clipboard.writeText($("#trOut", view).textContent);
      btn.textContent = "✅ コピーしました";
    } catch (e) {
      btn.textContent = "コピーできませんでした";
    }
    setTimeout(() => {
      btn.textContent = "📋 コピー";
    }, 1500);
  });
  draw();
}

/* =========================================================
   ページ: 耳トレ & クイズ
   ========================================================= */
const earTabState = { tab: "interval" };
const earState = { chosen: [3, 4, 5, 7, 12], dir: "上行", q: null, done: false, picked: null, msg: null, score: 0, total: 0 };
const fqState = { maxFret: 12, strings: [6, 5, 4, 3, 2, 1], q: null, done: false, picked: null, msg: null, score: 0, total: 0 };

function playInterval(q) {
  const ctx = ac();
  const t = ctx.currentTime + 0.05;
  const low = q.base;
  const high = q.base + q.semi;
  if (q.dir === "上行") {
    playNote(low, t, 1.6);
    playNote(high, t + 1.0, 1.6);
  } else if (q.dir === "下行") {
    playNote(high, t, 1.6);
    playNote(low, t + 1.0, 1.6);
  } else {
    playNote(low, t, 2.5, 0.6);
    playNote(high, t, 2.5, 0.6);
  }
}

function renderEar(view) {
  view.innerHTML = `
    <h1>👂 耳トレ & クイズ</h1>
    ${tabsHtml([["interval", "音程当て"], ["fret", "指板音名クイズ"]], earTabState.tab)}
    <div id="earBody"></div>`;
  bindTabs(view, earTabState);
  const body = $("#earBody", view);
  if (earTabState.tab === "interval") earInterval(body);
  else earFret(body);
}

function earInterval(body) {
  const s = earState;
  const semiName = Object.fromEntries(INTERVALS);
  const opts = [...s.chosen];
  if (s.q && !opts.includes(s.q.semi)) opts.push(s.q.semi);
  opts.sort((a, b) => a - b);
  const rate = s.total ? Math.round((s.score / s.total) * 100) : 0;
  body.innerHTML = `
    <h3>出題する音程</h3>
    <div class="checks">
      ${INTERVALS.map(([semi, name]) => `<label class="check"><input type="checkbox" class="eChk" value="${semi}"${s.chosen.includes(semi) ? " checked" : ""}> ${name}</label>`).join("")}
    </div>
    <div class="row">
      <label>再生方法
        <select id="eDir">${["上行", "下行", "和音"].map((d) => `<option${d === s.dir ? " selected" : ""}>${d}</option>`).join("")}</select>
      </label>
    </div>
    <div class="btn-row">
      <button class="btn" id="eNew">🎲 新しい問題</button>
      <button class="btn ghost" id="eReplay"${s.q ? "" : " disabled"}>🔁 もう一度聴く</button>
    </div>
    ${s.q ? `
      <h3>答えを選んでください</h3>
      <div class="answer-grid">
        ${opts.map((semi) => {
          let cls = "answer";
          if (s.done && semi === s.q.semi) cls += " correct";
          if (s.done && semi === s.picked && semi !== s.q.semi) cls += " wrong";
          return `<button class="${cls}" data-ans="${semi}"${s.done ? " disabled" : ""}>${semiName[semi]}</button>`;
        }).join("")}
      </div>` : ""}
    ${s.msg ? `<div class="${s.msg[0]}">${esc(s.msg[1])}</div>` : ""}
    <div class="metrics">${metric("成績", `${s.score} / ${s.total}`, `正答率 ${rate}%`)}</div>
    <button class="btn ghost small" id="eReset">成績リセット</button>`;

  $$(".eChk", body).forEach((c) => c.addEventListener("change", () => {
    s.chosen = $$(".eChk", body).filter((x) => x.checked).map((x) => Number(x.value));
  }));
  $("#eDir", body).addEventListener("change", (e) => {
    s.dir = e.target.value;
  });
  $("#eNew", body).addEventListener("click", () => {
    if (!s.chosen.length) {
      s.msg = ["warn", "出題する音程を1つ以上選んでください。"];
      render();
      return;
    }
    s.q = { base: randInt(45, 60), semi: pick(s.chosen), dir: s.dir };
    s.done = false;
    s.picked = null;
    s.msg = null;
    render();
    playInterval(s.q);
  });
  $("#eReplay", body).addEventListener("click", () => {
    if (s.q) {
      stopAllSounds();
      playInterval(s.q);
    }
  });
  $$("[data-ans]", body).forEach((b) => b.addEventListener("click", () => {
    if (s.done || !s.q) return;
    const semi = Number(b.dataset.ans);
    s.total++;
    s.done = true;
    s.picked = semi;
    if (semi === s.q.semi) {
      s.score++;
      s.msg = ["success", `正解！ ${semiName[s.q.semi]}`];
    } else {
      s.msg = ["error", `不正解… 正解は ${semiName[s.q.semi]}（${midiName(s.q.base)} と ${midiName(s.q.base + s.q.semi)}）`];
    }
    render();
  }));
  $("#eReset", body).addEventListener("click", () => {
    s.score = 0;
    s.total = 0;
    render();
  });
}

function earFret(body) {
  const s = fqState;
  const tune = tuning();
  const rate = s.total ? Math.round((s.score / s.total) * 100) : 0;
  let quizHtml = "";
  if (s.q) {
    const [si, fret] = s.q;
    const correctPc = mod(tune[si] + fret, 12);
    const label = s.done ? nm(correctPc) : "?";
    quizHtml = `
      <h3>${6 - si}弦 ${fret}フレットの音名は？</h3>
      <div class="fb-wrap">${fretboardSvg(tune, [[si, fret, label, "#ff7f0e"]], 0, Math.max(12, fret), false)}</div>
      <div class="answer-grid">
        ${Array.from({ length: 12 }, (_, pc) => {
          let cls = "answer";
          if (s.done && pc === correctPc) cls += " correct";
          if (s.done && pc === s.picked && pc !== correctPc) cls += " wrong";
          return `<button class="${cls}" data-fans="${pc}"${s.done ? " disabled" : ""}>${nm(pc)}</button>`;
        }).join("")}
      </div>`;
  }
  body.innerHTML = `
    <div class="row">
      <label>出題するフレットの最大値<input type="number" id="fMax" min="3" max="22" value="${s.maxFret}"></label>
    </div>
    <h3>出題する弦</h3>
    <div class="checks">
      ${[6, 5, 4, 3, 2, 1].map((n) => `<label class="check"><input type="checkbox" class="fChk" value="${n}"${s.strings.includes(n) ? " checked" : ""}> ${n}弦</label>`).join("")}
    </div>
    <div class="btn-row"><button class="btn" id="fNew">🎲 新しい問題</button></div>
    ${quizHtml}
    ${s.msg ? `<div class="${s.msg[0]}">${esc(s.msg[1])}</div>` : ""}
    <div class="metrics">${metric("成績", `${s.score} / ${s.total}`, `正答率 ${rate}%`)}</div>
    <button class="btn ghost small" id="fReset">成績リセット</button>`;

  $("#fMax", body).addEventListener("change", (e) => {
    let v = parseInt(e.target.value, 10);
    if (Number.isNaN(v)) v = 12;
    s.maxFret = clamp(v, 3, 22);
    e.target.value = s.maxFret;
  });
  $$(".fChk", body).forEach((c) => c.addEventListener("change", () => {
    s.strings = $$(".fChk", body).filter((x) => x.checked).map((x) => Number(x.value));
  }));
  $("#fNew", body).addEventListener("click", () => {
    if (!s.strings.length) {
      s.msg = ["warn", "出題する弦を1つ以上選んでください。"];
      render();
      return;
    }
    s.q = [6 - pick(s.strings), randInt(0, s.maxFret)];
    s.done = false;
    s.picked = null;
    s.msg = null;
    render();
  });
  $$("[data-fans]", body).forEach((b) => b.addEventListener("click", () => {
    if (s.done || !s.q) return;
    const [si, fret] = s.q;
    const correctPc = mod(tune[si] + fret, 12);
    const pc = Number(b.dataset.fans);
    s.total++;
    s.done = true;
    s.picked = pc;
    if (pc === correctPc) {
      s.score++;
      s.msg = ["success", `正解！ ${nm(correctPc)}`];
    } else {
      s.msg = ["error", `不正解… 正解は ${nm(correctPc)}`];
    }
    render();
    playNote(tune[si] + fret);
  }));
  $("#fReset", body).addEventListener("click", () => {
    s.score = 0;
    s.total = 0;
    render();
  });
}

/* =========================================================
   ページ: 練習記録
   ========================================================= */
const timerState = { startedAt: null, elapsed: 0 };

function timerMs() {
  return timerState.elapsed + (timerState.startedAt ? Date.now() - timerState.startedAt : 0);
}

function fmtTimer(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
}

function csvCell(v) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderLog(view) {
  const entries = loadLog();
  const goal = clamp(Number(lsGet("myGuiter.goal", 30)) || 30, 5, 600);
  const { total, todayMin, streak } = logStats(entries);
  const pct = Math.round(Math.min(todayMin / goal, 1) * 100);

  view.innerHTML = `
    <h1>📒 練習記録</h1>
    <div class="box">
      <h3>⏱ 練習タイマー</h3>
      <div class="timer-display" id="tmDisp">${fmtTimer(timerMs())}</div>
      <div class="btn-row">
        <button class="btn" id="tmStart">${timerState.startedAt ? "⏸ 一時停止" : "▶ 開始"}</button>
        <button class="btn ghost" id="tmReset">リセット</button>
        <button class="btn ghost" id="tmApply">記録欄に反映</button>
      </div>
    </div>
    <form id="logForm" class="box">
      <h3>記録を追加</h3>
      <div class="row">
        <label>日付<input type="date" id="lDate" value="${isoDate(new Date())}" required></label>
        <label>練習時間（分）<input type="number" id="lMin" min="1" max="600" value="30" required></label>
        <label>カテゴリ<select id="lCat">${PRACTICE_CATEGORIES.map((c) => `<option>${c}</option>`).join("")}</select></label>
        <label>BPM（任意）<input type="number" id="lBpm" min="0" max="400" placeholder="—"></label>
      </div>
      <label class="full">メモ<input type="text" id="lMemo" maxlength="200"></label>
      <button class="btn" type="submit">記録する</button>
      <span id="lMsg" class="muted"></span>
    </form>
    <div class="row">
      <label>1日の目標（分）<input type="number" id="lGoal" min="5" max="600" value="${goal}"></label>
    </div>
    <div class="metrics">
      ${metric("今日", `${todayMin} 分`)}
      ${metric("連続日数", `${streak} 日`)}
      ${metric("累計", `${Math.floor(total / 60)} 時間 ${total % 60} 分`)}
    </div>
    <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
    <p class="caption">今日の目標達成率 ${pct}%</p>
    <div id="lData"></div>
    <h2>バックアップ</h2>
    <p class="caption">記録はこのブラウザ（localStorage）に保存されます。別の端末へ移す場合はJSONでバックアップしてください。</p>
    <div class="btn-row">
      <button class="btn ghost" id="lCsv"${entries.length ? "" : " disabled"}>CSVをダウンロード</button>
      <button class="btn ghost" id="lJson"${entries.length ? "" : " disabled"}>JSONでバックアップ</button>
      <button class="btn ghost" id="lImportBtn">JSONから復元</button>
      <input type="file" id="lImport" accept="application/json,.json" style="display:none">
      <button class="btn ghost" id="lClear"${entries.length ? "" : " disabled"}>全記録を削除</button>
    </div>`;

  const dataEl = $("#lData", view);
  if (!entries.length) {
    dataEl.innerHTML = '<div class="info">まだ記録がありません。</div>';
  } else {
    const today = new Date();
    const labels = [];
    const values = [];
    const byDate = {};
    entries.forEach((e) => {
      byDate[e.date] = (byDate[e.date] || 0) + e.minutes;
    });
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      labels.push(`${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}`);
      values.push(byDate[isoDate(d)] || 0);
    }
    const byCat = {};
    entries.forEach((e) => {
      byCat[e.category] = (byCat[e.category] || 0) + e.minutes;
    });
    const catMax = Math.max(1, ...Object.values(byCat));
    const sorted = [...entries].sort((a, b) => (a.date === b.date ? (b.id || 0) - (a.id || 0) : a.date < b.date ? 1 : -1));
    dataEl.innerHTML = `
      <h2>直近30日の練習時間（分）</h2>
      ${barChartSvg(labels, values, 3)}
      <h2>カテゴリ別</h2>
      ${Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([c, m]) => `
        <div class="hbar-row"><span>${esc(c)}</span><div class="hbar" style="width:${(m / catMax) * 100}%"></div><span>${m} 分</span></div>`).join("")}
      <h2>履歴</h2>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>日付</th><th>分</th><th>カテゴリ</th><th>BPM</th><th>メモ</th><th></th></tr></thead>
        <tbody>${sorted.map((e) => `
          <tr>
            <td>${esc(e.date)}</td>
            <td>${e.minutes}</td>
            <td>${esc(e.category || "")}</td>
            <td>${e.bpm ? e.bpm : ""}</td>
            <td>${esc(e.memo || "")}</td>
            <td><button class="btn ghost small" data-del="${e.id}">削除</button></td>
          </tr>`).join("")}
        </tbody>
      </table></div>`;
  }

  const disp = $("#tmDisp", view);
  const tick = setInterval(() => {
    disp.textContent = fmtTimer(timerMs());
  }, 500);
  onCleanup(() => clearInterval(tick));

  $("#tmStart", view).addEventListener("click", (e) => {
    if (timerState.startedAt) {
      timerState.elapsed += Date.now() - timerState.startedAt;
      timerState.startedAt = null;
      e.target.textContent = "▶ 開始";
    } else {
      timerState.startedAt = Date.now();
      e.target.textContent = "⏸ 一時停止";
    }
  });
  $("#tmReset", view).addEventListener("click", () => {
    timerState.startedAt = null;
    timerState.elapsed = 0;
    disp.textContent = fmtTimer(0);
    $("#tmStart", view).textContent = "▶ 開始";
  });
  $("#tmApply", view).addEventListener("click", () => {
    $("#lMin", view).value = clamp(Math.round(timerMs() / 60000), 1, 600);
  });

  $("#logForm", view).addEventListener("submit", (e) => {
    e.preventDefault();
    const date = $("#lDate", view).value;
    const minutes = parseInt($("#lMin", view).value, 10);
    const bpm = parseInt($("#lBpm", view).value, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(minutes) || minutes < 1 || minutes > 600) {
      $("#lMsg", view).textContent = "日付と練習時間（1〜600分）を正しく入力してください。";
      return;
    }
    const list = loadLog();
    list.push({
      id: Date.now() + Math.floor(Math.random() * 1000),
      date,
      minutes,
      category: $("#lCat", view).value,
      bpm: Number.isFinite(bpm) && bpm > 0 ? clamp(bpm, 1, 400) : null,
      memo: $("#lMemo", view).value.trim(),
    });
    saveLog(list);
    render();
  });

  $("#lGoal", view).addEventListener("change", (e) => {
    let v = parseInt(e.target.value, 10);
    if (Number.isNaN(v)) v = 30;
    lsSet("myGuiter.goal", clamp(v, 5, 600));
    render();
  });

  $$("[data-del]", view).forEach((b) => b.addEventListener("click", () => {
    const id = Number(b.dataset.del);
    saveLog(loadLog().filter((e) => e.id !== id));
    render();
  }));

  $("#lCsv", view).addEventListener("click", () => {
    const rows = [["日付", "分", "カテゴリ", "BPM", "メモ"]].concat(
      [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).map((e) => [e.date, e.minutes, e.category, e.bpm || "", e.memo || ""])
    );
    const csv = "\uFEFF" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
    downloadFile(csv, "my_guiter_practice_log.csv", "text/csv;charset=utf-8");
  });
  $("#lJson", view).addEventListener("click", () => {
    downloadFile(JSON.stringify(entries, null, 2), "my_guiter_practice_log.json", "application/json");
  });
  $("#lImportBtn", view).addEventListener("click", () => $("#lImport", view).click());
  $("#lImport", view).addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("形式が正しくありません");
        const valid = data
          .filter((x) => x && typeof x.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && Number.isFinite(x.minutes))
          .map((x, i) => ({
            id: Number.isFinite(x.id) ? x.id : Date.now() + i,
            date: x.date,
            minutes: clamp(Math.round(x.minutes), 1, 600),
            category: typeof x.category === "string" ? x.category : "その他",
            bpm: Number.isFinite(x.bpm) ? x.bpm : null,
            memo: typeof x.memo === "string" ? x.memo : "",
          }));
        if (!valid.length) throw new Error("有効な記録がありません");
        if (confirm(`${valid.length}件の記録で現在のデータを置き換えます。よろしいですか？`)) {
          saveLog(valid);
          render();
        }
      } catch (err) {
        alert(`読み込みに失敗しました: ${err.message}`);
      }
    };
    reader.readAsText(file);
  });
  $("#lClear", view).addEventListener("click", () => {
    if (confirm("すべての練習記録を削除します。この操作は取り消せません。よろしいですか？")) {
      saveLog([]);
      render();
    }
  });
}

/* =========================================================
   ルーティング
   ========================================================= */
const PAGES = [
  { id: "home", label: "🏠 ホーム", desc: "", render: renderHome },
  { id: "chords", label: "🎼 コード辞典", desc: "16種類×12キーのコードフォーム、試聴、押さえた形からのコード判定", render: renderChords },
  { id: "scales", label: "🎹 スケール & 指板", desc: "15種類のスケールを指板表示、ダイアトニックコードを自動算出", render: renderScales },
  { id: "progression", label: "🔄 コード進行", desc: "定番進行・ブルース・カスタム進行の伴奏をリアルタイム再生", render: renderProgression },
  { id: "tuner", label: "🎚️ チューナー", desc: "マイクによるリアルタイムチューナーと基準音", render: renderTuner },
  { id: "metronome", label: "⏱️ メトロノーム", desc: "アクセント・細分化・タップテンポ・スピードトレーナー", render: renderMetronome },
  { id: "transpose", label: "🔀 移調 & カポ", desc: "コード譜の移調と最適なカポ位置の提案", render: renderTranspose },
  { id: "ear", label: "👂 耳トレ & クイズ", desc: "音程当てと指板の音名クイズ", render: renderEar },
  { id: "log", label: "📒 練習記録", desc: "練習タイマー、記録、グラフ、CSV/JSON出力", render: renderLog },
];

let pageCleanups = [];

function onCleanup(fn) {
  pageCleanups.push(fn);
}

function runCleanups() {
  pageCleanups.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });
  pageCleanups = [];
}

function currentPageId() {
  const h = location.hash.slice(1);
  return PAGES.some((p) => p.id === h) ? h : "home";
}

function render() {
  runCleanups();
  stopAllSounds();
  const id = currentPageId();
  const page = PAGES.find((p) => p.id === id);
  $$("#nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${id}`));
  const view = $("#view");
  view.innerHTML = "";
  page.render(view);
  document.title = id === "home" ? "My Guiter" : `${page.label.replace(/^\S+\s/, "")} | My Guiter`;
}

function init() {
  $("#nav").innerHTML = PAGES.map((p) => `<a href="#${p.id}">${p.label}</a>`).join("");

  const flat = $("#useFlat");
  flat.checked = settings.useFlat;
  flat.addEventListener("change", (e) => {
    settings.useFlat = e.target.checked;
    lsSet("myGuiter.flat", settings.useFlat);
    render();
  });

  const tsel = $("#tuningSelect");
  tsel.innerHTML = TUNINGS.map(([n], i) => `<option value="${i}"${i === settings.tuningIndex ? " selected" : ""}>${esc(n)}</option>`).join("");
  tsel.addEventListener("change", (e) => {
    settings.tuningIndex = Number(e.target.value);
    lsSet("myGuiter.tuning", settings.tuningIndex);
    render();
  });

  const sidebar = $("#sidebar");
  $("#menuToggle").addEventListener("click", () => sidebar.classList.toggle("open"));
  $("#nav").addEventListener("click", (e) => {
    if (e.target.closest("a")) sidebar.classList.remove("open");
  });

  window.addEventListener("hashchange", () => {
    render();
    window.scrollTo(0, 0);
  });
  render();
}

init();