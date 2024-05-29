variable "internal_ecs_config" {
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

variable "public_ecs_config" {
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

variable "subnet_group_name" {
  type = string
}

variable "vpc_security_group_id" {
  type = string
}

variable "plausible" {
  type = object({
    environment_variables = list(string)
    port                  = number
    docker_image          = string
    service_config = object({
      name           = string
      container_port = number
      host_port      = number
      cpu            = number
      memory         = number
      desired_count  = number
      alb_dns_name   = string
      zone_id        = string
      is_public      = bool

      alb_listener = object({
        alb_arn         = string
        port            = number
        protocol        = string
        certificate_arn = optional(string)
        dns_name        = optional(string)
      })

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
  })
}

variable "clickhouse" {
  type = object({
    environment_variables = list(string)
    port                  = number
    docker_image          = string
    service_config = object({
      name           = string
      container_port = number
      host_port      = number
      cpu            = number
      memory         = number
      desired_count  = number
      alb_dns_name   = string
      zone_id        = string
      is_public      = bool

      alb_listener = object({
        alb_arn         = string
        port            = number
        protocol        = string
        certificate_arn = optional(string)
        dns_name        = optional(string)
      })

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
  })
}
