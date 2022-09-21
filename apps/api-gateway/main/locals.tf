locals {
  identifier  = "api-gateway"
  env         = "main"
  environment = "production"
  name        = "${local.identifier}-${local.env}"
  port        = 4000
  public_url  = "graphql.central.jesusfilm.org"
  private_url = "api-gateway-main"
  env_secrets = {
    APOLLO_GRAPH_REF = var.apollo_graph_ref
    APOLLO_KEY = var.apollo_key
    AWS_ACCESS_KEY_ID = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
    GOOGLE_APPLICATION_JSON = var.google_application_json
    LOGGING_LEVEL = var.logging_level
   }

  tags = {
    Name         = local.name
    env          = local.env
    project_name = local.identifier
    application  = local.identifier
    owner        = "apps@cru.org"
    managed_by   = "terraform"
    terraform    = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }

  developers = []

  notification_recipients = []
}
