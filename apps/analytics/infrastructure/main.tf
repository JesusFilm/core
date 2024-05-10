
module "plausible" {
  source                = "../../../infrastructure/modules/aws/plausible"
  external_ecs_config   = var.external_ecs_config
  internal_ecs_config   = var.internal_ecs_config
  plausible             = local.plausible
  clickhouse            = local.clickhouse
  env                   = var.env
  doppler_token         = var.doppler_token
  subnet_group_name     = var.subnet_group_name
  vpc_security_group_id = var.vpc_security_group_id
}
