
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

  name      = "/ecs/${var.service_config.name}/${var.env}/${each.key}"
  type      = "SecureString"
  value     = data.doppler_secrets.app.map[each.key]
  overwrite = true
  tags = {
    name = each.key
  }
}


module "ecs_datadog_agent" {
  source               = "hazelops/ecs-datadog-agent/aws"
  version              = "3.2.0"
  app_name             = var.service_config.name
  cloudwatch_log_group = resource.aws_cloudwatch_log_group.ecs_cw_log_group.name
  ecs_launch_type      = "FARGATE"
  env                  = var.env
  name                 = "${local.ecs_task_definition_family}-datadog-agent"
}


#Create task definitions for app services
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = local.ecs_task_definition_family
  execution_role_arn       = var.ecs_config.task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.service_config.memory
  cpu                      = var.service_config.cpu

  container_definitions = jsonencode([
    {
      name      = "${local.ecs_task_definition_family}-app"
      image     = "${aws_ecr_repository.ecr_repository.repository_url}:latest"
      cpu       = var.service_config.cpu
      memory    = var.service_config.memory
      essential = true
      portMappings = [
        {
          containerPort = var.service_config.container_port
          hostPort      = var.service_config.host_port
          protocol      = "tcp"
        }
      ]
      secrets = [
        for param in aws_ssm_parameter.parameters : {
          name      = param.tags.name
          valueFrom = param.arn
        }
      ]
      logConfiguration = {
        logDriver = "awsfirelens",
        options = {
          Name        = "datadog",
          Host        = "http-intake.logs.datadoghq.com",
          TLS         = "on",
          dd_service  = "${local.ecs_task_definition_family}-app"
          dd_host     = local.ecs_task_definition_family,
          dd_source   = "ecs",
          dd_tags     = "env:${var.env} app:${var.service_config.name}",
          provider    = "ecs",
          retry_limit = "2",
        },
        secretOptions = [{
          name      = "apikey",
          valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.env}/global/DD_API_KEY"
        }]
      },
      environment = []
      mountPoints = []
      volumesFrom = []
    },
    module.ecs_datadog_agent.container_definition,
    {
      essential = true
      image     = "amazon/aws-for-fluent-bit:stable"
      name      = "${local.ecs_task_definition_family}-log-router"
      firelensConfiguration = {
        type = "fluentbit"
        options = {
          enable-ecs-log-metadata = "true"
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
    path_pattern {
      values = var.service_config.alb_target_group.path_pattern
    }
  }
}

#Create services for app services
resource "aws_ecs_service" "ecs_service" {
  name            = "${local.service_config_name_env}-service"
  cluster         = var.ecs_config.cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type     = "FARGATE"
  desired_count   = var.service_config.desired_count

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
  records = [var.service_config.alb_dns_name]
}
