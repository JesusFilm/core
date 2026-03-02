# Implementation Workflow

Steps to implement a Linear issue from start to PR.

## Steps

1. Fetch the issue from Linear using the provided issue ID or identifier (e.g., GRA-123). Use the Linear MCP **get_issue** tool.
2. If the issue has a parent issue, fetch the parent and read its description to understand the full context (why, constraints, current state, scope).
3. If the description references a spec file (e.g., `Spec: specs/<feature>.md`), read that file for additional detail.
4. Set the issue status to **In Progress** in Linear.
5. Create a branch using the issue’s **gitBranchName** from the get_issue response.
6. Implement the change as described in the issue and parent context.
7. Run `pnpm run build` to verify the build passes. Do not commit code that doesn't build.
8. Commit using [Conventional Commits](https://www.conventionalcommits.org/): `type: description` and include the Linear issue ID in the footer, e.g. `Refs: ISSUE-ID` or in the body.
9. Self-review the diff against main. Check for:
   - Unused imports or references to non-existent functions
   - CLAUDE.md convention violations
   - Empty catch blocks or swallowed errors
   - Over-engineering or unnecessary abstractions
   - Fix any **Critical** issues found before proceeding.
10. Push the branch to origin.
11. Create a draft PR with `gh pr create --draft`. Include in the PR body:
    - Summary of changes
    - Verification section: `pnpm run build` result, files changed
    - Link to the Linear issue

## Rules

- Do not amend existing commits. Create new commits to fix issues.
- Do not force push.
- If the build fails, fix it before committing.
- If anything fails (build, tests, or other CI checks), report the error clearly.
