import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("package.json declares the dsh bundle patch", () => {
  const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(manifest.dsh?.bundle?.patch, "./cordis.patch.yml");
});

test("bundle patch enforces the zero-LLM mneme policy", () => {
  const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
  // Every mneme background path that calls a model must be explicitly off.
  for (const flag of [
    "autoDream: false",
    "autoSummarize: false",
    "sleepModeEnabled: false",
    "entityExtractionEnabled: false",
  ]) {
    assert.ok(patch.includes(flag), `missing ${flag}`);
  }
  // Injection and mirror stay enabled: they never call a model.
  assert.match(patch, /autoInject: true/);
  assert.match(patch, /maxInjectedItems: 5/);
});

test("bundle patch keeps the bridge and the deepseek effort default", () => {
  const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
  assert.match(patch, /reasoningEffort: off/);
  assert.match(patch, /serverName: society/);
  assert.match(patch, /seed_society\.mcp_server/);
});

test("six yogacara seed skills ship with the package", () => {
  for (const skill of ["society", "alaya", "manas", "mano", "panca", "sila"]) {
    const file = join(root, "skills", `yogacara-${skill}`, "SKILL.md");
    const content = readFileSync(file, "utf8");
    assert.match(content, /^name: yogacara-/m, skill);
  }
});
