---
name: merge-branch
description: Merge a specified branch into the current branch and resolve conflicts. Handles schema.graphql regeneration, app codegen, and manual conflict resolution. Use when the user says "merge branch X", "merge X", or asks to merge any branch into the current branch.
---

# Merge Branch

Merge a target branch into the current branch and resolve any conflicts.

## Usage

The user will specify the branch to merge, e.g. "merge main".

## Steps

Run each step sequentially. Stop and report if an unrecoverable error occurs.

### 1. Stash uncommitted changes

```bash
git stash --include-untracked
```

Note whether the stash was created (output says "Saved working directory") or skipped ("No local changes to save"). Only pop the stash in step 8 if one was created.

### 2. Fetch and merge the branch

```bash
git fetch origin
git merge origin/<branch>
```

If the merge completes with no conflicts, skip to step 3 (install deps & prisma), then step 9 (pop stash).

### 3. Install dependencies and generate Prisma clients

```bash
pnpm i
nx run-many -t prisma-generate
```

### 4. Identify and categorize conflicts

```bash
git diff --name-only --diff-filter=U
```

Categorize each conflicting file:

| Category | Pattern | Resolution |
|----------|---------|------------|
| API schema | `apis/<api>/schema.graphql` | Regenerate (step 5) |
| App generated | `apps/<app>/__generated__/**` | Codegen (step 6) |
| Lib generated | `libs/**/__generated__/**` | Codegen (step 6) |
| Non-generated | Everything else | Manual (step 7) |

### 5. Resolve API schema.graphql conflicts

Process in this exact order:

#### a. Static APIs first

For any of these with conflicts: `api-analytics`, `api-journeys-modern`, `api-users`, `api-media`, `api-languages`:

```bash
git checkout --theirs apis/<api>/schema.graphql
git add apis/<api>/schema.graphql
nx generate-graphql <api>
git add apis/<api>/schema.graphql
```

#### b. Clear api-gateway conflict (prerequisite for api-journeys)

If `apis/api-gateway/schema.graphql` has conflicts, accept theirs to unblock api-journeys:

```bash
git checkout --theirs apis/api-gateway/schema.graphql
git add apis/api-gateway/schema.graphql
```

Skip this step if api-gateway has no conflicts.

#### c. api-journeys (requires running services)

If `apis/api-journeys/schema.graphql` has conflicts:

1. **Ensure `nf start` is running.** Check terminal files in the terminals folder (`head -n 10 *.txt`) or run:

   ```bash
   pgrep -f 'nf start'
   ```

   If not running, start it in background:

   ```bash
   nf start
   ```

   Wait for services to be ready (look for listening messages in the terminal output).

2. **Regenerate:**

   ```bash
   git checkout --theirs apis/api-journeys/schema.graphql
   git add apis/api-journeys/schema.graphql
   nx generate-graphql api-journeys
   git add apis/api-journeys/schema.graphql
   ```

#### d. Regenerate api-gateway

If api-gateway had conflicts (step 5b), regenerate it now that all subgraph schemas are resolved. This requires `nf start` to be running (started in 5c if needed, otherwise start it now using the same check).

```bash
nx generate-graphql api-gateway
git add apis/api-gateway/schema.graphql
```

### 6. Resolve generated file conflicts in apps and libs

For each app with generated file conflicts (`apps/<app>/__generated__/**`):

```bash
nx codegen <app>
git add apps/<app>/__generated__/
```

Known apps with codegen: `journeys`, `journeys-admin`, `watch`, `resources`.

For each lib with generated file conflicts (`libs/**/__generated__/**`), determine the nx project name and run:

```bash
nx codegen <lib-project>
git add libs/<path>/__generated__/
```

Known libs with codegen: `journeys-ui` (`libs/journeys/ui`), `shared-gql` (`libs/shared/gql`).

### 7. Resolve non-generated file conflicts

For remaining conflicting files:

- Read both sides of each conflict
- Retain intended functionality from both sides
- Remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
- Stage resolved files with `git add`

### 8. Complete the add

```bash
git add -A
```

### 9. Pop stash

If a stash was created in step 1, pop it:

```bash
git stash pop
```

## Error Handling

- If `git stash pop` results in conflicts, inform the user so they can resolve them manually.
- If `nx generate-graphql` or `nx codegen` fails, show the error output to the user.
- If `nf start` fails or services don't come up, report the error and suggest checking ports/configs.
