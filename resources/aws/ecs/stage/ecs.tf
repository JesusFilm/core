resource "aws_ecs_cluster" "stage" {
  name = local.env
}
