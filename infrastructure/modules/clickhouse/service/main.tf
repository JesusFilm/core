# One shared ClickHouse Cloud service per environment, one database per
# tenant:
#   - `redirects`: short-link scan events; the redirect Worker inserts rows
#     over HTTPS, api-media reads aggregates. Runbook:
#     workers/short-links-redirect/README.md ("Setting up ClickHouse").
#   - `plausible_events_db`: Plausible Analytics' event store, moved here from
#     the EKS StatefulSet. Runbook: infrastructure/kube/plausible-analytics/README.md.
# The service is all Terraform manages here. Databases, tables and the
# per-tenant users are created by hand from those runbooks, as `default`.

locals {
  name           = "${var.name}-${var.env}"
  doppler_config = var.env == "prod" ? "prd" : "stg"
}

# The `default` (admin) user's password. ClickHouse Cloud wants at least 12
# characters with upper, lower, digit and symbol; it is only used from the
# runbook and ends up in Doppler, like the Aurora master password.
resource "random_password" "admin" {
  length           = 32
  special          = true
  override_special = "!$%&*?-_"
  min_upper        = 1
  min_lower        = 1
  min_numeric      = 1
  min_special      = 1
}

resource "clickhouse_service" "this" {
  name           = local.name
  cloud_provider = "aws"
  region         = var.region

  num_replicas          = 1
  min_replica_memory_gb = var.replica_memory_gb
  max_replica_memory_gb = var.replica_memory_gb

  idle_scaling         = var.idle_scaling
  idle_timeout_minutes = var.idle_scaling ? var.idle_timeout_minutes : null

  # The Worker runs on Cloudflare, which has no fixed outbound addresses, so
  # the service must accept connections from anywhere. Protection is TLS,
  # strong passwords and the two narrowly scoped database users.
  ip_access = [
    {
      source      = "0.0.0.0/0"
      description = "Cloudflare Workers have no fixed egress addresses"
    }
  ]

  password = random_password.admin.result

  tags = {
    env     = var.env
    service = "clickhouse"
    tenants = "short-links plausible"
  }

  # A destroy deletes every scan event and all of Plausible's history; the
  # provider has no deletion protection.
  lifecycle {
    prevent_destroy = true
  }
}

# The Doppler keys keep their SHORT_LINKS_ prefix: the Worker, api-media and
# the short-links runbook consume them, and the admin password is per service,
# not per tenant. Plausible's own URL (its user, its database) is set by hand
# in the `plausible` Doppler project, for which Terraform holds no token.

resource "doppler_secret" "url" {
  project = var.doppler_project
  config  = local.doppler_config
  name    = "SHORT_LINKS_CLICKHOUSE_URL"
  value   = "https://${clickhouse_service.this.endpoints.https.host}:${clickhouse_service.this.endpoints.https.port}"
}

resource "doppler_secret" "admin_password" {
  project = var.doppler_project
  config  = local.doppler_config
  name    = "SHORT_LINKS_CLICKHOUSE_ADMIN_PASSWORD"
  value   = random_password.admin.result
}
