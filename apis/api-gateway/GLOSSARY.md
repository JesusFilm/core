# Gateway

The federation edge of the platform: composes the subgraph APIs into one supergraph, authenticates the caller once at the door, and routes each part of a query to the subgraph that owns it. It owns no domain entities of its own — its language is about composition, trust, and identity handoff.

## Language

### Composition

**Supergraph**:
The single composed GraphQL schema clients query, stitched from all Subgraph schemas. In dev it is a checked-in composed file; in stage/prod it is pulled (and re-polled) from the Hive schema registry.
_Avoid_: gateway schema, merged schema

**Subgraph**:
One federated GraphQL service contributing part of the Supergraph. Current subgraphs: `api-analytics`, `api-journeys-modern` (the `api-journeys` deployable), `api-languages`, `api-media`, `api-users`.
_Avoid_: microservice, downstream API

**Schema Registry**:
The external Hive service that stores published subgraph schemas and serves the composed Supergraph to the gateway via CDN. Source of truth for what the gateway exposes in stage/prod.

### Trust & identity

**Gateway Signature**:
The HMAC signature the gateway attaches to every subgraph request, proving the request passed through the gateway. Subgraphs trust gateway-forwarded identity only because of it.
_Avoid_: HMAC secret (that's the key, not the concept)

**Caller Identity**:
The Firebase Auth JWT presented by the client (`Authorization: JWT <token>`). The gateway verifies it against Google's JWKS once, then forwards the decoded payload to subgraphs — subgraphs never re-verify. A missing token is allowed; queries proceed anonymously.
_Avoid_: session, login

**Analytics Passthrough**:
The one identity exception: the raw `authorization` header is forwarded untouched to `api-analytics` only, because that subgraph authenticates with a Plausible API key, not Firebase.

**Interop Token**:
A shared-secret header (`interop-token`) propagated to subgraphs for trusted server-to-server calls that bypass Firebase identity.

**Client Name**:
The `x-graphql-client-name` header identifying which frontend surface issued the request; propagated to subgraphs for attribution.
