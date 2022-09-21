resource "aws_cloudwatch_log_group" "main" {
  name = "/ecs/${local.name}"
  tags = local.tags
}