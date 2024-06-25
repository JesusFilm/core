variable "ecs_config" {
  type = object({
    vpc_id                  = string
    is_public               = bool
    subnets                 = list(string)
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
    zone_id        = string
    is_public      = bool
    alb_target_group = object({
      port              = number
      protocol          = string
      path_pattern      = list(string)
      health_check_path = string
      health_check_port = optional(number)
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

variable "env" {
  type    = string
  default = "prod"
}

variable "dd_source" {
  type    = string
  default = "nestjs"
}


variable "doppler_token" {
  type = string
}

# We are unable to for_each sensitive values, so we must provide a list of secret env vars
variable "environment_variables" {
  type = list(string)
}

variable "alb_listener_arn" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "host_name" {
  type    = string
  default = null
}
