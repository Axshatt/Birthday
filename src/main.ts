import "./style.css";
import { gsap } from "gsap";
import { config as c } from "./config";
import { play, type Mood } from "./game";
const asset = (path: string) => import.meta.env.BASE_URL + path;
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
  document.querySelector<T>(s)!;
let muted = false,
  high = 0,
  unlocked = 0,
  taps = 0,
  tapTime = 0,
  stop = () => {},
  epoch = 0;
try {
  high = Number(localStorage.getItem("berry-high")) || 0;
  unlocked = Math.min(
    c.memoryCards.length,
    Number(localStorage.getItem("berry-cards")) || 0,
  );
} catch {}
function save() {
  try {
    localStorage.setItem("berry-high", String(high));
    localStorage.setItem("berry-cards", String(unlocked));
  } catch {}
}
const sounds = new Map<string, HTMLAudioElement>();
function sound(name: string) {
  if (muted) return;
  let a = sounds.get(name);
  if (!a) {
    a = new Audio(asset("sounds/" + name + ".wav"));
    sounds.set(name, a);
  }
  a.currentTime = 0;
  void a.play().catch(() => {});
}
const face = (m: Mood = "happy", cl = "") =>
  `<button class="face ${cl}" aria-label="Strawberry reaction cam"><img src="${asset("face/" + m + ".png")}" alt="Strawberry"></button>`;
document.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (img instanceof HTMLImageElement && img.closest(".face"))
      img.replaceWith(document.createTextNode("🍓"));
  },
  true,
);
function reaction(m: Mood) {
  const f = $(".face");
  if (!f) return;
  const img = f.querySelector("img");
  if (img) img.src = asset("face/" + m + ".png");
  gsap.fromTo(
    f,
    { scaleX: 1.12, scaleY: 0.8 },
    {
      scaleX: 1,
      scaleY: 1,
      duration: 0.4,
      ease: "elastic.out(1,.45)",
      overwrite: true,
    },
  );
}
function burst(x = innerWidth / 2, y = innerHeight * 0.45, berries = false) {
  for (let i = 0; i < 32; i++) {
    const p = document.createElement("i");
    p.className = "fx";
    p.textContent = berries ? "🍓" : ["✦", "▪", "●"][i % 3];
    p.style.cssText = `left:${x}px;top:${y}px;color:${["#f67192", "#ff9933", "#138808", "#77cde0"][i % 4]}`;
    document.body.append(p);
    const a = (i * Math.PI) / 16;
    gsap.to(p, {
      keyframes: [
        {
          x: Math.cos(a) * (60 + Math.random() * 130),
          y: Math.sin(a) * 140 - 45,
          duration: 0.45,
        },
        { y: "+=110", opacity: 0, duration: 0.55 },
      ],
      rotation: 180,
      onComplete: () => p.remove(),
    });
  }
}
function toast(message: string, img = "") {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.role = "status";
  el.innerHTML =
    (img ? `<img alt="" src="${asset(esc(img))}">` : "") + esc(message);
  document.body.append(el);
  gsap.from(el, { scale: 0.7, duration: 0.3, ease: "back.out" });
  setTimeout(() => el.remove(), 2300);
}
document.addEventListener("click", (e) => {
  const f = (e.target as Element).closest(".face");
  if (!f) return;
  const now = performance.now();
  if (now - tapTime > 1300) taps = 0;
  tapTime = now;
  if (++taps === 5) {
    taps = 0;
    const r = f.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, true);
    toast("Secret unlocked: you are my favourite player. 🍓");
  }
});
const speaker =
  '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 6h3l4-3v10l-4-3H2zM11 5q3 3 0 6m2-8q5 5 0 10"/></svg>';
$("#app").innerHTML =
  `<header><div class="brand"><img src="${asset("art/berry.png")}" alt="">BERRY ARCADE</div><div class="tools"><span class="tag"><i class="led"></i> PLAYER 01</span><button id="sound"></button></div></header><main></main><footer><span>MADE WITH <b class="heart">♥</b> BY ${esc(c.nickname.toUpperCase())}</span><span>BIRTHDAY EDITION · V1.0</span></footer>`;
function soundLabel() {
  const b = $("#sound");
  b.innerHTML = speaker + (muted ? "SOUND OFF" : "SOUND ON");
  b.setAttribute("aria-pressed", String(!muted));
}
soundLabel();
$("#sound").onclick = () => {
  muted = !muted;
  if (muted) sounds.forEach((a) => a.pause());
  else sound("pop");
  soundLabel();
};
const btn = (id: string, label: string, cls = "primary") =>
  `<button id="${id}" class="${cls}">${label}</button>`;
const on = (id: string, fn: () => void) => {
  $("#" + id).onclick = fn;
};
function show(id: string, html: string) {
  stop();
  stop = () => {};
  document.body.dataset.screen = id;
  epoch++;
  $("main").innerHTML = html;
  gsap.from("main", { opacity: 0.5, y: 5, duration: 0.2 });
  window.scrollTo(0, 0);
}
// Public assets resolve relative to the deployed repository, including on Pages.
document.documentElement.style.setProperty(
  "--world",
  'url("' + asset("art/world.png") + '")',
);
const pixelFont = new FontFace(
  "Pixel",
  'url("' + asset("art/pixel.ttf") + '")',
);
void pixelFont
  .load()
  .then((f) => document.fonts.add(f))
  .catch(() => {});
const cabinet = `<div class="cabinet"><div class="cab-head"><span>✦ BERRY SYSTEM</span><span class="dots">● ● ●</span></div><div class="screen poster"><span class="worldtag mono">★ BIRTHDAY EDITION ★</span><h1>${esc(c.friendName.toUpperCase())}'S<span>BIRTHDAY</span><span>RESCUE</span></h1></div><div class="scene-foot"><span class="power"><i class="led"></i>POWER</span><i class="vents"></i></div></div>`;
const guide = `<section class="guide"><div><h3>HOW TO PLAY</h3><small>Your pocket field guide</small></div><div class="item"><span class="ico">🍓</span><div><b>Catch treats</b><small>Rack up points</small></div></div><div class="item"><span class="ico">⏰</span><div><b>Dodge trouble</b><small>Keep your hearts</small></div></div><div class="item"><span class="ico">🎁</span><div><b>Unlock gifts</b><small>Find memories</small></div></div></section>`;
const lock =
  '<svg viewBox="0 0 24 26" shape-rendering="crispEdges" aria-hidden="true"><path fill="#29283c" d="M6 10V5h2V2h8v2h2v6h3v14h-2v1H4v-2H3V10zm3 0h6V5H9z"/><path fill="#ffbf58" d="M5 12h14v10H5z"/><path fill="#ffdd86" d="M5 12h14v2H7v6H5z"/><path fill="#bb763d" d="M17 14h2v8H6v-2h11z"/><path fill="#2c2940" d="M10 14h4v4h-1v2h-2v-2h-1z"/></svg>';
function gate() {
  show(
    "gate",
    `<div class="layout">${cabinet}<section class="panel"><span class="tagpill">◆ PLAYER GATE</span><div class="lock">${lock}</div><h2>Unlock the<br>arcade</h2><p class="question">${esc(c.unlockQuestion)}</p><form><label class="mono label" for="answer">Your answer</label><input class="input" id="answer" placeholder="Type your answer…" autocomplete="off" required><div class="error" aria-live="polite"></div><button class="primary">Unlock game <span>→</span></button></form><p class="note">♡ &nbsp; A little birthday quest, just for you.</p></section></div>${guide}`,
  );
  $("form").onsubmit = (e) => {
    e.preventDefault();
    if (
      c.unlockAnswer.some(
        (a) =>
          a.trim().toLowerCase() ===
          $<HTMLInputElement>("#answer").value.trim().toLowerCase(),
      )
    ) {
      sound("pop");
      start();
    } else {
      $(".error").textContent =
        c.roastLines[Math.floor(Math.random() * c.roastLines.length)];
      gsap.fromTo(
        "form",
        { x: -5 },
        {
          x: 5,
          repeat: 4,
          yoyo: true,
          duration: 0.055,
          onComplete: () => {
            gsap.set("form", { x: 0 });
          },
        },
      );
    }
  };
}
function start() {
  show(
    "start",
    `<div class="layout">${cabinet}<section class="panel"><span class="tagpill">★ PLAYER READY</span><div class="balloons">🎈 🎈</div>${face()}<h2>Happy Birthday, ${esc(c.friendName)}!</h2><p>Catch ${c.targetScore} points to rescue your birthday surprise.</p>${btn("play", "▶ Play")}<p class="note">High score · ${high}</p></section></div>${guide}`,
  );
  gsap.to(".balloons", { y: -8, yoyo: true, repeat: 4, duration: 0.6 });
  gsap.fromTo(
    ".face",
    { rotation: -8 },
    { rotation: 8, yoyo: true, repeat: 3, duration: 0.2 },
  );
  burst();
  on("play", game);
}
function game() {
  show(
    "game",
    `<section class="wide"><div class="hud mono"></div><div class="playfield"><canvas class="game" aria-label="Catch falling treats with the basket"></canvas>${face("happy", "cam")}</div><p class="controls">↔ Drag or use arrow keys to move</p></section>`,
  );
  stop = play($(".game"), $(".hud"), {
    react: reaction,
    sound,
    memory: () => {
      const card = c.memoryCards[unlocked];
      if (card) {
        unlocked++;
        save();
        toast("Memory unlocked · " + card.caption, card.image);
      }
    },
    finish: (won, score) => {
      high = Math.max(high, score);
      save();
      if (won) {
        sound("cheer");
        candles();
      } else {
        show(
          "over",
          `<section class="wide">${face("crying")}<h2>Seriously? Try again.</h2><p>Score ${score} · Best ${high}</p>${btn("retry", "↻ Retry")}</section>`,
        );
        on("retry", game);
      }
    },
  });
}
function candles() {
  show(
    "candles",
    `<section class="wide"><span class="tagpill">★ BIRTHDAY RESCUED</span><h2>Make a wish${c.age ? " for " + c.age : ""}!</h2><div class="cake" aria-label="Birthday cake with lit candles"><img src="${asset("art/cake-lit.png")}" alt=""></div><p id="micstatus" role="status">Blow out the candles with your microphone, or tap below.</p><div class="row">${btn("mic", "Use microphone")}${btn("blow", "Tap to blow", "secondary")}</div></section>`,
  );
  let stream: MediaStream | undefined,
    ctx: AudioContext | undefined,
    frame = 0,
    done = false;
  const version = epoch;
  function cleanup() {
    cancelAnimationFrame(frame);
    stream?.getTracks().forEach((t) => t.stop());
    if (ctx && ctx.state !== "closed") void ctx.close().catch(() => {});
  }
  function extinguish() {
    if (done) return;
    done = true;
    cleanup();
    $<HTMLImageElement>(".cake img").src = asset("art/cake-out.png");
    $(".cake").ariaLabel = "Cake with candles out";
    $("#micstatus").textContent = "Wish sent. Happy birthday!";
    sound("jingle");
    burst();
    setTimeout(() => {
      if (epoch === version) burst(innerWidth * 0.28, innerHeight * 0.3);
    }, 320);
    $(".row").innerHTML = btn("gift", "Open your gift →");
    on("gift", gift);
  }
  stop = cleanup;
  on("blow", extinguish);
  on("mic", async () => {
    const button = $<HTMLButtonElement>("#mic");
    button.disabled = true;
    try {
      ctx = new AudioContext();
      await ctx.resume();
      const acquired = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (done || epoch !== version) {
        acquired.getTracks().forEach((t) => t.stop());
        return;
      }
      stream = acquired;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      $("#micstatus").textContent =
        "Listening… blow gently toward your microphone.";
      let since = 0;
      function listen() {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const v of samples) sum += ((v - 128) / 128) ** 2;
        if (Math.sqrt(sum / samples.length) > 0.085) {
          since ||= performance.now();
          if (performance.now() - since > 180) {
            extinguish();
            return;
          }
        } else since = 0;
        frame = requestAnimationFrame(listen);
      }
      listen();
    } catch {
      cleanup();
      if (!done && epoch === version)
        $("#micstatus").textContent =
          "Microphone unavailable. Tap below to blow out the candles.";
    }
  });
}
function whatsapp(text: string) {
  return (
    "https://wa.me/" +
    c.myWhatsAppNumber.replace(/\D/g, "") +
    "?text=" +
    encodeURIComponent(text)
  );
}
const wa = (label: string, msg: string) =>
  `<a class="primary" rel="noopener noreferrer" target="_blank" href="${whatsapp(msg)}">${label} ↗</a>`;
function gift() {
  show(
    "gift",
    `<section class="wide"><span class="tagpill">★ GIFT UNLOCKED</span><h2>${esc(c.giftRevealTitle)}</h2><div class="giftbox"><p>${esc(c.giftRevealMessage)}</p><canvas class="scratch" width="380" height="180" aria-label="Scratch the golden surface"></canvas></div><div id="reveal"><p>Rub the gold away to reveal your surprise.</p>${btn("accessible", "Reveal with keyboard", "secondary")}</div></section>`,
  );
  const canvas = $<HTMLCanvasElement>(".scratch"),
    ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#edb74d";
  ctx.fillRect(0, 0, 380, 180);
  ctx.fillStyle = "#ffda82";
  for (let y = 0; y < 180; y += 16)
    for (let x = 0; x < 380; x += 16) ctx.fillRect(x + (y % 32) / 2, y, 3, 3);
  ctx.fillStyle = "#514027";
  ctx.font = "bold 21px monospace";
  ctx.textAlign = "center";
  ctx.fillText("✦ SCRATCH HERE ✦", 190, 96);
  ctx.globalCompositeOperation = "destination-out";
  let done = false,
    previous: { x: number; y: number } | null = null,
    lastCheck = 0;
  function reveal() {
    if (done) return;
    done = true;
    canvas.remove();
    $("#reveal").innerHTML =
      face() +
      '<p class="bubble">Strawberry sent you a gift</p><div class="row">' +
      wa("Open WhatsApp", "Got the voucher, thank you Strawberry!") +
      btn("letter", "Read your letter →", "secondary") +
      "</div>";
    gsap.from(".bubble", { y: 12, opacity: 0, scale: 0.85 });
    burst();
    sound("cheer");
    on("letter", final);
  }
  function check() {
    const data = ctx.getImageData(0, 0, 380, 180).data;
    let gone = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] < 20) gone++;
    if (gone / (data.length / 16) >= 0.6) reveal();
  }
  function scratch(e: PointerEvent) {
    if (!canvas.hasPointerCapture(e.pointerId) || done) return;
    const r = canvas.getBoundingClientRect(),
      x = ((e.clientX - r.left) * 380) / r.width,
      y = ((e.clientY - r.top) * 180) / r.height;
    ctx.lineWidth = 40;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(previous?.x ?? x, previous?.y ?? y);
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    previous = { x, y };
    if (performance.now() - lastCheck > 100) {
      lastCheck = performance.now();
      check();
    }
  }
  canvas.onpointerdown = (e) => {
    previous = null;
    canvas.setPointerCapture(e.pointerId);
    scratch(e);
  };
  canvas.onpointermove = scratch;
  canvas.onpointerup = check;
  on("accessible", reveal);
}
function final() {
  show(
    "final",
    `<section class="wide">${face()}<h2>Dear ${esc(c.friendName)},</h2><p class="letter">${esc(c.birthdayMessage)}</p><p><b>${esc(c.finalMessage)}</b></p><div class="row">${wa("Send a wish back", "Best birthday site ever, Strawberry")}${btn("mem", "Memories", "secondary")}${btn("replay", "Replay", "secondary")}</div></section>`,
  );
  on("replay", start);
  on("mem", gallery);
}
function gallery() {
  show(
    "gallery",
    `<section class="wide"><h2>Memories</h2><p>${unlocked} of ${c.memoryCards.length} unlocked · Catch gift boxes to collect cards.</p><div class="gallery">${c.memoryCards.map((card, i) => (i < unlocked ? `<article><img src="${asset(esc(card.image))}" alt=""><p>${esc(card.caption)}</p></article>` : "<article>🔒<p>Locked memory</p></article>")).join("")}</div><div class="row">${btn("back", "Back to letter")}</div></section>`,
  );
  on("back", final);
}
gate();
