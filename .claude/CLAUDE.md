# Project Instructions

This is an **Nx monorepo** (TypeScript). Apps live in `apps/`, GraphQL APIs in `apis/`, shared libraries in `libs/`, Cloudflare Workers in `workers/`, infrastructure in `infrastructure/`.

## Path-Scoped Rules

`.claude/rules/**/*.md` contains rules scoped by file path (see the `paths` frontmatter in each file). Before modifying a file, check whether a rule matches its path and follow it. If a rule conflicts with the request, flag the conflict and propose a compliant alternative before proceeding.

## Code Style

- Use early returns to reduce nesting.
- Use descriptive variable and function names.
- Define TypeScript types; avoid `any`.

## Documented Solutions

`docs/solutions/` — documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Check when implementing or debugging in documented areas.

## Branch Naming

When creating a branch without a Linear issue, it must match this pattern:

```regex
/^(\(HEAD detached at pull\/[0-9]+\/merge\)|(00-00-RB-.*)|stage|main|([0-9]{2}-[0-9]{2}-[A-Z]{2}-(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)-[a-z0-9-]+[a-z0-9])|(feature\/[0-9]{2}-[0-9]{2}-[A-Z]{2}-[a-z0-9-]+[a-z0-9])|[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|[a-z]+\/[a-z0-9]{2,4}-[0-9]+-[a-z0-9-]+|(cursor\/.*))$/g
```

Preferred format: `username/ticket-id-short-description` — all lowercase, no uppercase in suffix.
