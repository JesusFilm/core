locals {
  port = 3000
  environment_variables = [
    "JOURNEYS_REVALIDATE_ACCESS_TOKEN",
    "NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE",
    "NEXT_PUBLIC_DATADOG_APPLICATION_ID",
    "NEXT_PUBLIC_DATADOG_CLIENT_TOKEN",
    "NEXT_PUBLIC_FACEBOOK_APP_ID",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_GATEWAY_URL",
    "NEXT_PUBLIC_GTM_ID"
  ]
  service_config = {
    name           = "journeys"
    is_public      = true
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
