
resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${local.service_config_name_env}-logs"
}

resource "aws_ssm_parameter" "parameters" {
  for_each = toset(var.environment_variables)

  name      = "/ecs/${var.service_config.name}/${var.env}/${each.key}"
  type      = "SecureString"
  value     = data.doppler_secrets.app.map[each.key]
  overwrite = true
  tags = {
    name = each.key
  }
}

resource "aws_efs_file_system" "this" {
  availability_zone_name = "us-east-2a"
  creation_token         = "ecs-efs-clickhouse-${var.env}"
  encrypted              = false
  performance_mode       = "generalPurpose"
  throughput_mode        = "bursting"
}

resource "aws_efs_mount_target" "this" {
  file_system_id  = aws_efs_file_system.this.id
  subnet_id       = var.ecs_config.subnets[0]
  security_groups = [var.ecs_config.security_group_id]
}


# Create task definitions for app services
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = local.ecs_task_definition_family
  execution_role_arn       = var.ecs_config.task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.service_config.memory
  cpu                      = var.service_config.cpu
  volume {
    name = "clickhouse-volume-${var.env}"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.this.id
      root_directory = "/"
    }
  }

  container_definitions = jsonencode([
    # app container
    {
      name      = "${local.ecs_task_definition_family}-app"
      image     = "${var.docker_image}"
      essential = true
      cpu       = var.service_config.cpu
      memory    = var.service_config.memory
      command = [
        "/bin/echo \"${templatefile("${path.module}/clickhouse-config.xml", {})}\" > /etc/clickhouse-server/config.xml",
        "/bin/echo \"${templatefile("${path.module}/clickhouse-user-config.xml", {})}\" > /etc/clickhouse-server/users.d/logging.xml"
      ]
      ulimits = [
        {
          name      = "nofile"
          softLimit = 65536
          hardLimit = 65536
        }
      ]
      mountPoints : [
        {
          sourceVolume : "clickhouse-volume-${var.env}",
          containerPath : "/var/lib/clickhouse"
        }
      ],
      portMappings = [
        {
          containerPort = var.service_config.container_port
          hostPort      = var.service_config.host_port
          protocol      = "tcp"
        }
      ]
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

resource "aws_alb_listener" "alb_listener" {
  load_balancer_arn = var.service_config.alb_listener.alb_arn
  port              = var.service_config.alb_listener.port
  protocol          = var.service_config.alb_listener.protocol
  certificate_arn   = var.service_config.alb_listener.protocol == "HTTPS" ? var.service_config.alb_listener.certificate_arn : null

  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "No routes defined"
      status_code  = "200"
    }
  }
}

resource "aws_alb_target_group" "alb_target_group" {
  name        = "${local.service_config_name_env}-tg"
  port        = var.service_config.alb_target_group.port
  protocol    = var.service_config.alb_target_group.protocol
  target_type = "ip"
  vpc_id      = var.ecs_config.vpc_id

  health_check {
    healthy_threshold = 2
    interval          = 5
    timeout           = 4
    path              = var.service_config.alb_target_group.health_check_path
    port              = var.service_config.alb_target_group.health_check_port
    protocol          = var.service_config.alb_target_group.protocol
  }
}

resource "aws_alb_listener_rule" "alb_listener_rule" {
  listener_arn = aws_alb_listener.alb_listener.arn
  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.alb_target_group.arn
  }
  condition {
    host_header {
      values = [
        coalesce(
          var.service_config.alb_listener.dns_name,
          format("%s.%s", var.service_config.name, data.aws_route53_zone.zone.name)
        )
      ]
    }
  }
}

#Create services for app services
resource "aws_ecs_service" "ecs_service" {
  name            = "${local.service_config_name_env}-service"
  cluster         = var.ecs_config.cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type     = "FARGATE"
  desired_count   = 1

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

resource "aws_route53_record" "record" {
  name    = var.service_config.name
  type    = "CNAME"
  ttl     = 300
  zone_id = var.service_config.zone_id
  records = [var.service_config.alb_dns_name]
}
