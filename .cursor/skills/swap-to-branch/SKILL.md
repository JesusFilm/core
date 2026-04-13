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

1. **Checkout the branch**

First try checking out the local branch:

```bash
git checkout <branch>
```

If it fails (branch doesn't exist locally), fetch and check out from origin instead:

```bash
git fetch origin
git checkout -b <branch> origin/<branch>
```

Then skip steps 2 and 3 since the branch is already up to date from origin.

2. **Fetch from origin** *(skip if checked out from origin above)*

```bash
git fetch origin
```

3. **Pull latest changes** *(skip if checked out from origin above)*

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
- If `pnpm i` or `prisma-generate` fails, show the error output to the user.
