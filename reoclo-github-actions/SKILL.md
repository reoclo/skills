---
name: reoclo-github-actions
description: Use when wiring Reoclo into GitHub Actions or Gitea Actions - running a command on a managed server, checking out a repository onto a server, logging in to a private registry on a server, or loading Secrets Manager values into the workflow environment.
---

# Reoclo GitHub Actions

Reoclo publishes four composable Actions for CI/CD. They run on GitHub Actions and on Gitea Actions. Each one authenticates with a Reoclo automation key (`rca_...`), which you set as the `REOCLO_API_KEY` repository secret. Reoclo audits every operation.

| Action | Use when |
|--------|----------|
| [`reoclo/run@v2`](https://github.com/reoclo/run) | run a shell command on a managed server |
| [`reoclo/checkout@v2`](https://github.com/reoclo/checkout) | clone or update a repository onto a server |
| [`reoclo/docker-auth@v2`](https://github.com/reoclo/docker-auth) | log in to a private container registry on a server |
| [`reoclo/load-secrets@v1`](https://github.com/reoclo/load-secrets) | load Secrets Manager values into the workflow environment |

## Deploy with a command

```yaml
- uses: reoclo/run@v2
  with:
    api_key: ${{ secrets.REOCLO_API_KEY }}
    server_id: ${{ secrets.REOCLO_SERVER_ID }}
    command: cd /srv/reoclo/myapp && docker compose pull && docker compose up -d
    timeout: 300
```

## Load secrets from the Reoclo Secrets Manager

`reoclo/load-secrets` resolves every secret project you grant the key. It exports each secret to `$GITHUB_ENV`, so later steps read the values as ordinary environment variables. Each secret key becomes an environment variable name. The action masks every value in the log.

```yaml
- name: Load secrets
  uses: reoclo/load-secrets@v1
  with:
    api_key: ${{ secrets.REOCLO_API_KEY }}
    # projects: production-api   # optional; the default loads every granted project

- name: Use them
  run: ./migrate.sh             # DB_URL, API_TOKEN, ... are now env vars
```

Grant the automation key each secret project on the project **Access** tab. The **Read secrets** operation alone grants no project.

## Rules

- Set the automation key as the `REOCLO_API_KEY` repository secret. Never inline a key.
- Scope each key to the least it needs. Use a separate key per environment.
- `reoclo/load-secrets` is an Action. `reoclo run` is the CLI equivalent for any CI system. Both read the same Secrets Manager.
- `reoclo/run@v2` runs a command on a server. It does not read the Secrets Manager. Its `env:` input passes CI values through as literals.
- The same YAML runs on Gitea Actions. Do not rewrite it.

## Reference

Full inputs, outputs, and examples: [GitHub Actions guide](https://docs.reoclo.com/guides/github-actions/).
