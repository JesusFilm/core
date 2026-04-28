---
name: sync-ce
description: Check for compound-engineering plugin updates and sync skills/agents into the project
user_invocable: true
trigger: when user wants to update or sync compound-engineering skills, check for CE updates, or asks about CE version
---

# Sync Compound Engineering Plugin

Check if the project's compound-engineering snapshot is outdated and optionally sync to the latest version via a PR.

A `.ce-manifest` file in the project root tracks which skills and agents were synced from CE. This is used to distinguish CE files from project-owned files, and to handle deletions when CE removes a skill or agent upstream.

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

Resolve the version from step 2 to a specific git tag. Clone that tag (not `main`) so the scan and copy operate on a deterministic artifact:

```bash
TEMP_DIR=$(mktemp -d)
git clone --depth 1 --branch "v<upstream-version>" --quiet https://github.com/EveryInc/compound-engineering-plugin.git "$TEMP_DIR"
```

If no matching tag exists, fall back to cloning `main` but warn the user that the clone is not pinned to a specific release.

Read the existing `.ce-manifest` to know which skills and agents are CE-owned. Then compare:

- List new skills (in upstream but not in manifest)
- List removed skills (in manifest but no longer upstream)
- List new agents (in upstream but not in manifest)
- List removed agents (in manifest but no longer upstream)
- Count of modified files (files that exist in both but differ)

Present this as a short summary table, not a full diff. Keep it under 20 lines.

Do NOT delete the temp directory yet — it's needed if the user confirms.

### 5. Security scan of incoming changes

This is a **best-effort heuristic screen**, not a deterministic security gate. It may miss obfuscated or novel patterns. Do not over-trust a clean scan — the user should still review the PR diff before merging.

Scan all new and modified files in the upstream `skills/` and `agents/` directories for potentially malicious content. Check for:

- **Shell commands that exfiltrate data**: `curl`, `wget`, `nc`, `ssh` commands that send data to unknown hosts (not github.com or known package registries)
- **Environment variable access**: reading `GITHUB_TOKEN`, `AWS_SECRET`, API keys, or other credentials
- **File system access outside the project**: paths like `~/.ssh`, `~/.aws`, `~/.config`, `/etc/passwd`, or any absolute paths outside the working directory
- **Encoded/obfuscated content**: base64-encoded strings, hex-encoded payloads, or heavily obfuscated code
- **Network requests to suspicious domains**: any URLs that aren't well-known dev tool domains
- **Destructive commands**: `rm -rf /`, `git push --force`, `DROP TABLE`, or similar

For each flag, report:

- The file path
- The line or content that triggered the flag
- A severity level: `HIGH` (likely malicious), `MEDIUM` (suspicious, needs review), `LOW` (probably fine but unusual)

Present the results as a summary. If there are any `HIGH` severity flags, **warn the user strongly** and recommend they do not proceed without manual review. If only `LOW`/`MEDIUM`, note them but don't block.

If no flags are found, report "No suspicious content detected."

### 6. Ask for confirmation

Present the diff summary and security scan results together, then ask the user: "Do you want to sync to vX.Y.Z? This will create a new branch and PR."

**If the user declines or says no: clean up the temp directory and stop.**

**If the user confirms: proceed to Phase 2.**

## Phase 2: Sync and PR (only after user confirms)

### 7. Identify the user

Get the git user's name and GitHub username:

```bash
git config user.name
gh api user --jq '.login'
```

Derive the user's initials from their git username for the branch name. Use 2-letter uppercase initials.

### 8. Create a worktree branch

The branch name MUST follow the project's naming convention:

```
00-00-XX-chore-ce-sync-vX-Y-Z
```

Where:

- `XX` is the user's 2-letter uppercase initials
- `vX-Y-Z` is the upstream version with dots replaced by hyphens (e.g. `v2-45-0`)

> **Do not change this branch format without updating CI.** The `-chore-ce-sync-` segment is matched by `.github/workflows/autofix.ci.yml` to skip the lint job on sync PRs. Without that skip, autofix.ci reformats CE-managed files and adds a 150+ file commit on every sync. If you change this format, update the workflow's `if:` condition in lockstep.

Create a git worktree for this branch:

```bash
git worktree add ../sync-ce-worktree -b <branch-name> main
```

### 9. Delete removed CE files

Read the `.ce-manifest` from the worktree. For each skill and agent listed in the manifest, check if it still exists in the upstream repo. If not, delete it from the worktree:

```bash
# For each skill in manifest [skills] section that is NOT in upstream skills/
rm -rf ../sync-ce-worktree/.claude/skills/<removed-skill>

# For each agent in manifest [agents] section that is NOT in upstream agents/
rm -f ../sync-ce-worktree/.claude/agents/<removed-agent>
```

Only delete files listed in the manifest — never touch files that aren't CE-owned.

### 10. Copy updated files in the worktree

**Important:** CE-owned files (those listed in `.ce-manifest`) are treated as read-only. Any local modifications to CE-owned files will be overwritten on sync. If you need to customize a CE skill, create a separate project-owned skill instead.

```bash
# Copy skills (overwrites CE-owned files)
cp -r "$TEMP_DIR/plugins/compound-engineering/skills/"* ../sync-ce-worktree/.claude/skills/

# Copy agents (overwrites CE-owned files)
cp -r "$TEMP_DIR/plugins/compound-engineering/agents/"* ../sync-ce-worktree/.claude/agents/

# Copy LICENSE to both directories
cp "$TEMP_DIR/plugins/compound-engineering/LICENSE" ../sync-ce-worktree/.claude/skills/CE-LICENSE
cp "$TEMP_DIR/plugins/compound-engineering/LICENSE" ../sync-ce-worktree/.claude/agents/CE-LICENSE

# Update version file
echo "<new-version>" > ../sync-ce-worktree/.ce-version
```

### 11. Write fresh manifest

Generate a new `.ce-manifest` from the upstream repo contents:

```
# Compound Engineering manifest — tracks which files were synced from upstream.
# Auto-generated by /sync-ce. Do not edit manually.
# version: <new-version>

[skills]
<list each skill directory name from upstream, one per line, sorted>

[agents]
<list each agent file path relative to agents/, one per line, sorted>
```

Write this to `../sync-ce-worktree/.ce-manifest`.

Clean up the temp directory:

```bash
rm -rf "$TEMP_DIR"
```

### 12. Commit and push

Working inside the worktree:

```bash
cd ../sync-ce-worktree
git add .claude/skills/ .claude/agents/ .ce-version .ce-manifest
git commit -m "chore: sync compound-engineering skills and agents"
git push -u origin <branch-name>
```

### 13. Create PR and assign

Create a PR using the GitHub CLI, assigned to the person who ran the command:

```bash
gh pr create \
  --title "chore: sync compound-engineering skills and agents" \
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

### 14. Clean up worktree

```bash
cd -
git worktree remove ../sync-ce-worktree
```

### 15. Report

Tell the user:

- The PR URL
- The branch name
- That they are assigned to the PR
- Remind them to switch back to their original branch if needed
