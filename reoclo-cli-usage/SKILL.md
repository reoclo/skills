---
name: reoclo-cli-usage
description: >-
  Use when operating Reoclo from the terminal with the `reoclo` CLI (or its `rc`
  alias): signing in; deploying a linked git repository with `reoclo up`;
  creating and managing servers, apps, stacks (definition groups), containers,
  volumes, and deployments; build pools and builds; test servers (test pools, test files, test runs); cloud server power controls; the managed proxy;
  tailing and searching logs; running commands or shells on servers; tunnels; env vars;
  domains (including publishing DNS) and verified root domains; secrets, secret bindings, and `run`; uptime
  monitors, status pages and their components, and incidents; alerts and
  notification channels; git repos (scan, link), providers, and container registries;
  scheduled operations; audit logs; raw API requests; installing reoclo agent
  skills; and scripting Reoclo with JSON/YAML output.
---

# reoclo-cli-usage: Operate Reoclo from the CLI

## Overview

`reoclo` is the command-line client for the Reoclo platform. It manages servers, applications, containers, deployments, logs, domains, secrets, monitoring, and more from your terminal. `rc` is a built-in short alias for `reoclo`. This skill covers using the released CLI; it is not about building the CLI itself.

Every command level supports `--help` (for example `reoclo servers --help`, `reoclo apps deploy --help`). Use it to see the exact flags for any command. This skill lists what exists and how the pieces fit; `--help` is the source of truth for flags.

## Install and update

```bash
curl -sSL https://get.reoclo.com/cli | bash     # macOS / Linux
brew install reoclo/tap/reoclo                   # Homebrew
reoclo upgrade                                   # self-update (--check to dry-run)
```

The binary is self-contained (no Node or Bun runtime needed).

## First run

```bash
reoclo login          # OAuth device flow (opens a browser; --no-browser to print the URL)
reoclo whoami         # confirm identity + how many organizations are granted
reoclo org ls         # organizations your credential can access
reoclo org current    # the organization commands in this directory will target
reoclo logout         # end the session and remove stored credentials (defaults to the active profile)
```

Sign in once per machine and profile. The CLI refreshes its own session, including the short-lived token it mints for `--org`, so a session in use stays valid. Run `reoclo login` only after a command has failed on authentication: exit code 3 with `not authenticated`, or a message that the session could not be refreshed and names `reoclo login`. Never run it before a task, on a schedule, or because a token might be old. Each login starts a new session, and a login started by an agent waits on a browser approval that nobody may be watching.

Org-scoped commands need an explicit organization. There is no persistent "active org" to switch. Select one per invocation with the global `--org <slug>` flag or `$REOCLO_ORG`, or bind the directory once with `reoclo init` (writes a `.reoclo` file). With none of the three set, an org-scoped command fails and tells you how to select one.

## Global flags (work on every command)

| Flag | Effect |
|------|--------|
| `-o, --output <text\|json\|yaml>` | output format; use `json` for scripting |
| `--quiet` | suppress non-error output |
| `--verbose` | log HTTP requests (tokens redacted) |
| `--no-color` | disable ANSI colors |
| `--profile <name>` | use a named profile (multi-account/multi-env); equivalent to `$REOCLO_PROFILE` |
| `--org <slug>` | run against this organization for one invocation; wins over `$REOCLO_ORG` and `.reoclo` |

## Command map

Every top-level command group. Drill in with `<group> --help`.

| Group | Purpose |
|-------|---------|
| `up` | deploy a linked repository in one step: creates its stack or app on the first run, deploys it on every run |
| `login` / `logout` / `whoami` | authenticate, sign out, show identity |
| `org` | list granted organizations (`ls`); print this directory's target (`current`) |
| `profile` | manage named profiles (accounts / environments) |
| `keyring` | move stored tokens between config.json and the OS keyring |
| `servers` | list, inspect, rename servers; health, ports, uptime, reboot; cloud `power` |
| `proxy` | a server's managed proxy: reconcile it now |
| `containers` | fleet containers: list, inspect, logs, restart, recreate, scale, labels |
| `volumes` | Docker volumes on a server: list, inspect, create, delete, prune |
| `apps` | list, inspect, create (and deploy with `--deploy`), deploy, restart apps; manage deployment `config` |
| `groups` | definition groups (stacks): create from a repo's compose file, coordinated compose deployments, one-shot tasks, cancel; `stacks` is an alias |
| `deployments` | deployment history, details, stages, build/runtime logs, cancel |
| `build-pools` / `builds` | build servers: pools (persistent or ephemeral), cost estimates, builders; build history, logs, cancel |
| `test-pools` / `tests` | test servers: pools of machines that run test files; enable a repo, init and validate test files, run (`--wait` gates CI), runs, logs, cancel, rerun |
| `logs` | tail, search, systemd journal, sources, storage stats and usage |
| `env` | application environment variables (write-only values) |
| `domains` | register, verify, publish DNS for, and health-check domains |
| `verified-domains` | verified root domains: claim, prove ownership, list attached resources |
| `secrets` | secret projects (create, rename, duplicate), keys, reveal, set, import, inject, bind to apps/stacks |
| `run` | resolve granted secrets and run a command with them as env vars |
| `monitors` | uptime monitors |
| `status-pages` | public status pages and their `components` |
| `incidents` | incidents and incident updates |
| `alerts` | alert instances, ack/resolve, mutes, routing, catalog |
| `channels` | notification channels (Slack, Discord, and so on) |
| `repos` | mirrored git repositories: list, branches, scan for deployable services, link from a provider |
| `providers` | git providers (GitHub, Gitea): connect, sync, status |
| `registry` | container registry credentials; docker login/logout on a server |
| `schedule` | scheduled operations: create, list, pause, trigger, runs |
| `audit` | organization audit log |
| `dashboard` | organization summary (counts, recent activity, deploys) |
| `exec` / `shell` | run one-shot commands or an interactive shell on a server |
| `tunnel` | TCP/UDP tunnels through a runner, saved tunnels kept up by a daemon, agent approvals |
| `checkout` / `deploy` | CI helpers: clone a repo on a server, external deploy sync |
| `init` | link this project to an organization and install reoclo skills |
| `skills` | install, list, and update reoclo agent skills without re-running `init` |
| `api` | raw authenticated API request (escape hatch for endpoints without a command) |
| `sync` | refresh this profile's cached capabilities from the server (no re-login) |
| `mcp` | start the stdio MCP server |
| `completion` | shell completion for bash, zsh, fish |
| `upgrade` | self-update the CLI |

Most commands accept either a resource **id** or its **slug**. Slugs are the recommended, stable identifier and are what tab completion offers.

The collection verbs are interchangeable everywhere: `ls` and `list` are the same command, and so are `rm`, `delete`, and `remove`. Whichever spelling you try, the group answers.

## Servers

```bash
reoclo servers ls                          # slug, name, hostname, IP, status, runner
reoclo servers get <idOrSlug>              # full record
reoclo servers metrics <idOrSlug>          # latest CPU / RAM / disk from the runner
reoclo servers health <idOrSlug>           # health state
reoclo servers ports <idOrSlug>            # listening ports + firewall
reoclo servers uptime <idOrSlug>           # connectivity uptime (--hours)
reoclo servers containers <idOrSlug>       # containers running on this server
reoclo servers set-slug <idOrSlug> <slug>  # rename the slug
reoclo servers reboot <idOrSlug>           # OS reboot via the runner (--yes to skip prompt)
reoclo servers rm <idOrSlug>               # decommission (--yes to skip prompt; refused while apps are assigned)
```

## Adding and hardening servers

`add` and `harden` run Reoclo's setup script on the server as root, over your own SSH access. The runner cannot do this: its sudo access covers only systemctl, reboot and firewall tools. Log in as `root` or as a user with passwordless sudo. Needs CLI 0.99.0 or newer.

```bash
reoclo servers add --ssh root@203.0.113.9 --name web-1  # set up a fresh Ubuntu 22.04+ or Debian 12+ server, harden it, wait for it to connect
reoclo servers add --ssh root@host --check   # dry run: print the plan, change nothing
reoclo servers add --name web-1              # print a command to paste (holds a single-use token valid for one hour)
reoclo servers add --name web-1 --cloud-init # print first-boot user data instead
reoclo servers harden <server>               # harden a connected server, connecting as its admin user at its recorded IP
reoclo servers harden <server> --check       # dry run
reoclo servers harden <server> --print       # print the command to paste
```

Useful flags: `--port`, `-i <key>`, `--user <admin>`, `--firewall-allow 8080,9000:9100/udp`, `--trusted-ip <ip>`, `--ssh-only` (harden), `--no-harden` (add), `--name` (add, required without `--ssh`), `--hostname` (add), `--ssh <[user@]host>` (harden, when the recorded IP or user is wrong).

Hardening turns off root and password SSH logins and enables a firewall that allows only SSH, 80 and 443. `harden` warns about other listening ports first; keep them open with `--firewall-allow`. Without a terminal, both commands need `--yes`. Only add `--yes` once the user has agreed to the change.

Over MCP, `create_server_setup_script` returns the script for someone to run, `plan_server_hardening` returns the ports the firewall would block and the command to run, and `decommission_server` needs the server's slug as confirmation.

## Server power (cloud)

For cloud-managed servers, drive the provider's power controls. These work only where the server has a cloud provider and credentials configured, and only for operations that provider supports (check with `capabilities`). This is separate from `reoclo servers reboot`, which reboots the OS through the runner.

```bash
reoclo servers power capabilities <server>   # what this provider supports
reoclo servers power status <server>         # live power state
reoclo servers power on <server>
reoclo servers power off <server> --yes      # hard power cut; --yes skips the prompt
reoclo servers power shutdown <server>       # graceful shutdown
reoclo servers power reboot <server>         # provider reboot (not the runner reboot)
reoclo servers power reset <server>          # hard reset
```

Add `--wait` to block until the server reaches its target state (for example `reoclo servers power off <server> --wait`), giving up after `--wait-timeout` seconds (default 120). `off`, `shutdown`, `reboot`, and `reset` prompt for confirmation unless you pass `--yes`.

## Running commands and shells on a server

Runs over the server's runner. No inbound SSH needed.

```bash
reoclo exec <server> -- docker ps                          # use -- to separate the remote command
reoclo exec --shell bash <server> -- 'docker ps | wc -l'   # pipes/redirects/globs
reoclo exec --env-file .env.prod <server> -- ./migrate.sh  # inject env (masked in output)
reoclo shell <server>                                      # interactive shell
```

`exec` waits for the command to finish. `--timeout <seconds>` (default 600) is both the command timeout and the basis for how long the CLI waits for the answer, so a long migration or build is no longer abandoned after 30 seconds. A signed-in `exec` with a timeout over 60 seconds goes through the streams host, which keeps Cloudflare from cutting the request off at about 100 seconds.

## Managed proxy

A server's managed proxy re-syncs on a periodic reconcile tick. Ask it to reconcile now instead of waiting:

```bash
reoclo proxy reconcile <server>        # re-sync the managed proxy immediately
```

## Containers (fleet)

Cross-server container operations. Target a container by `<server> <name>`.

```bash
reoclo containers ls                              # fleet containers (filters via --help)
reoclo containers refresh                         # trigger a fleet snapshot refresh
reoclo containers inspect <server> <name>         # config + env (masked by default)
reoclo containers logs <server> <name>            # fetch or follow (--follow)
reoclo containers restart <server> <name>
reoclo containers recreate <server> <name>        # new env/labels/ports (see --help)
reoclo containers scale <server> <name> <n>       # scale a Swarm service
reoclo containers labels <server> <name>          # patch labels (see --help)
```

## Deploy a repository with `reoclo up`

`reoclo up` deploys a linked git repository in one step (CLI 0.93.0+). Run it inside a git checkout and it finds the linked repository from the `origin` remote, or pass `--repo <owner/name>`.

```bash
reoclo repos link acme/storefront        # once, if the repo is not linked yet
reoclo up --server web1                  # first run: creates the stack or app, then deploys
reoclo up                                # later runs: deploys what the first run created
```

- First run: `--server` is required. A repo with a compose file becomes a stack (one member per service; `--compose-file` picks the file when there are several). A repo with only a Dockerfile becomes an app (`--service` picks it when there are several). `--branch` sets the branch to scan and deploy, `--name` the stack name.
- Later runs find the stack built from the repo's compose file, or the app built from the repo that is not in a stack, and deploy it. Several matches: pass `--compose-file` or `--service`.
- It waits for the deployment by default and exits non-zero when it fails (`--no-wait` returns once triggered, `--wait-timeout` sets the limit, default 600 s; `--force-recreate` recreates unchanged containers).
- `--compose-file` looks only for a stack and `--service` only for an app. A first run without `--server` exits 2.

To see what a repo can deploy before creating anything: `reoclo repos scan <repo>`.

## Applications and deployments

```bash
reoclo apps ls                         # incl. a CI column: the app's CI gate state
reoclo apps get <idOrSlug>
reoclo apps create --name <name> --server <server> ...   # create an application (see below)
reoclo apps deploy <idOrSlug>          # trigger a deployment (--ref <git-ref>, --wait, --force-recreate)
reoclo apps restart <idOrSlug>         # restart the backing container
reoclo apps logs <idOrSlug>            # container logs for the app
reoclo apps config --help              # manage deployment config

reoclo deployments ls                  # organization deployment history (--app to filter)
reoclo deployments get <id>            # full details incl. build stages
reoclo deployments stages <id>         # pipeline stages with status and duration
reoclo deployments logs <id> --build   # build stage logs
reoclo deployments cancel <id>         # cancel a running deployment (the step replacing services finishes first)
```

For `deployments get` and `deployments logs`, the deployment id alone is enough. `--app` stays accepted for scripts that already pass it.

### Create an application

`apps create` registers an application on a server. Pass `--name` and `--server`, plus what the app builds from:

```bash
reoclo apps create --name api --server web1 --repo acme/api --deploy-branch main
reoclo apps create --name cache --server web1 --docker-image redis:7
reoclo apps create --name stack --server web1 --repo acme/web \
    --compose-file deploy/compose.staging.yml --compose-service web \
    --deploy-branch staging --require-ci --bind staging-secrets
```

- `--server` and `--repo` take a name, slug, or id.
- `--build-pack` is `dockerfile`, `docker_compose`, or `docker_image`. `--compose-file` and `--compose-service` imply `docker_compose`, and `--docker-image` implies `docker_image`. A `--build-pack` that contradicts them is refused.
- `--deploy-branch <branch>` sets the branch that deploys. `--require-ci` deploys a push only after its CI checks pass. `--no-auto-deploy` turns off deploy on push.
- `--bind <project>` binds a secret project by name or id at creation. Repeat it for more than one project.
- `--deploy` deploys the app right after creating it (CLI 0.93.0+). `--wait`, `--ref` and `--wait-timeout` need `--deploy`; `--wait` exits non-zero when the deployment fails.

```bash
reoclo apps create --name api --server web1 --repo acme/api --deploy --wait
```

### Deploy a specific ref

`apps deploy --ref <git-ref>` deploys a branch, tag, or commit SHA once, without changing the app's configured deploy branch. The credential needs the `applications:edit_config` permission to pass `--ref`.

```bash
reoclo apps deploy api --ref feat/login --wait
```

## Stacks (definition groups)

A stack is a definition group: one docker-compose file, one member application for each service, one coordinated deployment. `reoclo stacks` is an alias for `reoclo groups`.

```bash
reoclo groups ls                              # kind, member count, CI gate, last deploy
reoclo groups get <group>                     # incl. deploy branch, CI gate, compose path
reoclo groups create --repo <repo> --server <server> --deploy --wait   # stack from a repo's compose file (CLI 0.93.0+)
reoclo groups deploy <group> --wait           # coordinated deploy of every managed member (--force-recreate)
reoclo groups redeploy <group> <service>      # redeploy one compose service only (--force-recreate)
reoclo groups run <group> <service> --wait    # run a one-shot task member (compose run --rm)
reoclo groups task-runs <group>               # one-shot run history (status, exit code)
reoclo groups deployments <group>             # coordinated deployment history
reoclo groups deployment <group> <numberOrId> --logs   # stages, per-service slices, log tails
reoclo groups cancel <group> [numberOrId]     # cancel a running stack deployment (default: the newest one in progress)
```

`groups create` scans the repo, makes one member per service in the compose file (`--compose-file` when there are several; `--branch`, `--name`), and with `--deploy` deploys the new stack. A compose service that names an image runs that image; every other service builds from the repo.

`--wait` polls until the deployment or task finishes and exits non-zero on failure (`--wait-timeout` seconds, default 600). A one-shot task is a compose service under `profiles:` (a migration, for example). Deploy the stack one time before you run a task: the run uses the env files from the last stack deployment.

`--force-recreate` recreates containers even when the image and configuration did not change. Without it, a compose deploy leaves unchanged services running. Use it to restart a stack from a clean state, or to redeploy one unchanged service. On `groups redeploy` the recreate applies only to the named service.

## Logs

```bash
reoclo logs tail --server <server> --source container --name <name>   # fetch or follow (--follow)
reoclo logs search <query>            # across servers and sources
reoclo logs system <server>           # systemd journal
reoclo logs sources <server>          # containers + systemd units available
reoclo logs stats                     # tenant-wide storage totals + per-server
reoclo logs usage                     # storage and retention
```

## Env vars

```bash
reoclo env ls                              # keys only; values are write-only via the API
reoclo env set KEY=value [KEY2=value2 ...]
reoclo env rm KEY
```

A successful `env set` does not redeploy the application. The new values apply on the next deploy.

## Domains

```bash
reoclo domains ls
reoclo domains get <fqdnOrId>
reoclo domains add <fqdn>                  # then:
reoclo domains verify <fqdnOrId>           # TXT record to add
reoclo domains dns <fqdnOrId>              # DNS records + verification status
reoclo domains health <fqdnOrId>           # DNS + TLS + uptime
reoclo domains publish <fqdnOrId>          # write the expected DNS records to Cloudflare
reoclo domains rm <fqdnOrId>               # decommission
```

`domains publish` enables DNS publishing for the domain if it is not on yet, plans the changes, prints them (action, type, name, current, new), and applies them. Add `--proxied` to proxy new records through Cloudflare (the orange cloud). When every expected record is already correct it says so and changes nothing. It exits 1 when publishing is blocked, fails, or is still running after the wait, and `reoclo domains dns` shows where things stand. Run `domains dns` first to preview the records.

Root-domain ownership is separate from per-FQDN registration. `verified-domains` claims a root (for example `example.com`) and proves ownership with one TXT record. Domains you then add under a verified root verify automatically.

```bash
reoclo verified-domains ls
reoclo verified-domains get <rootOrId>
reoclo verified-domains resources <rootOrId>   # domains, apps, status pages under this root
reoclo verified-domains add <rootDomain>       # claim + start verification
reoclo verified-domains verify <rootOrId>      # the TXT record that proves ownership
reoclo verified-domains rm <rootOrId>
```

## Secrets and run

Secrets live in projects. `run` injects the secrets a credential is granted into a child process as env vars. `run --env-file` and `secrets inject` render a `.env` template of `op://` references, resolving each value from Reoclo (a drop-in for 1Password's `op inject`, and the `op` binary is not needed).

```bash
reoclo secrets projects --help         # manage secret projects (ls, create, update, duplicate)
reoclo secrets projects create <name> --description "Staging stack"   # create a project
reoclo secrets ls --project <name>     # list keys in a project
reoclo secrets get <key> --project <name>   # reveal a value
reoclo secrets set <key> --project <name>   # create or update
reoclo secrets rm <key> --project <name>
reoclo secrets import --help           # import from an external source
reoclo secrets inject -i app.env.tpl -o app.env   # render an op:// template to a file (op inject drop-in)

reoclo run -- ./my-app                 # run with granted secrets injected as env vars
reoclo run --env-file app.env.tpl -- ./my-app   # inject only the op:// refs a template names
```

An `op://` reference is `op://<project>/<item>/<field>`: it maps to the secret `<field>` in project `<project>` (`<item>` is ignored). `secrets inject` accepts an automation key or a login session. `run` needs an automation key.

### Bind secrets to apps and stacks

`bind` links a secret project to an application or a stack, so the project's secrets inject as env vars at deploy time:

```bash
reoclo secrets bind infra --app api                     # every key in the project
reoclo secrets bind storage --group portfolio \
    --key MINIO_ROOT_USER --key MINIO_ROOT_PASSWORD     # selected keys, into a stack
reoclo secrets bind storage --app public-web \
    --key MINIO_ROOT_USER=S3_ACCESS_KEY_ID              # rename on bind

reoclo secrets bindings --app <app>                     # list bindings + key selections
reoclo secrets unbind <bindingId> --app <app>           # a unique id prefix is enough
```

Exactly one target: `--app <idOrSlug>` or `--group <idOrSlug>`. `--key <KEY[=NEW_NAME]>` is repeatable (omit it to inject every key), `--prefix <PREFIX_>` prefixes un-renamed keys, and `--scope` is `production`, `preview`, or `both` (default `production`). A stack-level binding injects into **every member**. To give one member only part of a project, bind that member with `--app` and `--key`. Bindings apply on the next deploy.

## Monitoring: monitors, status pages, incidents

```bash
reoclo monitors ls | get <id> | create | update <id> | pause <id> | resume <id> | rm <id>
reoclo status-pages ls | get <id> | create | update <id> | rm <id>
reoclo incidents ls | get <id> | create | update <id> | add-update <id>
```

`reoclo incidents update <id> --state resolved` resolves an incident. Use `--help` on `create` / `update` for the field flags.

Status pages are built from components. Manage them under `status-pages components`:

```bash
reoclo status-pages components ls <page>
reoclo status-pages components get <page> <component>
reoclo status-pages components add <page>              # name, order, visibility, checks
reoclo status-pages components update <page> <component>
reoclo status-pages components pin <page> <component>  # override the derived status
reoclo status-pages components unpin <page> <component>
reoclo status-pages components reorder <page> <components...>
reoclo status-pages components rm <page> <component>
```

## Alerts and notification channels

```bash
reoclo alerts list                     # alert instances (filters via --help)
reoclo alerts get <instance-id>        # with severity history
reoclo alerts ack <instance-id>
reoclo alerts resolve <instance-id>
reoclo alerts history                  # recently resolved
reoclo alerts mute [alert-code]        # mute a code for a resource (omit code to mute all)
reoclo alerts mutes                    # manage mutes
reoclo alerts unmute <mute-id>
reoclo alerts routing --help           # manage alert routing
reoclo alerts catalog --help           # manage the alert catalog

reoclo channels list
reoclo channels kinds                  # available provider kinds
reoclo channels create <kind>          # for example: slack, discord
reoclo channels test <id>              # send a test notification
reoclo channels enable <id> | disable <id> | update <id> | delete <id>
```

## Git repos, providers, and registries

```bash
reoclo repos ls | get <repo> | branches <repo>   # ls --search <q> filters by name
reoclo repos scan <repo> --ref main      # what the repo can deploy: compose files, services, build packs, ports, images
reoclo repos link <owner/name>           # make a connected provider mirror the repo (GitHub App selection or Gitea sync), then wait (--no-wait, --wait-timeout)

reoclo providers ls | get <provider>
reoclo providers connect <provider>    # start OAuth (opens browser)
reoclo providers sync <provider>       # queue a repo sync
reoclo providers status <provider>     # sync status
reoclo providers test <provider>       # connection / refresh-token health

reoclo registry ls | get <id> | create | update <id> | rm <id>
reoclo registry test                   # test a connection (ad-hoc)
reoclo registry login <serverId>       # docker login on a managed server (CI)
reoclo registry logout <serverId>
```

`repos link` takes `owner/name` or a git remote URL and needs the tenant admin role. When no connected provider can see the repo, it exits 5 and says how to grant access (Reoclo GitHub App access on GitHub, or `reoclo providers connect` for Gitea).

## Build servers

```bash
reoclo build-pools ls | get <pool>        # build pools: persistent (registered servers) or ephemeral
reoclo build-pools create ...             # see --help: persistent from build servers, or ephemeral Hetzner
reoclo build-pools set <pool> ...         # update; --server replaces the whole builder list
reoclo build-pools builders <pool>        # ephemeral builders with lifecycle state
reoclo builds ls | get <id> | logs <id>   # build history
reoclo builds cancel <id>                 # cancel a queued or running build
```

## Test servers

Test servers run the tests a repository declares in `ci/reoclo/tests/<name>.yml` on machines Reoclo creates in the organization's own AWS or Hetzner account. They are switched on per organization; when they are off the commands answer 404.

```bash
reoclo test-pools ls | get <pool> | machines <pool>      # pools by slug or id
reoclo test-pools create --name CI --credential hetzner-main --location fsn1 --server-type cx33 \
  --max-machines 4 --budget 25 --var NODE_ENV=test --secret API_TOKEN=...
reoclo test-pools edit <pool> --max-machines 6 --unset-var NODE_ENV    # the slug and provider cannot change
reoclo test-pools rm <pool> --yes                        # needs no live machines or active runs

reoclo tests enable --repo acme/web          # organization admins; asks first, --yes skips; disable stops new runs
reoclo tests ls --repo acme/web --refresh    # test files on the default branch, with their validation result
reoclo tests init unit --pool ci             # writes a starter ci/reoclo/tests/unit.yml (--force overwrites)
reoclo tests validate                        # checks every ci/reoclo/tests/*.yml with the API; exit 1 if any is invalid
reoclo tests run unit --repo acme/web --ref main --wait
reoclo tests runs --test unit --state failed # newest first
reoclo tests show 12                         # a run by id or number, with its jobs
reoclo tests logs 12 --job build --follow    # --job takes the job key; --follow polls until the run ends
reoclo tests cancel 12 | rerun 12
```

- `--credential` takes a cloud credential id or label, and the pool's provider comes from it. `--secret KEY=VALUE` is stored encrypted and never shown again; `get` lists variable names only. Names starting with `REOCLO_` are reserved.
- Enabling tests lets anyone who can push to the repository run commands on machines in the organization's cloud account. Enable it only when the user asked for it and trusts the repository.
- `--repo` takes `owner/name` or an id and defaults to the `origin` remote of the current checkout. `tests init` and `tests validate` read the repository the command runs in.
- `tests run --wait` follows the run, prints each job and step as it changes with the job logs, and exits `0` when the run passes, `1` when it fails and `2` when it errors or is cancelled. With `-o json` it prints progress to stderr and the final run to stdout. Ctrl+C asks whether to cancel; answering no stops waiting and leaves the run going (exit `130`).
- Use `tests logs <run> --follow` to watch a run started elsewhere. Logs are kept for 30 days.

In CI, authenticate with a machine token (`REOCLO_MACHINE_TOKEN`); an automation key cannot call these commands. Gate a pipeline on the exit code:

```yaml
# GitHub Actions
- name: Run tests on Reoclo
  run: reoclo tests run unit --repo acme/web --ref "$GITHUB_REF_NAME" --sha "$GITHUB_SHA" --wait
  env:
    REOCLO_MACHINE_TOKEN: ${{ secrets.REOCLO_MACHINE_TOKEN }}
```

```yaml
# Woodpecker
steps:
  - name: reoclo-tests
    image: debian:bookworm-slim
    environment:
      REOCLO_MACHINE_TOKEN:
        from_secret: reoclo_machine_token
    commands:
      - apt-get update && apt-get install -y --no-install-recommends curl ca-certificates
      - curl -sSL https://get.reoclo.com/cli | bash
      - reoclo tests run unit --repo acme/web --ref "$CI_COMMIT_BRANCH" --sha "$CI_COMMIT_SHA" --wait
```

## Scheduled operations

```bash
reoclo schedule ls
reoclo schedule get <id>
reoclo schedule create --help          # cron-style operations
reoclo schedule update <id> | pause <id> | resume <id> | rm <id>
reoclo schedule trigger <id>           # run now
reoclo schedule runs <id>              # list runs
reoclo schedule run <id> <runId>       # show one run
```

## Audit and dashboard

```bash
reoclo audit ls                        # organization audit log (filters via --help)
reoclo dashboard                       # org summary: counts, recent activity, deploys
```

## Tunnels

Authenticated TCP/UDP tunnels through a server's runner (no SSH keys, no inbound firewall rules):

```bash
reoclo tunnel <server> -L 5432:5432                 # forward localhost:5432 to server's 127.0.0.1:5432
reoclo tunnel <server> -L 8080:internal-db:5432     # forward to a different remote host
reoclo tunnel <server> -R 8080:3000                 # reverse: server's :8080 to your localhost:3000
reoclo tunnel <server> -L 53:53 --udp               # UDP
reoclo tunnel ls                                    # live + historical sessions
reoclo tunnel close <tunnelId>
```

Tunnels survive transient runner reconnects (parked, then resumed).

### Saved tunnels

A saved tunnel has a name and a background tunnel daemon on the person's machine keeps it up, so it outlives the terminal:

```bash
reoclo tunnel add prod-db --server prod-1 --target 5432               # forward tunnel on 127.0.0.1
reoclo tunnel add grafana --server prod-1 --kind https --target 3000  # HTTPS hostname on this machine
reoclo tunnel status                                                  # state of every saved tunnel
reoclo tunnel down prod-db                                            # stop it, keep it saved
reoclo tunnel daemon status
```

Add `--via tailscale` or `--via auto` to connect straight over the tailnet instead of the Reoclo relay; `reverse` tunnels always use the relay. `reoclo tunnel share <name> --tailnet` puts a `tcp` or `https` tunnel on the tailnet for other devices, and `reoclo tunnel unshare <name>` takes it off.

### Tunnels for agents (MCP)

The local MCP server (`reoclo mcp`) has five tunnel tools that drive the daemon: `list_local_tunnels`, `open_tunnel`, `close_tunnel`, `tunnel_status` and `save_tunnel`. The hosted server does not have them.

- `open_tunnel` with `server` and `target` opens an ad-hoc forward tunnel: a free port on 127.0.0.1, no hostname, never saved, closed after `ttl_minutes` (default 60, at most 480). It waits up to 30 seconds, then returns `endpoint`, `address`, `expires_at` and, for an HTTPS tunnel, `ca_path`. Use the tunnel, then call `close_tunnel`. With `name` it brings up a saved tunnel instead.
- A person must approve: saving, editing or bringing up a reverse tunnel or one bound on all interfaces (`bind_public`); sharing a tunnel on the tailnet or stopping a share; adding, changing or removing a hostname (every HTTPS tunnel has one); and trusting the local CA. Closing a tunnel, ad-hoc tunnels, and plain tcp or udp tunnels need no approval.
- A call that needs approval waits up to 60 seconds. If it returns `status: "pending_approval"` with an `id`, tell the person what you are waiting for. They answer with `reoclo tunnel approvals`, `reoclo tunnel approve <id>` or `reoclo tunnel deny <id>`. Do not retry, and do not work around the approval with a shell command. Ask again only after they answer. Status `denied` means they said no.
- Approvals expire after 10 minutes. You cannot approve, deny or change daemon settings; the daemon refuses those requests from an agent.
- If a tool error says the sign-in expired, ask the person to run `reoclo login`.

## Profiles

Each profile holds its own credential, so profiles let you switch between accounts and environments (for example prod vs. staging). Organization selection is separate and per-invocation (`--org`, `$REOCLO_ORG`, or the `.reoclo` binding; see First run).

```bash
reoclo profile ls                          # list configured profiles
reoclo login --profile staging             # create / authenticate a profile
reoclo profile use staging                 # set the default profile persistently
```

Select a profile per-invocation two ways, both honored by every command:

```bash
reoclo --profile staging servers ls        # global flag (works before or after the subcommand)
REOCLO_PROFILE=staging reoclo servers ls   # env var (handy to export for a shell session)
```

Precedence: `--profile` flag, then `$REOCLO_PROFILE`, then the active profile from `reoclo profile use`.

`reoclo sync` refreshes the profile's cached capabilities from the server without a re-login. Run it when the server has granted the credential new permissions and a command still reports them missing.

## Keyring

By default the CLI stores tokens in the OS keyring. On a machine without one, and for logins under CI, it keeps both the access and refresh tokens in `config.json`, readable only by your user. Move them if you need to:

```bash
reoclo keyring status
reoclo keyring migrate    # config.json -> OS keyring, refresh token included (--profile, else all)
reoclo keyring export     # OS keyring -> config.json
```

## CI and automation credentials

Automation keys are scoped to a fixed command set: `apps deploy`, `apps restart`, `exec`, `shell`, `checkout`, `registry login`, `registry logout`, `deploy sync`, `run`, and `secrets inject`. Everything else needs an interactive org login or a machine token (`REOCLO_MACHINE_TOKEN`), which is what `tests run --wait` uses in a pipeline.

CI helpers:

```bash
reoclo checkout <serverId>             # clone or update a git repo on a managed server
reoclo deploy sync --help              # external deploy sync
reoclo registry login <serverId>       # docker login on a managed server
```

## Agent skills and guides

The reoclo MCP server serves these skills as guides, so an agent connected to it needs no copies in the repository. `list_guides` names them with their sections, `get_guide` returns a whole guide or one section, and each guide is also an MCP prompt. The local server updates with the CLI and the hosted one with each deploy.

`reoclo init` links a project to an organization and does not install skills. To keep copies for an agent that does not use the MCP server, the `skills` group manages them:

```bash
reoclo skills install    # pick skills, detect agent harnesses (`skills init` is an alias)
reoclo skills list       # skills available in the reoclo/skills repo + which are installed
reoclo skills update     # refresh already-installed skills to the latest, in place
```

Skills install to `.agents/skills/<name>/` (read by Codex, Gemini, opencode, and Cursor) with a `.claude/skills/<name>` link for Claude Code. `skills update` only refreshes what is already installed and never adds new skills.

## MCP server

```bash
reoclo mcp --org <slug>                # start the stdio MCP server (for MCP-capable agents)
```

Like every org-scoped command, `mcp` needs an organization or it exits immediately with a selection error. In an MCP client config, put `--org <slug>` in the command arguments. Starting it from a directory with a `.reoclo` binding also works. The server keeps its session fresh for as long as it runs, including under `--org`, and serves the reoclo guides (see Agent skills and guides). It also has the tunnel tools described under Tunnels for agents (MCP).

## Raw API access

When no command covers an endpoint, `reoclo api` sends an authenticated request and prints the JSON response (in the spirit of `gh api`). It rides the same profile auth and base URL as every other command, and `{tenant}` in the path expands to the current organization's tenant id.

```bash
reoclo api '/tenants/{tenant}/secret-projects'           # GET is the default
reoclo api '/tenants/{tenant}/servers/' -q page=2        # -q key=value appends query params
reoclo api <path> -f name=web-2 -f cores=4               # JSON body fields; body implies POST
reoclo api <path> -X PATCH --raw-field note=123          # --raw-field keeps the value a string
reoclo api <path> -X PUT --data @body.json               # raw JSON body (@file, or - for stdin)
```

`-f` auto-types `true`, `false`, `null`, and numbers. `--data` cannot combine with `-f`/`--raw-field`.

## Scripting

Most commands honor `-o json|yaml` for piping. Two things to know:

- **List commands emit one JSON object per line (NDJSON), not a JSON array.** Filter each line directly with `jq -r '.field'`, not `jq '.[]'` (which yields nothing).
- **`reoclo secrets get` prints the bare secret value** and ignores `-o`, so it composes with `$(...)`.
- Output written to a pipe or a file arrives in full, so `reoclo api <path> | jq` receives the whole document.

```bash
reoclo servers ls -o json | jq -r 'select(.status=="active") | .slug'
reoclo apps ls -o yaml
VALUE=$(reoclo secrets get DB_PASSWORD --project prod)   # raw value, not JSON
```

## Shell completion

```bash
reoclo completion install        # detects your shell, writes + wires the completion file
reoclo completion bash           # or print a shim for bash | zsh | fish
```

Resource completion is cache-only: it reads slugs from the local cache that `reoclo servers ls` / `reoclo apps ls` populate. Run any `ls` once on a fresh install to warm it.

## Tips

- Stuck on a subcommand? Every level supports `--help`.
- Most commands accept either a resource id or its slug.
- Use `-o json` for anything you script; text output is for humans.
