# Journeys MCP local runtime

This workspace implements the protocol/runtime part of [#10572](https://github.com/JesusFilm/core/issues/10572), under [#10157](https://github.com/JesusFilm/core/issues/10157). The release has an empty tool catalog. It cannot read journeys, accept identity tokens, contact providers, write content or manage grants/history. Authentication and owning-service authorization must be implemented and tested before adding any data tool. Public URLs and guest access supply no authority.

## Start locally

Use the repository's Node 24 and pnpm installation, from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec nx build api-mcp
export MCP_AUTH_MODE=disabled
export MCP_PUBLIC_URL=http://127.0.0.1:4010/mcp
pnpm exec nx start api-mcp
```

For source watch/restart during development, use `pnpm exec nx serve api-mcp`. No database, Firebase, Doppler, AWS identity, gateway secret or Hive publication is required. Neither build nor startup has a subgraph target.

In a second terminal:

```sh
curl --fail http://127.0.0.1:4010/health
curl --fail http://127.0.0.1:4010/ready
curl --fail http://127.0.0.1:4010/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"local-check","version":"1.0"}}}'
curl --fail http://127.0.0.1:4010/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2025-11-25' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

The last result contains `tools: []`. No MCP session ID is issued. Stop with Ctrl-C or SIGTERM. Missing/invalid required settings cause a nonzero exit with a redacted `startup_failed` event.

The SDK factory uses `legacy: 'stateless'` and `responseMode: 'json'`. Modern exchanges return JSON. The pinned SDK's legacy fallback returns a bounded SSE response; this is the SDK's built-in behavior, not a custom legacy adapter. It requires the Accept header above. The endpoint does not support subscriptions, optional resources/prompts, sampling, elicitation, tasks or streaming progress. GET/DELETE return 405 with `Allow: POST`; POST subscriptions are also denied through the SDK with a zero subscription limit. Modern listen returns a subscription-limit error; legacy listen is an unknown method. Modern requests carry the SDK's per-request envelope and MCP method/name headers. See `test/helpers.ts` for executable requests using the SDK's exported envelope constants.

SDK pins follow the [selected official release](https://github.com/modelcontextprotocol/typescript-sdk/releases/tag/v2.4.0): server 2.4.0 and Node adapter 2.1.2. Each exchange creates a fresh server. No affinity, session store, grant cache or process-local execution authority is used.

## Configuration

All configuration is supplied at runtime. URL settings reject credentials, query strings and fragments. They require HTTPS except on exact loopback hostnames.

| Variable                      | Default / allowed value                    | Purpose                                                                                                 |
| ----------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `MCP_AUTH_MODE`               | Required, `disabled` only                  | Explicitly keeps all data tools unavailable. Other modes fail startup.                                  |
| `MCP_PUBLIC_URL`              | Required, e.g. `http://127.0.0.1:4010/mcp` | External origin and exact MCP path, including any ingress prefix. Cannot be `/`, `/health` or `/ready`. |
| `MCP_HOST`                    | `127.0.0.1`                                | Bind address. Supply `0.0.0.0` for a container.                                                         |
| `MCP_PORT`                    | `4010`, range 1–65535                      | Bind port, independent of external ingress port.                                                        |
| `MCP_ISSUER_URL`              | Optional                                   | Reserved environment-specific issuer URL, validated but unused. Does not enable identity.               |
| `MCP_GATEWAY_URL`             | Optional                                   | Reserved environment-specific gateway URL, validated but unused. Does not enable data access.           |
| `MCP_ADMISSION_ENABLED`       | `true`, or `false`                         | Disabled admission returns 503 even if a proxy ignores readiness.                                       |
| `MCP_REQUEST_DEADLINE_MS`     | `20000`, maximum 20000                     | Bounds body receipt, protocol execution and buffered response.                                          |
| `MCP_DRAIN_DEADLINE_MS`       | `10000`, maximum 30000                     | Maximum transport drain before closing active connections.                                              |
| `MCP_MAX_REQUEST_BYTES`       | `262144`, maximum 1048576                  | Trusted buffered request limit, including chunked bodies.                                               |
| `MCP_MAX_RESPONSE_BYTES`      | `1048576`, maximum 4194304                 | Buffered response limit before any payload is released.                                                 |
| `MCP_MAX_CONCURRENT_REQUESTS` | `64`, maximum 256                          | Per-replica protocol admission bound. No entitlement/quota authority.                                   |

`GET /health` reports process liveness. `GET /ready` reports readiness for the implemented protocol-only service; both report `dataTools: false`. A stopped/draining admission gate makes readiness 503. Missing, invalid or unreachable issuer/gateway integration never enables tools. These future URLs are not dependency probes, and readiness does not assert that authentication works. The separate sign-in slice owns dependency checks and authoritative eligibility. No cached allow is implemented here.

The MCP route validates the actual Host header against the public hostname and permits a browser Origin only when it exactly equals the public origin. The ingress must preserve that Host; do not trust forwarded identity or forwarded-host headers. Health probes accept internal probe hostnames and return no private data.

Logs contain fixed event names, HTTP status and duration only. They omit headers, URLs, bodies, tool arguments/results and raw errors. The SDK emits a constant warning about JSON response mode. There is no audit store in this slice. The later operational owner must configure the agreed 90-day log retention; this runtime does not claim to implement durable audit cleanup.

## Verify

```sh
pnpm exec nx lint api-mcp
pnpm exec nx type-check api-mcp
pnpm exec vitest run --config apis/api-mcp/vitest.config.mts
```

Tests invoke real listening HTTP endpoints. `test/replicas.spec.ts` starts two separate processes behind a round-robin test proxy, sends both supported protocol profiles across them, abruptly replaces one and checks the survivor. It also checks graceful settlement and bounded forced transport shutdown. `test/fixture.ts` registers synthetic echo/delay/size tools through a test factory; the release entrypoint never imports it. There is no environment switch that enables fixtures. Fixed synthetic data is protocol evidence only, not authentication, current-rights, grant, database-participant or real-client evidence.

Tests cover missing/invalid configuration, empty release tools, unsupported POST capabilities, Host/Origin rejection, unavailable admission, request isolation, input/output bounds, deadlines, health/readiness, redacted logs and replacement. A transport timeout or terminated replica proves nothing about an owning backend executor. Future data capabilities must implement durable permits, current generations, receipts, expiry checks after locks, private-output release checks and positive fencing before they are enabled. This slice has no accepted domain work to drain and no assets to remove. A1/A9/A17/A19 remain broader release cases; this ticket supplies only their runtime prerequisite evidence.

## Local evidence, 13 November 2026

Workspace build, lint and TypeScript 7 checks passed. The Vitest suite passed 37 tests through real HTTP listeners, including both profiles across two processes and replacement. A separate smoke run used `pnpm exec nx start api-mcp` with `MCP_PUBLIC_URL=http://127.0.0.1:14010/agents/mcp` and verified readiness, legacy initialization, an empty release catalog and fixture denial. The built bundle exited 1 for an unsupported auth mode with only a redacted startup event. Container build/run and image identity evidence remain unexecuted for the runner reason below.

## Portable image and AWS handoff

Build the same release bundle first, then build and run the image from the repository root:

```sh
pnpm exec nx build api-mcp
docker build --platform linux/amd64 -f apis/api-mcp/Dockerfile -t journeys-mcp:10572 .
docker image inspect journeys-mcp:10572 --format '{{.Id}} {{.Os}}/{{.Architecture}}'
docker run --rm --name journeys-mcp-10572 -p 4010:4010 \
  -e MCP_HOST=0.0.0.0 -e MCP_AUTH_MODE=disabled \
  -e MCP_PUBLIC_URL=http://127.0.0.1:4010/mcp journeys-mcp:10572
```

The `MCP portable runtime` PR workflow uses the existing Core CI runner to build and load this image without credentials or publication. It runs both protocol profiles against the actual container, verifies empty release tools and fixture denial, and uploads `mcp-image-qualification` with the build manifest digest, image ID, OS/architecture and HTTP observations. This is local container evidence on CI, not an AWS deployment. The image is not qualified until that job passes.

Repeat the curl checks against the container. Record the image ID and architecture from inspect; when publishing later, also record the registry manifest digest and deploy by that digest. No registry publication is required for local qualification. `Dockerfile.dockerignore` restricts the build context to the bundled release file, excluding `.env`, databases, source fixtures and local data. The image runs as the Node user with no installation or network fetch at startup. Configuration and endpoints remain outside it. For ARM, build and qualify `linux/arm64` separately rather than treating an amd64 run as ARM evidence.

[#10583](https://github.com/JesusFilm/core/issues/10583) owns registry publication, AWS task permissions, secrets, DNS/TLS/ingress, two deployed replicas, replacement and deployed digest evidence. Set the ingress/task stop timeout above the configured drain bound, preserve external Host/path and route liveness/readiness probes. Package and deploy this service independently of GraphQL/Hive publication. It needs no direct database, issuer signing key, Firebase admin, gateway HMAC, unrestricted interop token or provider credential. Do not add these to its image or task role. Later scoped identity/gateway trust must arrive through their owning slices.

The portable image has not yet been built or run in this runner: it has neither Docker/Podman nor a daemon socket, and `unshare -Ur true` is denied. No image digest or architecture qualification is claimed until that check runs on a container-capable local runner or the Core CI qualification job passes. Local process replacement does not qualify ECS tasks, ingress or AWS availability. No AWS deployment, production deployment, Claude or ChatGPT product test is claimed.
