locals {
  port = 3000
  environment_variables = [
    "COOKIE_SECRET_CURRENT",
    "FORMIUM_TOKEN",
    "JOURNEYS_REVALIDATE_ACCESS_TOKEN",
    "JOURNEYS_URL",
    "LAUNCH_DARKLY_SDK_KEY",
    "NEXT_PUBLIC_ALGOLIA_API_KEY",
    "NEXT_PUBLIC_ALGOLIA_APP_ID",
    "NEXT_PUBLIC_ALGOLIA_INDEX",
    "NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE",
    "NEXT_PUBLIC_CLOUDFLARE_UPLOAD_KEY",
    "NEXT_PUBLIC_DATADOG_APPLICATION_ID",
    "NEXT_PUBLIC_DATADOG_CLIENT_TOKEN",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FORMIUM_PROJECT_SLUG",
    "NEXT_PUBLIC_FORMIUM_PROJECTID",
    "NEXT_PUBLIC_GATEWAY_URL",
    "NEXT_PUBLIC_GTM_ID",
    "NEXT_PUBLIC_JOURNEYS_URL",
    "NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID",
    "PRIVATE_FIREBASE_CLIENT_EMAIL",
    "PRIVATE_FIREBASE_PRIVATE_KEY",
    "NEXT_PUBLIC_MUX_DEFAULT_REPORTING_KEY",
    "NEXT_PUBLIC_MUX_USER_GENERATED_REPORTING_KEY"
  ]
  service_config = {
    name           = "journeys-admin"
    is_public      = true
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    zone_id        = var.ecs_config.zone_id
    alb = {
      arn      = var.ecs_config.alb.arn
      dns_name = var.ecs_config.alb.dns_name
    }
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port                             = local.port
      health_check_interval            = 5
      health_check_timeout             = 3
      health_check_healthy_threshold   = 2
      health_check_unhealthy_threshold = 2
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
