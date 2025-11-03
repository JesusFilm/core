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

variable "access_logs_enabled" {
  type        = bool
  default     = false
  description = "Enable ALB access logs"
}

variable "access_logs_bucket" {
  type        = string
  default     = ""
  description = "S3 bucket for ALB access logs"
}

variable "access_logs_prefix" {
  type        = string
  default     = ""
  description = "S3 prefix for ALB access logs"
}
