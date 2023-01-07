resource "aws_ecr_repository" "ecr_repository" {
  name = var.task_name
}

resource "aws_ecr_lifecycle_policy" "ecr_policy" {
  repository = aws_ecr_repository.ecr_repository.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire more than 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ssm_parameter" "parameters" {
  for_each = toset(var.environment_variables)

  name      = "/ecs/${var.task_name}/${var.env}/${each.key}"
  type      = "SecureString"
  value     = data.doppler_secrets.app.map[each.key]
  overwrite = true
  tags = {
    name = each.key
  }
}

resource "aws_ecs_task_definition" "this" {
  family = var.task_name
  container_definitions = jsonencode([{
    name      = var.task_name
    image     = "${aws_ecr_repository.ecr_repository.repository_url}:latest"
    cpu       = var.task_cpu
    memory    = var.task_memory
    essential = true
    secrets = [
      for param in aws_ssm_parameter.parameters : {
        name      = param.tags.name
        valueFrom = param.arn
      }
    ]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = "${var.task_name}-${var.env}-logs"
        awslogs-region        = data.aws_region.current.name
        awslogs-stream-prefix = "core"
      }
    }
  }])
  execution_role_arn       = var.task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.task_cpu)
  memory                   = tostring(var.task_memory)
}

resource "aws_cloudwatch_event_rule" "event_rule" {
  name                = var.task_name
  schedule_expression = var.cloudwatch_schedule_expression
}

