---
date: 2026-11-11
topic: journeys-mcp-hosting
issue: https://github.com/JesusFilm/core/issues/10534
---

# Journeys MCP hosting

## Decision

Deploy `apis/api-mcp` as an independently built Node service on the existing ECS Fargate platform. Give each environment its own HTTPS hostname, target group, service, image repository and configuration. Use Streamable HTTP at `/mcp`, with request-local state and ordinary ALB routing. Start with one on-demand task in stage and two in production, then validate stage with two replicas before release. The replica counts and timeouts below are proposed starting settings awaiting stage measurements. This deployment shape follows the identity decision. Repository evidence is pinned to `593400f9201d0b2acccea67835613639619bf527`. Live AWS, DNS, IAM and client behavior remain owner verification work. [Identity decision](https://github.com/JesusFilm/core/issues/10156), [existing service module][ecs-service]

## What the repository declares

- Each environment has its own VPC, public and internal ALBs, cluster and DNS configuration. The gateway consumes `public_ecs_config`, and the feature APIs consume `internal_ecs_config`. Public tasks use public subnets, public IP assignment and a security group accepting ingress from the public ALB security group. Internal APIs sit behind the internal ALB. Use the public configuration for MCP and an MCP-specific security group accepting only the application port from the public ALB. [Stage stack][stage], [production stack][prod], [task networking][ecs-service], [security groups][ecs-network]
- The public ALB terminates HTTPS on 443 with ACM and redirects HTTP to HTTPS. The service module adds host-header forwarding and a DNS CNAME. Stage creates a wildcard certificate and production looks up an existing wildcard. Choose an MCP hostname covered by the environment's certificate, and configure the canonical HTTPS resource URI explicitly. The target-group hop uses HTTP inside the VPC. [Listeners][listeners], [stage certificate][stage], [production certificate lookup][prod-data], [routing][routing], [DNS record][scaling]
- The module provides ECR, Fargate `awsvpc`, health checks, CPU/memory scaling, FireLens logging and a Datadog sidecar. It currently hardcodes a shared environment task role, while the execution role arrives through `ecs_config`. The gateway's declared sizing and replica counts provide a starting comparison, with sidecar memory included in capacity testing. [Task definition][task], [scaling][scaling], [role lookup][task-data], [gateway sizing][gateway-sizing]
- GitHub Actions builds affected APIs on pushes to `stage` and `main`, using explicit per-service jobs. The shared worker builds an Nx production bundle, pushes SHA and `latest` image tags, forces a service deployment, then publishes a Hive schema. Its deploy step ends after the update request. Infrastructure uses the Atlantis/OpenTofu PR workflow. [Stage workflow][stage-ci], [production workflow][prod-ci], [deploy worker][deploy-worker], [Atlantis projects][atlantis], [apply requirements][atlantis-server]

## Build and release changes

Add an Nx application with build, serve, lint, type-check and test targets, plus a Dockerfile and service infrastructure folder. Reuse the existing Node bundle and generated production package pattern. The MCP entrypoint should directly `exec` Node, keeping database migration ownership with the feature services. Add the module to both environment stacks and explicit affected-project jobs to both API workflows. Provision its repository, service and configuration through the normal infrastructure workflow before the first application rollout. [Existing Node build][node-project], [Docker packaging][dockerfile], [current migration entrypoint][entrypoint], [stage workflow][stage-ci], [production workflow][prod-ci]

Extract a reusable container deployment job whose service kind controls optional steps. Execute Hive publication and its token requirement only for subgraphs. Give MCP its own production build and deployment smoke check. Register a task-definition revision referencing the built image digest, wait for ECS stability, then check HTTPS readiness and an authorized tool call. Record the previous task revision and digest with the release. Align infrastructure's image reference with that release so a later apply preserves it. These are necessary additions to the worker's current `latest`/force-deploy behavior. [Deploy worker][deploy-worker], [task image and revision][task]

## Transport and replicas

Use the current stable TypeScript SDK v2 server and Node HTTP adapter, pinning the chosen package versions in the lockfile. The official SDK identifies `2026-07-28` as its protocol revision. Qualify the selected clients against that revision before opening the service. [Official SDK](https://github.com/modelcontextprotocol/typescript-sdk), [version negotiation](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning)

The current transport puts each request in its own POST and supports JSON or request-scoped SSE responses. Protocol-level sessions and standalone GET streams were removed. Implement the required version/method metadata checks, return 405 for unsupported GET/DELETE, and treat a closed SSE response as request cancellation. Pin this behavior to `2026-07-28`. [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)

Keep authentication and tool execution state request-local. Every healthy replica can accept the next request, with ALB stickiness disabled. Keep grants in the identity service and durable job/result state in the owning backend. An interrupted write needs an authoritative result lookup or backend idempotency before retry. Any future subscription or resumable workflow needs its own persistence design. These choices let task replacement and scaling preserve the authorization boundary. [ALB routing](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html), [identity and queued-work contract](https://github.com/JesusFilm/core/issues/10156)

If a required client speaks `2025-11-25`, add and test an explicit compatibility adapter. That revision allows initialization without issuing an `Mcp-Session-Id`, JSON responses and a 405 GET response. Choose that stateless subset and test initialization on replica A followed by a tool call on replica B. An in-memory session map would introduce replica affinity and restart recovery work. [Earlier transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)

## Health, streams and shutdown

Provide `/health` for process liveness and `/readiness` for validated configuration, initialized authentication and admission of work. Return a minimal status body. Point the ALB at readiness, with a 60-second startup grace, five-second checks, three-second timeout and two-check thresholds, following the gateway settings. Dependency outages should produce bounded request failures and metrics. Preserve authorization checks even when readiness fails because ALB can route to unhealthy targets when every target fails. [Gateway health settings][gateway-sizing], [ALB health behavior](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html)

Use an initial 20-second request deadline, 15-second SSE heartbeat and a 25-second application shutdown budget. Return longer work through backend-owned jobs. On SIGTERM, mark draining, reject new tool execution, stop accepting connections, finish or cancel active work and flush telemetry. Add MCP-specific module inputs for a 60-second target deregistration delay and 60-second container `stopTimeout`. ECS defaults to 30 seconds when `stopTimeout` is omitted, while ALB defaults to a 300-second deregistration delay. Exercise both replacement and abrupt termination. [Task definition][task], [target deregistration](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html), [ECS stop timeout](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html)

ALB's default connection idle timeout is 60 seconds, and HTTP/2 PING does not reset it. Verify the deployed value and keep the Node connection idle timeout above it. Send SSE bytes promptly, set `X-Accel-Buffering: no`, and test delivery through the full ingress path. Heartbeats address idle periods. The request deadline separately bounds execution. [ALB idle timeout](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-load-balancer-attributes.html), [SSE behavior](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)

## Authorization, gateway connectivity and secrets

MCP is the public OAuth resource server. Validate issuer, MCP audience, expiry and current grant on every request, publish protected-resource metadata, validate supplied Origins and canonical Host, and bound request size and per-principal concurrency. Permit missing Origin for authenticated native clients. Configure browser CORS for the approved clients and required protocol headers. Trust forwarding headers only through the ALB ingress. [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization), [transport security](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)

Call the environment's configured gateway HTTPS endpoint with approved typed operations and the gateway-scoped delegated credential described in #10156. The checked-in gateway currently verifies Firebase JWTs, forwards interop headers and signs subgraph traffic. Implement delegated verification and the downstream grant checks before enabling MCP operations. Build outbound headers from an allowlist, carrying the verified user/client/grant context through the approved exchange. Keep signing keys, interop authority, database access and provider credentials in their owning services. Confirm MCP egress to the gateway, issuer/JWKS and telemetry endpoints. [Gateway authentication][gateway-auth], [delegation contract](https://github.com/JesusFilm/core/issues/10156)

The source currently reads Doppler during infrastructure provisioning, writes selected values to SSM SecureStrings, then references their ARNs in container secrets. Treat provisioner access and remote state as secret-bearing. The backend declares encryption and locking. Rotation requires updating the materialized SSM values and replacing tasks. This source behavior should guide implementation where the infrastructure glossary describes runtime Doppler fetching. [Doppler provider][doppler-provider], [secret materialization][task], [state backend][state], [OpenTofu state](https://opentofu.org/docs/language/state/sensitive-data/), [ECS secret rotation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/secrets-envvar-ssm-paramstore.html)

Use separate service/environment configuration and exchange credentials. Scope the execution role to ECR pulls, logs and required SSM/KMS reads. Add a task-role override to the module and give MCP only its required AWS permissions. Keep `include_aws_env_vars` false. Scope the CI deploy role to the MCP repositories, services and task-role pass permissions. Existing role lookups and shared CI secrets leave effective policy and grants for the owner to inspect. [Role wiring][task], [optional AWS variables][task-variables], [deploy credentials][deploy-worker], [AWS execution-role responsibilities](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html)

## Operations and recovery

Reuse FireLens to Datadog, sidecar CloudWatch logs and ALB access logs. Instrument MCP request and gateway spans with service, environment and release digest. Audit the user, client, grant, operation and decision using redacted identifiers. Exclude bearer credentials, request bodies and tool results from routine logs. Alert on unhealthy targets, task restarts, latency, auth failures, throttling, gateway errors and stream disconnects. The module provisions log plumbing, while retention, dashboards, alert delivery and trace redaction need explicit service configuration and verification. [Logging containers][task], [ALB logs][listeners], [gateway telemetry example][gateway-prod]

Add an immediate route-level disable action returning 503 and an application admission switch. Use grant revocation for access withdrawal. For a complete stop, suspend scaling and set desired count to zero after blocking ingress. Readiness alone is insufficient because of ALB fail-open behavior. For rollback, restore the previous digest-pinned task revision and compatible configuration, wait for stable health and repeat the authorized smoke check. Enable ECS deployment circuit-breaker rollback for this service and record a manual first-deployment recovery procedure. Retain release images for the rollback window, accounting for the shared module's ten-image expiry policy. [ALB health behavior](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html), [scaling][scaling], [image retention][task], [ECS rollback](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-circuit-breaker.html)

## Owner verification before release

Record dated results against the deployed commit and digest. These are the remaining environment checks inferred from the repository configuration and proposed design above.

1. Confirm applied stage/prod resources, certificate coverage, DNS routing, HTTPS termination, target port, security groups and effective egress. Confirm the real gateway URL and delegated route. Inspect configuration through approved operations access, with secret values redacted.
2. Inspect CI, execution and task-role policies, SSM/KMS grants and environment separation. Demonstrate a credential rotation and grant revocation on already-running clients. Verify that the issuer and feature services enforce the same grant after a gateway hop.
3. Test the exact client/SDK/protocol matrix through public ingress. With two stage replicas, alternate initialization or requests across tasks, replace one task mid-stream, and exercise timeout, cancellation, duplicate-write recovery and authenticated job-result retrieval.
4. Observe readiness during startup, draining and dependency loss. Confirm SIGTERM reaches Node, actual deregistration/stop/idle timers, stream flushing and the measured memory budget including sidecars. Verify authorized operations, wrong-audience rejection and ingress admission controls using the approved stage fixtures.
5. Demonstrate non-subgraph CI from commit to healthy service, failed-deploy detection, previous-digest rollback and route disable. Verify log redaction, trace continuity, retention and alert delivery. Confirm the previous release image survives cleanup and subsequent infrastructure applies preserve the chosen release.

[ecs-service]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/main.tf#L311-L358
[stage]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/environments/stage/main.tf#L1-L145
[prod]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/environments/prod/main.tf#L1-L109
[prod-data]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/environments/prod/data.tf#L1-L24
[ecs-network]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs/main.tf#L14-L68
[listeners]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/main.tf#L82-L134
[routing]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/main.tf#L274-L309
[task]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/main.tf#L1-L272
[scaling]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/main.tf#L360-L406
[task-data]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/data.tf#L1-L14
[task-variables]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/variables.tf#L131-L155
[gateway-sizing]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-gateway/infrastructure/locals.tf#L12-L41
[stage-ci]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/.github/workflows/api-deploy-stage.yml#L1-L51
[prod-ci]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/.github/workflows/api-deploy-prod.yml#L1-L51
[deploy-worker]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/.github/workflows/api-deploy-worker.yml#L1-L125
[atlantis]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/atlantis.yaml#L1-L18
[atlantis-server]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/resources/atlantis/server-atlantis.yaml#L1-L4
[node-project]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/project.json#L1-L81
[dockerfile]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/Dockerfile#L1-L25
[entrypoint]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-journeys/docker-entrypoint.sh#L1-L7
[gateway-auth]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-gateway/src/common.config.ts#L12-L67
[doppler-provider]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/modules/aws/ecs-task/terraform.tf#L1-L12
[state]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/infrastructure/terraform.tf#L1-L8
[gateway-prod]: https://github.com/JesusFilm/core/blob/593400f9201d0b2acccea67835613639619bf527/apis/api-gateway/gateway.prod.config.ts#L5-L22
