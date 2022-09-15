locals {
  services = {
    for service in var.services :
    service.name => {
      type                               = lookup(service, "type", "app")
      family                             = "${local.name}-${service.name}"
      cluster                            = lookup(service, "cluster", data.aws_ecs_cluster.cluster.arn)
      desired_count                      = tonumber(lookup(service, "desired_count", lookup(service, "type", "app") == "sidekiq" ? "1" : (var.env == "prod" ? "2" : "1")))
      launch_type                        = lookup(service, "launch_type", "EC2")
      health_check_grace_period          = tonumber(lookup(service, "health_check_grace_period", "30"))
      deployment_minimum_healthy_percent = tonumber(lookup(service, "deployment_minimum_healthy_percent", null))
      deployment_maximum_percent         = tonumber(lookup(service, "deployment_maximum_percent", null))
      deployment_circuit_breaker         = tobool(lookup(service, "deployment_circuit_breaker", true))
      container_port                     = tonumber(lookup(service, "container_port", "0"))
      host_port                          = tonumber(lookup(service, "host_port", "0"))
      network_mode                       = lookup(service, "network_mode", "") == "" ? null : service.network_mode
      placement_strategy                 = lookup(service, "placement_strategy", "") == "" ? [] : jsondecode(service.placement_strategy)
      network_configuration              = lookup(service, "network_configuration", "") == "" ? [] : [jsondecode(service.network_configuration)]
      service_registries                 = lookup(service, "service_registry", "") == "" ? [] : [jsondecode(service.service_registry)]
      memory                             = tonumber(lookup(service, "memory", lookup(service, "type", "app") == "sidekiq" ? "512" : "1024"))
      memory_reservation                 = lookup(service, "memory_reservation", "") == "" ? null : tonumber(service.memory_reservation)
      cpu                                = tonumber(lookup(service, "cpu", lookup(service, "launch_type", "EC2") == "EC2" ? "128" : "256"))
      volumes                            = lookup(service, "volumes", "") == "" ? [] : jsondecode(service.volumes)
      essential                          = tobool(lookup(service, "essential", "true"))
      scheduling_strategy                = lookup(service, "scheduling_strategy", "") == "" ? "REPLICA" : "DAEMON"
      health_check                       = lookup(service, "health_check", "") == "" ? null : jsondecode(service.health_check)
      capacity_provider_strategy         = lookup(service, "capacity_provider_strategy", "") == "" ? [] : jsondecode(service.capacity_provider_strategy)
      environment                        = [for k, v in lookup(service, "environment", "") == "" ? {} : jsondecode(service.environment) : { name = k, value = v }],
      log_configuration = lookup(service, "log_configuration", "") == "" ? jsonencode({
        logDriver = "awsfirelens"
        options = {
          dd_message_key = "log"
          compress       = "gzip"
          provider       = "ecs"
          dd_service     = var.identifier
          Host           = "http-intake.logs.datadoghq.com"
          TLS            = "on"
          dd_source      = lookup(service, "log_dd_source", "ecs")
          dd_tags        = "env:${var.env},application:${var.identifier},integration:${service.name}"
          Name           = "datadog"
        }
        secretOptions = [{
          valueFrom = "arn:aws:ssm:us-east-1:056154071827:parameter/shared/${var.env}/DD_API_KEY"
          name      = "apikey"
        }]
      }) : service.log_configuration
    }
  }

  scheduled_tasks = {
    for task in var.scheduled_tasks :
    task.name => {
      type                  = "scheduled"
      family                = "${local.name}-${task.name}"
      cluster               = lookup(task, "cluster", data.aws_ecs_cluster.cluster.arn)
      launch_type           = lookup(task, "launch_type", "FARGATE")
      desired_count         = tonumber(lookup(task, "desired_count", "1"))
      essential             = true
      host_port             = 0
      environment           = [for k, v in lookup(task, "environment", "") == "" ? {} : jsondecode(task.environment) : { name = k, value = v }],
      network_mode          = lookup(task, "network_mode", "") == "" ? "awsvpc" : task.network_mode
      network_configuration = lookup(task, "network_configuration", "") == "" ? [] : [jsondecode(task.network_configuration)]
      health_check          = null
      log_configuration = lookup(task, "log_configuration", "") == "" ? jsonencode({
        logDriver = "awsfirelens"
        options = {
          dd_message_key = "log"
          compress       = "gzip"
          provider       = "ecs"
          dd_service     = var.identifier
          Host           = "http-intake.logs.datadoghq.com"
          TLS            = "on"
          dd_source      = lookup(task, "log_dd_source", "ecs")
          dd_tags        = "env:${var.env},application:${var.identifier},integration:${task.name}"
          Name           = "datadog"
        }
        secretOptions = [{
          valueFrom = "arn:aws:ssm:us-east-1:056154071827:parameter/shared/${var.env}/DD_API_KEY"
          name      = "apikey"
        }]
      }) : task.log_configuration
      memory              = tonumber(lookup(task, "memory", "1024"))
      memory_reservation  = lookup(task, "memory_reservation", "") == "" ? null : tonumber(task.memory_reservation)
      cpu                 = tonumber(lookup(task, "cpu", lookup(task, "launch_type", "FARGATE") == "EC2" ? "128" : "256"))
      volumes             = lookup(task, "volumes", "") == "" ? [] : jsondecode(task.volumes)
      schedule_expression = lookup(task, "schedule_expression", "") == "" ? "rate(1 day)" : task.schedule_expression
      platform_version    = lookup(task, "platform_version", "1.4.0")
    }
  }

  tasks = merge(local.services, local.scheduled_tasks)

  latest = {
    for service in concat(var.services, var.scheduled_tasks) :
    service.name => {
      task_definition = "${aws_ecs_task_definition.task_definition[service.name].family}:${max(aws_ecs_task_definition.task_definition[service.name].revision, data.external.latest[service.name].result.revision)}"
    }
  }
}

data "external" "latest" {
  for_each = toset(var.task_names)
  program  = ["bash", "${path.module}/latest-task-definition.sh"]
  query = {
    TASK_DEFINITION = local.tasks[each.key].family
  }
}

# data "external" "parameters" {
#   program = ["bash", "${path.module}/get-ssm-parameters.sh"]
#   query = {
#     PATH_PREFIX = "/ecs/${var.identifier}/${var.env}/"
#   }

#   depends_on = [aws_ssm_parameter.parameters]
# }

resource "random_string" "suffix" {
  for_each = toset(var.task_names)
  length   = 4
  special  = false
  upper    = false

  keepers = {
    // ECS service attributes that require a replacement
    name           = each.key
    cluster        = data.aws_ecs_cluster.cluster.cluster_name
    launch_type    = lookup(try(local.services[each.key], local.scheduled_tasks[each.key]), "launch_type")
    container_port = lookup(try(local.services[each.key], local.scheduled_tasks[each.key]), "container_port", 0) == 0 ? 80 : lookup(try(local.services[each.key], local.scheduled_tasks[each.key]), "container_port", 0)

    // This is complicated, in an attempt to (for now) prevent a new random (and thus a new service)
    // being generated when apps upgrade and keep the same target group config they had before.
    // So we ensure that `target_group_arns` here is null for those cases; null doesn't register as 'dirty'.
    target_group_arns = var.create_target_group ? null : (var.target_group_arns == null ? null : jsonencode(var.target_group_arns))
    target_group_arn  = var.create_target_group ? aws_lb_target_group.target_group[0].arn : var.target_group_arn

    placement_strategy   = jsonencode(lookup(try(local.services[each.key], local.scheduled_tasks[each.key]), "placement_strategy", []))
    networkConfiguration = jsonencode(lookup(try(local.services[each.key], local.scheduled_tasks[each.key]), "network_configuration", []))
    scheduling_strategy  = lookup(try(local.services[each.key], local.scheduled_tasks[each.key]), "scheduling_strategy", "REPLICA")
  }
}

locals {
  target_group_arns_for_lb = toset(compact(
    var.create_target_group ?
    [aws_lb_target_group.target_group[0].arn] :
    var.target_group_arns != null ? var.target_group_arns : [var.target_group_arn]
  ))
}

data "aws_lb_target_group" "target_groups" {
  for_each = toset(local.target_group_arns_for_lb)
  arn      = each.value
}

resource "aws_ecs_service" "service" {
  for_each = local.services

  lifecycle { create_before_destroy = true }

  provisioner "local-exec" {
    interpreter = ["/bin/bash", "-c"]
    command     = "if [ $IMAGE != \"scratch\" ]; then ${path.module}/wait-service-steady-state.sh ${each.value.cluster} ${self.name}; fi"
    environment = {
      IMAGE        = lookup(data.external.latest[each.key].result, "image", "scratch")
      GRACE_PERIOD = each.value.health_check_grace_period
    }
  }

  name                    = "${each.value.family}-${random_string.suffix[each.key].result}"
  cluster                 = each.value.cluster
  task_definition         = local.latest[each.key].task_definition
  desired_count           = each.value.desired_count
  launch_type             = each.value.launch_type
  enable_ecs_managed_tags = true
  propagate_tags          = "TASK_DEFINITION"
  scheduling_strategy     = each.value.scheduling_strategy
  wait_for_steady_state   = false // This is part of the provisioner

  deployment_controller {
    type = "ECS"
  }

  // health_check_grace_period_seconds only allowed when using a load balancer (app type)
  health_check_grace_period_seconds  = each.value.type == "app" ? each.value.health_check_grace_period : null
  deployment_minimum_healthy_percent = each.value.deployment_minimum_healthy_percent
  deployment_maximum_percent         = each.value.deployment_maximum_percent

  dynamic "deployment_circuit_breaker" {
    for_each = each.value.deployment_circuit_breaker ? [{}] : []
    content {
      enable   = true
      rollback = true
    }
  }

  // iam_role is only allowed in the EC2 launch_type that doesn't used awsvpc or multiple target groups
  iam_role = (
    each.value.type == "app" &&
    each.value.network_mode != "awsvpc" &&
    length(local.target_group_arns_for_lb) < 2
  ) ? data.aws_iam_role.ecs_service_role.arn : null

  dynamic "load_balancer" {
    // Only associate a load balancer for "app" types
    for_each = each.value.type == "app" ? data.aws_lb_target_group.target_groups : {}
    content {
      container_name   = each.key
      container_port   = each.value.container_port == 0 ? load_balancer.value.port : each.value.container_port
      target_group_arn = load_balancer.value.arn
    }
  }

  dynamic "network_configuration" {
    for_each = each.value.network_configuration
    content {
      subnets          = lookup(network_configuration.value, "subnets", "") == "" ? null : network_configuration.value.subnets
      security_groups  = lookup(network_configuration.value, "security_groups", "") == "" ? null : network_configuration.value.security_groups
      assign_public_ip = lookup(network_configuration.value, "assign_public_ip", "") == "" ? false : network_configuration.value.assign_public_ip
    }
  }

  dynamic "placement_constraints" {
    // placement_constraints are only valid on EC2
    // On env == prod, if type is sidekiq, constrain is "batch" function, otherwise "app" function
    // All other environments, constrain os to "linux"
    for_each = each.value.launch_type == "EC2" ? [{
      expression = var.env != "prod" ? "attribute:ecs.os-type == linux" : (
        each.value.type == "sidekiq" ? "attribute:function == batch" : "attribute:function == app"
      )
    }] : []
    content {
      type       = "memberOf"
      expression = placement_constraints.value.expression
    }
  }

  dynamic "ordered_placement_strategy" {
    // placement strategies are only valid on EC2 (except for Daemon services)
    // If placement_strategy is set, use it
    // Otherwise, if prod, spread and binpack
    // else binpack
    for_each = each.value.launch_type == "EC2" && each.value.type != "daemon" ? (
      length(each.value.placement_strategy) != 0 ? each.value.placement_strategy : (
        var.env == "prod" ? [{ type : "spread", field : "attribute:ecs.availability-zone" }, { type : "binpack", field : "memory" }] : [{ type : "binpack", field : "memory" }]
      )
    ) : []
    content {
      type  = ordered_placement_strategy.value.type
      field = ordered_placement_strategy.value.field
    }
  }

  dynamic "service_registries" {
    for_each = each.value.service_registries
    content {
      registry_arn   = service_registries.value.registry_arn
      port           = lookup(service_registries.value, "port", "") == "" ? null : service_registries.value.port
      container_port = lookup(service_registries.value, "container_port", "") == "" ? null : service_registries.value.container_port
      container_name = lookup(service_registries.value, "container_name", "") == "" ? null : service_registries.value.container_name
    }
  }

  dynamic "capacity_provider_strategy" {
    for_each = each.value.capacity_provider_strategy
    content {
      capacity_provider = capacity_provider_strategy.value.capacity_provider
      weight            = capacity_provider_strategy.value.weight
      base              = lookup(capacity_provider_strategy.value, "base", "") == "" ? null : capacity_provider_strategy.value.base
    }
  }

  tags = local.tags
}

output "service_names" {
  description = "ECS Service Names"
  value       = { for name, service in aws_ecs_service.service : name => service.name }
}

resource "aws_cloudwatch_event_rule" "rule" {
  for_each = local.scheduled_tasks

  name                = "ecstask-${each.value.family}"
  description         = "Scheduled execution of ${var.identifier} (${var.env}) ${each.key} task."
  is_enabled          = true
  schedule_expression = each.value.schedule_expression
}

resource "aws_cloudwatch_event_target" "target" {
  for_each = local.scheduled_tasks

  target_id = each.value.family
  rule      = aws_cloudwatch_event_rule.rule[each.key].name
  arn       = data.aws_ecs_cluster.cluster.arn
  role_arn  = aws_iam_role.task_execution_role.arn

  ecs_target {
    launch_type         = each.value.launch_type
    task_count          = each.value.desired_count
    task_definition_arn = aws_ecs_task_definition.task_definition[each.key].arn

    platform_version = each.value.platform_version

    dynamic "network_configuration" {
      for_each = each.value.network_configuration
      content {
        subnets          = lookup(network_configuration.value, "subnets", "") == "" ? null : network_configuration.value.subnets
        security_groups  = lookup(network_configuration.value, "security_groups", "") == "" ? null : network_configuration.value.security_groups
        assign_public_ip = lookup(network_configuration.value, "assign_public_ip", "") == "" ? false : network_configuration.value.assign_public_ip
      }
    }
  }
}

resource "aws_ecs_task_definition" "task_definition" {
  for_each = toset(var.task_names)

  family                   = local.tasks[each.key].family
  cpu                      = local.tasks[each.key].launch_type == "FARGATE" ? local.tasks[each.key].cpu : null
  memory                   = local.tasks[each.key].launch_type == "FARGATE" ? local.tasks[each.key].memory : null
  network_mode             = local.tasks[each.key].network_mode
  task_role_arn            = aws_iam_role.task_role.arn
  execution_role_arn       = aws_iam_role.task_execution_role.arn
  requires_compatibilities = [local.tasks[each.key].launch_type]
  tags                     = local.tags

  dynamic "volume" {
    for_each = local.tasks[each.key].volumes
    content {
      name      = lookup(volume.value, "name", "") == "" ? null : volume.value.name
      host_path = lookup(volume.value, "host_path", "") == "" ? null : volume.value.host_path

      dynamic "efs_volume_configuration" {
        for_each = lookup(volume.value, "efs_volume_configuration", "") == "" ? [] : [volume.value.efs_volume_configuration]
        content {
          file_system_id     = efs_volume_configuration.value.file_system_id
          transit_encryption = "ENABLED"
          authorization_config {
            access_point_id = efs_volume_configuration.value.access_point_id
            iam             = "ENABLED"
          }
        }
      }
    }
  }

  container_definitions = jsonencode([for container in [
    {
      name = each.key
      cpu  = local.tasks[each.key].launch_type == "EC2" ? local.tasks[each.key].cpu : null
      memory = local.tasks[each.key].launch_type == "EC2" ? (
        local.tasks[each.key].memory == 0 && coalesce(local.tasks[each.key].memory_reservation, 0) > 0 ? null : local.tasks[each.key].memory
      ) : null
      memoryReservation = local.tasks[each.key].memory_reservation
      command           = local.tasks[each.key].type == "sidekiq" ? ["/usr/local/bin/sidekiq-entrypoint.sh"] : null

      portMappings = (
        local.tasks[each.key].type == "app" ||
        local.tasks[each.key].host_port > 0
        ) ? [for port in(local.tasks[each.key].container_port > 0 ? [local.tasks[each.key].container_port] : distinct([for tg in data.aws_lb_target_group.target_groups : tg.port])) : {
          containerPort = port
          hostPort      = local.tasks[each.key].host_port
          protocol      = "tcp"
      }] : []
      essential   = local.tasks[each.key].essential
      healthCheck = local.tasks[each.key].health_check
      mountPoints = [for volume in local.tasks[each.key].volumes : {
        sourceVolume  = lookup(volume, "name", "") == "" ? null : volume.name
        containerPath = lookup(volume, "container_path", "") == "" ? null : volume.container_path
        readOnly      = tobool(lookup(volume, "read_only", "true"))
      }]
      environment = concat(
        local.tasks[each.key].environment,
        [
          { name = "PROJECT_NAME", value = var.identifier },
          { name = "ENVIRONMENT", value = local.environment },
        ]
      )
      logConfiguration = jsondecode(local.tasks[each.key].log_configuration)
      volumesFrom      = []

      // Jenkins "owns" theses fields, so terraform defaults to the latest values on each.
      image   = lookup(data.external.latest[each.key].result, "image", "scratch")
      # secrets = jsondecode(lookup(data.external.parameters.result, "secrets", "[]"))
    },
    jsondecode(lookup(jsondecode(local.tasks[each.key].log_configuration), "logDriver", "") == "awsfirelens" ? jsonencode({
      name              = "log_router"
      image             = "906394416424.dkr.ecr.${data.aws_region.current.name}.amazonaws.com/aws-for-fluent-bit:stable"
      essential         = true
      cpu               = 2
      memoryReservation = 32
      firelensConfiguration = {
        type = "fluentbit"
        options = {
          enable-ecs-log-metadata = "true"
        }
      }
      // container defaults to help prevent unnecessary replacements
      environment  = []
      mountPoints  = []
      portMappings = []
      user         = "0"
      volumesFrom  = []
    }) : "{}")
  ] : container if length(container) > 0])
}
