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
