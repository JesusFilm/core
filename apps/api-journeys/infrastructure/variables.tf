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

variable "alb_config" {
  type = object({
    subnets         = list(string)
    security_groups = list(string)
    alb_target_group = object({
      port              = number
      protocol          = string
      path_pattern      = list(string)
      health_check_path = string
      priority          = number
    })
    listeners = map(object({
      listener_port     = number
      listener_protocol = string
    }))
    redirects = map(object({
      listener_port     = number
      listener_protocol = string
      redirect_port     = number
      redirect_protocol = string
    }))
    forwards = map(object({
      listener_port     = number
      listener_protocol = string
    }))
    certificate_arn = string
  })
}

variable "zone_id" {
  type = string
}

variable "image_tag" {
  type    = string
  default = "main"
}
