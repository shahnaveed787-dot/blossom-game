const https = require("https");
const fs = require("fs");
const path = require("path");

https
  .get("https://blossomgamez.com/", (res) => {
    let d = "";
    res.on("data", (c) => (d += c));
    res.on("end", () => {
      fs.writeFileSync(path.join(__dirname, "live-index.html"), d);
      const m = d.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g);
      console.log("live len", d.length, "schemas", m ? m.length : 0);
      if (m) {
        m.forEach((s, i) => {
          const body = s.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
          fs.writeFileSync(path.join(__dirname, "schema-" + i + ".json"), body);
          console.log("schema", i, "len", body.length);
        });
      }
      console.log("css links", d.match(/href="[^"]*styles[^"]*"/g));
      console.log("fredoka", d.includes("fredoka"));
      console.log("facebook", d.includes("facebook.com"));
    });
  })
  .on("error", (e) => {
    console.error(e);
    process.exit(1);
  });
