
variable "microservice_config" {
  type = map(object({
    name           = string
    is_public      = bool
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
  }))
  description = "Microservice configuration"
}
