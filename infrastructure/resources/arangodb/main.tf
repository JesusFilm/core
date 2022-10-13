resource "oasis_project" "core" {
  name         = "Jesusfilm Core Project"
  organization = data.oasis_organization.jesusfilm.id
}

resource "oasis_deployment" "oneshard_deployment" {
  terms_and_conditions_accepted = "true"
  project                       = oasis_project.core.id // Project id where deployment will be created
  name                          = "core_deployment"
  disk_performance              = "dp30"

  location {
    region = "aws-us-east-2"
  }

  version {
    db_version = "3.8.7"
  }

  configuration {
    model = "oneshard"
    maximum_node_disk_size = 20
  }

  notification_settings {
    email_addresses = [
      "dj.mikeallison@gmail.com"
    ]
  }
}