# One ClickHouse Cloud service per environment for short-link scan events:
# the redirect Worker inserts rows over HTTPS, api-media reads aggregates.
# The service is all Terraform manages here. The database, table and the two
# limited users are created by hand from the runbook in
# workers/short-links-redirect/README.md ("Setting up ClickHouse").

locals {
  name           = "jfp-short-links-${var.env}"
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
    service = "short-links"
  }

  # A destroy deletes every scan event; the provider has no deletion protection.
  lifecycle {
    prevent_destroy = true
  }
}

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
