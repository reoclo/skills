#!/usr/bin/env node
// scripts/validate-skills.mjs
//
// Self-contained, dependency-free validator for portable SKILL.md frontmatter.
// It hand-parses the YAML frontmatter fence with simple line-oriented rules
// instead of a YAML library. A naive line parser usually breaks on a value
// that contains its own colon (a URL, a "CLI (or its `rc` alias): ..." style
// description). This parser avoids that trap: it only treats a line as a new
// top-level key when the line starts at column 0 and matches `key:` or
// `key: value`; everything after the first colon on that line, including any
// further colons, is the value. Indented lines are folded into the value of
// the most recent top-level key, so they never get misread as their own key.
//
// Run: node scripts/validate-skills.mjs

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

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

/** Pull the lines between the first two `---` fences out of a SKILL.md.
 *  Returns null when the file has no frontmatter fence. */
function extractFrontmatterLines(content) {
  const lines = content.split("\n");
  if (lines[0].trim() !== "---") return null;
  const end = lines.indexOf("---", 1);
  if (end === -1) return null;
  return lines.slice(1, end);
}

/** Hand-parse frontmatter lines into a map of top-level key to raw string
 *  value. Only the top-level keys matter for the portable-key check; any
 *  nested or block-scalar content is folded into its parent key's value so a
 *  multi-line description or a block-scalar body still reads as non-empty. */
function parseFrontmatter(lines) {
  const values = {};
  const order = [];
  let currentKey = null;
  for (const rawLine of lines) {
    if (rawLine.trim() === "") continue;
    const isTopLevel = /^[^\s]/.test(rawLine);
    if (isTopLevel) {
      const match = /^([A-Za-z0-9_-]+):(?:\s(.*))?$/.exec(rawLine);
      if (!match) continue; // not a recognizable "key:" or "key: value" line
      const key = match[1];
      currentKey = key;
      if (!(key in values)) order.push(key);
      values[key] = (match[2] ?? "").trim();
    } else if (currentKey) {
      values[currentKey] = `${values[currentKey]} ${rawLine.trim()}`.trim();
    }
  }
  return { values, order };
}

function stripQuotes(value) {
  if (value.length >= 2) {
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

/** Validate one skill directory's SKILL.md against the portable-frontmatter
 *  contract. Returns a list of human-readable violation strings (empty when
 *  the skill is valid). */
function validateSkill(dirName) {
  const violations = [];
  const path = join(root, dirName, "SKILL.md");
  const content = readFileSync(path, "utf8");
  const frontmatterLines = extractFrontmatterLines(content);
  if (frontmatterLines === null) {
    violations.push(`${dirName}: SKILL.md has no "---" frontmatter fence`);
    return violations;
  }

  const { values, order } = parseFrontmatter(frontmatterLines);

  for (const key of order) {
    if (!PORTABLE_KEYS.has(key)) {
      violations.push(
        `${dirName}: frontmatter key "${key}" is not one of the six portable keys ` +
          `(name, description, license, compatibility, metadata, allowed-tools)`,
      );
    }
  }

  const name = stripQuotes(values.name ?? "");
  const description = stripQuotes(values.description ?? "");

  if (!name) {
    violations.push(`${dirName}: frontmatter is missing "name"`);
  } else if (name !== dirName) {
    violations.push(
      `${dirName}: frontmatter name "${name}" does not match the directory name "${dirName}"`,
    );
  }

  if (!description) {
    violations.push(`${dirName}: frontmatter "description" is empty or missing`);
  }

  for (const [field, value] of [
    ["name", name],
    ["description", description],
  ]) {
    if (!value) continue;
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
