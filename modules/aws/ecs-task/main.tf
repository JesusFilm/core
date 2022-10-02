resource "aws_ecr_repository" "ecr_repository" {
  name = "core-${var.service_config.name}"
}

resource "aws_cloudwatch_log_group" "ecs_cw_log_group" {
  name = "${var.service_config.name}-logs"
}

#Create task definitions for app services
resource "aws_ecs_task_definition" "ecs_task_definition" {
  family                   = "core-${var.service_config.name}"
  execution_role_arn       = var.ecs_task_execution_role_arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = var.service_config.memory
  cpu                      = var.service_config.cpu

  container_definitions = jsonencode([
    {
      name      = var.service_config.name
      image     = "${var.account}.dkr.ecr.${var.region}.amazonaws.com/core-${var.service_config.name}:latest"
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
          awslogs-region        = var.region
          awslogs-stream-prefix = "core"
        }
      }
    }
  ])
}

#Create services for app services
resource "aws_ecs_service" "private_service" {
  name            = "${var.service_config.name}-service"
  cluster         = var.ecs_cluster_id
  task_definition = aws_ecs_task_definition.ecs_task_definition.arn
  launch_type     = "FARGATE"
  desired_count   = var.service_config.desired_count

  network_configuration {
    subnets          = var.service_config.is_public == true ? var.public_subnets : var.internal_subnets
    assign_public_ip = var.service_config.is_public == true ? true : false
    security_groups = [
      var.service_config.is_public == true ? aws_security_group.webapp_security_group.id : aws_security_group.service_security_group.id
    ]
  }

  load_balancer {
    target_group_arn = var.service_config.is_public == true ? var.public_alb_target_groups[each.key].arn : var.internal_alb_target_groups[each.key].arn
    container_name   = var.service_config.name
    container_port   = var.service_config.container_port
  }
}

resource "aws_appautoscaling_target" "service_autoscaling" {
  max_capacity       = var.service_config.auto_scaling.max_capacity
  min_capacity       = var.service_config.auto_scaling.min_capacity
  resource_id        = "service/${aws_ecs_cluster.ecs_cluster.name}/${aws_ecs_service.private_service.name}"
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

resource "aws_security_group" "service_security_group" {
  vpc_id = var.vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [var.internal_alb_security_group.security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "webapp_security_group" {
  vpc_id = var.vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [var.public_alb_security_group.security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
