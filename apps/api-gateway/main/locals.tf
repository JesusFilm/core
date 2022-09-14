locals {
  identifier  = "api-gateway"
  env         = "main"
  environment = "production"
  port        = "4000"
  public_url  = "graphql.jesusfilm.org"
  private_url = "api-gateway-main"

  tags = {
    Name         = "${local.identifier}-${local.env}"
    env          = local.env
    project_name = local.identifier
    application  = local.identifier
    # owner        = "apps@cru.org"
    managed_by   = "terraform"
    terraform    = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }

  developers = []

  notification_recipients = []
}
