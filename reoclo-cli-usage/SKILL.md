---
name: reoclo-cli-usage
description: Use when operating Reoclo from the terminal with the `reoclo` CLI (or its `rc` alias) — signing in, listing/inspecting servers and apps, deploying, tailing logs, running commands or shells on servers, opening tunnels, managing env vars and domains, or scripting Reoclo with JSON/YAML output.
---

# reoclo-cli-usage: Operate Reoclo from the CLI

## Overview

`reoclo` is the command-line client for the Reoclo platform — manage servers, applications, deployments, logs, domains, and tunnels from your terminal. `rc` is a built-in short alias for `reoclo`. This skill covers using the **released** CLI; it is not about building the CLI itself.

## Install & update

```bash
curl -sSL https://get.reoclo.com/cli | bash     # macOS / Linux
brew install reoclo/tap/reoclo                   # Homebrew
reoclo upgrade                                   # self-update (--check to dry-run)
```

The binary is self-contained (no Node/Bun runtime needed).

## First run

```bash
reoclo login          # OAuth device flow (opens a browser; --no-browser to print the URL)
reoclo whoami         # confirm identity + active organization
reoclo org ls         # organizations your credential can access
reoclo org use <slug> # switch active organization
```

## Global flags (work on every command)

| Flag | Effect |
|------|--------|
| `-o, --output <text\|json\|yaml>` | output format — use `json` for scripting |
| `--quiet` | suppress non-error output |
| `--verbose` | log HTTP requests (tokens redacted) |
| `--no-color` | disable ANSI colors |
| `--profile <name>` | use a named profile (multi-account/multi-env) |

## Everyday commands

| Goal | Command |
|------|---------|
| List / inspect servers | `reoclo servers ls` · `reoclo servers get <idOrSlug>` · `reoclo servers metrics <idOrSlug>` |
| Server health / ports | `reoclo servers health <idOrSlug>` · `reoclo servers ports <idOrSlug>` |
| List / inspect apps | `reoclo apps ls` · `reoclo apps get <idOrSlug>` |
| Deploy / restart an app | `reoclo apps deploy <idOrSlug>` · `reoclo apps restart <idOrSlug>` |
| Deployment history | `reoclo deployments ls` · `reoclo deployments get <id>` · `reoclo deployments stages <id>` |
| Tail / search logs | `reoclo logs tail` · `reoclo logs search <query>` · `reoclo logs system <server>` |
| List log sources | `reoclo logs sources <server>` |
| Containers on a server | `reoclo servers containers <idOrSlug>` · `reoclo containers ls` · `reoclo containers logs <server> <name>` |
| Org summary | `reoclo dashboard` |

## Running commands & shells on a server

Runs over the server's runner — no inbound SSH needed.

```bash
reoclo exec <server> -- docker ps                       # use -- to separate the remote command
reoclo exec --shell bash <server> -- 'docker ps | wc -l'   # pipes/redirects/globs
reoclo exec --env-file .env.prod <server> -- ./migrate.sh  # inject env (masked in output)
reoclo shell <server>                                   # interactive shell
```

## Tunnels

Authenticated TCP/UDP tunnels through a server's runner (no SSH keys, no inbound firewall rules):

```bash
reoclo tunnel <server> -L 5432:5432                 # forward localhost:5432 → server's 127.0.0.1:5432
reoclo tunnel <server> -L 8080:internal-db:5432     # forward to a different remote host
reoclo tunnel <server> -R 8080:3000                 # reverse: server's :8080 → your localhost:3000
reoclo tunnel <server> -L 53:53 --udp               # UDP
reoclo tunnel ls                                    # live + historical sessions
reoclo tunnel close <tunnelId>
```

Tunnels survive transient runner reconnects (parked, then resumed).

## Env vars & domains

```bash
reoclo env ls                              # keys only — values are write-only via the API
reoclo env set KEY=value [KEY2=value2 ...]
reoclo env rm KEY

reoclo domains add <fqdn>                  # then:
reoclo domains verify <fqdn>               # TXT record to add
reoclo domains health <fqdn>               # DNS + TLS + uptime
```

## Scripting

`-o json` makes every command pipeable:

```bash
reoclo servers ls -o json | jq -r '.[] | select(.status=="active") | .slug'
reoclo apps ls -o yaml
```

## Profiles

```bash
reoclo profile ls
reoclo --profile staging login
reoclo --profile staging servers ls
```

## Shell completion

```bash
reoclo completion install        # detects your shell, writes + wires the completion file
reoclo completion bash           # or print a shim for bash | zsh | fish
```

## Tips

- Stuck on a subcommand? Every level supports `--help` (e.g. `reoclo servers --help`, `reoclo apps deploy --help`).
- Most commands accept either a server/app **id** or its **slug**.
- Automation credentials are limited to `apps deploy`, `apps restart`, `exec`, and `shell`; everything else needs an interactive org login.
