# reoclo/skills

Shared **agent skills** for [Reoclo](https://reoclo.com) tooling: the [`reoclo` CLI](https://github.com/reoclo/cli) today, and more to come. Skills are reference guides that Claude Code (and other skill-aware agents) load on demand to apply proven techniques.

This repository is **public** and free to use. Clone it, vendor it, or add it as a submodule in your own project.

## Layout

Flat namespace, one directory per skill, each with a `SKILL.md`:

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
| `reoclo-cli-usage` | operating Reoclo from the terminal with the `reoclo` CLI: login, servers/apps, deploy, logs, exec/shell, tunnels, env, domains, scripting. |
| `reoclo-github-actions` | wiring Reoclo into GitHub Actions or Gitea Actions: run, checkout, docker-auth, and load-secrets. |

## Using these skills

`reoclo init` and `reoclo skills install` install these skills for you. Each command
downloads the skills from this repository and places one copy for each skill in
`.agents/skills/<name>/`. Codex, Gemini CLI, opencode, and Cursor read skills from that
directory.

Claude Code reads skills only from `.claude/skills/`. The CLI creates
`.claude/skills/<name>` as a link to the copy in `.agents/skills/<name>/`. On Windows,
the CLI copies the files instead of creating a link.

### Install with the CLI

In a new project, run:

```bash
reoclo init
```

`reoclo init` links the project to your organization and installs the skills in one
step. To install or refresh the skills in a project that is already linked, run:

```bash
reoclo skills install
```

Both commands detect which agent harnesses are on your machine and install skills for
each one. Detected harnesses: Claude Code, Codex, Gemini CLI, opencode, and Cursor.
These flags change the install:

| Flag | Effect |
|------|--------|
| `--harness <list>` | install for specific harnesses only, for example `--harness claude,codex` |
| `--global` | install to `~/.agents/skills` for every project, instead of the current project |
| `--project` | install to the current project only (default) |
| `--skills <list>` | install specific skills only, for example `--skills reoclo-cli-usage` |
| `-y` | accept the defaults and skip the prompts, for scripts and CI |

### Install by hand

If you do not use the CLI, place the files yourself. Clone this repository. Copy the
skill you need into `.agents/skills/`:

```bash
git clone https://github.com/reoclo/skills.git
mkdir -p .agents/skills
cp -R skills/reoclo-cli-usage .agents/skills/
```

For Claude Code, also link `.claude/skills/<name>` to the copy in `.agents/skills/<name>`:

```bash
mkdir -p .claude/skills
ln -sfn ../../.agents/skills/reoclo-cli-usage .claude/skills/reoclo-cli-usage
```

On Windows, copy the directory instead of creating a link.

## Authoring conventions

Contributions welcome. Each skill should follow these rules:

- Directory name **must equal** the frontmatter `name` (letters, numbers, hyphens only).
- `description` starts with **"Use when …"** and lists *triggering conditions only*, never a workflow summary (a summarized workflow makes agents skip the body).
- Frontmatter uses only the six portable keys: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. `name` and `description` must not contain `<`, `>`, "anthropic", or "claude". CI checks these rules on every push (`scripts/validate-skills.mjs`).
- Keep skills concise (aim < 500 words); move heavy reference or reusable tools into sibling files.
- One excellent example beats many mediocre ones.
- This repository is **public**. Never include private hostnames, credentials, or internal-only infrastructure.

See Anthropic's [skill-authoring guidance](https://docs.claude.com/en/docs/claude-code/skills) for the full format.

## Updating

Edit a skill, commit, and push. Consumers pick up the change depending on how they
installed:

- CLI users: run `reoclo skills install` again to fetch the latest skills.
- Manual-clone users: pull this repository, then copy the updated files into
  `.agents/skills/`.

## License

MIT
