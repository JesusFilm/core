---
title: 'Publisher template customization field updates denied by field-level ACL'
date: 2026-07-08
category: security-issues
module: api-journeys
problem_type: security_issue
component: authentication
symptoms:
  - 'Publishers using quick-start templates received FORBIDDEN from journeyCustomizationFieldPublisherUpdate'
  - 'GraphQL error said user is not allowed to update journey customization field'
  - 'The mutation failed before reaching the template-state validation branch'
root_cause: missing_permission
resolution_type: code_fix
severity: medium
tags:
  - authorization
  - publisher-role
  - journey-template
  - customization-fields
  - graphql-mutation
  - quick-start-templates
related_components:
  - journeys-admin
  - local-template-dialog
---

# Publisher template customization field updates denied by field-level ACL

## Problem

Publisher users could manage templates through the broader Journey ACL, but quick-start template customization failed when the frontend called `journeyCustomizationFieldPublisherUpdate`. The field-specific guard rejected publishers who did not also have direct journey or team membership, so the mutation returned FORBIDDEN before updating the template customization description and derived fields.

## Symptoms

- Publishers saw quick-start template customization fail with GraphQL `FORBIDDEN`.
- The error path was `journeyCustomizationFieldPublisherUpdate`.
- The message was `user is not allowed to update journey customization field`.
- Non-template validation was not the cause: the mutation checks `canManageTemplateField` before checking `journey.template`.

## What Didn't Work

- Checking only whether `context.user.roles` was available did not explain the bug. `api-journeys` attaches the user's roles to GraphQL context, so the publisher role was present.
- Looking only at `journeyAcl(Action.Update, ...)` was incomplete. That ACL already allows publishers to update templates, but this mutation uses the narrower `canManageTemplateField` helper.
- Treating the issue as a local-template-only frontend problem missed the backend failure point. The GraphQL mutation was the authoritative guard and had to permit the publisher role directly.

## Solution

Align `canManageTemplateField` with the global-template publisher policy: publishers can update customization fields on global templates, even when they do not have direct journey or team membership. Local or team-owned templates still require the user to have the correct journey or team access.

Before:

```ts
const isLocalTemplate = journey.template === true && journey.teamId !== 'jfp-team'

if (isLocalTemplate && (hasJourneyRole || hasTeamRole)) return true

if (user.roles?.includes('publisher') === true && (hasJourneyRole || hasTeamRole)) return true

return false
```

After:

```ts
const isGlobalTemplate = journey.template === true && journey.teamId === 'jfp-team'
const isLocalTemplate = journey.template === true && !isGlobalTemplate

if (isGlobalTemplate && user.roles?.includes('publisher') === true) return true

if (isLocalTemplate && (hasJourneyRole || hasTeamRole)) return true
```

Add direct ACL helper coverage for:

- publisher access to global templates
- publisher denial on local templates when the user has no journey or team access
- publisher and non-publisher access on local templates when the user has the correct journey or team access
- non-publisher denial when the user has no journey or team access

## Why This Works

The failing mutation uses `canManageTemplateField`, not the whole-journey `journeyAcl` update/manage path. The previous helper required publisher users to also have direct journey/team access, which blocked publisher-only access to global quick-start templates.

The fix puts the publisher global-template allow rule before the local-template membership rule. Publishers can update global templates without direct membership. For local or team-owned templates, publishers and non-publishers both need the correct journey or team access. Users without journey or team access still return false.

## Prevention

- When fixing authorization bugs, trace the exact mutation or query called by the frontend. Similar-looking ACL helpers may not be on the execution path.
- Keep field-level ACL helpers aligned with the precise resource scope. A broader resource-level policy may still need a narrower global-vs-local template contract.
- Add tests for role-only access when a role is meant to grant capability without direct resource membership, and denial coverage when that role-only access is intentionally scoped.
- Keep local-vs-global template scope explicit in tests. The `jfp-team` boundary is a known drift point from local template work.

## Related Issues

- `docs/solutions/security-issues/journey-acl-read-authorization-bypass-invite-requested-role.md` - prior Journey ACL bug showing why helpers should validate explicit roles and capabilities.
- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` - local/global template boundary and mutation-routing patterns.
- `docs/solutions/security-issues/google-sync-missing-integration-ownership-guard.md` - adjacent GraphQL authorization lesson: backend mutations remain authoritative even when the frontend filters choices.
