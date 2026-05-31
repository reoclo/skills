# reoclo/skills

Shared **agent skills** for [Reoclo](https://reoclo.com) tooling — the [`reoclo` CLI](https://github.com/reoclo/cli) today, and more to come. Skills are reference guides that Claude Code (and other skill-aware agents) load on demand to apply proven techniques.

This repository is **public** and free to use — clone it, vendor it, or add it as a submodule in your own project.

## Layout

Flat namespace — one directory per skill, each with a `SKILL.md`:

```
<skill-name>/
  SKILL.md            # required: YAML frontmatter + body
  <supporting files>  # optional: scripts, heavy reference, templates
```

Claude's skill namespace is flat, so **scope by name**, not by folders: prefix with the
tool (`reoclo-cli-*`, future `reoclo-api-*`, `reoclo-web-*`, …).

## Available skills

| Skill | Use when… |
|-------|-----------|
| `reoclo-cli-usage` | operating Reoclo from the terminal with the `reoclo` CLI — login, servers/apps, deploy, logs, exec/shell, tunnels, env, domains, scripting. |

## Using these skills

Claude Code discovers skills under a `.claude/skills/` directory. Pick whichever fits:

### Personal / global

Make every skill available in all your sessions:

```bash
git clone https://github.com/reoclo/skills.git ~/.claude/skills
```

### In a single project

Add this repo as a submodule, then symlink the skills you want into `.claude/skills/`:

```bash
git submodule add https://github.com/reoclo/skills.git skills
git submodule update --init skills
mkdir -p .claude/skills
ln -sfn ../../skills/reoclo-cli-usage .claude/skills/reoclo-cli-usage
```

A fresh checkout then needs `git submodule update --init skills` for the symlinks to resolve.

### Copy a single skill

Skills are self-contained directories — copy the one you need into your project's `.claude/skills/`:

```bash
cp -R skills/reoclo-cli-usage /path/to/project/.claude/skills/
```

## Authoring conventions

Contributions welcome. Each skill should follow these rules:

- Directory name **must equal** the frontmatter `name` (letters, numbers, hyphens only).
- `description` starts with **"Use when …"** and lists *triggering conditions only* — never a workflow summary (a summarized workflow makes agents skip the body).
- Keep skills concise (aim < 500 words); move heavy reference or reusable tools into sibling files.
- One excellent example beats many mediocre ones.
- This repository is **public** — never include private hostnames, credentials, or internal-only infrastructure.

See Anthropic's [skill-authoring guidance](https://docs.claude.com/en/docs/claude-code/skills) for the full format.

## Updating

Edit a skill, commit, and push. Personal-clone users pull; submodule users bump the pointer:

```bash
cd skills && git pull origin main && cd ..
git add skills && git commit -m "chore: bump skills submodule"
```

## License

MIT
