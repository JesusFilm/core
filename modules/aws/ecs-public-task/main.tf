resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name     = lower("${var.service_config.name}-logs")
}

resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = "core-${lower(var.service_config.name)}"
  execution_role_arn       = var.ecs_task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.service_config.memory
  cpu                      = var.service_config.cpu

  container_definitions = jsonencode([
    {
      name         = var.service_config.name
      image        = "${var.account}.dkr.ecr.${var.region}.amazonaws.com/core-${lower(var.service_config.name)}:latest"
      cpu          = var.service_config.cpu
      memory       = var.service_config.memory
      essential    = true
      portMappings = [
        {
          containerPort = var.service_config.container_port
          hostPort : var.service_config.host_port
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options   = {
          awslogs-group         = "${lower(var.service_config)}-logs"
          awslogs-region        = var.region
          awslogs-stream-prefix = "core"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "ecs_service" {
  name            = "${var.service_config.name}-service"
  cluster         = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type     = "FARGATE"
  desired_count   = var.service_config.desired_count

  network_configuration {
    subnets          = var.public_subnets
    assign_public_ip = true
    security_groups  = [aws_security_group.public_security_group.id]
  }

  load_balancer {
    target_group_arn = var.public_alb_target_groups[var.service_config.name].arn
    container_name   = var.service_config.name
    container_port   = var.service_config.container_port
  }
}

resource "aws_appautoscaling_target" "service_autoscaling" {
  max_capacity       = var.service_config.auto_scaling.max_capacity
  min_capacity       = var.service_config.auto_scaling.min_capacity
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.ecs_service.name}"
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
