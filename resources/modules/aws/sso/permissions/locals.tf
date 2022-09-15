locals {
  tags = merge({
    managed_by = "terraform"
  }, var.tags)
}
