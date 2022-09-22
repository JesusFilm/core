locals {
  identifier    = "api-journeys"
  env           = "stage"
  port          = 4001
  cpu           = 512
  memory        = 512
  desired_count = 1
  public_url    = "${local.identifier}-${local.env}.central.jesusfilm.org"
  private_url   = "${local.identifier}-${local.env}"
  env_secrets = {
    DATABASE_DB = var.database_db
    DATABASE_PASS = var.database_pass
    DATABASE_URL = var.database_url
    DATABASE_USER = var.database_user
    FIREBASE_API_KEY = var.firebase_api_key
    POWER_BI_CLIENT_ID = var.power_bi_client_id
    POWER_BI_CLIENT_SECRET = var.power_bi_client_secret
    POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID = var.power_bi_journeys_multiple_full_report_id
    POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID = var.power_bi_journeys_multiple_summary_report_id
    POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID = var.power_bi_journeys_single_full_report_id
    POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID = var.power_bi_journeys_single_summary_report_id
    POWER_BI_TENANT_ID = var.power_bi_tenant_id
    POWER_BI_WORKSPACE_ID = var.power_bi_workspace_id
   }

  tags = {
    Name         = local.name
    env          = local.env
    project_name = local.identifier
    application  = local.identifier
    owner        = "apps@cru.org"
    managed_by   = "terraform"
    terraform    = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}