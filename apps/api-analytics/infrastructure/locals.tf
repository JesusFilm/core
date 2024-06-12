locals {
  port = 4001
  environment_variables = [
    "FIREBASE_API_KEY",
    "GIT_BRANCH",
    "PG_DATABASE_URL_ANALYTICS",
    "PLAUSIBLE_URL",
    "PLAUSIBLE_API_KEY",
    "PLAYWRIGHT_USER_ID",
    "POWER_BI_CLIENT_ID",
    "POWER_BI_CLIENT_SECRET",
    "POWER_BI_ANALYTICS_MULTIPLE_FULL_REPORT_ID",
    "POWER_BI_ANALYTICS_MULTIPLE_SUMMARY_REPORT_ID",
    "POWER_BI_ANALYTICS_SINGLE_FULL_REPORT_ID",
    "POWER_BI_ANALYTICS_SINGLE_SUMMARY_REPORT_ID",
    "POWER_BI_TENANT_ID",
    "POWER_BI_WORKSPACE_ID",
    "GOOGLE_APPLICATION_JSON",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_STREAM_TOKEN",
    "ANALYTICS_ADMIN_URL",
    "REDIS_URL",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "INTEROP_TOKEN",
    "GATEWAY_URL",
    "MAILCHIMP_AUDIENCE_ID",
    "MAILCHIMP_MARKETING_API_KEY",
    "MAILCHIMP_MARKETING_API_SERVER_PREFIX",
    "VERCEL_ANALYTICS_PROJECT_ID",
    "VERCEL_TEAM_ID",
    "VERCEL_TOKEN"
  ]
  service_config = {
    name           = "api-analytics"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    alb_dns_name   = var.ecs_config.alb_dns_name
    zone_id        = var.ecs_config.zone_id
    alb_listener = merge(var.ecs_config.alb_listener, {
      port = local.port
    })
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    auto_scaling = {
      max_capacity = 4
      min_capacity = 1
      cpu = {
        target_value = 75
      }
      memory = {
        target_value = 75
      }
    }
  }
}
