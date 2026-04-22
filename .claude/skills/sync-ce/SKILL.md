---
name: sync-ce
description: Check for compound-engineering plugin updates and sync skills/agents into the project
user_invocable: true
trigger: when user wants to update or sync compound-engineering skills, check for CE updates, or asks about CE version
---

# Sync Compound Engineering Plugin

Check if the project's compound-engineering snapshot is outdated and optionally sync to the latest version via a PR.

## Phase 1: Version Check (always runs)

### 1. Read current snapshot version

```bash
cat .ce-version 2>/dev/null || echo "NOT_FOUND"
```

If `NOT_FOUND`, tell the user no `.ce-version` file exists and this will be treated as a first-time sync.

### 2. Fetch latest upstream version

Try the GitHub API for releases first:

```bash
curl -s https://api.github.com/repos/EveryInc/compound-engineering-plugin/releases/latest | jq -r '.tag_name'
```

If that returns `null`, fall back to plugin.json on the default branch:

```bash
curl -s https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/.claude-plugin/plugin.json | jq -r '.version'
```

### 3. Compare and report

- If versions match: report "compound-engineering is up to date (vX.Y.Z)" and **stop here**.
- If upstream is newer or no `.ce-version` exists: report the version difference.

### 4. Show brief diff preview

Clone the upstream repo to a temp directory and compare against the project snapshot:

```bash
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --quiet https://github.com/EveryInc/compound-engineering-plugin.git "$TEMP_DIR"
```

Then produce a brief summary:
- List new skills (directories in upstream `skills/` not in `.claude/skills/`)
- List removed skills (directories in `.claude/skills/` that came from CE but are no longer upstream)
- List new agents (directories in upstream `agents/` not in `.claude/agents/`)
- List removed agents
- Count of modified files (files that exist in both but differ)

Present this as a short summary table, not a full diff. Keep it under 20 lines.

Clean up the temp directory after generating the summary — do NOT delete it yet if the user might confirm.

### 5. Ask for confirmation

Ask the user: "Do you want to sync to vX.Y.Z? This will create a new branch and PR."

**If the user declines or says no: clean up the temp directory and stop.**

**If the user confirms: proceed to Phase 2.**

## Phase 2: Sync and PR (only after user confirms)

### 6. Identify the user

Get the git user's name and GitHub username:

```bash
git config user.name
gh api user --jq '.login'
```

Derive the user's initials from their git username for the branch name. Use 2-letter uppercase initials.

### 7. Create a worktree branch

The branch name MUST follow the project's naming convention:

```
DD-MM-XX-chore-sync-ce-vX-Y-Z
```

Where:
- `DD-MM` is the current day and month (2-digit each)
- `XX` is the user's 2-letter uppercase initials
- `vX-Y-Z` is the upstream version with dots replaced by hyphens

Create a git worktree for this branch:

```bash
git worktree add ../sync-ce-worktree -b <branch-name> main
```

### 8. Copy updated files in the worktree

Working inside the worktree directory:

```bash
# Copy skills
cp -r "$TEMP_DIR/plugins/compound-engineering/skills/"* ../sync-ce-worktree/.claude/skills/

# Copy agents
cp -r "$TEMP_DIR/plugins/compound-engineering/agents/"* ../sync-ce-worktree/.claude/agents/

# Update version file
echo "<new-version>" > ../sync-ce-worktree/.ce-version
```

Clean up the temp directory:

```bash
rm -rf "$TEMP_DIR"
```

### 9. Commit and push

Working inside the worktree:

```bash
cd ../sync-ce-worktree
git add .claude/skills/ .claude/agents/ .ce-version
git commit -m "chore: sync compound-engineering to vX.Y.Z"
git push -u origin <branch-name>
```

### 10. Create PR and assign

Create a PR using the GitHub CLI, assigned to the person who ran the command:

```bash
gh pr create \
  --title "chore: sync compound-engineering to vX.Y.Z" \
  --assignee "<github-username>" \
  --body "$(cat <<'PREOF'
## Summary
- Syncs compound-engineering skills and agents from upstream plugin repo
- Version bump: vOLD -> vNEW
- New skills: <list or "none">
- Removed skills: <list or "none">
- New agents: <list or "none">
- Removed agents: <list or "none">

## Test plan
- [ ] Verify skills load correctly in local Claude Code session
- [ ] Verify Dispatch-spawned tasks can discover the updated skills

🤖 Generated with `/sync-ce`
PREOF
)"
```

### 11. Clean up worktree

```bash
cd -
git worktree remove ../sync-ce-worktree
```

### 12. Report

Tell the user:
- The PR URL
- The branch name
- That they are assigned as the reviewer
- Remind them to switch back to their original branch if needed
