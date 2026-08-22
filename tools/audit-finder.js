const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const url = process.argv[2] || "http://127.0.0.1:5177/blossom-word-finder";
const form = process.argv[3] || "mobile";
const out = path.join(root, "tools", form === "desktop" ? "perf-finder-desktop.json" : "perf-finder-mobile.json");

const tmpDir = path.join(os.tmpdir(), "blossom-lighthouse");
process.env.TEMP = tmpDir;
process.env.TMP = tmpDir;
fs.mkdirSync(tmpDir, { recursive: true });

const args = [
  "--yes",
  "lighthouse@12.8.2",
  url,
  "--output=json",
  "--output-path=" + out,
  "--quiet",
  "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
];

if (form === "desktop") {
  args.push("--preset=desktop");
} else {
  args.push("--form-factor=mobile", "--screenEmulation.mobile", "--throttling-method=simulate");
}

const result = spawnSync("npx", args, { cwd: root, shell: true, stdio: "inherit" });

if (!fs.existsSync(out)) {
  console.error("Lighthouse did not write output:", out);
  process.exit(result.status || 1);
}

const r = JSON.parse(fs.readFileSync(out, "utf8"));
console.log("\n=== " + form.toUpperCase() + " ===");
Object.keys(r.categories).forEach(function (k) {
  console.log(k + ":", Math.round(r.categories[k].score * 100));
});

["performance", "best-practices", "accessibility"].forEach(function (cat) {
  console.log("\n-- failed " + cat + " audits --");
  r.categories[cat].auditRefs.forEach(function (ref) {
    var a = r.audits[ref.id];
    if (!a || a.score === null || a.score === 1) return;
    console.log(ref.id, a.score, a.title);
    if (a.details && a.details.items && a.details.items.length) {
      a.details.items.slice(0, 3).forEach(function (item) {
        console.log(" ", JSON.stringify(item).slice(0, 120));
      });
    }
  });
});

const perf = r.audits;
["first-contentful-paint", "largest-contentful-paint", "speed-index", "total-blocking-time", "cumulative-layout-shift"].forEach(function (id) {
  if (perf[id]) console.log(id + ":", perf[id].displayValue || perf[id].numericValue);
});
if (perf["largest-contentful-paint-element"] && perf["largest-contentful-paint-element"].details) {
  console.log("LCP element:", JSON.stringify(perf["largest-contentful-paint-element"].details.items[0]).slice(0, 200));
}
