data "aws_ecs_cluster" "cluster" {
  cluster_name = local.env
}

resource "aws_ecs_service" "service" {
  name                     = local.name
  cluster                  = data.aws_ecs_cluster.cluster.id
  desired_count            = 1
  task_definition          = aws_ecs_task_definition.app.arn
  launch_type              = "FARGATE"
  scheduling_strategy      = "REPLICA"
  load_balancer {
    target_group_arn = aws_lb_target_group.target_group.arn
    container_name   = "${local.name}-container"
    container_port   = local.port
  }
  network_configuration {
    subnets          = data.aws_subnets.apps_public.ids
    assign_public_ip = false
  }
}

resource "aws_ecs_task_definition" "app" {
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  family                   = "${local.identifier}-task"
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  task_role_arn            = aws_iam_role.task_role.arn
  container_definitions = jsonencode([{
   name        = "${local.name}-container"
   image       = "${data.aws_ecr_repository.main.repository_url}:${local.env}"
   essential   = true
   secrets     = [
     for param in aws_ssm_parameter.parameters: {
      name  = param.tags.name
      valueFrom = param.arn
     }
   ]
  #  environment = [{
  #   name = "APOLLO_GRAPH_REF"
  #   value = var.apollo_graph_ref
  #  },{
  #   name = "APOLLO_KEY"
  #   value = var.apollo_key
  #  }, {
  #   name = "AWS_ACCESS_KEY_ID"
  #   value = var.aws_access_key_id
  #  }, {
  #   name = "AWS_SECRET_ACCESS_KEY"
  #   value = var.aws_secret_access_key
  #  }, {
  #   name = "GOOGLE_APPLICATION_JSON"
  #   value = var.google_application_json
  #  }, {
  #   name = "LOGGING_LEVEL"
  #   value = var.logging_level
  #  }]
   portMappings = [{
     containerPort = local.port
     hostPort      = local.port
   }]
   logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.main.name
        awslogs-stream-prefix = "ecs"
        awslogs-region        = "us-east-2"
      }
   }
}])
}

#TODO: add autoscaling target & policies
