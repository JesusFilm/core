data "aws_region" "current" {}

data "aws_availability_zones" "current" {
  filter {
    name   = "region-name"
    values = [data.aws_region.current.id]
  }
}

# Existing clusters opt into a live-state guard. New-cluster callers leave it off.
data "aws_rds_cluster" "live" {
  count              = var.enforce_major_upgrade_approval ? 1 : 0
  cluster_identifier = "${var.name}-${var.env}"
}
