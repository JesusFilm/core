variable "ecs_config" {
  type = object({
    vpc_id    = string
    is_public = bool
    subnets   = list(string)
    zone_id   = string
    alb = object({
      arn      = string
      dns_name = string
    })
    alb_target_group = object({
      port              = number
      protocol          = string
      path_pattern      = list(string)
      health_check_path = string
      health_check_port = optional(number)
      priority          = number
    })
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

variable "service_name" {
  type        = string
  default     = "api-journeys"
  description = "Service identity used for AWS resource names, the service-discovery host, and ALB host-header routing. Override only for a temporary parallel (expand/contract) deployment."
}

variable "port_override" {
  type        = number
  default     = null
  description = "Temporarily override the container/ALB-listener port. Defaults to the standard port (4004). Used only for a parallel deployment to avoid an ALB listener collision on the standard port."
}

variable "doppler_token" {
  type        = string
  description = "Doppler token for API Journeys"
  sensitive   = true
}


variable "alb" {
  type = object({
    arn      = string
    dns_name = string
  })
}
