module "crawler" {
  source = "./../.."

  identifier = "siebel"
  env        = "lab"

  # org_name = "cru-data" #defaults to cru-data
  collection_name = "Siebel CRM"

  database_type = "oracle"

  database = "sbl8p1"
  schema   = "SIEBEL"
  host     = "plrac1.ccci.org"

  # password is set manually or by cru-ansible into SSM param store

  schedule_expression = "rate(10 minutes)"
}

variable "crawler_db_password" {
  description = "The crawler's database password. Probably should be set via TF_VAR_crawler_db_password env var."
  type        = string
}

resource "aws_ssm_parameter" "crawler_db_password" {
  name        = "/data-world-crawler/siebel/lab/PASSWORD"
  description = "The crawler's database password, set up by the example."
  type        = "SecureString"
  value       = var.crawler_db_password

  tags = {
    environment = "lab"
  }
}
