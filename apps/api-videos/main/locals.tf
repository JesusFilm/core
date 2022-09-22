locals {
  identifier    = "api-videos"
  env           = "main"
  port          = 4004
  cpu           = 1024
  memory        = 512
  desired_count = 1
  public_url    = "${local.identifier}.central.jesusfilm.org"
  private_url   = "${local.identifier}-${local.env}"
  env_secrets = {
    DATABASE_DB = var.database_db
    DATABASE_PASS = var.database_pass
    DATABASE_URL = var.database_url
    DATABASE_USER = var.database_user
    ARCLIGHT_API_KEY = var.arclight_api_key
    ARCLIGHT_V3_URL = var.arclight_v3_url    
    CROWDIN_API_KEY = var.crowdin_api_key
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
}
