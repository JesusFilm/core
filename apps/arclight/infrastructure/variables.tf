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

variable "doppler_token" {
  type = string
}

variable "alb_listener_arn" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "host_name" {
  type = string
}

variable "host_names" {
  type        = list(string)
  default     = []
  description = "List of host names for ALB listener rule. Takes precedence over host_name if provided."
}
