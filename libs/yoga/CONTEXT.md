# Yoga (subgraph runtime kernel)

Not a domain — the shared server-side kernel of the GraphQL Yoga subgraph APIs (`libs/yoga`): the caller-identity and service-trust vocabulary, single-leader election for background workers, the transactional email kit, and small crypto/tracing utilities. Consumed by all six APIs; it owns no entities, only the runtime vocabulary below.

## Language

### Identity & trust

**Payload User**:
The lightweight identity shape (`User`) parsed from the gateway-forwarded Firebase JWT payload: `id` is the **Firebase UID**, the display name is sanitized and split into first/last, and `imageUrl` survives only if https. This is *not* the Users context's `User` entity — it never touches a database and its `id` is the federation key, not the User record id.
_Avoid_: "the user" without saying which shape (payload projection vs Users-context entity)

**Sanitization (identity fields)**:
The defensive cleaning applied when parsing the payload: control characters stripped from display names (hostile IdP impersonation), non-https or oversized photo URLs dropped to `null`, and a missing name becoming `Unknown User` on create paths only.

**Interop Token**:
The shared-secret header that marks a request as a trusted service-to-service call. Verified together with the caller's IP against the **NAT allowlist** (`NAT_ADDRESSES`); both must pass to yield an **Interop Context**. This is the third trust mechanism, distinct from the Firebase JWT (end-user identity) and the Gateway Signature (HMAC on forwarded identity — owned by the Gateway context).
_Avoid_: conflating with the Gateway Signature

**Gateway Callback Client**:
The Apollo client a subgraph uses to call *back into the supergraph* as itself: pointed at the gateway, authenticated by the Interop Token, self-identified by the `x-graphql-client-name` header (the API's name).

### Worker leadership

**Leader Lock**:
A Redis key (per `lockKey`) that elects exactly one instance of a horizontally-scaled Service to run its background workers. The holder renews at half the TTL; non-holders **contend** on an interval and may become leader later.

**Leadership Loss**:
What an instance does when its renewal finds the lock gone: re-contend (default), exit the process, or run a shutdown hook and stop. The choice is per-worker-fleet policy, not global.

### Transactional email

**Email Kit**:
The shared React Email component set (EmailContainer, ActionCard, UnsubscribeLink, NextStepsFooter, SenderAvatar…) and the `sendEmail` SMTP helper. Branding default: mail is sent as "Next Steps Support" — the kit is NextSteps-flavored, not neutral.

**Journey-shaped email types (boundary leak)**:
`JourneyForEmails`, `UserJourneyRole`, and the events-notification job type are Journeys/Users-context vocabulary living inside this kernel because the email templates need them. They mirror the owning contexts' terms; the owning glossaries win on any disagreement.

### Utilities

**Symmetric Encryption**:
The AES-256-GCM helper pair producing `{ciphertext, iv, tag}` triples — the storage shape for secrets a context must hold reversibly (e.g. journeys' integration access keys).

### Terminology traps

**Test-mode identity**:
Under `NODE_ENV=test` the payload parsers short-circuit to a fixed `testUserId` user without parsing at all — specs exercising identity edge cases must not rely on the parsers in test mode.

**"Yoga" the name**:
The lib is named after the GraphQL Yoga server framework it serves; it is not itself a server, a schema, or a context boundary — each subgraph API remains its own context.
