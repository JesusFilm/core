locals {
  identifier    = "arangodb-bigquery-etl"
  env           = "main"
  env_secrets = {
    DATABASE_DB = var.database_db
    DATABASE_PASS = var.database_pass
    DATABASE_URL = var.database_url
    DATABASE_USER = var.database_user
    GCLOUD = var.gcloud    
  }
  cloudwatch_schedule_expression = "cron(0 0 * * ? *)"

  tags = {
    env          = local.env
    project_name = local.identifier
    application  = local.identifier
    owner        = "apps@cru.org"
    managed_by   = "terraform"
    terraform    = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
