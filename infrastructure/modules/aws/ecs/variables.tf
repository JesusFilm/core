variable "vpc_id" {
  type = string
}

variable "name" {
  type = string
}

variable "env" {
  type    = string
  default = "prod"
}

variable "internal_alb_security_group" {
  type = any
}

variable "public_alb_security_group" {
  type = any
}
