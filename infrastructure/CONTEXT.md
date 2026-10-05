# Infrastructure

The platform substrate the product contexts run on: the Terraform/OpenTofu estate (AWS, one account, `us-east-2`) that defines the Environments, the shared network/compute substrate, and each Service's runtime — plus the Atlantis workflow that changes it. Owns no product entities; its domain is Environments, Services, and the machinery that provisions them.

## Language

### Estate & workflow

**Estate**:
The whole Terraform-managed footprint, held in four independent states: the main `infrastructure` state (everything product-facing) and the three Bootstrap States. All are OpenTofu, not HashiCorp Terraform (a deliberate distribution switch — see the Atlantis pinning notes).
_Avoid_: "the terraform" (ambiguous — four states, and the binary is OpenTofu)

**Atlantis**:
The PR-driven plan/apply workflow: every change to `*.tf` (including per-Service Infrastructure Folders) is planned on the pull request and applied only when mergeable, approved, and undiverged. Atlantis itself is a Bootstrap State, running on ECS as the GitHub user `jesus-film-bot`.

**Bootstrap State**:
One of the three standalone states under `infrastructure/resources/` that exist so the main state can: the state bucket itself (`terraform`), the Atlantis server (`atlantis`), and the Doppler writer IAM user (`doppler`). Each is its own Atlantis project.
_Avoid_: "resources" (collides with the generic Terraform word and with `apps/resources`)

### Environments & substrate

**Environment**:
A named deployment target with its own VPC, CIDR, and domain: `prod` (`*.central.jesusfilm.org`) and `stage` (`*.stage.central.jesusfilm.org`). Both live in the same AWS account and region, separated only by VPC. Not to be confused with Vercel preview deployments or Doppler configs, which have their own environment notions.
_Avoid_: staging (the environment is named `stage`), dev (no AWS dev environment exists)

**Substrate**:
The shared per-Environment foundation produced by the `modules/aws` composite — VPC, public and internal ALBs, security groups, the ECS cluster, and the private DNS zone — consumed by every Service via an ECS Config.
_Avoid_: "the network module" (it also owns the cluster and load balancers)

**ECS Config**:
The bundle of substrate references (`public_ecs_config` / `internal_ecs_config`) an Environment hands to each Service: which subnets, security group, ALB, cluster, and DNS zone it plugs into. Choosing between the two _is_ choosing the Service's exposure.

**Naming Convention (`jfp-`)**:
AWS resources are named `jfp-<thing>-<env>` (`jfp` = Jesus Film Project), e.g. `jfp-public-alb-prod`, `jfp-ecs-cluster-stage`.

### Services

**Service**:
A deployable workload running on ECS Fargate in each Environment: the six subgraph APIs plus Arclight. Its infrastructure lives in its own Infrastructure Folder; its container image is deployed by GitHub Actions, not by Terraform.
_Avoid_: app (ambiguous — most `apps/*` deploy to Vercel, not ECS)

**Infrastructure Folder**:
The `infrastructure/` directory inside a Service's own project (e.g. `apis/api-media/infrastructure`) declaring its Service Config and calling the shared `ecs-task` module. The Environment stacks reference these folders by relative path, so per-Service infra lives with the Service but is planned/applied as part of the main state.

**Service Config**:
A Service's runtime shape — CPU, memory, desired count, port, health check, autoscaling — defined in its Infrastructure Folder.

**Public Service / Internal Service**:
A Service's exposure class. Public Services (`api-gateway`, `arclight`) sit behind the public ALB and real hostnames; Internal Services (the other five APIs) sit behind the internal ALB and are reachable only inside the VPC as `<name>.service.internal`.
_Avoid_: external/private (say Public/Internal to match the ALB names)

**Deploy Surface**:
Where a deployable actually runs — ECS (the Services), Vercel (the Next.js frontends, deployed by GitHub Actions with Vercel's own git integration disabled), or Cloudflare Workers (`workers/*`). Terraform owns only the ECS surface. Arclight is intentionally dual-surface: ECS and Vercel.

### Shared stateful resources

**Core Database**:
The one Aurora PostgreSQL cluster per Environment (`jfp-core`) that all the Services' databases live in; its connection URL is published into Doppler, not consumed as a Terraform output.
_Avoid_: "the RDS" / per-service database (there is one cluster, many logical databases)

**Doppler Token**:
The per-Service, per-Environment secret handle: Terraform reads it from SSM and passes it to the task, which pulls its env vars from Doppler at runtime. Secrets never live in Terraform state or task definitions.

**Bastion**:
The SSH jump host (`bastion.central.jesusfilm.org`) for reaching internal resources (the Core Database, Redis); access is an IP allowlist of named individuals.

**Platform Cluster**:
The EKS cluster (`jfp-eks`) per Environment. It runs platform/ops tooling only (Plausible Analytics, cert-manager, Datadog, ingress) via Argo CD GitOps from `infrastructure/kube/` — no product Services run there. ECS is the product runtime; EKS is the ops runtime.
_Avoid_: "the cluster" (ambiguous with the ECS cluster)

### Terminology traps

**`api-journeys-modern`**:
The Environment stacks name the journeys Service module `api-journeys-modern`, but it sources `apis/api-journeys/infrastructure` — the same deployable the rest of the repo calls `api-journeys`. One Service, two names; prefer `api-journeys` and treat `-modern` as the gateway/subgraph label.

**Nested environment modules**:
`module "prod"` at the root sources `environments/prod`, which itself contains a `module "prod"` sourcing `modules/aws`. "The prod module" is ambiguous — say the _Environment stack_ (outer) or the _Substrate_ (inner).

**Environment (overloaded)**:
AWS Environments (`prod`/`stage`), Doppler configs, and Vercel environments (production/preview) are three different partitions that only loosely align. Name the system when it matters.
