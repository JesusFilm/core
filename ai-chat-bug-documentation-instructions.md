# AI Chat Bug Documentation Instructions

## When You Find a Bug:

### Step 1: Gather Information

Collect the following details:

1. **Bug Title** - Brief, descriptive summary
2. **Environment** - Where did this occur? (Staging, Preview, Local, Production)
3. **Severity Level**:
   - **Critical**: Feature completely broken, blocks release
   - **High**: Major functionality affected, should be fixed before release
   - **Medium**: Minor functionality affected, could be addressed post-launch
   - **Low**: Cosmetic or edge case, nice-to-have fix
4. **Blocks Release?** - Yes/No
5. **Reproduction Steps** - Exact steps to reproduce the bug
6. **Expected Behavior** - What should happen
7. **Actual Behavior** - What actually happens
8. **Additional Context** - Screenshots, console errors, browser info, etc.

### Step 2: Prompt Me to Create the Ticket

Use this format when prompting me:

```
Create an AI Chat bug ticket with the following details:

**Title:** [Brief bug description]
**Environment:** [Staging/Preview/Local/Production]
**Severity:** [Critical/High/Medium/Low]
**Blocks Release:** [Yes/No]

**Reproduction Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Additional Context:**
[Any screenshots, console errors, browser info, etc.]
```

### Step 3: I Will Create the Linear Ticket

I will:

- Create the ticket as a sub-issue of NES-417
- Use the naming pattern: `AI Chat Bug - [Your Bug Title]`
- Include all the structured information in the description
- Set appropriate priority and labels
- Set status to "todo" (not "triage")
- Link it back to the parent issue

### Example Prompt Format:

```
Create an AI Chat bug ticket with the following details:

**Title:** AI Chat Bug - Tool invocation buttons not responding on mobile Safari
**Environment:** Staging
**Severity:** High
**Blocks Release:** Yes

**Reproduction Steps:**
1. Open AI chat on iPhone Safari
2. Send message "Add a text block"
3. Try to click the image selection button that appears
4. Button does not respond to touch

**Expected Behavior:**
Button should be clickable and open image selection interface

**Actual Behavior:**
Button appears but does not respond to touch events

**Additional Context:**
- iOS 17.2, Safari
- Works fine on desktop Chrome
- Console shows no errors
```

## Additional Notes:

- If you're unsure about severity, err on the side of higher priority
- Include browser/device info when relevant
- Take screenshots when possible
- Note if the bug is consistent or intermittent
- Mention if there are any workarounds

## Severity Guidelines:

- **Critical**: App crashes, data loss, security issues, core functionality completely broken
- **High**: Major features don't work, significant user experience issues, blocks typical workflows
- **Medium**: Minor features affected, workarounds available, doesn't block core functionality
- **Low**: Cosmetic issues, edge cases, minor UX improvements

## Common AI Chat Bug Categories:

- Tool invocation failures
- UI responsiveness issues
- Form handling problems
- Feedback system not working
- Navigation/routing issues
- Authentication/permission problems
- Mobile-specific issues
- Cross-browser compatibility

This process ensures each bug is properly documented, categorized, and trackable for the team to prioritize and address.
