variable "vpc_id" {
  type = string
}

variable "internal_alb_security_group" {
  type = any
}

variable "public_alb_security_group" {
  type = any
}
