const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const htmlPath = path.join(root, "index.html");
let html = fs.readFileSync(htmlPath, "utf8");
const start = html.indexOf("<!-- Critical CSS");
const end = html.indexOf("</head>");
if (start < 0 || end < 0) throw new Error("markers");
const styleMatch = html.slice(start, end).match(/<style>[\s\S]*?<\/style>/);
if (!styleMatch) throw new Error("no style");
const block =
  "  <!-- Critical CSS ONLY (paint test). -->\n" +
  "  " + styleMatch[0] + "\n";
html = html.slice(0, start) + block + html.slice(end);
fs.writeFileSync(htmlPath, html);
console.log("crit-only html", html.length, "has fullcss", html.includes("styles.min.css"));
