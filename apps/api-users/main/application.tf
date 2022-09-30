module "main" {
  source = "../../../resources/modules/aws/ecs/app"

  identifier    = local.identifier
  env           = local.env
  cpu           = local.cpu
  memory        = local.memory
  desired_count = local.desired_count
  port          = local.port
  public_url    = local.public_url
  env_secrets   = local.env_secrets
  include_rds   = true
  database_user = var.database_user
  database_pass = var.database_pass
  database_root_pass = var.database_root_pass
  tags          = local.tags
}