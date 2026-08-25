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

test("bundle patch carries the memory consolidation fixes", () => {
  const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");
  assert.match(patch, /reasoningEffort: off/);
  assert.match(patch, /dreamMaxTokens: 32768/);
  assert.match(patch, /dreamModel: deepseek-chat/);
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
