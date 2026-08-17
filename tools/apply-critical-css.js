const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");
const VER = "18";

/* Mobile ATF only — must match final mobile layout (hero-visual hidden). */
const critical = [
  "html{scrollbar-gutter:stable;scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:84px}",
  ':root{--rose:#ff5c8a;--rose-soft:#ff8fb3;--rose-deep:#e63e73;--purple:#7c5cff;--ink:#22143a;--muted:#5b5470;--cream:#fff9f5;--paper:#fff;--line:#f0e4ec;--shadow-sm:0 2px 8px rgba(34,20,58,.06);--radius:18px;--radius-pill:999px;--container:1160px;--gutter:clamp(16px,4vw,40px);--font:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
  "*,*::before,*::after{box-sizing:border-box}",
  "body{margin:0;font-family:var(--font);font-weight:400;font-size:clamp(1rem,.96rem + .2vw,1.08rem);line-height:1.65;color:var(--ink);background:var(--cream);overflow-x:hidden;-webkit-font-smoothing:antialiased}",
  "img,svg{max-width:100%;height:auto;display:block}",
  "a{color:inherit;text-decoration:none}",
  "h1{font-size:clamp(2.1rem,1.5rem + 3.2vw,4rem);font-weight:700;line-height:1.15;margin:0 0 .5em;letter-spacing:-.01em}",
  "p{margin:0 0 1em}",
  ".skip-link{position:absolute;left:50%;transform:translateX(-50%) translateY(-140%);top:8px;z-index:200;background:var(--ink);color:#fff;padding:10px 18px;border-radius:var(--radius-pill)}",
  ".container{width:100%;max-width:var(--container);margin-inline:auto;padding-inline:var(--gutter)}",
  "section{padding-block:clamp(56px,8vw,110px);position:relative}",
  ".site-header{position:sticky;top:0;z-index:100;background:rgba(255,249,245,.94);border-bottom:1px solid var(--line);contain:layout}",
  ".nav{display:flex;align-items:center;justify-content:space-between;gap:16px;height:68px}",
  ".brand{display:flex;align-items:center;gap:10px;font-weight:700;font-size:1.25rem;color:var(--ink)}",
  ".brand svg{width:36px;height:36px;flex:none}",
  ".brand span b{color:var(--rose-deep)}",
  ".nav-links,.nav-cta-desktop{display:none}",
  ".nav-actions{display:flex;align-items:center;gap:10px}",
  ".nav-actions .btn{padding:11px 20px;min-height:44px;font-size:.98rem}",
  ".nav-toggle{display:inline-flex;flex-direction:column;justify-content:center;gap:5px;width:46px;height:46px;padding:0;border:2px solid var(--line);background:#fff;border-radius:14px;cursor:pointer}",
  ".nav-toggle span{display:block;width:22px;height:2.5px;margin-inline:auto;background:var(--ink);border-radius:2px}",
  ".mobile-menu{display:grid;grid-template-rows:0fr;background:var(--cream);border-bottom:1px solid var(--line);position:sticky;top:68px;z-index:99}",
  ".mobile-menu>div{overflow:hidden}",
  ".eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:.8rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a3164f;background:#ffe6ee;padding:7px 14px;border-radius:var(--radius-pill);margin-bottom:16px}",
  ".lead{font-size:1.12em;color:var(--muted)}",
  ".play-launch{display:inline-flex;align-items:center;gap:14px;margin:18px 0 8px;padding:12px 18px;text-decoration:none;color:#fff;background:linear-gradient(135deg,var(--rose),var(--purple));border-radius:var(--radius-pill);box-shadow:0 10px 30px rgba(34,20,58,.1)}",
  ".play-launch__icon{display:grid;place-items:center;width:40px;height:40px;flex:none;background:rgba(255,255,255,.22);border-radius:50%}",
  ".play-launch__text{display:flex;flex-direction:column;line-height:1.2}",
  ".play-launch__text strong{font-size:1.05rem}",
  ".play-launch__text small{font-size:.8rem;opacity:.9}",
  ".play-launch__ext{margin-left:4px;font-size:1.1rem;opacity:.9}",
  ".btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;font-size:1.02rem;font-weight:600;line-height:1;padding:15px 28px;min-height:52px;border:none;border-radius:var(--radius-pill);background:var(--rose);color:#fff;cursor:pointer;box-shadow:0 8px 20px rgba(255,92,138,.35);text-align:center}",
  ".btn--lg{font-size:1.12rem;padding:18px 36px;min-height:60px}",
  ".btn--primary{background:linear-gradient(135deg,var(--rose-soft),var(--rose))}",
  ".btn--secondary{background:#fff;color:var(--ink);box-shadow:var(--shadow-sm);border:2px solid var(--line)}",
  ".hero{position:relative;padding-top:clamp(40px,6vw,72px);padding-bottom:clamp(40px,6vw,72px);background:radial-gradient(1000px 480px at 82% -8%,#ffe3ef 0%,rgba(255,227,239,0) 60%),radial-gradient(900px 500px at 6% 8%,#e7efff 0%,rgba(231,239,255,0) 55%),var(--cream);overflow:hidden}",
  ".hero-grid{display:grid;gap:clamp(32px,5vw,56px);align-items:center}",
  ".hero-copy .eyebrow{margin-bottom:18px}",
  ".hero h1{margin-bottom:18px}",
  ".hero h1 .grad{color:var(--rose-deep)}",
  ".hero-copy .lead{max-width:560px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}",
  ".hero-cta{display:flex;flex-wrap:wrap;gap:14px;margin-top:26px}",
  ".hero-stats{display:none}",
  ".reveal{opacity:1;transform:none}",
  "@media (max-width:700px){.hero{min-height:calc(100vh - 68px);padding-bottom:48px}.hero-visual,.floaty{display:none!important}.hero-copy .lead{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}main>section:not(.hero),main>.strip{content-visibility:auto;contain-intrinsic-size:auto 800px}}"
].join("");

const block =
  "  <!-- Mobile: critical CSS + async sheet. Desktop: blocking sheet (CLS). -->\n" +
  '  <link rel="preload" href="assets/fonts/fredoka-latin.woff2" as="font" type="font/woff2" crossorigin media="(min-width: 701px)" />\n' +
  '  <link rel="stylesheet" href="styles.min.css?v=' + VER + '" media="(min-width: 701px)" />\n' +
  "  <style>" + critical + "</style>\n" +
  '  <link rel="stylesheet" href="styles.min.css?v=' + VER + '" media="print" id="mobilecss">\n' +
  "  <script>(function(){function m(){var l=document.getElementById('mobilecss');if(l&&window.matchMedia('(max-width:700px)').matches)l.media='all';}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',m);else m();})();</script>\n" +
  '  <noscript><link rel="stylesheet" href="styles.min.css?v=' + VER + '"></noscript>\n';

const markers = [
  "<!-- Mobile: critical CSS",
  "<!-- Critical CSS",
  "<!-- Critical ATF",
  "<!-- Inlined CSS:",
  "<!-- Minified blocking",
  "<!-- Critical CSS + deferred"
];
let start = -1;
for (const m of markers) {
  const i = html.indexOf(m);
  if (i >= 0) {
    start = i;
    break;
  }
}
const end = html.indexOf("</head>");
if (start < 0 || end < 0) throw new Error("cannot find head CSS block");
html = html.slice(0, start) + block + html.slice(end);
html = html.replace(/app\.js\?v=\d+/g, "app.js?v=" + VER);
html = html.replace(/styles\.min\.css\?v=\d+/g, "styles.min.css?v=" + VER);
fs.writeFileSync(htmlPath, html);
console.log("critical", critical.length, "html", html.length, "v=" + VER);
