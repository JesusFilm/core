
resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${var.task_name}-logs"
}

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

# Create task definitions for scheduled tasks
resource "aws_ecs_task_definition" "default" {
  family                   = var.task_name
  execution_role_arn       = var.task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = tostring(var.task_cpu)
  memory                   = tostring(var.task_memory)

  container_definitions = jsonencode([
    # app container
    {
      name      = "${var.task_name}-app"
      image     = "${aws_ecr_repository.ecr_repository.repository_url}:latest"
      essential = true
      cpu       = var.task_cpu
      memory    = var.task_memory
      secrets = concat([
        for param in aws_ssm_parameter.parameters : {
          name      = param.tags.name
          valueFrom = param.arn
        }
        ], [
        {
          name      = "DD_API_KEY"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
        }
      ])
      logConfiguration = {
        logDriver = "awsfirelens"
        options = {
          Name        = "datadog"
          Host        = "http-intake.logs.datadoghq.com"
          TLS         = "on"
          dd_service  = "ecs"
          dd_source   = "aws"
          dd_tags     = "env:${var.env},app:${var.task_name},host:${var.task_name}-app"
          provider    = "ecs"
          retry_limit = "2"
        }
        secretOptions = [
          {
            name      = "apikey"
            valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
          }
        ]
      }
      environment = []
      mountPoints = []
      volumesFrom = []
    },
    # datadog agent container
    {
      name              = "${var.task_name}-datadog-agent"
      image             = "public.ecr.aws/datadog/agent:latest"
      essential         = true
      cpu               = 0
      memoryReservation = 128
      environment = [
        {
          name  = "DD_DOGSTATSD_NON_LOCAL_TRAFFIC",
          value = "true"
        },
        {
          name  = "DD_PROCESS_AGENT_ENABLED",
          value = "true"
        },
        {
          name  = "DD_TAGS",
          value = "env:${var.env} app:${var.task_name}"
        },
        {
          name  = "ECS_FARGATE",
          value = "true"
        }
      ]
      secrets = [
        {
          name      = "DD_API_KEY"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
        }
      ]
      mountPoints = []
      portMappings = [
        {
          protocol      = "udp"
          hostPort      = 8125
          containerPort = 8125
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = resource.aws_cloudwatch_log_group.ecs_cw_log_group.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "core"
        }
      }
      volumesFrom = []
    },
    # log router container
    {
      name              = "${var.task_name}-log-router"
      image             = "amazon/aws-for-fluent-bit:stable"
      essential         = true
      cpu               = 0
      memoryReservation = 100
      environment       = []
      mountPoints       = []
      portMappings      = []
      user              = "0"
      volumesFrom       = []
      firelensConfiguration = {
        type = "fluentbit"
        options = {
          enable-ecs-log-metadata = "true"
          config-file-type        = "file"
          config-file-value       = "/fluent-bit/configs/parse-json.conf"
        }
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = resource.aws_cloudwatch_log_group.ecs_cw_log_group.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "core"
        }
      }
    }
  ])
  tags = {}
}

resource "aws_cloudwatch_event_rule" "default" {
  name                = var.task_name
  schedule_expression = var.cloudwatch_schedule_expression
}

resource "aws_cloudwatch_event_target" "default" {
  target_id = var.task_name
  arn       = var.cluster_arn
  rule      = aws_cloudwatch_event_rule.default.name
  role_arn  = aws_iam_role.ecs_event.arn
  ecs_target {
    launch_type         = "FARGATE"
    task_definition_arn = aws_ecs_task_definition.default.arn
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
  name               = "${var.task_name}-ecs-task-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_assume_role_policy.json
}

resource "aws_iam_policy" "ecs_task_execution" {
  name   = "${var.task_name}-ecs-task-execution"
  policy = data.aws_iam_policy.ecs_task_execution.policy
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_task_execution.arn
}
