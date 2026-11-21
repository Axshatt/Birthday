import { config } from "./config";
export type Mood = "happy" | "shocked" | "smirk" | "crying" | "laughing";
interface Hooks {
  react: (m: Mood) => void;
  sound: (name: string) => void;
  memory: () => void;
  finish: (won: boolean, score: number) => void;
}
type Drop = { x: number; y: number; kind: number; label: string; bad: boolean };
const icons = ["🍓", "🍰", "🎁", "🎈", "☕", "🎧", "⭐"];
const names = ["Warm-up", "Exam Season", "Overthinking Shivangi"];
export function play(canvas: HTMLCanvasElement, hud: HTMLElement, h: Hooks) {
  const ctx = canvas.getContext("2d")!,
    keys = new Set<string>(),
    events = new AbortController();
  const signal = events.signal,
    drops: Drop[] = [];
  const face = new Image();
  face.src = import.meta.env.BASE_URL + "face/happy.png";
  let width = 0,
    height = 0,
    basket = 0,
    score = 0,
    lives = 3,
    combo = 0,
    catches = 0,
    level = 1,
    slow = 0,
    double = 0,
    shield = false;
  let frame = 0,
    last = 0,
    elapsed = 0,
    spawn = 0.35,
    ended = false,
    lastHud = "";
  function resize() {
    const old = width;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    basket = old ? (basket * width) / old : width / 2;
    const scale = Math.min(devicePixelRatio, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }
  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  function move(e: PointerEvent) {
    basket = e.clientX - canvas.getBoundingClientRect().left;
  }
  canvas.onpointerdown = (e) => {
    canvas.setPointerCapture(e.pointerId);
    move(e);
  };
  canvas.onpointermove = (e) => {
    if (canvas.hasPointerCapture(e.pointerId)) move(e);
  };
  window.addEventListener(
    "keydown",
    (e) => {
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        keys.add(e.key);
      }
    },
    { signal },
  );
  window.addEventListener("keyup", (e) => keys.delete(e.key), { signal });
  window.addEventListener("blur", () => keys.clear(), { signal });
  function stop() {
    ended = true;
    cancelAnimationFrame(frame);
    events.abort();
    observer.disconnect();
  }
  function catchItem(d: Drop) {
    if (d.bad) {
      combo = 0;
      if (shield) {
        shield = false;
        h.react("shocked");
      } else {
        lives--;
        h.react("crying");
        navigator.vibrate?.(80);
      }
      h.sound("boing");
      return;
    }
    catches++;
    combo++;
    h.react(combo % 5 === 0 ? "smirk" : "happy");
    h.sound("pop");
    navigator.vibrate?.(15);
    if (d.kind <= 3) {
      score += [1, 2, 3, 1][d.kind] * (double > elapsed ? 2 : 1);
      if (d.kind === 2) h.memory();
    }
    if (d.kind === 4) slow = elapsed + 5;
    if (d.kind === 5) double = elapsed + 8;
    if (d.kind === 6) shield = true;
    const next = Math.min(3, 1 + Math.floor(catches / 10));
    if (next !== level) {
      level = next;
      h.react("laughing");
    }
  }
  function create() {
    const bad = Math.random() < [0.16, 0.29, 0.35][level - 1],
      kind =
        Math.random() < 0.12
          ? 4 + Math.floor(Math.random() * 3)
          : Math.floor(Math.random() * 4);
    const sample = (a: string[]) =>
      a[Math.floor(Math.random() * a.length)] || "Oops!";
    const label = bad
      ? level === 3 && Math.random() < 0.6
        ? sample(config.roastLines)
        : level === 2 && Math.random() < 0.5
          ? config.badItems[0]
          : sample(config.badItems)
      : icons[kind];
    drops.push({ x: Math.random(), y: -18, bad, kind, label });
  }
  // Advance in seconds so gameplay speed stays consistent across refresh rates.
  function tick(t: number) {
    if (ended) return;
    const dt = last ? Math.min((t - last) / 1000, 0.04) : 0;
    last = t;
    elapsed += dt;
    spawn -= dt;
    if (spawn <= 0) {
      create();
      spawn = Math.max(0.43, 0.93 - 0.065 * Math.floor(catches / 10));
    }
    basket += (+keys.has("ArrowRight") - +keys.has("ArrowLeft")) * width * dt;
    basket = Math.max(26, Math.min(width - 26, basket));
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#eaf5db";
    ctx.fillRect(0, height - 14, width, 14);
    ctx.font = "27px sans-serif";
    ctx.textAlign = "center";
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      const old = d.y;
      d.y +=
        dt *
        height *
        (0.24 + 0.025 * Math.floor(catches / 10)) *
        (slow > elapsed ? 0.52 : 1);
      ctx.font = "bold 11px monospace";
      const half = d.bad
        ? Math.min(width / 2 - 2, ctx.measureText(d.label).width / 2 + 7)
        : 15;
      const x = half + d.x * (width - half * 2);
      if (d.bad) {
        ctx.fillStyle = "#403047";
        ctx.fillRect(x - half, d.y - 11, half * 2, 22);
        ctx.fillStyle = "#ffdfdf";
        ctx.fillText(d.label, x, d.y + 4, half * 2 - 4);
      } else if (d.kind === 0 && face.complete && face.naturalWidth) {
        ctx.drawImage(face, x - 15, d.y - 16, 30, 32);
      } else {
        ctx.font = "27px sans-serif";
        ctx.fillText(d.label, x, d.y + 8);
      }
      if (
        old <= height - 42 &&
        d.y >= height - 42 &&
        Math.abs(x - basket) < 26 + half
      ) {
        catchItem(d);
        drops.splice(i, 1);
      } else if (d.y > height + 12) {
        if (!d.bad && d.kind < 4) {
          combo = 0;
          h.react("shocked");
        }
        drops.splice(i, 1);
      }
      if (!lives || score >= config.targetScore) {
        stop();
        h.finish(lives > 0, score);
        return;
      }
    }
    ctx.fillStyle = shield ? "#138808" : "#783f38";
    ctx.fillRect(basket - 25, height - 42, 50, 8);
    ctx.fillRect(basket - 20, height - 34, 40, 18);
    ctx.fillStyle = "#f1ac69";
    ctx.fillRect(basket - 17, height - 33, 34, 13);
    for (let j = -13; j <= 13; j += 8)
      ctx.fillRect(basket + j, height - 40, 4, 4);
    const status =
      "Level " +
      level +
      " · " +
      names[level - 1] +
      " | " +
      score +
      "/" +
      config.targetScore +
      " pts | " +
      "♥".repeat(lives) +
      " | Combo ×" +
      combo +
      (shield ? " | Shield" : "") +
      (slow > elapsed ? " | Chai " + Math.ceil(slow - elapsed) + "s" : "") +
      (double > elapsed ? " | 2× " + Math.ceil(double - elapsed) + "s" : "");
    if (status !== lastHud) {
      hud.textContent = status;
      lastHud = status;
    }
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);
  return stop;
}
