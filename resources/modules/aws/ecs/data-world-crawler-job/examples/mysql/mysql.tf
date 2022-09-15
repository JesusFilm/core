module "crawler" {
  source = "./../.."

  identifier = "infobase-panorama"
  env        = "lab"

  # org_name = "cru-data" #defaults to cru-data
  collection_name = "Infobase + Panorama"

  database_type = "mysql"

  database = "prod"
  schema   = "prod"
  host     = "production.ctzggtk79wff.us-east-1.rds.amazonaws.com"

  # password is set manually or by cru-ansible into SSM param store

  schedule_expression = "rate(3 minutes)"
}

variable "crawler_db_password" {
  description = "The crawler's database password. Probably should be set via TF_VAR_crawler_db_password env var."
  type        = string
}

resource "aws_ssm_parameter" "crawler_db_password" {
  name        = "/data-world-crawler/infobase-panorama/lab/PASSWORD"
  description = "The crawler's database password, set up by the example."
  type        = "SecureString"
  value       = var.crawler_db_password

  tags = {
    environment = "lab"
  }
}
