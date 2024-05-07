
module "plausible" {
  source         = "../../../infrastructure/modules/aws/plausible"
  ecs_config     = var.ecs_config
  service_config = local.service_config
  env            = var.env
  doppler_token  = var.doppler_token
}
