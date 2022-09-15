module "crawler" {
  source = "./../.."

  identifier = "summer_missions"
  env        = "lab"

  org_name        = "cru-us-campus" # defaults to cru-data
  collection_name = "Summer Missions Application"

  database_type = "postgresql"

  # database = "summer_missions" # defaults to identifier
  host = "10.16.4.145"

  # password should be set manually or by cru-ansible into SSM param store
  # at /data-world-crawler/{credentials_identifier}/{env}/PASSWORD
  credentials_identifier = "pg-prod-a" # defaults to the identifier

  schedule_expression = "rate(3 minutes)"
}

variable "crawler_db_password" {
  description = "The crawler's database password. Probably should be set via TF_VAR_crawler_db_password env var."
  type        = string
}

resource "aws_ssm_parameter" "crawler_db_password" {
  name        = "/data-world-crawler/pg-prod-a/lab/PASSWORD"
  description = "The crawler's database password, set up by the example."
  type        = "SecureString"
  value       = var.crawler_db_password

  tags = {
    environment = "lab"
  }
}
