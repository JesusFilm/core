locals {
  name = "${var.identifier}-${var.env}"
  # Tags are merged with var.extra_tags, var.extra_tags take precedence
  tags = merge({
    Name        = local.name
    env         = var.env
    application = var.identifier
    function    = "app"
    managed_by  = "terraform"
    owner       = var.contact_email
  }, var.extra_tags)

}
