variable "name" {
  type = string
}

variable "internal" {
  type = bool
}

variable "vpc_id" {
  type = string
}

variable "subnets" {
  type = list(string)
}

variable "security_groups" {
  type = list(string)
}



variable "redirects" {
  type = map(object({
    listener_port     = number
    listener_protocol = string
    redirect_port     = number
    redirect_protocol = string
  }))
  default = {}
}

variable "forwards" {
  type = map(object({
    listener_port     = number
    listener_protocol = string
  }))
  default = {}
}
