---
name: sync-ce
description: Check for compound-engineering plugin updates and sync skills/agents into the project
user_invocable: true
trigger: when user wants to update or sync compound-engineering skills, check for CE updates, or asks about CE version
---

# Sync Compound Engineering Plugin

Sync the project's compound-engineering skills and agents with the latest version from the upstream repo.

## Steps

### 1. Check current snapshot version

Read the `.ce-version` file in the project root:

```bash
cat .ce-version 2>/dev/null || echo "No .ce-version file found"
```

If no `.ce-version` file exists, treat this as a first-time sync.

### 2. Fetch latest version from upstream

Use the GitHub API to get the latest version from the compound-engineering plugin repo:

```bash
curl -s https://api.github.com/repos/EveryInc/compound-engineering-plugin/releases/latest | jq -r '.tag_name'
```

If that returns null (no releases), fall back to checking the plugin.json on the default branch:

```bash
curl -s https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/.claude-plugin/plugin.json | jq -r '.version'
```

### 3. Compare versions

- If versions match: report "compound-engineering is up to date (vX.Y.Z)" and stop.
- If no `.ce-version` file exists: proceed with sync.
- If upstream is newer: report the version difference and proceed.

### 4. Sync files

Clone the repo to a temp directory and copy skills and agents:

```bash
TEMP_DIR=$(mktemp -d)
git clone --depth 1 https://github.com/EveryInc/compound-engineering-plugin.git "$TEMP_DIR"

# Copy skills
cp -r "$TEMP_DIR/plugins/compound-engineering/skills/"* .claude/skills/

# Copy agents
cp -r "$TEMP_DIR/plugins/compound-engineering/agents/"* .claude/agents/

# Clean up
rm -rf "$TEMP_DIR"
```

### 5. Update version file

Write the new version to `.ce-version`:

```bash
echo "<new-version>" > .ce-version
```

### 6. Report changes

Summarize what changed:
- Version bump (old -> new)
- New skills added (list any new directories in `.claude/skills/`)
- New agents added (list any new directories in `.claude/agents/`)
- Skills removed upstream (list any that exist locally but not in the new version)

Run `git status --short .claude/skills/ .claude/agents/ .ce-version` to show all changed files.

### 7. Do NOT commit

Leave all changes uncommitted so the user can review the diff before committing. Remind the user to review and commit when ready.
