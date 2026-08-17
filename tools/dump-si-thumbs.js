const fs = require("fs");
const path = require("path");
const r = require("./perf-si.json");
const out = path.join(__dirname, "tmp");
fs.mkdirSync(out, { recursive: true });
const ts = r.audits["screenshot-thumbnails"].details.items;
ts.forEach((t, i) => {
  const b64 = t.data.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(path.join(out, "si-" + i + "-" + t.timing + ".jpg"), Buffer.from(b64, "base64"));
});
console.log("wrote", ts.length, "thumbnails");
