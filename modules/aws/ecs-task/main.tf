resource "aws_ecr_repository" "ecr_repository" {
  name = "core-${var.service_config.name}"
}

resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${var.service_config.name}-logs"
}

#Create task definitions for app services
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = "core-${var.service_config.name}"
  execution_role_arn       = var.ecs_config.task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.service_config.memory
  cpu                      = var.service_config.cpu

  container_definitions = jsonencode([
    {
      name      = var.service_config.name
      image     = "${local.account}.dkr.ecr.${local.region}.amazonaws.com/core-${var.service_config.name}:latest"
      cpu       = var.service_config.cpu
      memory    = var.service_config.memory
      essential = true
      portMappings = [
        {
          containerPort = var.service_config.container_port
          hostPort : var.service_config.host_port
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "${var.service_config.name}-logs"
          awslogs-region        = local.region
          awslogs-stream-prefix = "core"
        }
      }
    }
  ])
}

resource "aws_alb_target_group" "alb_target_group" {
  name        = "${var.service_config.name}-tg"
  port        = var.service_config.alb_target_group.port
  protocol    = var.service_config.alb_target_group.protocol
  target_type = "ip"
  vpc_id      = var.ecs_config.vpc_id

  health_check {
    path     = var.service_config.alb_target_group.health_check_path
    protocol = var.service_config.alb_target_group.protocol
  }

}


resource "aws_alb_listener_rule" "alb_listener_rule" {
  listener_arn = var.ecs_config.alb_listener[var.service_config.alb_target_group.protocol].arn
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
  name            = "${var.service_config.name}-service"
  cluster         = var.ecs_config.cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type     = "FARGATE"
  desired_count   = var.service_config.desired_count

  network_configuration {
    subnets          = var.ecs_config.subnets
    assign_public_ip = var.ecs_config.is_public
    security_groups  = [var.ecs_config.security_group_id]
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.alb_target_group.arn
    container_name   = var.service_config.name
    container_port   = var.service_config.container_port
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
  name               = "core-memory-autoscaling"
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
  name               = "core-cpu-autoscaling"
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
