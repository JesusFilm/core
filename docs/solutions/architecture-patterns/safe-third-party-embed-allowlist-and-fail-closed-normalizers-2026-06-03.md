---
title: 'Safe third-party embed pattern: env allowlist + fail-closed provider normalizers'
date: 2026-06-03
category: architecture-patterns
module: api-journeys-modern
problem_type: architecture_pattern
component: service_object
severity: medium
related_components:
  - database
  - tooling
applies_when:
  - Embedding third-party URL content (Canva, YouTube, Google Slides, Mux, Loom, etc.)
  - Especially when the embed renders on a public / unauthenticated surface
tags:
  - embed
  - oembed
  - iframe
  - allowlist
  - normalizer-registry
  - fail-closed
  - canva
  - youtube
---

# Safe third-party embed pattern: env allowlist + fail-closed provider normalizers

## Context

NES-1706 needed to let users paste a Canva / YouTube / Google Slides link (or attach a Mux upload) and embed it on the public `TemplateGalleryPage`. The earlier naive approach (store whatever URL the user pasted, iframe it later) produced broken iframes — users pasted URL shapes that don't actually embed (the NES-1660 trap). The pattern below validates and normalizes at save time so a non-embeddable URL is rejected up front, never stored.

Implementation lives in `apis/api-journeys-modern/src/schema/templateGalleryPage/media/`.

## Guidance

**1. One env-driven allowlist as the single host gate.** `TEMPLATE_LIBRARY_EMBED_HOSTS` is a Doppler JSON object mapping a label to one bare hostname per entry (`{"canva":"canva.com","canvaLink":"canva.link",...}`), parsed at boot by `parseEmbedHostsEnv.ts`. It is the *only* host gate — no code-default seeding. To disable a host (or kill a misbehaving provider), remove it from Doppler; no deploy. The host name must be wired into `infrastructure/locals.tf` so the ECS task receives it, and the key must exist in each env's Doppler config before `terraform apply`.

**2. Registry of self-contained provider specs.** Each provider exports an `EmbedNormalizerSpec` (`{ hosts, normalize }`). `linkValidate.ts` builds the normalizer dispatch table from a single `SPECS` array, so a provider's host list can't drift from its handler; adding a provider is one file. (We dropped an earlier `ShortLinkBlocklistDomain` gate — it was a cross-service `prismaMedia` read that only worked inside api-media and violated the no-interop rule; the allowlist is sufficient.)

**3. Fail-closed normalizers.** Each `normalize(url)` validates against the live provider and returns a verified `embedUrl`, or throws `BAD_USER_INPUT` with a structured `reason`. It never stores an unverified URL. Provider specifics:
- **Canva** — oEmbed call, extract iframe `src`, re-validate the returned `src` through `assertHttpsUrl` (closes a `javascript:`/`data:` injection vector). Constrained regex fallback only for the canonical `/design/{id}/{slug}/(edit|view|watch)` shape; anything else rejects. `canva.link` short links are resolved by following the HTTP redirect to the canonical `canva.com` URL first (validating the destination host).
- **YouTube** — extract the 11-char ID from any paste shape, validate via oEmbed, store `youtube-nocookie.com/embed/{id}`.
- **Google Slides** — segment-anchored published check (not substring; `/presentation/d/pubXYZ/edit` must not pass), then rewrite the `/pub` "Link" form to `/embed` (the `/pub` page is `X-Frame-Options: SAMEORIGIN` and won't iframe).
- **Mux** — read through the **gateway** (`getMuxVideo`), matching the existing `videoBlockCreate` flow, *not* a direct cross-DB Prisma client.

**4. Cross-service reads go through the gateway, not direct Prisma.** Match the in-repo video-attach precedent (`fetchFieldsFromMux`) and the no-interop convention.

**5. Public-read isolation.** Denormalize only what the public renderer needs (`muxPlaybackId`) at save time; the public GraphQL type omits internal FKs (`muxVideoId`) and federated refs so the anonymous `bySlug` path never crosses to another DB. Guard the field surface with a negative-selection spec.

**6. External IO before the DB transaction.** `resolveMediaInput` (oEmbed fetches, gateway Mux read) runs before `prisma.$transaction` so no network call holds a tx open.

## Why This Matters

Every provider embeds differently and changes its URL shapes / oEmbed endpoints / iframe headers over time (Canva already EOL'd one oEmbed endpoint). Storing raw URLs gives broken iframes; per-provider handling is unavoidable. The pattern bounds the inherent brittleness three ways: **fail-closed** (a broken provider yields "try again", never a stored broken embed), the **env allowlist kill-switch** (disable a provider via Doppler, no deploy), and the **spec registry** (each provider's logic in one file). The residual risk — a provider silently changing format (unit tests mock `fetch`, so CI won't catch it) — is best covered by a scheduled synthetic check (see the NES-1706 follow-up comment).

## When to Apply

- Any feature that embeds third-party URL content via iframe.
- Especially on public/unauthenticated surfaces, where the read-isolation and fail-closed points matter most.

## Examples

File layout (the registry + gate live together, one file per provider):

```
media/
  types.ts                 # EmbedNormalizerSpec interface
  linkValidate.ts          # https → allowlist gate → normalizer dispatch
  canvaOEmbed.ts           # canvaSpec  (oEmbed + canva.link resolve + fallback)
  youTubeOEmbed.ts         # youTubeSpec
  googleSlidesValidate.ts  # googleSlidesSpec  (/pub → /embed)
  muxValidate.ts           # gateway getMuxVideo, denormalized playbackId
  resolveMediaInput.ts     # zod discriminated-union dispatch, pre-transaction
```

## Related

- `docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md` — public-anonymous field-surface isolation (NES-1547).
- `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md` — the schema-change workflow this feature went through.
- NES-1706 (backend), NES-1707 (frontend), NES-1660 (the broken-iframe trap this avoids).
