import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(__dirname, "shots");
fs.mkdirSync(SHOTS, { recursive: true });

const BASE = process.env.BASE || "http://localhost:5177/";
const results = [];
const log = (ok, msg) => { results.push({ ok, msg }); console.log((ok ? "PASS " : "FAIL ") + msg); };

let browser;
for (const channel of ["chrome", "msedge"]) {
  try { browser = await chromium.launch({ channel }); console.log("Using channel:", channel); break; }
  catch (e) { console.log("channel " + channel + " unavailable:", e.message.split("\n")[0]); }
}
if (!browser) browser = await chromium.launch();

async function hasHScroll(page) {
  return page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  );
}

async function runViewport(name, width, height, isMobile) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: isMobile ? 3 : 1,
    isMobile,
    hasTouch: isMobile
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  await page.goto(BASE, { waitUntil: "networkidle" });

  // Single H1
  const h1Count = await page.locator("h1").count();
  log(h1Count === 1, `${name}: exactly one <h1> (found ${h1Count})`);

  // No horizontal scroll
  const hs = await hasHScroll(page);
  log(!hs, `${name}: no horizontal scrolling`);

  // Hero CTA visible (target the hero section specifically)
  const cta = page.locator(".hero-cta a.btn--primary").first();
  log(await cta.isVisible(), `${name}: primary Play CTA visible`);

  // Full-page screenshot
  await page.screenshot({ path: path.join(SHOTS, `${name}-full.png`), fullPage: true });
  await page.screenshot({ path: path.join(SHOTS, `${name}-fold.png`) });

  // Navigation mode depends on layout, not device flag (breakpoint 900px)
  const useHamburger = await page.locator(".nav-toggle").isVisible();
  if (useHamburger) {
    const toggle = page.locator(".nav-toggle");
    await toggle.click();
    await page.waitForTimeout(400);
    const expanded = await toggle.getAttribute("aria-expanded");
    const menuLink = page.locator("#mobileMenu a", { hasText: "How to Play" }).first();
    log(expanded === "true" && (await menuLink.isVisible()), `${name}: hamburger menu opens`);
    await page.screenshot({ path: path.join(SHOTS, `${name}-menu.png`) });
    await menuLink.click();
    await page.waitForTimeout(500);
    log((await toggle.getAttribute("aria-expanded")) === "false", `${name}: menu closes on link click`);
    log(await page.locator("#how").isVisible(), `${name}: nav anchor works`);
  } else {
    await page.locator(".nav-links a", { hasText: "How to Play" }).click();
    await page.waitForTimeout(600);
    log(await page.locator("#how").isVisible(), `${name}: nav anchor works`);
  }

  // Mini game: pick letters G A R (spells nothing) then test GARDEN
  await page.locator("#demoClear").click();
  const wanted = ["G", "A", "R", "D", "E", "N"];
  for (const l of wanted) {
    await page.locator(`.petal-btn:has-text("${l}")`).first().click();
  }
  const built = (await page.locator("#demoWord").innerText()).trim();
  log(built.includes("GARDEN"), `${name}: petals build word (got "${built}")`);
  await page.locator("#demoCheck").click();
  await page.waitForTimeout(300);
  const msg = (await page.locator("#demoMsg").innerText()).trim();
  log(/great word|Well done|🎉/i.test(msg), `${name}: check recognizes valid word ("${msg}")`);
  await page.screenshot({ path: path.join(SHOTS, `${name}-game.png`) });

  // FAQ accordion
  const firstFaq = page.locator(".faq details").first();
  await firstFaq.locator("summary").scrollIntoViewIfNeeded();
  await firstFaq.locator("summary").click();
  await page.waitForTimeout(200);
  log(await firstFaq.evaluate((el) => el.open), `${name}: FAQ opens`);

  // Scroll through the page to trigger reveal animations, then verify content is visible
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.45);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1600);
  const hiddenReveals = await page.evaluate(() =>
    Array.prototype.filter.call(document.querySelectorAll(".reveal"), (el) => {
      const s = getComputedStyle(el);
      return parseFloat(s.opacity) < 0.9;
    }).length
  );
  log(hiddenReveals === 0, `${name}: all scroll-reveal blocks visible after scroll (${hiddenReveals} still hidden)`);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, `${name}-full.png`), fullPage: true });

  log(consoleErrors.length === 0, `${name}: no console errors ${consoleErrors.length ? JSON.stringify(consoleErrors.slice(0,3)) : ""}`);

  await ctx.close();
}

async function renderOgImage() {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(BASE + "assets/og-image.svg", { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(ROOT, "assets", "og-image.png") });
  console.log("Rendered assets/og-image.png");
  await ctx.close();
}

await runViewport("desktop", 1440, 900, false);
await runViewport("tablet", 820, 1180, false);
await runViewport("mobile", 390, 844, true);
await runViewport("mobile-small", 360, 740, true);
await renderOgImage();

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n==== ${results.length - failed.length}/${results.length} checks passed ====`);
if (failed.length) { console.log("FAILURES:"); failed.forEach((f) => console.log(" - " + f.msg)); process.exit(1); }
