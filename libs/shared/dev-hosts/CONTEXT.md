# Dev Hosts (dev-trust kernel)

The shared vocabulary of trusting a developer's own hostname (`libs/shared/dev-hosts`): the secret-provisioned registry of Dev Hosts and the relaxations a surface grants when serving one. Owns no product entities; a tiny kernel consumed by frontend surfaces and the gateway.

## Language

**Dev Host**:
A hostname (typically a developer's Tailscale machine name) that a surface treats as a trusted development origin. Membership is exact, case-sensitive hostname match — no ports, no prefixes, no wildcards.
_Avoid_: dev origin, local host, allowed host

**Dev Hosts Registry**:
The set of Dev Hosts, provisioned as a secret (a JSON object mapping developer name → hostname, or a JSON array) in the environment. Only development environments carry the secret.
_Avoid_: whitelist, host list env var

**Relaxation**:
A dev-only behavior a surface enables when the request or page is on a Dev Host — proxy rewrite, gateway URL derivation, auth-cookie handling, QR-code host swap, permissive CORS. Each surface owns its own relaxations; this kernel only answers "is this a Dev Host?".

**Fail-Closed**:
The rule that any doubt yields the empty registry — missing secret, empty string, malformed JSON, or a non-object payload all mean "no Dev Hosts". Absence of the secret is the gate; there is no `NODE_ENV` check.
_Avoid_: default-off, safe mode

**Localhost carve-out**:
`localhost` support is deliberately outside this kernel — surfaces that need it handle it with their own hardcoded rules. A Dev Host is always a real, secret-provisioned hostname.
