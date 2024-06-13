variable "name" {
  type        = string
  description = "Name of the task for resource naming"
}

variable "cpu" {
  default     = 512
  description = "CPU units to allocate to your job (vCPUs * 1024)"
}

variable "memory" {
  default     = 1024
  description = "In MiB"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnets where the job will be run"
}

variable "cloudwatch_schedule_expression" {
  type        = string
  description = "AWS cron schedule expression"
}

variable "extra_container_defs" {
  type        = any
  default     = {}
  description = "Additional configuration that you want to add to your task definition (see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definition_parameters.html for all options)"
}

variable "task_execution_role_arn" {
  type = string
}

variable "env" {
  type    = string
  default = "prod"
}

variable "environment_variables" {
  type = list(string)
}

variable "doppler_token" {
  type = string
}

variable "cluster_arn" {
  type = string
}
