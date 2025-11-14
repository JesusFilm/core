# CodeRabbit Configuration

## Current Limitation

CodeRabbit does not currently have a built-in feature to automatically limit docstring coverage checks to only files changed in a pull request. By default, it checks the entire repository.

## Solution Implemented

We have configured CodeRabbit to **disable docstring checks** because:
1. It checks the entire repository, not just changed files
2. This causes false positives for files that haven't been modified in the PR
3. It doesn't align with the goal of only checking changed files

## Configuration Files

### `.coderabbit.yml`
This is the main CodeRabbit configuration file. Currently:
- Docstring checks are **disabled** (`reviews.finishing_touches.docstrings.enabled: false`)
- Path filters are available but empty by default
- Can be manually updated per PR if needed

### `.github/workflows/coderabbit-config.yml`
This workflow attempts to auto-update `.coderabbit.yml` with changed files when a PR is opened or updated.

**Note:** There's a timing issue: CodeRabbit runs when a PR is first opened, but this workflow runs after. So the first CodeRabbit review won't use the updated config. However, subsequent commits will trigger CodeRabbit again with the updated config.

## Alternative Approaches

### Option 1: Use ESLint for Docstring Checks (Recommended)
Create a custom ESLint rule or use an existing plugin that checks only changed files:

```yaml
# .github/workflows/docstring-check.yml
name: Docstring Check
on: [pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Get changed files
        id: changed
        uses: tj-actions/changed-files@v44
      - name: Check docstrings for changed files only
        run: |
          # Custom script to check only changed TypeScript files
          echo "${{ steps.changed.outputs.all_changed_files }}" | \
            grep -E '\.(ts|tsx)$' | \
            xargs -I {} npx eslint {} --rule 'jsdoc/require-jsdoc: error'
```

### Option 2: Custom Script
Create a script that uses git diff to check only changed lines:

```bash
#!/bin/bash
# scripts/check-docstrings.sh
git diff --name-only origin/main...HEAD | \
  grep -E '\.(ts|tsx)$' | \
  while read file; do
    # Check if file has docstrings
    # Custom logic here
  done
```

### Option 3: Manual Path Filters (Current Workflow)
The workflow will update `.coderabbit.yml` with changed files, but only affects subsequent CodeRabbit runs after the initial PR review.

## Enabling Docstring Checks Again

If you want to enable docstring checks (understanding they will check the entire repo), update `.coderabbit.yml`:

```yaml
reviews:
  finishing_touches:
    docstrings:
      enabled: true
  pre_merge_checks:
    docstrings:
      mode: error  # Options: off, warning, error
      threshold: 80
```

## References

- [CodeRabbit Configuration Docs](https://docs.coderabbit.ai/reference/configuration)
- [CodeRabbit Path Filters](https://docs.coderabbit.ai/reference/configuration#path_filters)

