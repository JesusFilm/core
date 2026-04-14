---
name: swap-to-branch
description: Switch to a specified git branch and set up the local environment. Fetches and pulls from origin, installs dependencies, and generates Prisma clients. Use when the user says "swap to branch X", "switch branch", "checkout branch", or asks to change to a different git branch.
---

# Swap to Branch

Switch to a target git branch and bring the local environment up to date.

## Usage

The user will specify the target branch, e.g. "swap to branch feat/my-feature".

## Steps

Run each step sequentially. Stop and report if any step fails.

1. **Fetch from origin**

```bash
git fetch origin
```

2. **Checkout the branch**

Try checking out the branch:

```bash
git checkout <branch>
```

This succeeds if the branch exists locally **or** if a matching remote-tracking branch exists (git auto-creates a local tracking branch).

If it fails, check the error:

- **Uncommitted changes** — stop and inform the user. Suggest `git stash` or committing first.
- **Branch not found** — the branch doesn't exist locally. Try creating it from the remote:

```bash
git checkout -b <branch> origin/<branch>
```

If this also fails, the branch doesn't exist on the remote either. Stop and inform the user that the branch was not found locally or on origin.

If the branch was freshly created from origin, skip step 3.

3. **Pull latest changes** *(skip if created from origin above)*

```bash
git pull origin <branch>
```

4. **Install dependencies**

```bash
pnpm i
```

5. **Generate Prisma clients**

```bash
nx run-many -t prisma-generate
```

## Error Handling

- If `git checkout` fails because of uncommitted changes, inform the user and suggest stashing (`git stash`) or committing first.
- If the branch is not found locally or on origin, inform the user that the branch name may be incorrect.
- If `pnpm i` or `prisma-generate` fails, show the error output to the user.
