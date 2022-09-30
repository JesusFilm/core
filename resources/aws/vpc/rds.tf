resource "aws_db_subnet_group" "default" {
  name       = "main"
  subnet_ids = [for subnet in aws_subnet.prod_db: subnet.id]

  tags = local.tags
}