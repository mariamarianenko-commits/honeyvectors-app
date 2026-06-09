// HoneyVectors marketing kit — single module (concatenated so cross-file
// component references resolve in one scope, as in the original global build).


/* ======================= anim.jsx ======================= */

// HoneyVectors marketing kit — scroll-animation helpers + honeycomb-collapse

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (p, s, e) => clamp((p - s) / (e - s));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

// Reveal-on-enter wrapper. IntersectionObserver + scroll fallback so it fires
// reliably (even when programmatically scrolled / IO delivery is deferred).
function Reveal({ children, as = "div", variant, delay = 0, className = "", style = {}, ...rest }) {
  const ref = React.useRef(null);
  const [seen, setSeen] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let done = false;
    const reveal = () => { if (!done) { done = true; setSeen(true); cleanup(); } };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) * 0.92 && r.bottom > 0) reveal();
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) reveal(); });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    function cleanup() { io.disconnect(); window.removeEventListener("scroll", check); window.removeEventListener("resize", check); }
    check();
    return cleanup;
  }, []);
  const Tag = as;
  const cls = ["reveal", variant ? `reveal--${variant}` : "", seen ? "is-in" : "", className].filter(Boolean).join(" ");
  return React.createElement(Tag, { ref, className: cls, style: { transitionDelay: delay + "s", ...style }, ...rest }, children);
}

// Count-up number when scrolled into view (IO + scroll fallback).
function CountUp({ to, dur = 1400, prefix = "", suffix = "", decimals = 0 }) {
  const ref = React.useRef(null);
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    if (document.documentElement.hasAttribute("data-static")) { setVal(to); return; }
    let raf = 0, started = false;
    const run = () => {
      if (started) return; started = true; cleanup();
      const t0 = performance.now();
      const tick = (now) => {
        const t = clamp((now - t0) / dur);
        setVal(to * easeOut(t));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const check = () => {
      const r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) * 0.9 && r.bottom > 0) run();
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => { if (e.isIntersecting) run(); });
    }, { threshold: 0.3 });
    io.observe(el);
    window.addEventListener("scroll", check, { passive: true });
    function cleanup() { io.disconnect(); window.removeEventListener("scroll", check); }
    check();
    return () => { cleanup(); if (raf) cancelAnimationFrame(raf); };
  }, [to, dur]);
  return React.createElement("span", { ref }, prefix + val.toFixed(decimals) + suffix);
}

// Progress 0..1 across a tall section's sticky travel.
function useSectionProgress(ref) {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    const calc = () => {
      raf = 0;
      const el = ref.current; if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = el.offsetHeight - window.innerHeight;
      const scrolled = clamp(-rect.top, 0, travel);
      setP(travel > 0 ? scrolled / travel : 0);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(calc); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    calc();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return p;
}

// ── Honeycomb of 7 hexagonal cells (the "three leaks" + composition accents) ─
const DownArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
const DropIco = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5C12 2.5 5 10 5 14.5a7 7 0 0 0 14 0C19 10 12 2.5 12 2.5Z" /></svg>
);

// rounded hexagon path generator (pointy-top, corner radius r)
function roundedHexPath(w, h, r) {
  const V = [[w / 2, 0], [w, h * 0.25], [w, h * 0.75], [w / 2, h], [0, h * 0.75], [0, h * 0.25]];
  const tp = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy); return [p[0] + dx / l * r, p[1] + dy / l * r]; };
  let d = "";
  for (let i = 0; i < 6; i++) {
    const c = V[i], pv = V[(i + 5) % 6], nx = V[(i + 1) % 6];
    const a = tp(c, pv), b = tp(c, nx);
    d += (i === 0 ? `M${a[0]} ${a[1]}` : `L${a[0]} ${a[1]}`) + `Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
  }
  return d + "Z";
}
const HEX_W = 200, HEX_H = 230, HEX_PATH = roundedHexPath(HEX_W, HEX_H, 14);

const HCELLS = [
  { color: "#E8611A", tc: "#0D0D0D", n: "01", t: "Visibility", s: "buyers can't find you", dir: "x", from: -110, op: [0.04, 0.30, 0.54, 0.80] },
  { color: "#F5A623", tc: "#0D0D0D", n: "02", t: "Experience", s: "buyers won't stay", dir: "y", from: 110, op: [0.09, 0.35, 0.58, 0.84] },
  { color: "#1A1A1A", tc: "#F5A623", n: "03", t: "Intelligence", s: "you can't see why", dir: "x", from: 110, op: [0.14, 0.40, 0.62, 0.88] },
];

// ease-out ≈ cubic-bezier(0.16,1,0.3,1)
const eo = (x) => 1 - Math.pow(1 - x, 3);
function pwE(p, stops, vals) {
  if (p <= stops[0]) return vals[0];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i]) return lerp(vals[i - 1], vals[i], eo(seg(p, stops[i - 1], stops[i])));
  }
  return vals[vals.length - 1];
}

// back-ease (overshoot / wind-up) for an expressive card bounce
const easeOutBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeInBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return c3 * x * x * x - c1 * x * x; };
function cardOffset(prog, op, from) {
  if (prog <= op[0]) return from;
  if (prog < op[1]) return lerp(from, 0, easeOutBack(seg(prog, op[0], op[1])));  // IN  — overshoots then settles
  if (prog <= op[2]) return 0;                                                  // HOLD (short)
  if (prog < op[3]) return lerp(0, from, easeInBack(seg(prog, op[2], op[3])));   // OUT — winds up then flies out
  return from;
}

function Honeycomb({ prog }) {
  const assembled = prog === undefined;
  return (
    <div className="cards3">
      {HCELLS.map((c, i) => {
        const opacity = assembled ? 1 : pwE(prog, c.op, [0, 1, 1, 0]);
        const off = assembled ? 0 : cardOffset(prog, c.op, c.from);
        const transform = c.dir === "x" ? `translateX(${off}%)` : `translateY(${off}%)`;
        return (
          <div key={i} className="card3" style={{ opacity, transform }}>
            <div className="card3__bg" style={{ background: c.color }}></div>
            <span className="card3__n" style={{ color: c.tc }}>{c.n}</span>
            <div className="card3__tx" style={{ color: c.tc }}>
              <span className="card3__t">{c.t}</span>
              <span className="card3__s">{c.s}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const STACK_HEX = [
  { pos: "v", name: "HIVE", tag: "Adaptive web platform" },
  { pos: "e", name: "Honeycomb", tag: "Intent-aware delivery" },
  { pos: "i", name: "Beeswax", tag: "Revenue-grade analytics" },
];
function StackHexes() {
  return (
    <div className="gcards">
      {STACK_HEX.map((c, i) => (
        <div key={i} className="gcard">
          <span className="gcard__t">{c.name}</span>
          <span className="gcard__s">{c.tag}</span>
        </div>
      ))}
    </div>
  );
}

const LM_COPY = "Most teams treat a website like a finished asset. In reality, it bleeds — quietly, every day. Three systems decide whether buyers ever see you, stay with you, or trust you enough to act.";
const LM_WORDS = LM_COPY.split(" ");

// piecewise interpolation across keyframe stops
function pw(p, stops, vals) {
  if (p <= stops[0]) return vals[0];
  for (let i = 1; i < stops.length; i++) {
    if (p <= stops[i]) return lerp(vals[i - 1], vals[i], seg(p, stops[i - 1], stops[i]));
  }
  return vals[vals.length - 1];
}

const LM_CARDS = [
  { color: "#E8611A", n: "1", t: "Visibility", s: "buyers can't find you", dir: "x", from: -110, inPos: [0.34, 0.52], inOp: [0.34, 0.50] },
  { color: "#F59E2A", n: "2", t: "Experience", s: "buyers won't stay", dir: "y", from: 110, inPos: [0.38, 0.56], inOp: [0.38, 0.54] },
  { color: "#FFC457", n: "3", t: "Insight", s: "you can't see why", dir: "x", from: 110, inPos: [0.42, 0.60], inOp: [0.42, 0.58] },
];

// Pinned manifesto → cards. Driven by refs + rAF (no setState per scroll = no stutter).
function LeakMaturity() {
  const ref = React.useRef(null);
  const paraRef = React.useRef(null);
  const wordRefs = React.useRef([]);
  const gridRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const E = (x) => 1 - Math.pow(1 - x, 3); // ease-out ≈ cubic-bezier(0.16,1,0.3,1)
    const sg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
    const lp = (a, b, t) => a + (b - a) * t;
    const pwf = (p, stops, vals) => {
      if (p <= stops[0]) return vals[0];
      for (let i = 1; i < stops.length; i++) if (p <= stops[i]) return lp(vals[i - 1], vals[i], E(sg(p, stops[i - 1], stops[i])));
      return vals[vals.length - 1];
    };
    const N = LM_WORDS.length;
    const span = 0.34 / N;
    // Mobile: un-pin — show manifesto + numbers fully, stacked, no scroll choreography.
    const isMobile = window.matchMedia("(max-width: 760px)").matches;
    if (isMobile) {
      if (paraRef.current) { paraRef.current.style.opacity = 1; paraRef.current.style.transform = "none"; }
      wordRefs.current.forEach((w) => { if (w) w.style.color = w.dataset.hot ? "#E8611A" : "#fff"; });
      if (gridRef.current) gridRef.current.style.transform = "none";
      cardRefs.current.forEach((node) => { if (node) { node.style.opacity = 1; node.style.transform = "none"; } });
      return;
    }
    let raf = 0;
    const draw = () => {
      raf = 0;
      const travel = el.offsetHeight - window.innerHeight;
      const p = travel > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / travel)) : 0;
      const para = paraRef.current;
      if (para) {
        para.style.opacity = pwf(p, [0, 0.46, 0.58], [1, 1, 0]);
        para.style.transform = `translateY(${pwf(p, [0, 0.14, 0.58], [4, 0, -46])}vh)`;
      }
      for (let i = 0; i < N; i++) {
        const w = wordRefs.current[i]; if (!w) continue;
        const start = i * span;
        const lit = E(sg(p, start, Math.min(start + span * 2.6, 0.42)));
        if (w.dataset.hot) {
          w.style.color = `rgb(${Math.round(lp(64, 232, lit))},${Math.round(lp(64, 97, lit))},${Math.round(lp(64, 26, lit))})`;
        } else {
          const c = Math.round(lp(64, 255, lit));
          w.style.color = `rgb(${c},${c},${c})`;
        }
      }
      if (gridRef.current) gridRef.current.style.transform = "none";
      LM_CARDS.forEach((c, i) => {
        const node = cardRefs.current[i]; if (!node) return;
        let off;
        if (p < c.inPos[0]) off = c.from;
        else if (p < c.inPos[1]) off = lp(c.from, 0, E(sg(p, c.inPos[0], c.inPos[1])));
        else off = 0;
        node.style.opacity = pwf(p, [c.inOp[0], c.inOp[1]], [0, 1]);
        node.style.transform = c.dir === "x" ? `translateX(${off}%)` : `translateY(${off}%)`;
      });
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(draw); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    draw();
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="lm" ref={ref} style={{ height: "190vh" }}>
      <div className="lm__sticky">
        <div className="lm__card">
          <div className="lm__para" ref={paraRef} style={{ opacity: 1 }}>
            <p>
              {LM_WORDS.map((w, i) => {
                const hot = w === "Three" || w === "systems";
                return <span key={i} ref={(n) => (wordRefs.current[i] = n)} data-hot={hot ? "1" : undefined} style={{ color: "rgb(70,70,70)", marginRight: "0.3em", display: "inline-block", willChange: "color" }}>{w}</span>;
              })}
            </p>
          </div>
          <div className="lm__gridwrap" ref={gridRef}>
            <div className="cards3">
              {LM_CARDS.map((c, i) => (
                <div key={i} className="bignum" ref={(n) => (cardRefs.current[i] = n)} style={{ opacity: 0, transform: c.dir === "x" ? `translateX(${c.from}%)` : `translateY(${c.from}%)` }}>
                  <span className="bignum__n" style={{ color: c.color }}>{c.n}</span>
                  <span className="bignum__t">{c.t}</span>
                  <span className="bignum__s">{c.s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Reveal, CountUp, useSectionProgress, Honeycomb, StackHexes, LeakMaturity, _anim: { clamp, lerp, seg, easeOut } });

/* ======================= sections-top.jsx ======================= */

// HoneyVectors marketing kit — top sections: Mark, Nav, Hero, Story

// 7-cell honeycomb flower mark (from brand mark-icon.svg)
const MARK_POLYS = [
  "0,-19 16.45,-9.5 16.45,9.5 0,19 -16.45,9.5 -16.45,-9.5",
  "32.9,-19 49.35,-9.5 49.35,9.5 32.9,19 16.45,9.5 16.45,-9.5",
  "16.45,-47.5 32.9,-38 32.9,-19 16.45,-9.5 0,-19 0,-38",
  "-16.45,-47.5 0,-38 0,-19 -16.45,-9.5 -32.9,-19 -32.9,-38",
  "-32.9,-19 -16.45,-9.5 -16.45,9.5 -32.9,19 -49.35,9.5 -49.35,-9.5",
  "-16.45,9.5 0,19 0,38 -16.45,47.5 -32.9,38 -32.9,19",
  "16.45,9.5 32.9,19 32.9,38 16.45,47.5 0,38 0,19",
];
function Mark({ size = 30, fill = "var(--hv-signal)", stroke = "var(--hv-void)", sw = 1.2 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-label="HoneyVectors" role="img" style={{ flex: "none" }}>
      <g transform="translate(60,60) rotate(90)">
        {MARK_POLYS.map((p, i) => <polygon key={i} points={p} fill={fill} stroke={stroke} strokeWidth={sw} />)}
      </g>
    </svg>
  );
}

function Wordmark({ size = 16 }) {
  return (
    <span className="nav__wordmark-text" style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: size, lineHeight: 1, fontWeight: 800 }}>
      <span style={{ color: "#fff" }}>HONEY</span><span style={{ color: "var(--hv-signal)" }}>VECTORS</span>
    </span>
  );
}

// Signature CTA pill (matches DS Button.primary)
function CTA({ children = "Find My Revenue Leaks", size = "md", href = "#audit", variant = "primary" }) {
  return (
    <a className={`hv-btn hv-btn--${variant} hv-btn--${size}`} href={href}>
      <span className="hv-btn__fill" aria-hidden="true"></span>
      <span style={{ position: "relative" }}>{children}</span>
      <span className="hv-btn__hex" aria-hidden="true">
        <svg width="1em" height="1em" viewBox="0 0 14 14" fill="none" style={{ width: "0.85em", height: "0.85em" }}>
          <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}

// Fit-to-width poster headline: uniform font-size, each line tracked out
// (letter-spacing) to fill the column edge-to-edge — like a justified poster.
function HeroHeadline() {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const head = ref.current;
    if (!head) return;
    const lines = [...head.querySelectorAll(".hl")];
    const fit = () => {
      const w = head.clientWidth;
      if (!w) return;
      // 1) natural widths at 100px, no tracking
      const nat = lines.map((l) => {
        l.style.letterSpacing = "0px";
        l.style.fontSize = "100px";
        l.style.display = "inline-block";
        const x = l.scrollWidth;
        l.style.display = "block";
        return x;
      });
      const maxNat = Math.max(...nat, 1);
      const capFs = Math.min(150, w * 0.2);          // bound height on wide screens
      const fs = Math.min((100 * w) / maxNat, capFs); // longest line ~fills at ls 0
      const wt = w - fs * 0.14;                       // breathing room for italic slant
      // 2) apply uniform size + per-line tracking to fill width
      lines.forEach((l, i) => {
        l.style.fontSize = fs.toFixed(2) + "px";
        const natAtFs = (nat[i] * fs) / 100;
        const len = l.textContent.trim().length || 1;
        const ls = Math.max(-2, (wt - natAtFs) / len);
        l.style.letterSpacing = ls.toFixed(2) + "px";
      });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(head);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    const t = setTimeout(fit, 500);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);
  return (
    <h1 className="hero__head" ref={ref}>
      <span className="hl">Your</span>
      <span className="hl">Website</span>
      <span className="hl">Is <span className="hero__leak"><span className="hero__leak-ink">Leaking</span><span className="honey-pool" aria-hidden="true">
        <span className="honey-pool__base"></span>
        <span className="honey-blob" style={{ left: "12%", "--dur": "4.6s", "--delay": "0s" }}></span>
        <span className="honey-blob" style={{ left: "30%", "--dur": "5.7s", "--delay": "1.9s" }}></span>
        <span className="honey-blob" style={{ left: "48%", "--dur": "5.1s", "--delay": "0.9s" }}></span>
        <span className="honey-blob" style={{ left: "66%", "--dur": "6.1s", "--delay": "2.7s" }}></span>
        <span className="honey-blob" style={{ left: "84%", "--dur": "4.9s", "--delay": "1.3s" }}></span>
      </span></span></span>
      <span className="hl">Revenue</span>
    </h1>
  );
}

function Nav() {
  const [open, setOpen] = React.useState(false);
  const links = [["Results", "#results"], ["Products", "#products"], ["Contact", "#contact"]];
  return (
    <header className="nav">
      <div className="nav__bar">
        <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <Mark size={30} />
          <Wordmark />
        </a>
        <nav className="nav__links">
          {links.map(([t, h]) => <a key={h} href={h}>{t}</a>)}
        </nav>
        <div className="nav__right">
          <CTA size="sm">Free Leak Audit</CTA>
          <button className={"nav__burger" + (open ? " is-open" : "")} aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div className={"nav__menu" + (open ? " is-open" : "")}>
        {links.map(([t, h]) => <a key={h} href={h} onClick={() => setOpen(false)}>{t}</a>)}
      </div>
    </header>
  );
}

function Hero({ bg, video }) {
  return (
    <section className="hero">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="hv-liquid" x="-35%" y="-35%" width="170%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.009 0.016" numOctaves="2" seed="7" result="noise">
              <animate attributeName="baseFrequency" dur="20s" values="0.009 0.016;0.014 0.01;0.007 0.019;0.009 0.016" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" result="disp" />
            <feGaussianBlur in="disp" stdDeviation="0.6" />
          </filter>
        </defs>
      </svg>
      {video
        ? <video className="hero__bg hero__bg-img" src={video} poster={bg} autoPlay muted loop playsInline></video>
        : <img className="hero__bg hero__bg-img" src={bg} alt="" />}
      <div className="hero__scrim"></div>

      <Nav />

      <div className="hero__inner">
        <h1 className="hero__title">
          <span className="line">Your Website Is</span>
          <span className="line"><span className="leak">Leaking</span> Revenue</span>
        </h1>
        <p className="hero__sub">
          See exactly where your website loses in search, where visitors stop converting, and
          where revenue leaks — then we rebuild your site to adapt to visitor behavior and rank
          everywhere buyers search. <b>Free.</b>
        </p>
        <div className="hero__cta">
          <CTA size="lg">Find My Revenue Leaks</CTA>
          <p className="hero__trust">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12.5L10 17.5L19 7.5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Delivered in 5 days <span className="sep">|</span> No sales pitch
          </p>
        </div>
      </div>
    </section>
  );
}

function Story({ img1, img2, img3 }) {
  const TOK = [
    { w: "Every" }, { w: "site" }, { img: img1 }, { w: "leaks" }, { br: true },
    { img: img2 }, { w: "revenue" }, { w: "in" }, { w: "these" }, { br: true },
    { w: "three" }, { img: img3 }, { w: "ways:" },
  ];
  const clip = { overflow: "hidden", display: "inline-block", verticalAlign: "bottom", paddingBottom: "0.08em" };
  return (
    <section className="section section--light">
      <div className="container">
        <h2 className="story__head">
          <span className="story__flow">
            {TOK.map((t, i) => {
              if (t.br) return <span key={i} style={{ flexBasis: "100%", height: 0 }} aria-hidden="true"></span>;
              if (t.img) return <Reveal key={i} as="span" variant="scale" delay={i * 0.05} style={{ display: "inline-block" }}><img className="story__img" src={t.img} alt="" /></Reveal>;
              return <span key={i} style={clip}><Reveal as="span" variant="rise" delay={i * 0.05} style={{ display: "inline-block" }}>{t.w}</Reveal></span>;
            })}
          </span>
        </h2>
      </div>
    </section>
  );
}

Object.assign(window, { Mark, Wordmark, CTA, HeroHeadline, Nav, Hero, Story });

/* ======================= sections-intro.jsx ======================= */

// HoneyVectors marketing kit — intro chrome: HexCursor, HiveLoader, StickyNav

function HexCursor() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0, x = innerWidth / 2, y = innerHeight / 2;
    const move = (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (ref.current) ref.current.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`; });
    };
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mousemove", move); if (raf) cancelAnimationFrame(raf); };
  }, []);
  if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return null;
  return (
    <div ref={ref} className="kit-cursor" aria-hidden="true">
      <span className="kit-cursor__pulse"></span>
      <span className="kit-cursor__hex"></span>
    </div>
  );
}

const LOADER_MSGS = [
  "Calibrating signal", "Handshaking with hive", "Loading vectors", "Mapping intent signals",
  "Syncing the hive", "Scoring friction points", "Detecting buyer stage", "Spinning up Omni-Nectar",
  "Priming HoneyCombDB", "Building 4D intent map", "Activating Beeswax layer", "Running heuristic pass",
  "Calculating intent score", "Finalizing your session", "Almost there", "Signal locked",
];

function OrbitHex({ dir, fill, stroke }) {
  return (
    <div className="loader__orbit">
      <div className="loader__hex" style={{ animation: `${dir} 3.6s linear infinite` }}>
        <svg width="62" height="62" viewBox="0 0 62 62" style={{ animation: `${dir === "hv-orbit-cw" ? "hv-spin" : "hv-spin-rev"} 3.6s linear infinite` }}>
          <polygon points="31,3 56,17 56,45 31,59 6,45 6,17" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <polygon points="31,12 48,21.5 48,40.5 31,50 14,40.5 14,21.5" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}

function HiveLoader({ onComplete }) {
  const [progress, setProgress] = React.useState(0);
  const [idx, setIdx] = React.useState(0);
  const [vis, setVis] = React.useState(true);
  const [out, setOut] = React.useState(false);
  const doneRef = React.useRef(false);

  React.useEffect(() => {
    const swap = setInterval(() => {
      setVis(false);
      setTimeout(() => { setIdx((i) => (i + 1) % LOADER_MSGS.length); setVis(true); }, 280);
    }, 950);
    return () => clearInterval(swap);
  }, []);

  React.useEffect(() => {
    const start = performance.now();
    const total = 2100 + Math.random() * 600;
    let raf = 0, value = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / total);
      const target = (1 - Math.pow(1 - t, 1.6)) * 100;
      value += (target - value) * 0.12;
      setProgress(value);
      if (value >= 99 && !doneRef.current) {
        doneRef.current = true;
        setProgress(100);
        setOut(true);
        setTimeout(onComplete, 600);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety: guarantee completion even if rAF is throttled (background tab).
    const safety = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; setProgress(100); setOut(true); setTimeout(onComplete, 600); }
    }, total + 1200);
    return () => { cancelAnimationFrame(raf); clearTimeout(safety); };
  }, [onComplete]);

  return (
    <div className={"loader" + (out ? " loader--out" : "")}>
      <div className="hv-grid-bg" style={{ position: "absolute", inset: 0 }}></div>
      <div className="loader__rig">
        <svg className="loader__ring" width="220" height="220" viewBox="0 0 220 220" style={{ animation: "hv-spin 12s linear infinite" }}>
          <polygon points="110,10 200,57 200,163 110,210 20,163 20,57" stroke="#fff" strokeWidth="1.2" strokeDasharray="10 7" fill="none" opacity="0.35" />
        </svg>
        <svg className="loader__ring" width="175" height="175" viewBox="0 0 175 175" style={{ animation: "hv-spin-rev 8s linear infinite" }}>
          <polygon points="87.5,8 161,49 161,126 87.5,167 14,126 14,49" stroke="#fff" strokeWidth="0.9" strokeDasharray="7 6" fill="none" opacity="0.25" />
        </svg>
        <svg className="loader__ring" width="130" height="130" viewBox="0 0 130 130" style={{ animation: "hv-spin 5s linear infinite" }}>
          <polygon points="65,6 118,36 118,94 65,124 12,94 12,36" stroke="#fff" strokeWidth="0.9" strokeDasharray="5 5" fill="none" opacity="0.2" />
        </svg>
        <OrbitHex dir="hv-orbit-cw" fill="#fff" stroke="rgba(255,255,255,0.6)" />
        <OrbitHex dir="hv-orbit-ccw" fill="#FFD166" stroke="#FFC233" />
        <svg width="20" height="20" viewBox="0 0 20 20" style={{ position: "absolute" }}>
          <circle cx="10" cy="10" r="5" fill="#fff" opacity="0.95">
            <animate attributeName="r" values="5;3;5" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="loader__status">
        {[0, 1, 2].map((i) => (
          <span key={i} className="loader__dot" style={{ animation: `hv-dot-pulse 1.2s ease-in-out infinite ${i * 0.2}s` }}></span>
        ))}
        <span className="loader__label" style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(-5px)" }}>
          {LOADER_MSGS[idx]}
        </span>
      </div>
      <div className="loader__bar"><div className="loader__fill" style={{ width: progress + "%" }}></div></div>
    </div>
  );
}

// Honey-drip bottom edge for the sticky nav (1440x120 viewBox path)
const DRIP_PATH = "M0,0 H1440 V80 C1380,80 1360,116 1320,116 C1280,116 1260,80 1200,80 C1140,80 1120,120 1080,120 C1040,120 1020,80 960,80 C900,80 880,110 840,110 C800,110 780,80 720,80 C660,80 640,118 600,118 C560,118 540,80 480,80 C420,80 400,114 360,114 C320,114 300,80 240,80 C180,80 160,118 120,118 C80,118 60,80 0,80 Z";
const DRIP_MASK = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120' preserveAspectRatio='none'><path d='${DRIP_PATH}' fill='black'/></svg>")`;

function StickyNav() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className={"snav" + (show ? " snav--show" : "")}>
      <div className="snav__bar" style={{ WebkitMaskImage: DRIP_MASK, maskImage: DRIP_MASK }}>
        <div className="snav__inner container container--wide">
          <a href="#" style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <Mark size={34} fill="#fff" stroke="#E8611A" sw={3} />
            <span style={{ fontFamily: "var(--font-display)", textTransform: "uppercase", letterSpacing: "0.14em", fontSize: 17, color: "#fff" }}>HONEYVECTORS</span>
          </a>
          <nav className="snav__links"><a href="#results">Results</a><a href="#products">Products</a><a href="#contact">Contact</a></nav>
          <CTA size="sm">Free Leak Audit</CTA>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { HexCursor, HiveLoader, StickyNav });

/* ======================= sections-mid.jsx ======================= */

// HoneyVectors marketing kit — mid sections: LeakTiles + pinned Diagnosis
// Diagnosis recreated 1:1 from the production "THE THREE LEAKS" pinned-scroll
// section: 3 states × 120vh, sticky 100vh, scroll-progress → active state,
// 3D-tilt mockup with a glow that travels between focus points, left progress
// rail, and a headline/why/impact/old-way panel that cross-fades per state.

const dlerp = (a, b, t) => a + (b - a) * t;
const dclamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const dseg = (p, s, e) => dclamp((p - s) / (e - s));

function LeakTiles({ leaksImg }) {
  return (
    <section className="section section--light" style={{ paddingTop: 0 }}>
      <div className="container" style={{ display: "flex", justifyContent: "center" }}>
        <Honeycomb leaksImg={leaksImg} />
      </div>
    </section>
  );
}

const LEAKS = [
  {
    step: "01", tag: "The Visibility Leak", headline: "Buyers can't find you.",
    subhead: "ChatGPT cited your competitor 47 times this month. You weren't mentioned once.",
    focus: { x: 50, y: 14 },
    why: [
      ["Not built for semantic retrieval", "AI scrapes HTML, strips markup, guesses meaning. Vector-native content is indexed for meaning from day one."],
      ["Invisible across 10+ surfaces", "Google, ChatGPT, Perplexity, Claude, TikTok, Reddit, YouTube, AI Overviews — traditional SEO only ranks one."],
      ["Static pages can't answer questions", "Buyers ask AI questions. Your content is organized by /pages, not by intent. Competitors get cited. You get skipped."],
    ],
    impact: [
      ["Content ROI collapses", "20 posts/month, 40 views each, zero conversions. Competitors get 10× discovery from the same effort."],
      ["Paid becomes your only channel", "CPCs rise 15–30% yearly. Competitors with strong organic spend ⅓ what you do. Your CAC climbs, theirs stays flat."],
      ["Every new platform widens the gap", "SearchGPT, Perplexity, Claude — each launch, they're cited by default. You scramble. The gap compounds quarterly."],
    ],
    oldWay: { tactic: "Hire SEO agency. Research keywords. Optimize meta tags. Build links. Wait 6–12 months for Google.", problem: "Only works for Google. Doesn't help in ChatGPT, Perplexity, social search, or AI Overviews. Search evolved. The tactic didn't." },
  },
  {
    step: "02", tag: "The Experience Leak", headline: "Visitors don't convert.",
    subhead: "Every visitor sees the same page. Most see the wrong experience for their intent.",
    focus: { x: 50, y: 50 },
    why: [
      ["Speed kills before they see the offer", "3.2s average load. −30% conversion per second past 2s. Mobile is worse. Speed isn't a feature — it's a requirement."],
      ["Static architecture forces mismatches", "Ready buyer sees \u201cLearn More.\u201d Researcher sees \u201cBook Demo.\u201d Cognitive rejection in milliseconds. They just leave."],
      ["Generic resonates with no one", "Analytical buyers need data. Emotional need stories. Risk-averse need proof. Generic copy satisfies none of them."],
      ["Pages can't read behavior", "8 minutes on comparisons = clear intent. Static site shows the same CTA. Architecture, not copy, is the ceiling."],
    ],
    impact: [
      ["2% conversion isn't \u201cnormal\u201d", "It's an architectural limit. 49 of 50 visitors weren't unqualified — they saw mismatched experiences."],
      ["CAC spirals while theirs stays flat", "Same $200/visitor. They convert 6%, you convert 2%. Their CAC: $3,333. Yours: $10,000."],
      ["Sales cycles drag for 90 days", "Wrong experience → nurture → retargeting → drips → call. Adaptive sites close on visit one. You close on day 90."],
      ["A/B testing hits a low ceiling", "Six months of tests: 2.1% → 2.4%. You're rearranging deck chairs on a one-size-fits-all foundation."],
    ],
    oldWay: { tactic: "Hire CRO agency. A/B test headlines, button colors, images. Iterate for 6–12 months. Get a 10–20% lift.", problem: "You're testing tactics while competitors rebuilt the architecture. They convert 3× higher because they removed the ceiling, not painted it." },
  },
  {
    step: "03", tag: "The Insight Leak", headline: "You don't know why.",
    subhead: "Google Analytics tells you WHERE visitors go. It fundamentally can't tell you WHY they leave.",
    focus: { x: 70, y: 84 },
    why: [
      ["Analytics track behavior, not psychology", "Clicks, pages, sessions — never intent stage, never psychographics, never the friction that caused the bounce."],
      ["Six tools, zero correlation", "GA, Hotjar, SEMrush, PageSpeed, UX audits, surveys. Weeks of manual stitching to diagnose one bounce. Most teams just guess."],
      ["You can't see where you're invisible", "GA shows traffic that came. It can't show the ChatGPT, Reddit, TikTok searches where you never appeared."],
      ["Attribution breaks across platforms", "TikTok → ChatGPT → Reddit → Google → convert. GA credits Google. You optimize the wrong channel forever."],
    ],
    impact: [
      ["$50K/yr testing the wrong things", "60–80% of optimization fails because you fix symptoms. Real cause: 71% are analytical skeptics seeing emotional copy."],
      ["Stuck at 2% for 18 months", "New copy, redesigns, CTAs — nothing moves. You treat visible symptoms while invisible variables control the outcome."],
      ["$50K–$100K decisions on coin flips", "Redesign? Rebuild pricing? Double content? 40–60% of major calls fail without root-cause visibility."],
      ["Competitive intel gap compounds", "They see psychographics, intent, friction, invisibility. You see traffic and bounce. Asymmetry widens."],
    ],
    oldWay: { tactic: "Stack GA + Hotjar + SEMrush + PageSpeed + quarterly UX audits. $400/mo plus consultants. Stitch reports by hand.", problem: "Still missing the psychological layer. Six tools, still guessing at root cause. Intent and psychographics aren't what they were built to measure." },
  },
];

// Center 3D mockup: tilt + dotted grid + window + traveling glow.
function DiagMock({ rotX, rotY, focusX, focusY }) {
  return (
    <div className="dg-stage">
      <div className="dg-grid" aria-hidden="true"></div>
      <div className="dg-window" style={{ transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)` }}>
        <div className="dg-bar">
          <span className="dg-dot"></span><span className="dg-dot"></span><span className="dg-dot"></span>
          <span className="dg-url">yoursite.com</span>
        </div>
        <div className="dg-body">
          <div className="dg-blk dg-blk--head"><span></span><span></span></div>
          <div className="dg-blk" style={{ gridColumn: "span 4", gridRow: "span 4" }}></div>
          <div className="dg-blk" style={{ gridColumn: "span 4", gridRow: "span 4" }}></div>
          <div className="dg-blk" style={{ gridColumn: "span 4", gridRow: "span 4" }}></div>
          <div className="dg-blk" style={{ gridColumn: "span 8", gridRow: "span 5" }}></div>
          <div className="dg-blk dg-blk--cta" style={{ gridColumn: "span 4", gridRow: "span 5" }}></div>
        </div>
        <div className="dg-glow" style={{ background: `radial-gradient(circle at ${focusX}% ${focusY}%, rgba(232,97,26,0.55), rgba(232,97,26,0) 28%)` }}></div>
      </div>
    </div>
  );
}

// State 01 — AI search + sources with "0 mentions"
function MockVisibility() {
  return (
    <div className="dg-overlay">
      <div className="dg-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.4)", flex: "none" }}><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        <span className="dg-search__q">which sites does Perplexity cite<span className="dg-caret"></span></span>
      </div>
      <div className="dg-sources">
        <div className="dg-sources__h"><span className="dg-sdot"></span>AI Answer · Sources</div>
        <div className="dg-sline" style={{ width: "100%" }}></div>
        <div className="dg-sline" style={{ width: "88%" }}></div>
        <div className="dg-sline" style={{ width: "60%" }}></div>
        <div className="dg-src"><span className="dg-src__n">[1]</span>competitor-a.com</div>
        <div className="dg-src"><span className="dg-src__n">[2]</span>competitor-b.io</div>
        <div className="dg-src"><span className="dg-src__n">[3]</span>industry-blog.com</div>
        <div className="dg-src dg-src--you"><span className="dg-src__n" style={{ color: "var(--hv-signal)" }}>[—]</span><span className="dg-strike">yoursite.com</span><span className="dg-badge">0 mentions</span></div>
      </div>
    </div>
  );
}

const SEGMENTS = [
  { x: "-4%", y: "10%", label: "Ready Buyer", need: "Wants pricing + demo" },
  { x: "66%", y: "26%", label: "Researcher", need: "Wants comparisons" },
  { x: "-4%", y: "70%", label: "Skeptic", need: "Wants proof + cases" },
  { x: "68%", y: "86%", label: "Browser", need: "Wants overview" },
];
function MockExperience() {
  return (
    <div className="dg-overlay">
      {SEGMENTS.map((s) => (
        <div className="dg-seg" key={s.label} style={{ left: s.x, top: s.y }}>
          <div className="dg-seg__l">{s.label}</div>
          <div className="dg-seg__n">{s.need}</div>
          <div className="dg-seg__got">Got → "Learn More"</div>
        </div>
      ))}
      <div className="dg-onepage">One page · Every visitor</div>
    </div>
  );
}

const METRICS = [
  { x: "-4%", y: "6%", label: "Bounce", value: "68%" },
  { x: "68%", y: "20%", label: "Conversion", value: "2.1%" },
  { x: "-4%", y: "64%", label: "AI citations", value: "?" },
  { x: "66%", y: "78%", label: "Why they left", value: "—" },
];
function MockInsight() {
  return (
    <div className="dg-overlay">
      {METRICS.map((m) => (
        <div className="dg-metric" key={m.label} style={{ left: m.x, top: m.y }}>
          <div className="dg-metric__l">{m.label}</div>
          <div className="dg-metric__v">{m.value}</div>
          <span className="dg-why">why?</span>
        </div>
      ))}
    </div>
  );
}

function DiagRail({ active, fill }) {
  return (
    <div className="dg-rail" aria-hidden="true">
      <div className="dg-rail__label">Leak</div>
      <div className="dg-rail__track"><div className="dg-rail__fill" style={{ height: fill + "%" }}></div></div>
      <div className="dg-rail__items">
        {LEAKS.map((l, i) => {
          const on = i === active, past = i < active;
          return (
            <div className="dg-rail__item" key={l.step} style={{ opacity: on ? 1 : past ? 0.7 : 0.45 }}>
              <span className="dg-rail__hex" style={{ background: on || past ? "#0D0D0D" : "transparent", boxShadow: on || past ? "none" : "inset 0 0 0 2px rgba(13,13,13,0.4)", transform: on ? "scale(1.25)" : "scale(1)" }}></span>
              <span><span className="dg-rail__n">{l.step}</span><span className="dg-rail__t">{l.tag.replace("The ", "").replace(" Leak", "")}</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiagCol({ label, items, accent }) {
  return (
    <div>
      <div className="dg-colh"><span className={"dg-colh__hx" + (accent ? " dg-colh__hx--on" : "")}></span>{label}</div>
      <ul className="dg-bullets">
        {items.map(([t, d], i) => (
          <li className="dg-bullet" key={i}>
            <span className={"dg-bullet__ic" + (accent ? " dg-bullet__ic--ink" : "")}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5L10 17.5L19 7.5" /></svg>
            </span>
            <div className="dg-bullet__tx"><div className="dg-bullet__t">{t}</div><div className="dg-bullet__d">{d}</div></div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const FIX = {
  "01": "We rebuild your content vector-native — structured for meaning — so Google ranks it and ChatGPT, Perplexity and Claude cite it by default.",
  "02": "We rebuild the page to adapt to each visitor's intent in real time — the right message, offer and CTA per buyer, not one generic page.",
  "03": "We instrument the site to read intent and friction, not just clicks — so you see why visitors leave and fix the cause, not the symptom.",
};

function Diagnosis() {
  const ref = React.useRef(null);
  const p = useSectionProgress(ref);
  const N = LEAKS.length;
  const f = 0.9 / N;
  const active = Math.min(N - 1, Math.max(0, Math.floor(p / f)));
  const leak = LEAKS[active];

  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const on = () => setIsMobile(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const rotY = dlerp(-22, 22, dseg(p, 0.05, 0.95));
  const rotX = dlerp(12, -8, dseg(p, 0.05, 0.95));
  const fill = dseg(p, 0.05, 0.95) * 100;
  // glow focus: interpolate between state focus points across the scroll
  const fp = p / 0.9 * (N - 1);
  const i0 = Math.min(N - 1, Math.floor(fp));
  const i1 = Math.min(N - 1, i0 + 1);
  const ft = dclamp(fp - i0);
  const focusX = dlerp(LEAKS[i0].focus.x, LEAKS[i1].focus.x, ft);
  const focusY = dlerp(LEAKS[i0].focus.y, LEAKS[i1].focus.y, ft);

  const MOCKS = [MockVisibility, MockExperience, MockInsight];

  if (isMobile) {
    return (
      <section className="dg dg--stacked" id="leaks">
        <div className="dg-sticky">
          <div className="dg-head">
            <span className="dg-head__hx"></span>
            <span className="dg-head__t">The Three Leaks · Diagnosis in detail</span>
            <span className="dg-head__line"></span>
          </div>
          {LEAKS.map((lk, idx) => {
            const M = MOCKS[idx];
            return (
              <div className="dg-2col" key={lk.step}>
                <div className="dg-col-mock">
                  <DiagMock rotX={0} rotY={0} focusX={lk.focus.x} focusY={lk.focus.y} />
                  <div className="dg-overlay-wrap"><M /></div>
                </div>
                <div className="dg-panel">
                  <div className="dg-panel__step">
                    <span className="dg-panel__num">{lk.step}</span>
                    <span className="dg-panel__tag">{lk.tag.replace("The ", "").replace(" Leak", "")}</span>
                  </div>
                  <h3 className="dg-panel__h">{lk.headline.replace(/\.$/, "")}<span className="dg-panel__dot">.</span></h3>
                  <p className="dg-panel__sub">{lk.subhead}</p>
                  <div className="dg-panel__fix"><p className="dg-panel__fix-p">{FIX[lk.step]}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="dg" id="leaks" ref={ref} style={{ height: `${N * 175}vh` }}>
      <div className="dg-sticky">
        <div className="dg-amb" aria-hidden="true"></div>
        <div className="dg-head">
          <span className="dg-head__hx"></span>
          <span className="dg-head__t">The Three Leaks · Diagnosis in detail</span>
          <span className="dg-head__line"></span>
        </div>

        <DiagRail active={active} fill={fill} />

        <div className="dg-grid-wrap">
          <div className="dg-2col">
            <div className="dg-col-mock" key={leak.step + "-m"}>
              <DiagMock rotX={rotX} rotY={rotY} focusX={focusX} focusY={focusY} />
              <div className="dg-overlay-wrap">
                {active === 0 && <MockVisibility />}
                {active === 1 && <MockExperience />}
                {active === 2 && <MockInsight />}
              </div>
            </div>
            <div className="dg-panel" key={leak.step}>
              <div className="dg-panel__step">
                <span className="dg-panel__num">{leak.step}</span>
                <span className="dg-panel__tag">{leak.tag.replace("The ", "").replace(" Leak", "")}</span>
              </div>
              <h3 className="dg-panel__h">{leak.headline.replace(/\.$/, "")}<span className="dg-panel__dot">.</span></h3>
              <p className="dg-panel__sub">{leak.subhead}</p>
              <div className="dg-panel__fix">
                <p className="dg-panel__fix-p">{FIX[leak.step]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeakDetails() {
  return (
    <section className="ld" id="leak-details">
      <div className="container">
        {LEAKS.map((leak) => (
          <Reveal as="div" className="ld__row" key={leak.step}>
            <div className="ld__head">
              <span className="ld__num">{leak.step}</span>
              <div>
                <h3 className="ld__title">{leak.headline}</h3>
                <p className="ld__sub">{leak.subhead}</p>
              </div>
            </div>
            <div className="ld__cols">
              <DiagCol label="Why it happens" items={leak.why} />
              <DiagCol label="What it's costing you" items={leak.impact} accent />
            </div>
            <div className="ld__fix">
              <div className="ld__fix-h"><span className="ld__fix-hx"></span>How we fix it</div>
              <p className="ld__fix-p">{FIX[leak.step]}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PUNCH = {
  "01": { name: "Visibility", fig: "10\u00d7", cap: "more discovery your competitors pull from the same content effort \u2014 while you're cited zero times." },
  "02": { name: "Experience", fig: "$10K", cap: "your real cost per customer at 2% conversion. Theirs is $3,333 at 6% \u2014 identical traffic." },
  "03": { name: "Insight", fig: "$50K", cap: "burned every year testing the wrong things \u2014 60\u201380% of optimization fails on guesswork." },
};
// Data-forward: the key numbers pulled from each leak (one "hot" headline figure each)
const STATS = {
  "01": [
    { n: "10\u00d7", l: "discovery your rivals get", hot: true },
    { n: "0", l: "times AI search cites you" },
    { n: "10+", l: "AI surfaces \u2014 you rank on 1" },
    { n: "15\u201330%", l: "yearly rise in ad CPCs" },
  ],
  "02": [
    { n: "2%", l: "your conversion ceiling", hot: true },
    { n: "$10K", l: "your CAC \u2014 rivals pay $3,333" },
    { n: "3.2s", l: "load \u2014 \u221230% per sec after 2s" },
    { n: "90 days", l: "to close vs. visit one" },
  ],
  "03": [
    { n: "$50K/yr", l: "burned on guesswork", hot: true },
    { n: "18 mo", l: "stuck at 2% conversion" },
    { n: "6 tools", l: "zero correlation between them" },
    { n: "40\u201360%", l: "of major calls fail" },
  ],
};
const AnTick = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
);
const VS_FACE = [
  { label: "Conversion rate", you: "2%", them: "6%", youW: 33, themW: 100 },
  { label: "Cost per customer", you: "$10K", them: "$3,333", youW: 100, themW: 33 },
  { label: "AI search discovery", you: "1\u00d7", them: "10\u00d7", youW: 10, themW: 100 },
  { label: "Time to close", you: "90 days", them: "Visit 1", youW: 100, themW: 9 },
];
const VS_ROWS = [
  { dim: "Visibility", you: "Invisible across AI search \u2014 cited 0 times, ranked on a single surface. Content ROI collapses: 40 views, zero conversions.", them: "Vector-native content, cited by default across Google, ChatGPT, Perplexity, Claude and 10+ surfaces." },
  { dim: "Experience", you: "One static page for everyone \u2014 the wrong message for their intent. Cognitive rejection in milliseconds, then a 90-day drag to close.", them: "The page adapts to each visitor's intent in real time \u2014 right message, offer and CTA. Closes on visit one." },
  { dim: "Insight", you: "GA plus five disconnected tools, zero correlation. You guess at root cause and stay stuck at 2% for 18 months.", them: "Root-cause visibility \u2014 intent stage, psychographics, friction, and exactly where you're invisible." },
];

function LeakAnatomy() {
  return (
    <section className="an" id="anatomy">
      <div className="an__grain" aria-hidden="true"></div>
      <div className="container">
        <Reveal className="an__head">
          <span className="eyebrow eyebrow--signal"><span className="hx"></span>You vs. Them</span>
          <h2 className="an__h">Same market. Same traffic. <em>Opposite outcomes.</em></h2>
          <p className="an__sub">A static site and an adaptive one, fighting for the same buyer. Here's exactly where the gap opens.</p>
        </Reveal>

        <Reveal as="div" className="vs-board">
          <div className="vs-heads">
            <div className="vs-head vs-head--you">You · Static site</div>
            <div className="vs-head vs-head--mid"></div>
            <div className="vs-head vs-head--them">Them · Adaptive site</div>
          </div>
          {VS_FACE.map((f, i) => (
            <div className="vs-row" key={i}>
              <div className="vs-side vs-side--you">
                <span className="vs-val">{f.you}</span>
                <span className="vs-track"><span className="vs-fill" style={{ "--w": f.youW + "%" }}></span></span>
              </div>
              <div className="vs-label">{f.label}</div>
              <div className="vs-side vs-side--them">
                <span className="vs-track"><span className="vs-fill" style={{ "--w": f.themW + "%" }}></span></span>
                <span className="vs-val">{f.them}</span>
              </div>
            </div>
          ))}
        </Reveal>

        <div className="vs-detail">
          {VS_ROWS.map((r, i) => (
            <Reveal as="div" className="vsd" key={i}>
              <div className="vsd-you">{r.you}</div>
              <div className="vsd-them">{r.them}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { LeakTiles, Diagnosis, LeakDetails, LeakAnatomy });

/* ======================= sections-bottom.jsx ======================= */

// HoneyVectors marketing kit — bottom sections: Proof, Tech, Footer

const CLIENTS = [
  { q: "HoneyVectors rebuilt our funnel in five days. Within a month organic-attributed pipeline doubled and our CAC dropped by a third — without touching ad spend.", nm: "Mara Lindqvist", rl: "Head of Growth, Northbeam Logistics" },
  { q: "We finally get cited in ChatGPT answers when buyers research our category. That alone changed our quarter.", nm: "Devon Park", rl: "VP Marketing, Kindred Robotics" },
  { q: "Pages that reshape themselves around intent sounded like marketing fluff. Then conversion went from 1.4% to 4.1%.", nm: "Iris Okafor", rl: "CMO, Altair Industrial" },
];

function Proof({ imgs }) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % CLIENTS.length), 3200);
    return () => clearInterval(id);
  }, []);
  const c = CLIENTS[i];
  const strip = [...imgs, ...imgs];
  return (
    <section className="section section--light" id="work">
      <div className="container">
        <div className="eyebrow eyebrow--ink" style={{ marginBottom: "1.5rem" }}><span className="hx"></span>Client outcomes</div>
        <Reveal as="h2" className="story__head" style={{ marginBottom: "1rem" }}>Our work speaks for <em>itself.</em></Reveal>
        <Reveal as="p" className="proof__lead">A handful of the rebuilds below — and the revenue they quietly won back.</Reveal>
      </div>
      <div className="proof__strip">
        <div className="proof__track">
          {strip.map((s, k) => <img key={k} src={s} alt="" />)}
        </div>
      </div>
      <div className="container" style={{ marginTop: "2.5rem" }}>
        <div className="proof__band">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.32em", color: "var(--hv-signal)" }}>Testimonial</div>
            <p className="proof__q" key={i} style={{ animation: "fade-up .85s var(--ease-expressive)" }}>“{c.q}”</p>
            <div className="proof__by">
              <div className="nm">{c.nm}</div>
              <div className="rl">{c.rl}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tech({ video, poster }) {
  return (
    <section className="stack stack--video" id="products">
      {video
        ? <video className="stack__bg" src={video} poster={poster} autoPlay muted loop playsInline></video>
        : <img className="stack__bg" src={poster} alt="" />}
      <div className="stack__scrim" aria-hidden="true"></div>
      <div className="container">
        <Reveal className="stack__head">
          <span className="eyebrow eyebrow--signal"><span className="hx"></span>We built our own stack</span>
          <h2 className="stack__h">One adaptive stack. Built to seal <em>all three leaks.</em></h2>
          <p className="stack__sub">Our adaptive web platform enables — for the first time — vector-native pages that surface in Google, get cited by ChatGPT, and reshape themselves around buyer intent. One stack for visibility, experience and intelligence.</p>
          <a className="stack__cta" href="#products"><span>Explore the tech</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>
        </Reveal>
        <Reveal as="div" className="stack__hexwrap"><StackHexes /></Reveal>
      </div>
    </section>
  );
}

const SOCIAL = [
  { label: "LinkedIn", d: "M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zM8.3 18.3H5.7V9.7h2.6v8.6zM7 8.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM18.3 18.3h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2v4.3h-2.6V9.7h2.5v1.2h0a2.7 2.7 0 012.5-1.4c2.6 0 3.1 1.7 3.1 4v4.8z" },
  { label: "YouTube", d: "M21.6 7.2a2.5 2.5 0 00-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 002.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 001.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5 3-5 3z" },
  { label: "X", d: "M18.244 2H21.5l-7.49 8.56L22.5 22h-6.84l-5.36-7.02L4.06 22H.8l8.02-9.16L1.5 2h6.99l4.85 6.4L18.24 2zm-1.2 18h1.86L7.04 4H5.1l11.94 16z" },
];

function Footer() {
  return (
    <footer className="foot" id="contact">
      <div className="foot__glow"></div>
      <div className="foot__inner container container--wide">
        <div className="foot__grid">
          <div>
            <h2 className="foot__h">We&rsquo;re just<br />getting started</h2>
          </div>
          <div>
            <div className="foot__col-h">About us</div>
            <div className="foot__cols">
              <ul className="foot__list">
                {["Home", "Technology", "Research"].map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
              <ul className="foot__list">
                {["Company", "Careers", "Insights"].map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "1.5rem" }}>
            <div className="foot__social">
              {SOCIAL.map((s) => (
                <a key={s.label} href="#" aria-label={s.label}><svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d={s.d} /></svg></a>
              ))}
            </div>
            <div>
              <p style={{ fontSize: 14, color: "color-mix(in oklab,var(--hv-void) 75%,transparent)" }}>Follow along or reach out directly at</p>
              <p style={{ marginTop: "0.5rem", fontSize: 14 }}>
                <a href="mailto:press@honeyvectors.com" style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>press@honeyvectors.com</a>
                <span style={{ margin: "0 0.5rem", color: "rgba(13,13,13,0.4)" }}>|</span>
                <a href="mailto:info@honeyvectors.com" style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>info@honeyvectors.com</a>
              </p>
            </div>
          </div>
        </div>
        <div className="foot__base">
          <div>© {new Date().getFullYear()} HoneyVectors. All rights reserved.</div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <a href="#">Privacy Policy</a><a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Proof, Tech, Footer });

// ── Results / data — what the client actually gets, in numbers ──────────────
const KPIS = [
  { to: 312, prefix: "+", suffix: "%", label: "Organic traffic", sub: "Discovery across Google + AI search", w: "82%", before: "1.2k / mo", after: "4.9k / mo" },
  { to: 3.4, suffix: "×", decimals: 1, label: "Qualified leads", sub: "Intent-matched, sales-ready", w: "74%", before: "18 / mo", after: "61 / mo" },
  { to: 41, prefix: "−", suffix: "%", label: "Cost per acquisition", sub: "Same spend, more conversions", w: "58%", before: "$210", after: "$124" },
  { to: 1.4, prefix: "$", suffix: "M", decimals: 1, label: "Attributed pipeline", sub: "New revenue sourced in 6 months", w: "70%", before: "$0.4M", after: "$1.8M" },
];

const MILESTONES = [
  { day: "Day 0", hex: "ms__hex", n: "A", t: "Audit delivered", d: "Every leak mapped to a dollar figure — visibility, experience, insight." },
  { day: "Day 30", hex: "ms__hex ms__hex--amber", n: "B", t: "Adaptive rebuild live", d: "Vector-native pages shipped, indexed in Google and cited by AI search." },
  { day: "Day 90", hex: "ms__hex ms__hex--dark", n: "C", t: "Compounding", d: "Traffic, leads and citations stack month over month — CAC keeps falling." },
];

function GrowthCurve() {
  // Rising revenue curve over 90 days (viewBox 0 0 420 220).
  const line = "M20,196 C90,188 120,150 170,140 C230,128 250,92 300,72 C350,52 372,30 400,18";
  const area = line + " L400,200 L20,200 Z";
  return (
    <svg className="curve__svg" viewBox="0 0 420 220" fill="none" aria-label="Revenue growth over 90 days">
      <defs>
        <linearGradient id="cv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8611A" stopOpacity="0.35" />
          <stop offset="1" stopColor="#E8611A" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[40, 86, 132, 178].map((y) => <line key={y} x1="20" y1={y} x2="400" y2={y} stroke="rgba(255,255,255,0.06)" />)}
      <path d={area} fill="url(#cv)" />
      <path d={line} stroke="#E8611A" strokeWidth="3" strokeLinecap="round" />
      {[[20, 196], [170, 140], [300, 72], [400, 18]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x},${y})`}>
          <polygon points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5" fill={i === 3 ? "#FFD166" : "#E8611A"} stroke="#0D0D0D" strokeWidth="1.5" />
        </g>
      ))}
      <text x="20" y="216" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="var(--font-mono)">Day 0</text>
      <text x="372" y="216" fill="rgba(255,255,255,0.4)" fontSize="11" fontFamily="var(--font-mono)">Day 90</text>
    </svg>
  );
}

function Results() {
  return (
    <section className="results" id="results">
      <div className="container">
        <div className="results__head">
          <div className="eyebrow eyebrow--signal"><span className="hx"></span>What you actually get</div>
          <h2 className="results__h">Less process talk. <em>More revenue.</em></h2>
          <p className="results__sub">Here's what fixing the three leaks does to the numbers that matter — measured against the client's own baseline, in their first two quarters.</p>
        </div>

        <Reveal className="kpi-grid">
          {KPIS.map((k, i) => (
            <div className="kpi" key={i}>
              <div className="kpi__big">
                <CountUp to={k.to} prefix={k.prefix || ""} suffix="" decimals={k.decimals || 0} /><span className="u">{k.suffix}</span>
              </div>
              <div className="kpi__label">{k.label}</div>
              <div className="kpi__sub">{k.sub}</div>
              <div className="kpi__bar"><div className="kpi__fill" style={{ "--w": k.w }}></div></div>
              <div className="kpi__ba"><span>Before {k.before}</span><span><b>After {k.after}</b></span></div>
            </div>
          ))}
        </Reveal>

        <div className="curve">
          <GrowthCurve />
          <div className="curve__milestones">
            {MILESTONES.map((m, i) => (
              <div className="ms" key={i}>
                <span className={m.hex}>{m.n}</span>
                <div>
                  <div className="ms__day">{m.day}</div>
                  <div className="ms__t">{m.t}</div>
                  <div className="ms__d">{m.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="fcta" id="audit">
      <div className="fcta__ghost" aria-hidden="true">STOP IT</div>
      <div className="fcta__inner container">
        <span className="fcta__eye">Unlocking growth in the AI era</span>
        <h2 className="fcta__h">Stop the leak.<br />Now.</h2>
        <div style={{ marginTop: "2.2rem" }}>
          <CTA variant="ink" size="lg" href="#audit">Find My Leaks</CTA>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Results, FinalCTA });
