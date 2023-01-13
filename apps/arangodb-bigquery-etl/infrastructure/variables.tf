variable "task_execution_role_arn" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "doppler_token" {
  type = string
}

variable "cluster_arn" {
  type = string
}
