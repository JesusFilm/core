locals {
  port = 4003
  environment_variables = [
    "PG_DATABASE_URL_LANGUAGES",
    "ALGOLIA_API_KEY_LANGUAGES",
    "ALGOLIA_APPLICATION_ID",
    "ALGOLIA_INDEX_COUNTRIES",
    "ALGOLIA_INDEX_LANGUAGES",
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "CLOUDFLARE_R2_BUCKET",
    "CLOUDFLARE_R2_ENDPOINT",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_SECRET",
    "REDIS_PORT",
    "REDIS_URL",
    "WESS_API_TOKEN",
    "GATEWAY_HMAC_SECRET"
  ]
  # Stage peaked at 0.65 GiB of memory and a few percent of one vCPU over
  # 14 days, so it runs on half the task size prod gets.
  service_config = {
    name                              = "api-languages"
    is_public                         = false
    container_port                    = local.port
    host_port                         = local.port
    cpu                               = var.env == "stage" ? 512 : 1024
    memory                            = var.env == "stage" ? 1024 : 2048
    desired_count                     = var.env == "stage" ? 1 : 1
    zone_id                           = var.ecs_config.zone_id
    health_check_grace_period_seconds = 60
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
      # Stage fails fast, like api-gateway: these were set by hand on the
      # stage target groups while ecs-task ignored health_check drift.
      # null = the module defaults, which is what prod has.
      health_check_interval            = var.env == "stage" ? 5 : null
      health_check_timeout             = var.env == "stage" ? 3 : null
      health_check_healthy_threshold   = var.env == "stage" ? 2 : null
      health_check_unhealthy_threshold = var.env == "stage" ? 2 : null
    })
    auto_scaling = {
      max_capacity = var.env == "stage" ? 1 : 3
      min_capacity = var.env == "stage" ? 1 : 1
      cpu = {
        target_value = 75
      }
      memory = {
        target_value = 75
      }
    }
  }
}
