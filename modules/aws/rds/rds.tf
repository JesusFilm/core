resource "aws_db_subnet_group" "default" {
  name       = var.env
  subnet_ids = var.subnet_ids
}
