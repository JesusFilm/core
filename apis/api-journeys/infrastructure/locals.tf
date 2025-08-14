locals {
  port = 4001
  environment_variables = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "FIREBASE_API_KEY",
    "GATEWAY_URL",
    "GIT_BRANCH",
    "GOOGLE_APPLICATION_JSON",
    "GROWTH_SPACES_URL",
    "INTEGRATION_ACCESS_KEY_ENCRYPTION_SECRET",
    "INTEROP_TOKEN",
    "JOURNEYS_ADMIN_URL",
    "JOURNEYS_SHORTLINK_DOMAIN",
    "JOURNEYS_URL",
    "MAILCHIMP_AUDIENCE_ID",
    "MAILCHIMP_MARKETING_API_KEY",
    "MAILCHIMP_MARKETING_API_SERVER_PREFIX",
    "MUX_ACCESS_TOKEN_ID",
    "MUX_SECRET_KEY",
    "PG_DATABASE_URL_JOURNEYS",
    "PLAUSIBLE_API_KEY",
    "PLAUSIBLE_URL",
    "PLAYWRIGHT_USER_ID",
    "PLAYWRIGHT_USER_ID_2",
    "PLAYWRIGHT_USER_ID_3",
    "PLAYWRIGHT_USER_ID_4",
    "PLAYWRIGHT_USER_ID_5",
    "PLAYWRIGHT_USER_ID_6",
    "POWER_BI_CLIENT_ID",
    "POWER_BI_CLIENT_SECRET",
    "POWER_BI_JOURNEYS_MULTIPLE_FULL_REPORT_ID",
    "POWER_BI_JOURNEYS_MULTIPLE_SUMMARY_REPORT_ID",
    "POWER_BI_JOURNEYS_SINGLE_FULL_REPORT_ID",
    "POWER_BI_JOURNEYS_SINGLE_SUMMARY_REPORT_ID",
    "POWER_BI_TENANT_ID",
    "POWER_BI_WORKSPACE_ID",
    "REDIS_PORT",
    "REDIS_URL",
    "SMTP_URL",
    "VERCEL_JOURNEYS_PROJECT_ID",
    "VERCEL_TEAM_ID",
    "VERCEL_TOKEN"
  ]
  service_config = {
    name           = "api-journeys"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 2
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port                             = local.port
      health_check_interval            = 5
      health_check_timeout             = 3
      health_check_healthy_threshold   = 2
      health_check_unhealthy_threshold = 2
    })
    auto_scaling = {
      max_capacity = 4
      min_capacity = 2
      cpu = {
        target_value = 75
      }
      memory = {
        target_value = 75
      }
    }
  }
}
