import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const patch = readFileSync(join(root, "cordis.patch.yml"), "utf8");

test("package.json declares the bundle patch and the 0.2 kernel range", () => {
  assert.equal(manifest.dsh?.bundle?.patch, "./cordis.patch.yml");
  // The 0.2 loader honours engines.dsh alone and checks it with
  // includePrerelease, so the range must admit 0.2 prereleases and stop
  // before 0.3.0-0.
  assert.equal(manifest.engines?.dsh, ">=0.2.0-rc.1 <0.3.0-0");
});

test("patch inserts the society bridge and overrides nothing else", () => {
  assert.match(patch, /^- insert:/m);
  // An id-targeted layer replaces another package's whole config (no deep
  // merge) and warns `entry not found` when that package is absent, so the
  // bundle must not carry one.
  assert.doesNotMatch(patch, /^- id:/m);
  assert.match(patch, /id: mcp-society/);
  assert.match(patch, /name: '@deepseek-ai\/dsh-mcp-client'/);
  assert.match(patch, /serverName: society/);
  assert.match(patch, /seed_society\.mcp_server/);
});

test("display metadata is exported for the plugin manager", () => {
  const exportMap = manifest.exports ?? {};
  assert.equal(exportMap["./icon"], "./icon.svg");
  assert.equal(exportMap["./locale/*.json"], "./locale/*.json");
  assert.match(readFileSync(join(root, "icon.svg"), "utf8"), /^<svg[\s>]/);
  assert.ok(statSync(join(root, "icon.svg")).size <= 256 * 1024);
  for (const lang of ["en", "zh"]) {
    const { meta } = JSON.parse(
      readFileSync(join(root, "locale", `${lang}.json`), "utf8"),
    );
    assert.ok(meta.title && meta.description, `${lang} locale meta incomplete`);
  }
});

test("six yogacara seed skills ship with the package", () => {
  for (const skill of ["society", "alaya", "manas", "mano", "panca", "sila"]) {
    const file = join(root, "skills", `yogacara-${skill}`, "SKILL.md");
    const content = readFileSync(file, "utf8");
    assert.match(content, /^name: yogacara-/m, skill);
  }
});
