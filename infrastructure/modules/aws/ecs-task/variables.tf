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
      health_check_matcher             = optional(string, "200")
    })

    health_check_grace_period_seconds = optional(number, 0)
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
  type        = string
  description = "Doppler token for ECS Task"
  sensitive   = true
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

variable "image" {
  type        = string
  default     = null
  description = "Image for the app container. Defaults to this service's ECR repository at :latest, which CI pushes to. Set it for a third-party image that is not built in this repo (the ECR repository is still created and stays empty)."
}

variable "command" {
  type        = list(string)
  default     = null
  description = "Command for the app container. Default: none, so the image's CMD runs."
}

variable "cpu_architecture" {
  type        = string
  default     = "X86_64"
  description = "Fargate CPU architecture. ARM64 is Graviton; the image and every sidecar must be published for linux/arm64."

  validation {
    condition     = contains(["X86_64", "ARM64"], var.cpu_architecture)
    error_message = "cpu_architecture must be X86_64 or ARM64."
  }
}

variable "deployment_minimum_healthy_percent" {
  type        = number
  default     = null
  description = "ECS deployment minimum healthy percent. null keeps the provider default (100). 0 with deployment_maximum_percent = 100 serializes deploys for single-node apps."

  validation {
    condition     = var.deployment_minimum_healthy_percent == null || (var.deployment_minimum_healthy_percent >= 0 && var.deployment_minimum_healthy_percent <= 100)
    error_message = "deployment_minimum_healthy_percent must be between 0 and 100."
  }
}

variable "deployment_maximum_percent" {
  type        = number
  default     = null
  description = "ECS deployment maximum percent. null keeps the provider default (200)."

  validation {
    condition     = var.deployment_maximum_percent == null || (var.deployment_maximum_percent >= 100 && var.deployment_maximum_percent <= 200)
    error_message = "deployment_maximum_percent must be between 100 and 200."
  }
}
