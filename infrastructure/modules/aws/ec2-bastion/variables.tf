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

variable "dns_name" {
  type = string
}

variable "zone_id" {
  type = string
}
