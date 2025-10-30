module "ecs-task-job" {
  source                  = "../../../infrastructure/modules/aws/ecs-task-job"
  task_execution_role_arn = var.task_execution_role_arn
  name                    = "media-transcoder"
  env                     = var.env
  doppler_token           = var.doppler_token
  cpu                     = 2048
  memory                  = 4096
  environment_variables = [
    "CLOUDFLARE_R2_ACCESS_KEY_ID",
    "CLOUDFLARE_R2_BUCKET",
    "CLOUDFLARE_R2_ENDPOINT",
    "CLOUDFLARE_R2_SECRET",
    "REDIS_PORT",
    "REDIS_URL",
  ]
}
