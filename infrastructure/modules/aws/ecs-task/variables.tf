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
    name                 = string
    doppler_project_name = optional(string)
    container_port       = number
    host_port            = number
    cpu                  = number
    memory               = number
    desired_count        = number
    zone_id              = string
    is_public            = bool
    alb_target_group = object({
      port                             = number
      protocol                         = string
      path_pattern                     = list(string)
      health_check_path                = string
      health_check_port                = optional(number)
      priority                         = number
      health_check_interval            = optional(number, 10)
      health_check_timeout             = optional(number, 4)
      health_check_healthy_threshold   = optional(number, 2)
      health_check_unhealthy_threshold = optional(number, 4)
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

  validation {
    condition = (
      var.service_config.alb_target_group.health_check_interval == null ||
      (var.service_config.alb_target_group.health_check_interval >= 5 &&
      var.service_config.alb_target_group.health_check_interval <= 300)
    )
    error_message = "health_check_interval must be between 5 and 300 seconds to comply with ALB constraints."
  }

  validation {
    condition = (
      var.service_config.alb_target_group.health_check_timeout == null ||
      (var.service_config.alb_target_group.health_check_timeout >= 2 &&
      var.service_config.alb_target_group.health_check_timeout <= 120)
    )
    error_message = "health_check_timeout must be between 2 and 120 seconds to comply with ALB constraints."
  }

  validation {
    condition = (
      var.service_config.alb_target_group.health_check_healthy_threshold == null ||
      (var.service_config.alb_target_group.health_check_healthy_threshold >= 2 &&
      var.service_config.alb_target_group.health_check_healthy_threshold <= 10)
    )
    error_message = "health_check_healthy_threshold must be between 2 and 10 to comply with ALB constraints."
  }

  validation {
    condition = (
      var.service_config.alb_target_group.health_check_unhealthy_threshold == null ||
      (var.service_config.alb_target_group.health_check_unhealthy_threshold >= 2 &&
      var.service_config.alb_target_group.health_check_unhealthy_threshold <= 10)
    )
    error_message = "health_check_unhealthy_threshold must be between 2 and 10 to comply with ALB constraints."
  }
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

variable "host_names" {
  type        = list(string)
  default     = []
  description = "List of host names for ALB listener rule. Takes precedence over host_name if provided."
}

variable "include_aws_env_vars" {
  type    = bool
  default = false
}
