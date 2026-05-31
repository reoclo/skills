# reoclo/skills

Shared **agent skills** for Reoclo tooling — the reoclo CLI today, and any other tool we build next. Skills are reference guides that Claude Code (and other skill-aware agents) load on demand to apply proven, repo-specific techniques.

Consumed as a **git submodule** in the Reoclo monorepo, or cloned directly for personal use.

## Layout

Flat namespace — one directory per skill, each with a `SKILL.md`:

```
<skill-name>/
  SKILL.md            # required: YAML frontmatter + body
  <supporting files>  # optional: scripts, heavy reference, templates
```

Claude's skill namespace is flat, so **scope by name**, not by folders: prefix with the
tool (`reoclo-cli-*`, future `reoclo-api-*`, `reoclo-web-*`, …).

## Conventions

- Directory name **must equal** the frontmatter `name` (letters, numbers, hyphens only).
- `description` starts with **"Use when …"** and lists *triggering conditions only* — never a workflow summary (a summarized workflow makes agents skip the body).
- Keep skills concise (aim < 500 words); move heavy reference or reusable tools into sibling files.
- One excellent example beats many mediocre ones.
- This repository is **public** — never include private hostnames, credentials, or internal-only infrastructure. Keep internal/maintainer skills out of this repo.

See Anthropic's skill-authoring guidance for the full format.

## Current skills

| Skill | Use when… |
|-------|-----------|
| `reoclo-cli-usage` | operating Reoclo from the terminal with the `reoclo` CLI — login, servers/apps, deploy, logs, exec/shell, tunnels, env, domains, scripting. |

## Consuming these skills

### As a submodule

```bash
git submodule add https://github.com/reoclo/skills.git skills
git submodule update --init skills
```

Claude Code discovers project skills at `.claude/skills/`, so bridge each public skill with
a symlink:

```bash
mkdir -p .claude/skills && ln -sfn ../../skills/reoclo-cli-usage .claude/skills/reoclo-cli-usage
```

### Personal / global

```bash
git clone https://github.com/reoclo/skills.git ~/.claude/skills
```

## Updating

Edit the skill here, commit, push. Submodule consumers pick it up by bumping the pointer:

```bash
cd skills && git pull origin main && cd ..
git add skills && git commit -m "chore: bump skills submodule"
```
