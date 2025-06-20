variable "task_execution_role_arn" {
  type = string
}

variable "env" {
  type    = string
  default = "prod"
}

variable "doppler_token" {
  type = string
}
