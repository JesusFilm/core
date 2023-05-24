variable "env" {
  type        = string
  description = "Environment"
}

# VPC
variable "cidr" {
  type        = string
  description = "VPC CIDR"
}

variable "internal_url_name" {
  type = string
}

variable "certificate_arn" {
  type = string
}

