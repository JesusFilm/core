---
name: write-qa-requirements
description: Writes QA requirements for a Linear ticket based on branch changes. Use when asked to write, draft, or review QA requirements.
---

# Writing QA Requirements

**Applies when:** The user asks to write, draft, or review QA requirements for a Linear ticket.

When helping write QA requirements for a Linear ticket:

## Process

- Always fetch the Linear ticket first for full context
- Ask the user if there are QA comments on related/sibling tickets you can reference for format consistency
- Analyze the branch changes before writing scenarios (see Change Analysis below)
- Collaborate iteratively — draft, get feedback, refine before posting
- Post as a **comment** on the Linear ticket (not in the ticket body) unless told otherwise
- Ask the user if any scenarios are blocked by other work (e.g. "blocked until NES-1400 merges to main")
- Remind the user to attach screenshots or videos to the Linear ticket for complex UI changes

## Change Analysis

Before writing scenarios, systematically analyze what changed and what it could affect:

1. **Identify all changes on the branch:**
   - Run `git log main..HEAD --oneline` to see all commits
   - Run `git diff main..HEAD --stat` to see all changed files
   - Read the key changed files to understand what was modified

2. **Trace indirect impacts:**
   - Identify shared components, hooks, or utilities that were modified
   - Check where those shared pieces are imported/used across the codebase
   - Note any user-facing flows that consume the changed code, even if those flows weren't the target of the change

3. **Map entry points:**
   - List all places a user can trigger the changed functionality (e.g. different pages, roles, or navigation paths that reach the same component)

Use this analysis to inform both the acceptance scenarios and the regression scenarios.

## Format

- Use `## QA Requirements` as the top-level heading
- Scenario-based: `### Scenario N: Descriptive title`
- Each scenario has **Setup:** (step-by-step user actions) and **Verify:** (checkbox list)
- Chain setup steps with `→` arrows
- Use `- [ ]` markdown checkboxes for verify items
- One assertion per verify item — each checkbox tests exactly one thing
- Scenarios can reference earlier ones: "From Scenario 3 →" instead of repeating setup
- Blocked scenarios get a `> **Blocked until [ticket] merges to main**` callout above the setup

## Example

```markdown
## QA Requirements

### Scenario 1: Customizable toggle on template with undo/redo

**Setup:** Open the editor for a **template** journey → add/enable a chat widget (e.g. WhatsApp) so the details panel expands

**Verify:**

- [ ] "Needs Customization" switch is visible in the chat widget details panel
- [ ] Toggling the switch ON reflects the ON state in the UI
- [ ] Toggling the switch OFF reflects the OFF state in the UI
- [ ] Undo (Ctrl+Z) reverts the toggle to its previous state
- [ ] Redo (Ctrl+Shift+Z) re-applies the toggle change

### Scenario 2: Customizable toggle hidden on non-template

**Setup:** Open the editor for a **non-template** journey → add/enable a chat widget so the details panel expands

**Verify:**

- [ ] "Needs Customization" switch is NOT visible

### Scenario 3: Links display on publisher page

> **Blocked until NES-1400 merges to main**

**Setup:** Create a template journey with chat widgets → publish → navigate to publisher page

**Verify:**

- [ ] Links section displays all enabled chat widget URLs

### Scenario 4: Toggle persists after save

**Setup:** From Scenario 1 → save the journey → close and reopen the editor

**Verify:**

- [ ] The "Needs Customization" toggle retains the last saved state

---

## Regression Testing

> Verify existing functionality that touches the same components or flows was not broken by this change.

### Chat widget panel (non-customizable fields)

- [ ] Other fields in the chat widget details panel still display and save correctly
- [ ] Adding and removing chat widgets still works as before

### Journey editor general

- [ ] Undo/redo for other block types (e.g. text, image) still works correctly
- [ ] Saving and reopening a journey without chat widgets is unaffected
```

## Content

- Write from the user's perspective — what they see and do in the UI
- Never reference implementation details (mutations, field values, GraphQL, database columns)
- Use product terminology consistently (match whatever the user uses, e.g. "chat widget" not "chatButton")
- Setup steps should be specific about UI navigation (e.g. "on the publisher page, open the menu and click 'Copy to Team'"), not vague
- If setup requires a complex precondition, reference an earlier scenario's setup (e.g. "From Scenario 3's template →") rather than repeating all the steps
- Verify items test observable outcomes only
- Specify the User Role if relevant (e.g. "As a publisher", "As an editor")
- Include environment or timing notes when relevant (e.g. "requires staging environment", "wait for page to fully reload")

## Scenario Design

- Start with the happy path / core feature scenarios
- Group related interactions together (including scenarios that reference each other's setup) before moving to exclusion/negative cases
- Cover negative cases (feature hidden when conditions aren't met)
- End with duplication/persistence/edge-case scenarios
- Separate scenarios by distinct preconditions — don't overload one scenario
- If a feature only appears under certain conditions (e.g. template-only), test both the positive and negative case
- If a scenario has more than 6-7 verify items, consider splitting it into separate scenarios

## Regression Testing

After the acceptance scenarios, add a `## Regression Testing` section when the change analysis reveals indirect impacts:

- Group regression items by **user flow or page**, not by file changed
- Use the same checkbox format (`- [ ]`)
- Focus on flows that share modified components, hooks, or utilities
- Only include regression items where the change analysis found a real connection — don't pad with generic "check the whole app" items
- Skip this section if the change is fully isolated with no shared code paths
