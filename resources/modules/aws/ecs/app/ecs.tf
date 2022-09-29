resource "aws_ecs_service" "service" {
  name                     = local.name
  cluster                  = data.aws_ecs_cluster.cluster.id
  desired_count            = var.desired_count
  task_definition          = aws_ecs_task_definition.app.arn
  launch_type              = "FARGATE"
  scheduling_strategy      = "REPLICA"
  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name   = "${local.name}-container"
    container_port   = var.port
  }
  network_configuration {
    security_groups  = [aws_security_group.task.id] 
    subnets          = data.aws_subnets.apps_public.ids
    assign_public_ip = false
  }
  
  # we ignore task_definition changes as the revision changes on deploy
  # of a new version of the application
  # desired_count is ignored as it can change due to autoscaling policy
  lifecycle { 
    ignore_changes        = [task_definition, desired_count]
    create_before_destroy = true
  }
}

resource "aws_ecs_task_definition" "app" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.cpu
  memory                   = var.memory
  family                   = "${var.identifier}-task"
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  container_definitions = jsonencode([{
   name        = "${local.name}-container"
   image       = "${data.aws_ecr_repository.main.repository_url}:${var.env}"
   essential   = true
   secrets     = [
     for param in aws_ssm_parameter.parameters: {
      name  = param.tags.name
      valueFrom = param.arn
     }
   ]
   portMappings = [{
     containerPort = var.port
     hostPort      = var.port
   }]
   logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.main.name
        awslogs-stream-prefix = "ecs"
        awslogs-region        = data.aws_region.current.name
      }
   }
}])
}

#TODO: add autoscaling target & policies
