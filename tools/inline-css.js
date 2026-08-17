const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
const cssPath = path.join(root, "styles.min.css");

// Ensure min CSS is current
const cssSrc = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const min = cssSrc
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\s+/g, " ")
  .replace(/\s*([{}:;,>~+])\s*/g, "$1")
  .replace(/;}/g, "}")
  .trim();
fs.writeFileSync(cssPath, min);

let html = fs.readFileSync(htmlPath, "utf8");
const block =
  "  <!-- Inlined CSS: zero extra stylesheet RTT (mobile Speed Index). -->\n" +
  "  <style>\n" +
  min +
  "\n  </style>\n";

const startMarkers = [
  "<!-- Critical ATF CSS",
  "<!-- Critical CSS + async",
  "<!-- Inlined CSS:",
  "<!-- Minified blocking",
];
let start = -1;
for (const m of startMarkers) {
  const i = html.indexOf(m);
  if (i >= 0) { start = i; break; }
}
const end = html.indexOf("</head>");
if (start < 0 || end < 0) throw new Error("head markers missing: " + start + " " + end);
html = html.slice(0, start) + block + html.slice(end);
html = html.replace(/app\.js\?v=\d+/g, "app.js?v=16");
fs.writeFileSync(htmlPath, html);
console.log("inlined", min.length, "html", html.length);
