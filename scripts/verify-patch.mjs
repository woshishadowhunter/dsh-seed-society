// Verify the plugin's structure and bundle patch shape.
// Run: node scripts/verify-patch.mjs
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (manifest.dsh?.bundle?.patch !== "./cordis.patch.yml") {
  failures.push("package.json must declare dsh.bundle.patch = ./cordis.patch.yml");
}
if (manifest.engines?.dsh !== ">=0.2.0-rc.1 <0.3.0-0") {
  failures.push("package.json must declare engines.dsh = >=0.2.0-rc.1 <0.3.0-0");
}
for (const [key, target] of [
  ["./icon", "./icon.svg"],
  ["./locale/*.json", "./locale/*.json"],
]) {
  if (manifest.exports?.[key] !== target) {
    failures.push(`package.json must export ${key} -> ${target}`);
  }
}

const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
if (!/^- insert:/m.test(patch)) failures.push("patch must use a top-level - insert:");
if (/^- id:/m.test(patch)) {
  failures.push("patch must not override foreign rows (id-targeted layer)");
}
for (const expected of [
  "id: mcp-society",
  "serverName: society",
  "seed_society.mcp_server",
]) {
  if (!patch.includes(expected)) failures.push(`patch missing: ${expected}`);
}

for (const lang of ["en", "zh"]) {
  const file = join(root, "locale", `${lang}.json`);
  if (!existsSync(file)) {
    failures.push(`missing locale: ${lang}.json`);
    continue;
  }
  const { meta } = JSON.parse(readFileSync(file, "utf8"));
  if (!meta?.title || !meta?.description) {
    failures.push(`locale ${lang}.json: meta.title/description required`);
  }
}
const icon = join(root, "icon.svg");
if (!existsSync(icon)) failures.push("missing icon.svg");
else if (statSync(icon).size > 256 * 1024) failures.push("icon.svg exceeds 256 KiB");

for (const skill of ["society", "alaya", "manas", "mano", "panca", "sila"]) {
  const skillFile = join(root, "skills", `yogacara-${skill}`, "SKILL.md");
  if (!existsSync(skillFile)) failures.push(`missing skill: yogacara-${skill}`);
}

if (failures.length) {
  console.error("verify-patch FAILED:");
  for (const failure of failures) console.error(" -", failure);
  process.exit(1);
}
console.log("verify-patch OK: manifest, insert-only patch, display metadata, six seed skills");
