locals {
  port = 4005
  # Every key here must exist in the api-media Doppler config of each
  # environment (it becomes an SSM parameter, and AWS rejects an empty value).
  # Short-link settings that have no value yet are left out, and api-media
  # treats each as switched off. Add them back as the values arrive (the
  # module makes an SSM parameter per name, so the Doppler key must exist and
  # be non-empty in every environment the name is listed for):
  #   CLOUDFLARE_SHORT_LINKS_API_TOKEN, CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID
  #     -> edge publishing (the Worker serves through api-media until then);
  #        stage only below until the prod namespace and token exist
  #   SHORT_LINKS_CLICKHOUSE_URL, _USER, _PASSWORD, _DATABASE
  #     -> scan statistics (zeros until then)
  #   SLACK_SHORT_LINKS_BOT_TOKEN, SLACK_SHORT_LINKS_CHANNEL_ID
  #     -> destination health alerts (logged only until then)
  environment_variables = concat([
    "ARCLIGHT_API_KEY",
    "ARCLIGHT_V3_URL",
    "ALGOLIA_APPLICATION_ID",
    "ALGOLIA_API_KEY",
    "ALGOLIA_INDEX_VIDEO_VARIANTS",
    "ALGOLIA_INDEX_VIDEOS",
    "ALGOLIA_INDEX_LANGUAGES",
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
    "CROWDIN_PROJECT_ID",
    "CROWDIN_DISTRIBUTION_HASH",
    "FIREBASE_API_KEY",
    "GATEWAY_HMAC_SECRET",
    "GATEWAY_URL",
    "GOOGLE_APPLICATION_JSON",
    "INTEROP_TOKEN",
    "JOURNEYS_SHORTLINK_DOMAIN",
    "MUX_ACCESS_TOKEN_ID",
    "MUX_SECRET_KEY",
    "MUX_UGC_ACCESS_TOKEN_ID",
    "MUX_UGC_SECRET_KEY",
    "NAT_ADDRESSES",
    "PG_DATABASE_URL_MEDIA",
    "PG_DATABASE_URL_LANGUAGES",
    "PG_DATABASE_URL_JOURNEYS",
    "PG_DATABASE_URL_USERS",
    "REDIS_PORT",
    "REDIS_URL",
    "SLACK_DATA_LANGS_CHANNEL_ID",
    "SLACK_PRODUCTION_MANAGERS_CHANNEL_ID",
    "SLACK_VIDEO_ADMIN_BOT_TOKEN",
    "VERCEL_SHORT_LINKS_PROJECT_ID",
    "VERCEL_TEAM_ID",
    "VERCEL_TOKEN",
    "SEGMIND_API_KEY",
    "UNSPLASH_ACCESS_KEY",
    "WATCH_REVALIDATE_SECRET",
    "WATCH_URL"
    ], var.env == "stage" ? [
    "CLOUDFLARE_SHORT_LINKS_API_TOKEN",
    "CLOUDFLARE_SHORT_LINKS_KV_NAMESPACE_ID"
  ] : [])
  service_config = {
    name                              = "api-media"
    is_public                         = false
    container_port                    = local.port
    host_port                         = local.port
    cpu                               = 1024
    memory                            = 2048
    desired_count                     = var.env == "stage" ? 1 : 1
    zone_id                           = var.ecs_config.zone_id
    health_check_grace_period_seconds = 60
    alb_target_group = merge(var.ecs_config.alb_target_group, {
      port = local.port
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
