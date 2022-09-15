module "crawler" {
  source = "./../.."

  identifier = "cru-snowplow"
  env        = "lab"

  # org_name = "cru-data" #defaults to cru-data
  collection_name = "Snowplow"

  database_type = "bigquery"

  # credential file is set by terraform into SSM param store
  project_id          = "cru-snowplow-prod-1"
  dataset             = "derived"
  schedule_expression = "rate(3 minutes)"
}

variable "my_gcp_email" {
  description = "The email address to identify the user who should temporarily get permissions to create a service account key for this example."
  type        = string
}

data "google_service_account" "crawler_sa" {
  project    = "cru-snowplow-prod-1"
  account_id = "data-world-sp"
}

resource "google_project_iam_member" "i_can_add_service_account_keys" {
  role    = "roles/iam.serviceAccountKeyAdmin"
  member  = "user:${var.my_gcp_email}"
  project = "cru-snowplow-prod-1"
}


resource "google_service_account_key" "crawler_sa_key" {
  service_account_id = data.google_service_account.crawler_sa.name

  depends_on = [google_project_iam_member.i_can_add_service_account_keys]
}

resource "aws_ssm_parameter" "crawler_sa_key" {
  name        = "/data-world-crawler/cru-snowplow/lab/CREDENTIAL_FILE_CONTENTS"
  description = "The crawler's service account key, set up by the example."
  type        = "SecureString"
  value       = base64decode(google_service_account_key.crawler_sa_key.private_key)

  tags = {
    environment = "lab"
  }
}
