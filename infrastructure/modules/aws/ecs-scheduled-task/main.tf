
module "task" {
  source                  = "../ecs-task-job"
  name                    = var.task_name
  doppler_token           = var.doppler_token
  environment_variables   = var.environment_variables
  cpu                     = var.task_cpu
  memory                  = var.task_memory
  task_execution_role_arn = var.task_execution_role_arn
  env                     = var.env
}

resource "aws_cloudwatch_event_rule" "default" {
  name                = local.service_config_name_env
  schedule_expression = var.cloudwatch_schedule_expression
}

resource "aws_cloudwatch_event_target" "default" {
  target_id = var.task_name
  arn       = var.cluster_arn
  rule      = aws_cloudwatch_event_rule.default.name
  role_arn  = aws_iam_role.ecs_event.arn
  ecs_target {
    launch_type         = "FARGATE"
    task_definition_arn = module.task.task_definition_arn
    network_configuration {
      assign_public_ip = false
      # security_groups = var.security_groups
      subnets = var.subnet_ids
    }
  }
}

resource "aws_iam_role" "ecs_event" {
  name               = "${var.task_name}-ecs-event-role"
  assume_role_policy = data.aws_iam_policy_document.ecs_events_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "ecs_event" {
  role       = aws_iam_role.ecs_event.name
  policy_arn = data.aws_iam_policy.ecs_event.arn
}

resource "aws_iam_role" "ecs_task_execution" {
  name               = "${local.service_config_name_env}-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role_policy.json
}

resource "aws_iam_policy" "ecs_task_execution" {
  name   = "${local.service_config_name_env}-ecs-task-execution"
  policy = data.aws_iam_policy.ecs_task_execution.policy
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_task_execution.arn
}
