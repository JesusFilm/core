variable "ecs_config" {
  type = object({
    vpc_id    = string
    is_public = bool
    subnets   = list(string)
    alb_listener = map(
      object({
        arn = string
      })
    )
    security_group_id       = string
    task_execution_role_arn = string
    cluster = object({
      id   = string
      name = string
    })
  })
}

variable "service_config" {
  type = object({
    name           = string
    container_port = number
    host_port      = number
    cpu            = number
    memory         = number
    desired_count  = number

    alb_target_group = object({
      port              = number
      protocol          = string
      path_pattern      = list(string)
      health_check_path = string
      priority          = number
    })

    auto_scaling = object({
      max_capacity = number
      min_capacity = number
      cpu = object({
        target_value = number
      })
      memory = object({
        target_value = number
      })
    })
  })
}
