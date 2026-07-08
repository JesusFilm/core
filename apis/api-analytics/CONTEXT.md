# Plausible Provisioning

The measurement-provisioning context (deployable: `api-analytics`). A thin GraphQL federation subgraph sitting **directly on top of [Plausible Analytics](https://plausible.io)' own database** — its Prisma schema is *introspected* from Plausible, not owned. Its sole job is to provision the Plausible **Sites**, **Goals**, and **Shared Links** that the rest of the platform (chiefly `api-journeys`) reports traffic against. It exposes one write and no reads.

## Language

### Measurement

**Site**:
A Plausible tracking site — the unit that traffic, goals, and dashboards hang off. Uniquely identified by its `domain`. Every Site created here is given an `owner` Membership and, by default, one Shared Link.
_Avoid_: property, project, dashboard, tenant

**domain**:
A Site's unique key. Despite the name it is **not a web URL** — for platform-created sites it is a synthetic identifier (`api-journeys-journey-<id>`, `api-journeys-team-<id>`, `api-journeys-template-<id>`). It is the string events are reported against, and the natural key `siteCreate` de-duplicates on.
_Avoid_: url, hostname, website, address

**Goal**:
A Plausible conversion goal attached to a Site — a named custom event (`eventName`) to be counted. Supplied as a list at creation; back-fillable across all sites via the `sites-add-goals` script.
_Avoid_: conversion, event, metric, target

**Shared Link**:
An unguessable public link (`slug`) that exposes a Site's dashboard without authentication — the mechanism by which journeys surfaces analytics to users who have no Plausible account. Created named `api-analytics`; suppressed per-site with `disableSharedLinks`.
_Avoid_: public link, embed link, dashboard link, share URL

**Membership**:
The join between a Plausible User and a Site, carrying a `role` (`owner`, `admin`, `viewer`). The caller who creates a Site becomes its `owner`.
_Avoid_: access, permission, collaborator, seat

### Identity

**Plausible User**:
The identity this context authenticates — a row in **Plausible's own `users` table**. It is *not* an `api-users` / Firebase user; it is a separate identity space local to the Plausible database and must never be joined to a Firebase UID.
_Avoid_: user (unqualified), account, Firebase user, currentUser (that is only the context field)

**API Key**:
The only credential. A Bearer token resolved to a Plausible User by looking up its 6-character prefix, then confirming a SHA-256 hash computed with Plausible's own algorithm and `PLAUSIBLE_SECRET_KEY_BASE`. There is no other sign-in.
_Avoid_: token, secret, bearer token, session

**isAuthenticated / isAnonymous**:
The two auth scopes, both derived from the resolved Plausible User: *authenticated* = a user row **with** an email; *anonymous* = a user row with a **null** email. Note this is a different notion of "anonymous" from the Users context's Anonymous User.
_Avoid_: loggedIn, guest

> **Two traps worth stating plainly.**
> 1. **`users` here is Plausible's table, not the Users context.** The `currentUser` on every request is a *Plausible* identity keyed by an API key — a distinct identity space. Never conflate it with a Firebase UID or an `api-users` User.
> 2. **This context owns none of its schema.** The tables (`sites`, `goals`, `shared_links`, `site_memberships`, `api_keys`, `users`, …) are Plausible's, pulled in with `nx prisma-introspect prisma-analytics` — there are **no migrations here**. Numeric Plausible ids (`BigInt`) are surfaced to the graph as `String`.
