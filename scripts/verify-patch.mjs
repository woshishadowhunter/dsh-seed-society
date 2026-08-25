// Verify the plugin's structure and bundle patch shape.
// Run: node scripts/verify-patch.mjs
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (manifest.dsh?.bundle?.patch !== "./cordis.patch.yml") {
  failures.push("package.json must declare dsh.bundle.patch = ./cordis.patch.yml");
}

const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
for (const expected of [
  "reasoningEffort: off",           // llm-deepseek route default fix
  "dreamMaxTokens: 32768",          // mneme consolidation output budget
  "dreamModel: deepseek-chat",      // measured-valid consolidation route
  "serverName: society",            // MCP bridge namespace
  "seed_society.mcp_server",        // MCP server module
]) {
  if (!patch.includes(expected)) failures.push(`patch missing: ${expected}`);
}

for (const skill of ["society", "alaya", "manas", "mano", "panca", "sila"]) {
  const skillFile = join(root, "skills", `yogacara-${skill}`, "SKILL.md");
  if (!existsSync(skillFile)) failures.push(`missing skill: yogacara-${skill}`);
}

if (failures.length) {
  console.error("verify-patch FAILED:");
  for (const failure of failures) console.error(" -", failure);
  process.exit(1);
}
console.log("verify-patch OK: manifest, patch, and six seed skills present");
