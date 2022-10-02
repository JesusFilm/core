variable "account" {
  type = number
}

variable "region" {
  type = string
}

variable "ecs_task_execution_role_arn" {
  type = string
}

variable "ecs_cluster_id" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "internal_subnets" {
  type = list(string)
}

variable "public_subnets" {
  type = list(string)
}

variable "internal_alb_security_group" {
  type = any
}

variable "public_alb_security_group" {
  type = any
}

# variable "internal_alb_target_groups" {
#   type = map(object({
#     arn = string
#   }))
# }

# variable "public_alb_target_groups" {
#   type = map(object({
#     arn = string
#   }))
# }
