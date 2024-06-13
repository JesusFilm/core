variable "subnet_id" {
  type = string
}

variable "security_group_ids" {
  type = list(string)
}

variable "name" {
  type = string
}

variable "env" {
  type = string
}

variable "rds_instances" {
  type = list(object({
    host             = string
    port             = number
    username         = string
    password         = string
    db_instance_name = string
  }))
}
