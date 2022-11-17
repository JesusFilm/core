variable "name" {
  type = string
}

variable "dns_name" {
  type = string
}

variable "cidr_block" {
  type    = string
  default = "10.10.0.0/16"
}

variable "vpc_id" {
  type = string
}

variable "vpc_cidr_block" {
  type = string
}

variable "subnets" {
  type = list(string)
}

variable "certificate_arn" {
  type = string
}

variable "dns_server" {
  type = string
}
