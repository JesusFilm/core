variable "account" {
  type = number
}

variable "region" {
  type = string
}

variable "ecs_task_execution_role_arn" {
  type = string
}

variable "ecs_cluster" {
  type = object({
    id   = string
    name = string
  })
}

variable "vpc_id" {
  type = string
}

variable "public_subnets" {
  type = list(string)
}

variable "public_alb_listener" {
  type = map(
    object({
      arn = string
    })
  )
}

variable "public_alb_security_group" {
  type = object({
    security_group_id = string
  })
}

variable "public_ecs_security_group_id" {
  type = string
}

variable "internal_subnets" {
  type = list(string)
}

variable "internal_alb_listener" {
  type = map(
    object({
      arn = string
    })
  )
}

variable "internal_alb_security_group" {
  type = object({
    security_group_id = string
  })
}

variable "internal_ecs_security_group_id" {
  type = string
}
