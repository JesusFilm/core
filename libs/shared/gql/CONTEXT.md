# GQL (supergraph typing kernel)

The shared vocabulary of writing type-safe GraphQL operations against the supergraph (`libs/shared/gql`): a gql.tada re-export bound to the gateway's composed schema, so every client-side query is typechecked at authoring time. Owns no entities and no runtime behavior; a types-only kernel consumed by the frontend surfaces.

## Language

**Supergraph Schema**:
The gateway's composed `schema.graphql` (checked in at `apis/api-gateway`) — the single schema this kernel binds to. Every operation written through the kernel is typed against the whole supergraph, never against an individual subgraph.

**Tada Environment**:
The generated type environment (`__generated__/graphql-env.d.ts`, produced by the `codegen` target) that encodes the Supergraph Schema as TypeScript types. Regenerated whenever the composed schema changes; stale environments mean stale operation types, not runtime failures.
_Avoid_: introspection output, codegen artifacts (it is one file with one job)

**Typed Operation**:
A query/mutation written with the kernel's `graphql()` tag — its result and variables types (`ResultOf`, `VariablesOf`) are inferred from the document text against the Tada Environment, with no per-operation codegen step.
_Avoid_: generated query types (nothing is generated per operation)
