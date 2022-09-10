resource "aws_ecs_cluster" "prod" {
  name = local.env
}