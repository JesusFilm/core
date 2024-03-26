variable "ecs_config" {
  type = object({
    vpc_id       = string
    is_public    = bool
    subnets      = list(string)
    alb_dns_name = string
    zone_id      = string
    alb_listener = object({
      alb_arn  = string
      protocol = string
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
      arn  = string
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

variable "subnet_group_name" {
  type = string
}

variable "vpc_security_group_id" {
  type = string
}
