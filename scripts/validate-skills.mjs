#!/usr/bin/env node
// scripts/validate-skills.mjs
//
// Validates the portable SKILL.md frontmatter of every skill in this repo.
// The frontmatter is parsed with a real YAML parser (the `yaml` package),
// the same strict parsing skill loaders apply. A value that is only valid to
// a lenient line parser, such as an unquoted description containing
// "colon-space" ("CLI (or its `rc` alias): ..."), fails here instead of
// failing silently inside an agent's skill loader. Use a quoted or folded
// (`>-`) scalar for any value that contains ": ".
//
// Run: npm ci && node scripts/validate-skills.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

const PORTABLE_KEYS = new Set([
  "name",
  "description",
  "license",
  "compatibility",
  "metadata",
  "allowed-tools",
]);

const RESERVED_WORDS = ["anthropic", "claude"];

const root = process.cwd();

/** Find every directory directly under the repo root that has a SKILL.md. */
function findSkillDirs() {
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .filter((name) => {
      try {
        return statSync(join(root, name, "SKILL.md")).isFile();
      } catch {
        return false;
      }
    })
    .sort();
}

/** Return the text between the first two `---` fences of a SKILL.md, or null
 *  when the file has no frontmatter fence. */
function extractFrontmatter(content) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content);
  return match ? match[1] : null;
}

/** Validate one skill directory's SKILL.md against the portable-frontmatter
 *  contract. Returns a list of human-readable violation strings (empty when
 *  the skill is valid). */
function validateSkill(dirName) {
  const violations = [];
  const content = readFileSync(join(root, dirName, "SKILL.md"), "utf8");
  const frontmatter = extractFrontmatter(content);
  if (frontmatter === null) {
    violations.push(`${dirName}: SKILL.md has no "---" frontmatter fence`);
    return violations;
  }

  let data;
  try {
    data = parse(frontmatter);
  } catch (error) {
    const message = error instanceof Error ? error.message.split("\n")[0] : String(error);
    violations.push(`${dirName}: frontmatter is not valid YAML: ${message}`);
    return violations;
  }

  if (data === null || typeof data !== "object" || Array.isArray(data)) {
    violations.push(`${dirName}: frontmatter must be a YAML mapping`);
    return violations;
  }

  for (const key of Object.keys(data)) {
    if (!PORTABLE_KEYS.has(key)) {
      violations.push(
        `${dirName}: frontmatter key "${key}" is not one of the six portable keys ` +
          `(name, description, license, compatibility, metadata, allowed-tools)`,
      );
    }
  }

  const fields = [];
  for (const field of ["name", "description"]) {
    const value = data[field];
    if (value === undefined || value === null || value === "") {
      violations.push(`${dirName}: frontmatter "${field}" is empty or missing`);
    } else if (typeof value !== "string") {
      violations.push(`${dirName}: frontmatter "${field}" must be a string`);
    } else {
      fields.push([field, value]);
    }
  }

  if (typeof data.name === "string" && data.name !== "" && data.name !== dirName) {
    violations.push(
      `${dirName}: frontmatter name "${data.name}" does not match the directory name "${dirName}"`,
    );
  }

  for (const [field, value] of fields) {
    if (value.includes("<") || value.includes(">")) {
      violations.push(`${dirName}: "${field}" contains an angle bracket ("<" or ">")`);
    }
    const lower = value.toLowerCase();
    for (const word of RESERVED_WORDS) {
      if (lower.includes(word)) {
        violations.push(`${dirName}: "${field}" contains the reserved word "${word}"`);
      }
    }
  }

  return violations;
}

function main() {
  const dirs = findSkillDirs();
  if (dirs.length === 0) {
    console.error("No skill directories found (no */SKILL.md under the repo root).");
    process.exitCode = 1;
    return;
  }

  const allViolations = dirs.flatMap((dir) => validateSkill(dir));

  if (allViolations.length > 0) {
    console.error(
      `Found ${allViolations.length} violation(s) across ${dirs.length} skill dir(s):\n`,
    );
    for (const violation of allViolations) console.error(`  - ${violation}`);
    process.exitCode = 1;
    return;
  }

  console.log(`OK: ${dirs.length} skill(s) validated (${dirs.join(", ")}).`);
}

main();
