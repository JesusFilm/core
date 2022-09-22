locals {
  name = "${var.identifier}-${var.env}"
  tags = var.tags
  developers = []
  notification_recipients = []
}
