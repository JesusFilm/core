locals {
  identifier    = "arangodb-s3-backup"
  env           = "main"
  env_secrets = {
    DATABASE_DB = var.database_db
    DATABASE_PASS = var.database_pass
    DATABASE_URL = var.database_url
    DATABASE_USER = var.database_user
    AWS_ACCESS_KEY_ID = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
    S3_BUCKET = var.s3_bucket
  }
  cloudwatch_schedule_expression = "cron(0 2 * * ? *)"

  tags = {
    env          = local.env
    project_name = local.identifier
    application  = local.identifier
    owner        = "apps@cru.org"
    managed_by   = "terraform"
    terraform    = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}
