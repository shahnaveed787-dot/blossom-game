const fs = require("fs");
const h = fs.readFileSync("index.html", "utf8");
console.log("len", h.length);
console.log("hero-visual", h.includes("hero-visual"));
console.log("tags", (h.match(/<[a-zA-Z]/g) || []).length);
console.log("has ld+json", h.includes("ld+json"));
console.log("facebook", h.includes("facebook.com"));
