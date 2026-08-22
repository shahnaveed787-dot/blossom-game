const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "blossom-word-finder.html");
const VER = "24";
let html = fs.readFileSync(htmlPath, "utf8");
html = html.replace(/\r\n/g, "\n");

const base = [
  "html{scrollbar-gutter:stable;scroll-behavior:smooth;-webkit-text-size-adjust:100%;scroll-padding-top:84px}",
  ':root{--rose:#ff5c8a;--rose-soft:#ff8fb3;--rose-deep:#e63e73;--purple:#7c5cff;--ink:#22143a;--muted:#5b5470;--cream:#fff9f5;--paper:#fff;--line:#f0e4ec;--shadow-sm:0 2px 8px rgba(34,20,58,.06);--shadow-md:0 10px 30px rgba(34,20,58,.1);--radius:18px;--radius-lg:28px;--radius-pill:999px;--container:1160px;--gutter:clamp(16px,4vw,40px);--font:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}',
  "*,*::before,*::after{box-sizing:border-box}",
  "body{margin:0;font-family:var(--font);font-weight:400;font-size:clamp(1rem,.96rem + .2vw,1.08rem);line-height:1.65;color:var(--ink);background:var(--cream);overflow-x:hidden;-webkit-font-smoothing:antialiased}",
  "img,svg{max-width:100%;height:auto;display:block}",
  "a{color:inherit;text-decoration:none}",
  "h1{font-size:clamp(2rem,1.4rem + 2.6vw,3.2rem);font-weight:700;line-height:1.15;margin:0 0 .5em;letter-spacing:-.01em}",
  "h2{font-size:clamp(1.35rem,1rem + 1.4vw,1.85rem);margin:0 0 8px}",
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
  ".btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:inherit;font-size:1.02rem;font-weight:600;line-height:1;padding:15px 28px;min-height:52px;border:none;border-radius:var(--radius-pill);background:var(--rose);color:#fff;cursor:pointer;box-shadow:0 8px 20px rgba(255,92,138,.35);text-align:center}",
  ".btn--primary{background:linear-gradient(135deg,var(--rose-soft),var(--rose))}",
  ".btn--ghost{background:transparent;color:var(--rose-deep);box-shadow:none;border:2px solid var(--line)}",
  ".page-hero{padding-block:clamp(40px,7vw,72px);text-align:center;background:radial-gradient(800px 360px at 78% -20%,#ffe3ef 0%,rgba(255,227,239,0) 60%),radial-gradient(700px 360px at 10% 0%,#e7efff 0%,rgba(231,239,255,0) 55%),var(--cream);border-bottom:1px solid var(--line)}",
  ".page-hero p{color:var(--muted);max-width:620px;margin:0 auto;font-size:1.08em}",
  ".breadcrumb{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;list-style:none;margin:0 0 18px;padding:0;font-size:.9rem;color:var(--muted)}",
  ".breadcrumb li{display:inline-flex;align-items:center;gap:6px}",
  ".breadcrumb li:not(:last-child)::after{content:'›';color:var(--rose);margin-left:6px}",
  ".breadcrumb a{color:var(--rose-deep);font-weight:500}",
  ".finder-section{padding-block:clamp(32px,5vw,56px);background:radial-gradient(900px 420px at 50% -10%,rgba(255,143,179,.18) 0%,rgba(255,143,179,0) 62%),var(--cream)}",
  ".finder-card{max-width:720px;margin:0 auto;background:var(--paper);border:1px solid var(--line);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);padding:clamp(22px,4vw,36px)}",
  ".finder-card__head{text-align:center;margin-bottom:clamp(20px,3vw,28px)}",
  ".finder-card__head p{margin:0;color:var(--muted);font-size:.98rem}",
  ".finder-flower{position:relative;width:min(100%,320px);aspect-ratio:1;margin:0 auto clamp(22px,3vw,28px)}",
  ".finder-flower__ring{position:absolute;inset:8%;border-radius:50%;border:1px dashed rgba(255,92,138,.22);pointer-events:none}",
  ".finder-letter{width:clamp(44px,12vw,54px);height:clamp(44px,12vw,54px);border:2px solid rgba(255,92,138,.35);border-radius:50%;background:#fff;color:var(--ink);font-family:var(--font);font-size:clamp(1.25rem,3.5vw,1.55rem);font-weight:600;text-align:center;text-transform:uppercase;box-shadow:var(--shadow-sm)}",
  ".finder-petal{position:absolute;transform:translate(-50%,-50%)}",
  ".finder-petal--0{top:6%;left:50%}.finder-petal--1{top:22%;left:84%}.finder-petal--2{top:72%;left:84%}",
  ".finder-petal--3{top:94%;left:50%}.finder-petal--4{top:72%;left:16%}.finder-petal--5{top:22%;left:16%}",
  ".finder-center-wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;z-index:2}",
  ".finder-center-label{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--rose-deep);background:rgba(255,249,245,.92);padding:2px 10px;border-radius:var(--radius-pill);border:1px solid rgba(255,92,138,.25)}",
  ".finder-center{width:clamp(56px,15vw,68px);height:clamp(56px,15vw,68px);border-color:var(--rose);background:linear-gradient(145deg,#fff6dc,#ffe9a8);color:var(--rose-deep);font-size:clamp(1.45rem,4vw,1.85rem);box-shadow:0 8px 22px rgba(255,92,138,.18)}",
  ".finder-controls{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-bottom:18px}",
  ".finder-options{display:flex;flex-wrap:wrap;gap:12px 18px;align-items:center;justify-content:center;padding:14px 16px;margin-bottom:18px;background:rgba(255,249,245,.85);border:1px solid var(--line);border-radius:var(--radius)}",
  ".finder-toggle{display:inline-flex;align-items:center;gap:8px;font-weight:600}",
  ".finder-hint-select{display:inline-flex;align-items:center;gap:8px;font-size:.92rem;color:var(--muted)}",
  ".finder-hint-select select{border:1px solid var(--line);border-radius:var(--radius-pill);padding:6px 12px;background:#fff;color:var(--ink);font:inherit}",
  ".finder-status{min-height:1.4em;text-align:center;font-size:.92rem;color:var(--muted);margin-bottom:8px}",
  ".finder-rules{margin-top:18px;padding-top:16px;border-top:1px solid var(--line);font-size:.88rem;color:var(--muted);text-align:center}",
  ".finder-rules strong{color:var(--rose-deep)}",
  "@media (max-width:700px){.page-hero{padding-block:clamp(32px,5vw,48px)}main>section:not(.page-hero):not(.finder-section),.site-footer,.finder-section .showcase{content-visibility:auto;contain-intrinsic-size:auto 800px}}"
];

const cssBlock =
  "  <!-- Mobile: inline critical CSS + async sheet. Desktop: blocking sheet (CLS). -->\n" +
  '  <link rel="preload" href="assets/fonts/fredoka-latin.woff2" as="font" type="font/woff2" crossorigin media="(min-width: 701px)" />\n' +
  '  <link rel="stylesheet" href="styles.min.css?v=' + VER + '" media="(min-width: 701px)" />\n' +
  "  <style>" + base.join("") + "</style>\n" +
  '  <link rel="stylesheet" href="styles.min.css?v=' + VER + '" media="print" id="fullcss">\n' +
  "  <script>requestAnimationFrame(function(){requestAnimationFrame(function(){var l=document.getElementById('fullcss');if(l&&window.matchMedia('(max-width:700px)').matches)l.media='all';});});</script>\n" +
  '  <noscript><link rel="stylesheet" href="styles.min.css?v=' + VER + '"></noscript>\n';

html = html.replace(
  '  <link rel="preload" href="assets/fonts/fredoka-latin.woff2" as="font" type="font/woff2" crossorigin media="(min-width: 701px)" />\n  <link rel="stylesheet" href="styles.min.css?v=' + VER + '" />\n\n',
  cssBlock + "\n"
);

const gaBlock =
  "  <!-- Google tag — deferred until after load (FCP/LCP + Best Practices) -->\n" +
  "  <script>\n" +
  "    window.dataLayer = window.dataLayer || [];\n" +
  "    function gtag(){dataLayer.push(arguments);}\n" +
  "    window.addEventListener('load', function () {\n" +
  "      setTimeout(function () {\n" +
  "        var id = 'G-8NFFZSH23C';\n" +
  "        var s = document.createElement('script');\n" +
  "        s.async = true;\n" +
  "        s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;\n" +
  "        s.onload = function () { gtag('js', new Date()); gtag('config', id); };\n" +
  "        document.head.appendChild(s);\n" +
  "      }, 2500);\n" +
  "    }, { once: true });\n" +
  "  </script>\n";

html = html.replace(
  /  <!-- Google tag \(gtag\.js\)[\s\S]*?<\/script>\n\n/,
  gaBlock + "\n"
);

html = html.replace(
  /  <script type="application\/ld\+json">[\s\S]*?<\/script>\n/,
  ""
);

const ldJson =
  "  <script type=\"application/ld+json\">\n" +
  "  {\n" +
  '    "@context": "https://schema.org",\n' +
  '    "@type": "WebPage",\n' +
  '    "name": "Blossom Word Finder & Solver",\n' +
  '    "url": "https://blossomgamez.com/blossom-word-finder",\n' +
  '    "description": "Free Blossom word finder and solver for today\'s Merriam-Webster puzzle.",\n' +
  '    "publisher": {\n' +
  '      "@type": "Organization",\n' +
  '      "name": "Blossom Game",\n' +
  '      "url": "https://blossomgamez.com/",\n' +
  '      "logo": "https://blossomgamez.com/assets/favicon.svg"\n' +
  "    }\n" +
  "  }\n" +
  "  </script>\n";

const scriptBlock =
  "  <script>\n" +
  "    (function () {\n" +
  '      var appSrc = "app.js?v=' + VER + '";\n' +
  '      var finderSrc = "blossom-finder.js?v=' + VER + '";\n' +
  "      function loadFinder() {\n" +
  '        if (!document.getElementById("blossomFinder")) return;\n' +
  '        var s = document.createElement("script");\n' +
  "        s.src = finderSrc;\n" +
  "        s.defer = true;\n" +
  "        document.body.appendChild(s);\n" +
  "      }\n" +
  '      if (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) {\n' +
  '        var a = document.createElement("script");\n' +
  "        a.src = appSrc;\n" +
  "        a.defer = true;\n" +
  "        document.head.appendChild(a);\n" +
  '        if ("requestIdleCallback" in window) requestIdleCallback(loadFinder, { timeout: 2500 });\n' +
  '        else document.addEventListener("DOMContentLoaded", loadFinder);\n' +
  "      } else {\n" +
  '        window.addEventListener("load", function () {\n' +
  "          var boot = function () {\n" +
  '            var a = document.createElement("script");\n' +
  "            a.src = appSrc;\n" +
  "            document.body.appendChild(a);\n" +
  "            loadFinder();\n" +
  "          };\n" +
  '          if ("requestIdleCallback" in window) requestIdleCallback(boot, { timeout: 5000 });\n' +
  "          else setTimeout(boot, 1);\n" +
  "        }, { once: true });\n" +
  "      }\n" +
  "    })();\n" +
  "  </script>\n";

html = html.replace(
  '  <script src="app.js?v=' + VER + '" defer></script>\n  <script src="blossom-finder.js?v=' + VER + '" defer></script>\n',
  ldJson + scriptBlock
);

html = html.replace(/styles\.min\.css\?v=\d+/g, "styles.min.css?v=" + VER);
html = html.replace(/blossom-finder\.js\?v=\d+/g, "blossom-finder.js?v=" + VER);
html = html.replace(/app\.js\?v=\d+/g, "app.js?v=" + VER);

html = html.replace(
  '<img src="assets/blossom-word-finder.webp" alt="blossom word finder" width="680" height="680" loading="lazy" decoding="async" />',
  '<img src="assets/blossom-word-finder.webp" alt="blossom word finder" width="680" height="680" loading="lazy" decoding="async" fetchpriority="low" />'
);

fs.writeFileSync(htmlPath, html.replace(/\n/g, "\r\n"));
console.log("finder critical applied", base.join("").length, "v=" + VER);
