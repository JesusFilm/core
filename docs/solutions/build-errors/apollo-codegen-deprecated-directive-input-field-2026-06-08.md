---
title: 'Apollo client:codegen rejects @deprecated on input fields; put the deprecation in the description'
date: 2026-06-08
category: build-errors
module: apis/api-journeys-modern
problem_type: build_error
component: tooling
symptoms:
  - 'nx run-many -t codegen fails for the 5 apollo-CLI projects (journeys, journeys-admin, journeys-ui, resources, watch)'
  - 'GraphQLSchemaValidationError: Directive "deprecated" may not be used on INPUT_FIELD_DEFINITION.'
  - 'Subgraph generate-graphql and api-gateway composition both pass — the failure surfaces only at frontend codegen'
  - 'All-or-nothing failure at schema-load time, even for projects that never query the deprecated field'
root_cause: wrong_api
resolution_type: code_fix
severity: medium
related_components:
  - api-gateway
  - frontend-codegen
tags:
  - graphql
  - codegen
  - apollo-cli
  - pothos
  - deprecated-directive
  - input-fields
  - api-gateway
---

# Apollo client:codegen rejects @deprecated on input fields; put the deprecation in the description

## Problem

Adding Pothos `deprecationReason` to an **input** field (`mediaUrl` on `TemplateGalleryPageCreateInput` / `TemplateGalleryPageUpdateInput`, for consistency with the already-`@deprecated` output field) broke frontend codegen for every project that consumes the gateway schema through the legacy Apollo CLI — even though none of them query the field. The directive is spec-legal in modern graphql-js but rejected by the directive-location table baked into `apollo-language-server`.

## Symptoms

- `nx generate-graphql api-journeys-modern` and `nx generate-graphql api-gateway` both **pass**; the directive lands in the subgraph SDL and composes into `apis/api-gateway/schema.graphql`.
- `nx run-many -t codegen` then fails for 5 projects (`journeys`, `journeys-admin`, `journeys-ui`, `resources`, `watch`) with:

  ```text
  GraphQLSchemaValidationError: Directive "deprecated" may not be used on INPUT_FIELD_DEFINITION.
  ```

- The error fires during "Loading Apollo Project" / "Loading schema for api-gateway" — schema-load time, before any operation is parsed — so every Apollo-CLI project fails identically regardless of what it queries.
- The graphql-codegen targets (`api-journeys`, `shared-gql`) pass: graphql-codegen ships a current graphql-js whose location table allows the directive.

## What Didn't Work

- **`@deprecated` on the input fields.** The directive's location set was extended to `INPUT_FIELD_DEFINITION` / `ARGUMENT_DEFINITION` only in graphql-js 15.5 (March 2021). The 5 failing projects run `npx apollo client:codegen` (Apollo CLI v2.34.0, final release mid-2021, officially deprecated — it prints `[DEPRECATED]` in its own help), whose bundled `apollo-language-server` validates against the older location table and refuses to load the schema.
- **The pre-existing `rm -rf node_modules/apollo-language-server/node_modules/graphql` hack** (run before codegen in `apps/watch/project.json` and siblings to force a newer graphql onto the language server). It doesn't help: the directive-location validation that throws lives in `apollo-language-server`'s own logic, not in its nested `graphql` package.
- **Scoping the directive away from the gateway.** Impossible — Hive composition copies subgraph SDL into `apis/api-gateway/schema.graphql`, which is exactly the file the Apollo CLI loads. Whatever the subgraph declares reaches the consumer that rejects it.

## Solution

Drop `deprecationReason` from the Pothos **input** fields and express the deprecation in the field **description** (inert text), with a code comment so a future reviewer doesn't "fix" it back to the directive. Keep `@deprecated` on **output** fields — that location is legal in every consumer.

Before (breaks the 5 apollo-CLI codegen targets):

```ts
mediaUrl: t.string({
  required: false,
  description:
    'Optional https URL of a hero/cover media asset. Rejected if not https.',
  deprecationReason:
    'Superseded by the `media` input (NES-1704). Retained for legacy callers; new UI must write through `media`.'
}),
```

After (`apis/api-journeys-modern/src/schema/templateGalleryPage/inputs/templateGalleryPageCreateInput.ts`; same pattern in `templateGalleryPageUpdateInput.ts`):

```ts
// Not @deprecated: the legacy apollo CLI used by 5 frontend codegen
// targets predates @deprecated on INPUT_FIELD_DEFINITION and fails to
// load any schema containing it, so the deprecation lives in the
// description instead. Remove this field together with the @deprecated
// TemplateGalleryPage.mediaUrl output field.
mediaUrl: t.string({
  required: false,
  description:
    'Deprecated: superseded by the `media` input (NES-1704); will be removed together with the deprecated `TemplateGalleryPage.mediaUrl` field. Optional https URL of a hero/cover media asset. Rejected if not https.'
}),
```

Then regenerate, in order:

```bash
nx generate-graphql api-journeys-modern   # subgraph SDL
nx generate-graphql api-gateway           # Hive recompose
nx run-many -t codegen --skip-nx-cache    # all consumers; cache hits can mask the failure
```

Result: all 7 codegen targets green; `tsc -b` clean; full templateGalleryPage suite passing.

## Why This Works

A field description is plain documentation text with no directive-location semantics, so every toolchain — graphql-codegen and the legacy Apollo CLI alike — treats it as inert and loads the schema. A directive, by contrast, is validated against the location table compiled into the **consumer's** graphql version; consumers predating graphql-js 15.5 reject `@deprecated` on input fields. Output-field `@deprecated` survives because `FIELD_DEFINITION` has been a legal location since the original spec.

## Prevention

- **Validate post-2021 schema features against the legacy Apollo CLI consumers before merge** — new `@deprecated` locations, `@oneOf`, repeatable directives, `@specifiedBy`, etc. Server-side generation passing is not sufficient signal; this class of failure only surfaces in downstream codegen.
- **Canary command after any subgraph/gateway schema change:** `nx run-many -t codegen --skip-nx-cache`. It loads the composed gateway schema through every consumer and fails fast at exactly the layer where this bug lives. `--skip-nx-cache` matters: a cache hit can replay stale output and mask the failure.
- **Long-term fix:** migrate the 5 Apollo-CLI targets (`watch`, `resources`, `journeys`, `journeys-admin`, `journeys-ui`) off `apollo client:codegen` to graphql-codegen, matching `api-journeys`/`shared-gql`. The `rm -rf node_modules/apollo-language-server/node_modules/graphql` hack in those `project.json` files is a smell pointing at the same root cause and can be deleted as part of that migration.

## Related Issues

- `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md` — sibling codegen-pipeline trap from the same branch: nx stale-cache replay at the same `generate-graphql → gateway → codegen` boundary (distinct root cause: cache key vs. directive validation).
- `.claude/rules/backend/database-schema-changes.md` — documents the Step 5–7 regeneration workflow this failure lives in; its troubleshooting section does not yet mention the Apollo-CLI directive limitation.
- `docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md` — general theme of subgraph schema changes with hidden downstream prerequisites.
