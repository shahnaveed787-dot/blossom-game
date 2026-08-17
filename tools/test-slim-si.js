const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");

// Start from applied critical CSS, then strip full stylesheet
require("./apply-critical-css.js");
require("./crit-only.js");

let html = fs.readFileSync(htmlPath, "utf8");

// Remove JSON-LD (large) for this paint experiment
html = html.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");

// Aggressively skip layout of everything after the hero
html = html.replace(
  "</style>",
  "main>*:not(.hero):not(#top){content-visibility:hidden!important;contain-intrinsic-size:0 0!important}" +
    ".hero-visual,.floaty,.hero-stats{display:none!important}</style>"
);

fs.writeFileSync(htmlPath, html);
console.log("slim test html", html.length);

process.env.TEMP = path.join(root, "tools", "tmp");
process.env.TMP = process.env.TEMP;
fs.mkdirSync(process.env.TEMP, { recursive: true });

const lh = spawnSync(
  "npx",
  [
    "--yes",
    "lighthouse@12.8.2",
    "http://127.0.0.1:5177/",
    "--only-categories=performance",
    "--form-factor=mobile",
    "--screenEmulation.mobile",
    "--throttling-method=simulate",
    "--output=json",
    "--output-path=./tools/perf-slim.json",
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
    "--quiet",
  ],
  { cwd: root, shell: true, encoding: "utf8" }
);
console.log(lh.stderr ? lh.stderr.slice(-400) : "");

const r = require("./perf-slim.json");
const a = r.audits;
const m = (id) => a[id].displayValue || a[id].numericValue;
console.log("score", Math.round(r.categories.performance.score * 100));
console.log("FCP", m("first-contentful-paint"));
console.log("SI", m("speed-index"));
console.log("CLS", m("cumulative-layout-shift"));
console.log("TBT", m("total-blocking-time"));
a["screenshot-thumbnails"].details.items.forEach((t, i) => {
  console.log(
    "frame",
    i,
    t.timing + "ms",
    Buffer.from(t.data.split(",")[1], "base64").length + "B"
  );
});
const main = a["mainthread-work-breakdown"];
if (main && main.details) {
  main.details.items.forEach((i) => console.log(i.group, Math.round(i.duration) + "ms"));
}

// Restore normal critical+async setup
require("./apply-critical-css.js");
