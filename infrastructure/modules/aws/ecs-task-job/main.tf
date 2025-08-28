
resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${local.service_config_name_env}-logs"
}

resource "aws_ecr_repository" "ecr_repository" {
  name = local.ecs_task_definition_family
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

  name      = "/ecs/${var.name}/${var.env}/${each.key}"
  type      = "SecureString"
  value     = data.doppler_secrets.app.map[each.key]
  overwrite = true
  tags = {
    name = each.key
  }
}

resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = local.ecs_task_definition_family
  execution_role_arn       = var.task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.memory
  cpu                      = var.cpu

  container_definitions = jsonencode([
    # app container
    {
      name      = "${local.ecs_task_definition_family}-app"
      image     = "${aws_ecr_repository.ecr_repository.repository_url}:latest"
      essential = true
      cpu       = var.cpu
      memory    = var.memory
      secrets = concat([
        for param in aws_ssm_parameter.parameters : {
          name      = param.tags.name
          valueFrom = param.arn
        }
        ], [
        {
          name      = "DD_API_KEY"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
        }
      ])
      logConfiguration = {
        logDriver = "awsfirelens"
        options = {
          Name        = "datadog"
          Host        = "http-intake.logs.datadoghq.com"
          TLS         = "on"
          dd_service  = local.ecs_task_definition_family
          dd_source   = "node"
          dd_tags     = "env:${var.env}"
          provider    = "ecs"
          retry_limit = "2"
        }
        secretOptions = [
          {
            name      = "apikey"
            valueFrom = "arn:aws:ssm:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
          }
        ]
      }
      environment = [
        {
          name  = "NODE_ENV",
          value = "production"
        }
      ]
      mountPoints = []
      volumesFrom = []
    },
    # datadog agent container
    {
      name              = "${local.ecs_task_definition_family}-datadog-agent"
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
          value = "env:${var.env} app:${local.ecs_task_definition_family}"
        },
        {
          name  = "ECS_FARGATE",
          value = "true"
        }
      ]
      secrets = [
        {
          name      = "DD_API_KEY"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
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
          awslogs-region        = data.aws_region.current.id
          awslogs-stream-prefix = "core"
        }
      }
      volumesFrom = []
    },
    # log router container
    {
      name              = "${local.ecs_task_definition_family}-log-router"
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
          awslogs-region        = data.aws_region.current.id
          awslogs-stream-prefix = "core"
        }
      }
    }
  ])
  tags = {}
}
