module "main" {
  source = "../../../resources/modules/aws/ecs/app"

  identifier    = local.identifier
  env           = local.env
  cpu           = 1024
  memory        = 2048
  desired_count = 1
  port          = local.port
  public_url    = local.public_url
  env_secrets   = local.env_secrets
  tags          = local.tags
}