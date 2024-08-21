variable "alb_arn" {
  type = string
}

variable "port" {
  type = number
}

variable "protocol" {
  type = string
}

variable "certificate_arn" {
  type    = string
  default = ""
}
