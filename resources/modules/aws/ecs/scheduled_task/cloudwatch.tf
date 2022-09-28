resource "aws_cloudwatch_log_group" "main" {
  name = "/ecs/${local.name}"
  tags = local.tags
}

resource "aws_cloudwatch_event_rule" "event_rule" {
  name                = "${local.name}-event"
  schedule_expression = var.cloudwatch_schedule_expression
}

resource "aws_cloudwatch_event_target" "ecs_scheduled_task" {
  rule      = aws_cloudwatch_event_rule.event_rule.name
  target_id = "${local.name}-event"
  arn       = data.aws_ecs_cluster.cluster.arn
  role_arn  = aws_iam_role.cloudwatch_role.arn

  ecs_target {
    launch_type         = "FARGATE"
    platform_version    = "LATEST"
    task_count          = 1
    task_definition_arn = aws_ecs_task_definition.app.arn
    network_configuration {
      subnets = data.aws_subnets.apps_public.*.id
    }
  }
}