
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

  name      = "/ecs/${coalesce(var.service_config.doppler_project_name, var.service_config.name)}/${var.env}/${each.key}"
  type      = "SecureString"
  value     = data.doppler_secrets.app.map[each.key]
  overwrite = true
  tags = {
    name = each.key
  }
}

# Create task definitions for app services
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = local.ecs_task_definition_family
  execution_role_arn       = var.ecs_config.task_execution_role_arn
  task_role_arn            = data.aws_iam_role.ecs_task_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.service_config.memory
  cpu                      = var.service_config.cpu

  container_definitions = jsonencode([
    # app container
    {
      name      = "${local.ecs_task_definition_family}-app"
      image     = "${aws_ecr_repository.ecr_repository.repository_url}:latest"
      essential = true
      cpu       = var.service_config.cpu
      memory    = var.service_config.memory
      portMappings = [
        {
          containerPort = var.service_config.container_port
          hostPort      = var.service_config.host_port
          protocol      = "tcp"
        }
      ]
      secrets = concat(concat([
        for param in aws_ssm_parameter.parameters : {
          name      = param.tags.name
          valueFrom = param.arn
        }
        ], [
        {
          name      = "DD_API_KEY"
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/DATADOG_API_KEY"
        }
        ]), var.include_aws_env_vars ? [
        {
          name      = "AWS_ACCESS_KEY_ID",
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/AWS_ACCESS_KEY_ID"
        },
        {
          name      = "AWS_SECRET_ACCESS_KEY",
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/terraform/prd/AWS_SECRET_ACCESS_KEY"
        }
      ] : [])
      logConfiguration = {
        logDriver = "awsfirelens"
        options = {
          Name        = "datadog"
          Host        = "http-intake.logs.datadoghq.com"
          TLS         = "on"
          compress    = "gzip"
          dd_service  = var.service_config.name
          dd_source   = var.dd_source
          dd_tags     = "env:${var.env}"
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
      environment = concat([
        {
          name  = "NODE_ENV",
          value = "production"
        },
        {
          name  = "SERVICE_NAME",
          value = var.service_config.name
        },
        {
          name  = "SERVICE_ENV",
          value = var.env
        }],
        var.include_aws_env_vars ? [
          {
            name  = "AWS_REGION",
            value = data.aws_region.current.name
          },
          {
            name  = "ECS_CLUSTER",
            value = var.ecs_config.cluster.name
          }
      ] : [])
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
          name  = "DD_APM_ENABLED",
          value = "true"
        },
        {
          name  = "DD_DOGSTATSD_NON_LOCAL_TRAFFIC",
          value = "true"
        },
        {
          name  = "DD_APM_NON_LOCAL_TRAFFIC",
          value = "true"
        },
        {
          name  = "DD_PROCESS_AGENT_ENABLED",
          value = "true"
        },
        {
          name  = "DD_TAGS",
          value = "env:${var.env} app:${var.service_config.name}"
        },
        {
          name  = "DD_TRACE_ANALYTICS_ENABLED",
          value = "true"
        },
        {
          name  = "DD_RUNTIME_METRICS_ENABLED",
          value = "true"
        },
        {
          name  = "DD_PROFILING_ENABLED",
          value = "true"
        },
        {
          name  = "DD_LOGS_INJECTION",
          value = "true"
        },
        {
          name  = "DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_GRPC_ENDPOINT",
          value = "0.0.0.0:4317"
        },
        {
          name  = "DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_HTTP_ENDPOINT",
          value = "0.0.0.0:4318"
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
          protocol      = "tcp"
          hostPort      = 4317
          containerPort = 4317
        },
        {
          protocol      = "tcp"
          hostPort      = 4318
          containerPort = 4318
        },
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
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = "core"
        }
      }
    }
  ])
  tags = {}
}

resource "aws_alb_target_group" "alb_target_group" {
  name        = "${local.service_config_name_env}-tg"
  port        = var.service_config.alb_target_group.port
  protocol    = var.service_config.alb_target_group.protocol
  target_type = "ip"
  vpc_id      = var.ecs_config.vpc_id

  health_check {
    healthy_threshold   = 2
    unhealthy_threshold = 4
    interval            = 10
    timeout             = 4
    path                = var.service_config.alb_target_group.health_check_path
    port                = var.service_config.alb_target_group.health_check_port
    protocol            = var.service_config.alb_target_group.protocol
  }
}

resource "aws_alb_listener_rule" "alb_listener_rule" {
  listener_arn = var.alb_listener_arn
  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.alb_target_group.arn
  }
  condition {
    host_header {
      values = length(var.host_names) > 0 ? var.host_names : [
        coalesce(
          var.host_name,
          format("%s.%s", var.service_config.name, data.aws_route53_zone.zone.name)
        )
      ]
    }
  }
}

#Create services for app services
resource "aws_ecs_service" "ecs_service" {
  name                   = "${local.service_config_name_env}-service"
  cluster                = var.ecs_config.cluster.id
  task_definition        = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type            = "FARGATE"
  desired_count          = var.service_config.desired_count
  enable_execute_command = true

  network_configuration {
    subnets          = var.ecs_config.subnets
    assign_public_ip = var.service_config.is_public
    security_groups  = [var.ecs_config.security_group_id]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_target_group.arn
    container_name   = "${local.ecs_task_definition_family}-app"
    container_port   = var.service_config.container_port
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_appautoscaling_target" "service_autoscaling" {
  max_capacity       = var.service_config.auto_scaling.max_capacity
  min_capacity       = var.service_config.auto_scaling.min_capacity
  resource_id        = "service/${var.ecs_config.cluster.name}/${aws_ecs_service.ecs_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_memory" {
  name               = "jfp-memory-autoscaling-${var.env}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.service_autoscaling.resource_id
  scalable_dimension = aws_appautoscaling_target.service_autoscaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }

    target_value = var.service_config.auto_scaling.memory.target_value
  }
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "jfp-cpu-autoscaling-${var.env}"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.service_autoscaling.resource_id
  scalable_dimension = aws_appautoscaling_target.service_autoscaling.scalable_dimension
  service_namespace  = aws_appautoscaling_target.service_autoscaling.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value = var.service_config.auto_scaling.cpu.target_value
  }
}

resource "aws_route53_record" "record" {
  name    = var.service_config.name
  type    = "CNAME"
  ttl     = 300
  zone_id = var.service_config.zone_id
  records = [var.alb_dns_name]
}
