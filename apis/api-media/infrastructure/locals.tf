locals {
  port = 4005
  environment_variables = [
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "ALGOLIA_APPLICATION_ID",
    "ALGOLIA_API_KEY",
    "ALGOLIA_INDEX_VIDEO_VARIANTS",
    "ALGOLIA_INDEX_VIDEOS",
    "CLOUDFLARE_IMAGES_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
    "CLOUDFLARE_IMAGE_ACCOUNT",
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_BUCKET",
    "CLOUDFLARE_R2_CUSTOM_DOMAIN",
    "CLOUDFLARE_R2_ENDPOINT",
    "CLOUDFLARE_R2_SECRET",
    "CORS_ORIGIN",
    "CROWDIN_API_KEY",
    "CROWDIN_DISTRIBUTION_HASH",
    "GATEWAY_HMAC_SECRET",
    "GATEWAY_URL",
    "GOOGLE_APPLICATION_JSON",
    "INTEROP_TOKEN",
    "JOURNEYS_SHORTLINK_DOMAIN",
    "MEDIA_TRANSCODER_TASK_DEFINITION",
    "MUX_ACCESS_TOKEN_ID",
    "MUX_SECRET_KEY",
    "MUX_UGC_ACCESS_TOKEN_ID",
    "MUX_UGC_SECRET_KEY",
    "NAT_ADDRESSES",
    "PG_DATABASE_URL_MEDIA",
    "REDIS_PORT",
    "REDIS_URL",
    "VERCEL_SHORT_LINKS_PROJECT_ID",
    "VERCEL_TEAM_ID",
    "VERCEL_TOKEN",
    "SEGMIND_API_KEY",
    "UNSPLASH_ACCESS_KEY",
    "WATCH_REVALIDATE_SECRET",
    "WATCH_URL"
  ]
  service_config = {
    name           = "api-media"
    is_public      = false
    container_port = local.port
    host_port      = local.port
    cpu            = 1024
    memory         = 2048
    desired_count  = 1
    zone_id        = var.ecs_config.zone_id
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
    })
    auto_scaling = {
      max_capacity = 3
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
