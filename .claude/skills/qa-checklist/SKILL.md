---
name: qa-checklist
description: Generate a QA acceptance criteria and regression testing checklist based on the current branch's changes, then update the Linear ticket. Use when work is ready for QA review.
argument-hint: [LINEAR-ISSUE-ID]
disable-model-invocation: true
---

# QA Checklist Generator

Generate a QA-friendly acceptance criteria and regression testing checklist for the current branch.

## Steps

1. **Get the Linear issue**: Fetch the issue using the provided ID (e.g., NES-1297) to understand the original requirements and acceptance criteria.

2. **Analyze the branch changes**:
   - Run `git log main..HEAD --oneline` to see all commits on this branch.
   - Run `git diff main..HEAD --stat` to see all changed files.
   - Read the key changed files to understand what was modified.

3. **Identify affected areas**: Determine all user-facing flows that were changed or could be impacted. Consider:
   - Direct changes (new features, modified behavior)
   - Indirect impacts (shared components, hooks, or utilities that were modified)
   - Entry points where users can trigger the changed functionality

4. **Generate the checklist**: Write a checklist with two sections:

   **Acceptance Criteria** — What the feature should do (based on the issue requirements):
   - Written as checkbox items (`- [ ]`)
   - Non-technical language a QA tester can follow
   - Focused on observable behavior, not implementation details

   **Regression Testing** — What else should be manually verified to ensure nothing broke:
   - Grouped by user flow or page
   - Written as checkbox items (`- [ ]`)
   - Include any special testing notes (e.g., timing, environment requirements)
   - Cover all entry points where shared/modified code is used

5. **Show the checklist to the user** for review before updating Linear.

6. **Update the Linear ticket**: Once approved, replace the Acceptance Criteria section in the issue description with the new checklist. Keep the rest of the description unchanged.

## Important

- Write for a QA team — avoid technical jargon, code references, and implementation details.
- Use checkbox format (`- [ ]`) for all items so they can be checked off.
- Do NOT add progress summaries or implementation notes to the ticket.
- Do NOT add the checklist as a comment — update the description directly.
- Always show the checklist to the user for review before updating Linear.
