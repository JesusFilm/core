locals {
  name = "${var.identifier}-${var.env}"
  repo = var.github_repo == "" ? var.identifier : var.github_repo

  # Tags are merged with var.extra_tags, var.extra_tags take precedence
  tags = merge({
    Name        = local.name
    env         = var.env
    application = var.identifier
    function    = "app"
    managed_by  = "terraform"
    owner       = var.contact_email
  }, var.extra_tags)

  environment = {
    lab   = "lab"
    dev   = "development"
    stage = "staging"
    main  = "production"
  }[var.env]

  # Use var.dns_name if set, otherwise build dns_name from identifier and zone
  dns_name = var.dns_name == "" && var.zone_id != "" ? "${var.env == "prod" ? var.identifier : local.name}.${replace(data.aws_route53_zone.zone[0].name, "/[.]$/", "")}" : var.dns_name

  notification_recipients = join(" ", formatlist("@%s", var.notification_recipients))
}
