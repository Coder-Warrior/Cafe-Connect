import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// Save the logo you sent as src/assets/cafe-connect-logo.jpg (or change this path).
// The crop regions below assume a 1024x1024 image like the one you uploaded.
import logo from "../imgs/cafe_connect.jpg";

// Demo data. Replace with your API / geolocation results.
const SAMPLE_CAFES = [
  { id: 1, name: "Bernabeu", distance: 120, speed: 48, signal: 4 },
  { id: 2, name: "Al Abd", distance: 260, speed: 31, signal: 3 },
];

// Demo numbers for the "in numbers" section. Replace with real data before launch.
const STATS = [
  { icon: "users", value: 52400, suffix: "+", label: "Active users", trend: "+12% this month" },
  { icon: "cafe", value: 1250, suffix: "+", label: "Partner cafés", trend: "+38 new this month" },
  { icon: "bolt", value: 2.4, decimals: 1, suffix: "M", label: "Connections made", trend: "+18% this quarter" },
  { icon: "pin", value: 14, label: "Cities covered", trend: "3 launching soon" },
];
const TEAM = [
  { name: "Engineering", n: 16 },
  { name: "Customer support", n: 9 },
  { name: "Café partnerships", n: 8 },
  { name: "Design & product", n: 5 },
];
const TEAM_TOTAL = TEAM.reduce((sum, t) => sum + t.n, 0);
const TEAM_MAX = Math.max(...TEAM.map((t) => t.n));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHLY = [110, 128, 150, 140, 172, 195, 212, 205, 240, 258, 280, 310]; // thousands of connections
const MONTHLY_MAX = Math.max(...MONTHLY);

// Crop regions of the logo image (in px of the 1024x1024 source)
const MARK = { x: 330, y: 250, w: 390, h: 390 }; // cup + connect symbol
const LOCKUP = { x: 200, y: 290, w: 630, h: 410 }; // symbol + "Café Connect" text

const css = `
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap");

.cc-page {
  --bg: #f5f3ff; --card: rgba(255,255,255,.7); --stroke: rgba(99,80,180,.2);
  --text: #1d1a3a; --muted: #6a6693;
  --g1: #7c3aed; --g2: #ec4899; --g3: #22d3ee;
  --ok: #059669; --err: #e11d48;
  position: relative; isolation: isolate; overflow: hidden; min-height: 100vh;
  background: var(--bg); color: var(--text);
  font-family: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;
}
.cc-page *, .cc-page *::before, .cc-page *::after { box-sizing: border-box; }
.cc-page h1, .cc-page h2, .cc-page h3, .cc-page p { margin: 0; }
.cc-defs { position: absolute; width: 0; height: 0; }

.cc-aurora { position: absolute; inset: 0; z-index: -1; overflow: hidden; }
.cc-blob { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .4; animation: cc-float 16s ease-in-out infinite; }
.cc-b1 { width: 480px; height: 480px; background: var(--g1); top: -120px; left: -120px; }
.cc-b2 { width: 420px; height: 420px; background: var(--g2); bottom: -140px; right: -100px; animation-delay: -5s; }
.cc-b3 { width: 340px; height: 340px; background: var(--g3); top: 40%; left: 55%; opacity: .3; animation-delay: -9s; }
@keyframes cc-float {
  0%, 100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(60px,-40px) scale(1.12); }
  66% { transform: translate(-50px,50px) scale(.94); }
}
@keyframes cc-shine { to { background-position: 250% 0; } }
@keyframes cc-pop { from { opacity: 0; transform: scale(.9) translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes cc-bob { 50% { transform: translateY(-8px); } }

.cc-wrap { width: min(1040px, 100%); margin: 0 auto; padding: 0 20px; }

/* logo crops */
.cc-mark { border-radius: 50%; background-color: #fcfefe; background-repeat: no-repeat; flex: none; }
.cc-lockup { width: min(240px, 60vw); border-radius: 12px; background-color: #fcfefe; background-repeat: no-repeat; }

/* nav */
.cc-nav { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 22px 0; }
.cc-brand { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1.1rem; letter-spacing: -.01em; }
.cc-brand .cc-mark { width: 46px; border: 1px solid var(--stroke); box-shadow: 0 6px 18px rgba(99,80,180,.18); }
.cc-navlink { color: var(--muted); font-size: .88rem; text-decoration: none; padding: 8px 14px; border-radius: 99px; border: 1px solid var(--stroke); background: rgba(255,255,255,.6); transition: color .2s, border-color .2s; }
.cc-navlink:hover { color: var(--g1); border-color: var(--g1); }

/* hero */
.cc-hero { display: grid; grid-template-columns: 1.1fr .9fr; gap: 32px; align-items: center; padding: 36px 0 56px; }
.cc-title {
  font-size: clamp(2.2rem, 5.5vw, 3.6rem); font-weight: 700; letter-spacing: -.03em; line-height: 1.08;
  background: linear-gradient(110deg, #0891b2, var(--g1) 45%, var(--g2), #0891b2);
  background-size: 250% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: cc-shine 6s linear infinite;
}
.cc-lead { color: var(--muted); font-size: 1.02rem; line-height: 1.65; margin: 18px 0 28px !important; max-width: 46ch; }
.cc-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 18px; }
.cc-btn {
  padding: 15px 28px; border: 0; border-radius: 14px; cursor: pointer;
  font: inherit; font-weight: 600; font-size: 1rem; color: #fff;
  background: linear-gradient(110deg, var(--g1), var(--g2), var(--g3), var(--g1)); background-size: 300% 100%;
  animation: cc-shine 5s linear infinite; box-shadow: 0 10px 30px rgba(124,58,237,.4);
  transition: transform .2s, box-shadow .2s, opacity .2s;
}
.cc-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(236,72,153,.4); }
.cc-btn:active:not(:disabled) { transform: scale(.98); }
.cc-btn:disabled { opacity: .65; cursor: wait; }
.cc-btn:focus-visible, .cc-small:focus-visible, .cc-textlink:focus-visible, .cc-navlink:focus-visible { outline: 3px solid var(--g1); outline-offset: 3px; }
.cc-textlink { color: var(--g1); font-weight: 600; font-size: .92rem; text-decoration: none; }
.cc-textlink:hover { text-decoration: underline; }

.cc-mini { display: flex; flex-wrap: wrap; gap: 14px 30px; margin-top: 30px; padding-top: 22px; border-top: 1px solid var(--stroke); }
.cc-mini div { display: grid; gap: 2px; }
.cc-mini b { font-size: 1.25rem; font-weight: 700; letter-spacing: -.01em; }
.cc-mini span { color: var(--muted); font-size: .78rem; }

/* radar */
.cc-radar { position: relative; width: min(340px, 80vw); aspect-ratio: 1; margin: 0 auto; display: grid; place-items: center; }
.cc-ring { position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--g1); opacity: 0; animation: cc-ping 3.6s cubic-bezier(.2,.6,.3,1) infinite; }
.cc-ring:nth-child(2) { animation-delay: 1.2s; border-color: var(--g2); }
.cc-ring:nth-child(3) { animation-delay: 2.4s; border-color: var(--g3); }
.cc-radar.scanning .cc-ring { animation-duration: 1.6s; }
.cc-radar.scanning .cc-ring:nth-child(2) { animation-delay: .5s; }
.cc-radar.scanning .cc-ring:nth-child(3) { animation-delay: 1s; }
@keyframes cc-ping { 0% { transform: scale(.3); opacity: .8; } 100% { transform: scale(1); opacity: 0; } }
.cc-sweep { position: absolute; inset: 6%; border-radius: 50%; opacity: 0; transition: opacity .4s;
  background: conic-gradient(from 0deg, transparent 70%, rgba(124,58,237,.35) 100%); }
.cc-radar.scanning .cc-sweep { opacity: 1; animation: cc-spin 1.4s linear infinite; }
@keyframes cc-spin { to { transform: rotate(360deg); } }
.cc-core { position: relative; width: 136px; height: 136px; border-radius: 50%; display: grid; place-items: center;
  background: var(--card); border: 1px solid var(--stroke); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px rgba(99,80,180,.25), inset 0 1px 0 rgba(255,255,255,.9);
  animation: cc-bob 4s ease-in-out infinite; }
.cc-core .cc-mark { width: 104px; }

/* sections */
.cc-section { padding: 8px 0 56px; }
.cc-h2 { font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; }
.cc-head { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 14px; margin-bottom: 20px; }
.cc-count { color: var(--muted); font-size: .88rem; margin-top: 4px !important; }
.cc-search { padding: 12px 16px; border-radius: 14px; width: min(260px, 100%); font: inherit; font-size: .92rem; color: var(--text);
  background: rgba(255,255,255,.85); border: 1px solid var(--stroke); outline: none; transition: border-color .25s, box-shadow .25s; }
.cc-search:focus { border-color: var(--g1); box-shadow: 0 0 0 4px rgba(124,58,237,.18); }

.cc-list { display: grid; gap: 12px; }
.cc-cafe {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 18px;
  padding: 18px 22px; border-radius: 20px; background: var(--card); border: 1px solid var(--stroke);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12px 40px rgba(99,80,180,.12), inset 0 1px 0 rgba(255,255,255,.9);
  animation: cc-pop .45s cubic-bezier(.2,1.2,.4,1) both; transition: border-color .25s, transform .25s;
}
.cc-cafe:hover { transform: translateY(-2px); border-color: var(--g3); }
.cc-cafe.on { border-color: var(--ok); box-shadow: 0 12px 40px rgba(5,150,105,.18), inset 0 1px 0 rgba(255,255,255,.9); }
.cc-bars { display: flex; align-items: flex-end; gap: 3px; height: 26px; }
.cc-bars i { width: 6px; border-radius: 3px; background: rgba(99,80,180,.2); }
.cc-bars i:nth-child(1) { height: 7px; } .cc-bars i:nth-child(2) { height: 12px; }
.cc-bars i:nth-child(3) { height: 18px; } .cc-bars i:nth-child(4) { height: 26px; }
.cc-bars i.lit { background: linear-gradient(180deg, var(--g1), var(--g2)); }
.cc-name { font-weight: 600; font-size: 1.02rem; }
.cc-meta { color: var(--muted); font-size: .82rem; margin-top: 3px !important; }
.cc-small {
  display: inline-block; text-align: center; text-decoration: none;
  padding: 10px 20px; border-radius: 12px; cursor: pointer; font: inherit; font-weight: 600; font-size: .88rem;
  color: var(--g1); background: rgba(255,255,255,.85); border: 1px solid var(--g1);
  transition: background .2s, color .2s, transform .2s; min-width: 108px;
}
.cc-small:hover:not(:disabled) { background: var(--g1); color: #fff; transform: translateY(-1px); }
.cc-small:disabled { opacity: .6; cursor: wait; }
.cc-small.connected { color: var(--ok); border-color: var(--ok); }
.cc-small.connected:hover { background: var(--ok); color: #fff; }
.cc-empty { text-align: center; color: var(--muted); padding: 32px 0; font-size: .95rem; }

/* steps */
.cc-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.cc-step { padding: 22px; border-radius: 20px; background: var(--card); border: 1px solid var(--stroke);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); }
.cc-num { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-weight: 700; font-size: .9rem; color: #fff;
  background: linear-gradient(135deg, var(--g1), var(--g2)); margin-bottom: 14px; }
.cc-step h3 { font-size: 1.02rem; font-weight: 600; }
.cc-step p { color: var(--muted); font-size: .88rem; line-height: 1.55; margin-top: 6px !important; }

/* reveal on scroll */
.cc-reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s cubic-bezier(.2,.8,.2,1); }
.cc-reveal.in { opacity: 1; transform: none; }

/* stats */
.cc-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.cc-stat, .cc-panel {
  height: 100%; padding: 22px; border-radius: 20px; background: var(--card); border: 1px solid var(--stroke);
  backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 12px 40px rgba(99,80,180,.12), inset 0 1px 0 rgba(255,255,255,.9);
  transition: border-color .25s, box-shadow .25s;
}
.cc-stat:hover, .cc-panel:hover { border-color: var(--g3); box-shadow: 0 18px 50px rgba(99,80,180,.2), inset 0 1px 0 rgba(255,255,255,.9); }
.cc-ico { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(124,58,237,.12), rgba(236,72,153,.12)); }
.cc-ico svg { width: 24px; height: 24px; fill: none; stroke: url(#cc-ico-g); stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.cc-val, .cc-big b {
  font-size: clamp(1.7rem, 4.2vw, 2.3rem); font-weight: 700; letter-spacing: -.02em; line-height: 1.1; font-variant-numeric: tabular-nums;
  background: linear-gradient(110deg, var(--g1), var(--g2)); -webkit-background-clip: text; background-clip: text; color: transparent;
}
.cc-lab { color: var(--muted); font-size: .88rem; margin-top: 6px !important; }
.cc-trend { display: inline-block; margin-top: 12px; padding: 4px 10px; border-radius: 99px; font-size: .74rem; font-weight: 600;
  color: var(--ok); background: rgba(5,150,105,.1); }

.cc-duo { display: grid; grid-template-columns: 1fr 1.25fr; gap: 14px; margin-top: 14px; }
.cc-eyebrow { color: var(--g1); font-size: .78rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; }
.cc-panel { padding: 24px; }
.cc-big { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px; margin: 10px 0 22px; }
.cc-big span { color: var(--muted); font-size: .88rem; }
.cc-team { display: grid; gap: 16px; }
.cc-rowtop { display: flex; justify-content: space-between; font-size: .88rem; margin-bottom: 7px; }
.cc-rowtop span { color: var(--muted); }
.cc-rowtop b { font-weight: 600; }
.cc-track { height: 8px; border-radius: 99px; background: rgba(99,80,180,.14); overflow: hidden; }
.cc-fill { height: 100%; width: 0; border-radius: 99px; background: linear-gradient(90deg, var(--g3), var(--g1), var(--g2));
  transition: width 1.2s cubic-bezier(.2,.8,.2,1); }
.in .cc-fill { width: var(--w); }

.cc-chart-title { font-size: 1.05rem; font-weight: 600; margin-top: 8px !important; }
.cc-chart-sub { color: var(--muted); font-size: .84rem; margin-top: 4px !important; }
.cc-chart { display: flex; align-items: stretch; gap: 6px; height: 190px; margin-top: 22px; }
.cc-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.cc-barwrap { flex: 1; width: 100%; display: flex; align-items: flex-end; }
.cc-col i { display: block; width: 100%; height: 0; border-radius: 8px 8px 4px 4px; background: linear-gradient(180deg, var(--g1), var(--g2));
  transition: height 1s cubic-bezier(.2,.8,.2,1), filter .2s; }
.in .cc-col i { height: var(--h); }
.cc-col.peak i { background: linear-gradient(180deg, var(--g3), var(--g1)); }
.cc-col:hover i { filter: brightness(1.12); }
.cc-col span { font-size: .62rem; color: var(--muted); letter-spacing: -.02em; }

/* footer */
.cc-footer { display: grid; justify-items: center; gap: 14px; padding: 24px 0 44px; text-align: center; color: var(--muted); font-size: .85rem; }
.cc-badge { padding: 14px 18px; border-radius: 22px; background: #fcfefe; border: 1px solid var(--stroke); box-shadow: 0 16px 40px rgba(99,80,180,.15); }

/* toast */
.cc-toast {
  position: fixed; left: 50%; bottom: 36px; z-index: 10; transform: translate(-50%, 140%); opacity: 0;
  display: flex; align-items: center; gap: 12px; padding: 14px 22px; border-radius: 16px;
  font-weight: 600; font-size: .95rem; max-width: calc(100% - 32px);
  background: rgba(236,253,245,.97); border: 1px solid var(--ok); color: #047857; box-shadow: 0 16px 50px rgba(5,150,105,.25);
  transition: transform .45s cubic-bezier(.2,1.2,.4,1), opacity .3s; pointer-events: none;
}
.cc-toast.show { transform: translate(-50%, 0); opacity: 1; }
.cc-dot { width: 10px; height: 10px; border-radius: 50%; background: currentColor; flex: none; animation: cc-pulse 1.2s infinite; }
@keyframes cc-pulse { 0% { box-shadow: 0 0 0 0 currentColor; } 100% { box-shadow: 0 0 0 12px transparent; } }

@media (max-width: 800px) {
  .cc-hero { grid-template-columns: 1fr; padding-top: 12px; }
  .cc-radar { order: -1; width: min(240px, 70vw); }
  .cc-steps { grid-template-columns: 1fr; }
  .cc-stats { grid-template-columns: repeat(2, 1fr); }
  .cc-duo { grid-template-columns: 1fr; }
  .cc-cafe { grid-template-columns: auto 1fr; }
  .cc-cafe .cc-small { grid-column: 1 / -1; }
}
@media (max-width: 480px) {
  .cc-nav { flex-wrap: wrap; }
  .cc-navlink { font-size: .8rem; }
  .cc-stat, .cc-panel { padding: 18px; }
  .cc-chart { height: 160px; gap: 4px; }
  .cc-mini { gap: 14px 22px; }
}
@media (prefers-reduced-motion: reduce) {
  .cc-page *, .cc-page *::before, .cc-page *::after { animation: none !important; transition: none !important; }
}
`;

/* ---------- small helpers ---------- */

// Shows a part of the logo image, sized by CSS (width comes from the class)
function LogoCrop({ region, className, label }) {
  const { x, y, w, h } = region;
  return (
    <div
      role="img"
      aria-label={label}
      className={className}
      style={{
        aspectRatio: `${w} / ${h}`,
        backgroundImage: `url(${logo})`,
        backgroundSize: `${(1024 / w) * 100}% auto`,
        backgroundPosition: `${(x / (1024 - w)) * 100}% ${(y / (1024 - h)) * 100}%`,
      }}
    />
  );
}

const ICONS = {
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M16.5 14.2A5 5 0 0 1 21 19" />
    </>
  ),
  cafe: (
    <>
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2" />
      <path d="M8 3v2M12 3v2" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

// true once the element has scrolled into view (runs once)
function useInView() {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, seen];
}

function CountUp({ to, decimals = 0, suffix = "", start }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVal(to);
      return;
    }
    let raf;
    const t0 = performance.now();
    const duration = 1800;
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, to]);
  return (
    <>
      {val.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </>
  );
}

/* ---------- stats section ---------- */

function Stats() {
  const [ref, seen] = useInView();
  const cls = seen ? "in" : "";

  return (
    <section className="cc-section" ref={ref} aria-labelledby="cc-stats-title">
      <div className="cc-head">
        <div>
          <h2 className="cc-h2" id="cc-stats-title">Cafe Connect in numbers</h2>
          <p className="cc-count">Trusted by people who work, study, and meet in cafés every day.</p>
        </div>
      </div>

      <div className="cc-stats">
        {STATS.map((s, i) => (
          <div key={s.label} className={`cc-reveal ${cls}`} style={{ transitionDelay: `${i * 90}ms` }}>
            <div className="cc-stat">
              <div className="cc-ico"><Icon name={s.icon} /></div>
              <div className="cc-val">
                <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} start={seen} />
              </div>
              <p className="cc-lab">{s.label}</p>
              <span className="cc-trend">{s.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="cc-duo">
        <div className={`cc-reveal ${cls}`} style={{ transitionDelay: "150ms" }}>
          <div className="cc-panel">
            <p className="cc-eyebrow">Our team</p>
            <div className="cc-big">
              <b><CountUp to={TEAM_TOTAL} start={seen} /></b>
              <span>people behind Cafe Connect</span>
            </div>
            <div className="cc-team">
              {TEAM.map((t, i) => (
                <div key={t.name}>
                  <div className="cc-rowtop">
                    <span>{t.name}</span>
                    <b>{t.n}</b>
                  </div>
                  <div className="cc-track">
                    <div
                      className="cc-fill"
                      style={{ "--w": `${(t.n / TEAM_MAX) * 100}%`, transitionDelay: `${350 + i * 130}ms` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`cc-reveal ${cls}`} style={{ transitionDelay: "260ms" }}>
          <div className="cc-panel">
            <p className="cc-eyebrow">Growth</p>
            <h3 className="cc-chart-title">Connections per month</h3>
            <p className="cc-chart-sub">2.4M connections in the last 12 months, peaking at 310K in December.</p>
            <div
              className="cc-chart"
              role="img"
              aria-label="Bar chart of monthly connections, growing from 110 thousand in January to 310 thousand in December"
            >
              {MONTHLY.map((v, i) => (
                <div key={MONTHS[i]} className={`cc-col ${v === MONTHLY_MAX ? "peak" : ""}`} title={`${MONTHS[i]}: ${v}K`}>
                  <div className="cc-barwrap">
                    <i style={{ "--h": `${(v / MONTHLY_MAX) * 100}%`, transitionDelay: `${300 + i * 70}ms` }} />
                  </div>
                  <span>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export default function MainPage({ uploadHref = "/internet-connection" }) {
  const [scanning, setScanning] = useState(false);
  const [cafes, setCafes] = useState(null);
  const [query, setQuery] = useState("");
  const [connectingId, setConnectingId] = useState(null);
  const [connectedId, setConnectedId] = useState(null);
  const [toast, setToast] = useState({ show: false, text: "" });

  const timers = useRef([]);
  const toastTimer = useRef(null);
  const resultsRef = useRef(null);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      clearTimeout(toastTimer.current);
    },
    []
  );

  // toast visible for exactly 3 seconds
  function showToast(text) {
    clearTimeout(toastTimer.current);
    setToast({ show: true, text });
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 3000);
  }

  function scan() {
    if (scanning) return;
    setScanning(true);
    setCafes(null);
    setQuery("");
    setConnectedId(null);
    timers.current.push(
      setTimeout(() => {
        setCafes([...SAMPLE_CAFES].sort((a, b) => a.distance - b.distance));
        setScanning(false);
        setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
      }, 2400)
    );
  }

  const visible = (cafes || []).filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="cc-page">
      <style>{css}</style>

      {/* shared gradient for the stat icons */}
      <svg className="cc-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="cc-ico-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>

      <div className="cc-aurora" aria-hidden="true">
        <div className="cc-blob cc-b1" />
        <div className="cc-blob cc-b2" />
        <div className="cc-blob cc-b3" />
      </div>

      <div className="cc-wrap">
        <header className="cc-nav">
          <div className="cc-brand">
            <LogoCrop region={MARK} className="cc-mark" label="Cafe Connect logo" />
            Cafe Connect
          </div>
          <a className="cc-navlink" href={uploadHref}>Connect via QR Code</a>
        </header>

        <section className="cc-hero">
          <div>
            <h1 className="cc-title">Find a café.<br />Get online.</h1>
            <p className="cc-lead">
              Cafe Connect finds the internet in the cafés around you and connects you in one tap.
              No hunting for passwords, no guessing which place has a good signal.
            </p>
            <div className="cc-actions">
              <button className="cc-btn" onClick={scan} disabled={scanning}>
                {scanning ? "Scanning..." : cafes ? "Scan again" : "Find cafés near me"}
              </button>
              <a className="cc-textlink" href={uploadHref}>Have a code? Upload your QR Code</a>
            </div>
            <div className="cc-mini">
              <div><b>52K+</b><span>Active users</span></div>
              <div><b>1,250+</b><span>Partner cafés</span></div>
              <div><b>4.8 / 5</b><span>Average rating</span></div>
            </div>
          </div>

          <div className={`cc-radar ${scanning ? "scanning" : ""}`} aria-hidden="true">
            <span className="cc-ring" />
            <span className="cc-ring" />
            <span className="cc-ring" />
            <span className="cc-sweep" />
            <div className="cc-core">
              <LogoCrop region={MARK} className="cc-mark" label="Cafe Connect logo" />
            </div>
          </div>
        </section>

        {cafes && (
          <section className="cc-section" ref={resultsRef} aria-live="polite">
            <div className="cc-head">
              <div>
                <h2 className="cc-h2">Cafés near you</h2>
                <p className="cc-count">
                  {visible.length} of {cafes.length} with internet
                </p>
              </div>
              <input
                className="cc-search"
                type="text"
                placeholder="Search by name"
                aria-label="Search cafés by name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {visible.length === 0 ? (
              <p className="cc-empty">No café matches “{query}”. Try a different name.</p>
            ) : (
              <div className="cc-list">
                {visible.map((c, i) => {
                  const connected = connectedId === c.id;
                  const connecting = connectingId === c.id;
                  return (
                    <article
                      key={c.id}
                      className={`cc-cafe ${connected ? "on" : ""}`}
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <div className="cc-bars" role="img" aria-label={`Signal ${c.signal} of 4`}>
                        {[1, 2, 3, 4].map((n) => (
                          <i key={n} className={n <= c.signal ? "lit" : ""} />
                        ))}
                      </div>
                      <div>
                        <h3 className="cc-name">{c.name}</h3>
                        <p className="cc-meta">
                          {c.distance} m away · about {c.speed} Mbps
                        </p>
                      </div>
                      {connected ? (
                        <button className="cc-small connected" onClick={() => setConnectedId(null)}>
                          Connected
                        </button>
                      ) : (
                        <Link
                          className="cc-small"
                          to="/internet-connection"
                        >
                          {connecting ? "Connecting..." : "Connect"}
                        </Link>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <section className="cc-section">
          <div className="cc-head">
            <h2 className="cc-h2">How it works</h2>
          </div>
          <div className="cc-steps">
            <div className="cc-step">
              <div className="cc-num">1</div>
              <h3>Scan your area</h3>
              <p>Tap the button and we look for cafés around you that offer internet.</p>
            </div>
            <div className="cc-step">
              <div className="cc-num">2</div>
              <h3>Pick the best one</h3>
              <p>Compare distance, signal strength, and speed, and choose where to sit.</p>
            </div>
            <div className="cc-step">
              <div className="cc-num">3</div>
              <h3>Connect in one tap</h3>
              <p>Press Connect and you are online. Press Connected to disconnect.</p>
            </div>
          </div>
        </section>

        <Stats />

        <footer className="cc-footer">
          <div className="cc-badge">
            <LogoCrop region={LOCKUP} className="cc-lockup" label="Café Connect" />
          </div>
          <p>Find a café. Get online.</p>
          <Link className="cc-textlink" to={uploadHref}>Connect via QR Code</Link>
          <p>© 2026 Cafe Connect. All rights reserved.</p>
        </footer>
      </div>

      <div className={`cc-toast ${toast.show ? "show" : ""}`} role="status" aria-live="polite">
        <span className="cc-dot" />
        <span>{toast.text}</span>
      </div>
    </div>
  );
}