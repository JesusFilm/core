# Application
variable "env" {
  type        = string
  description = "Environment"
  default     = "prod"
}

# VPC
variable "cidr" {
  type        = string
  description = "VPC CIDR"
  default     = "10.10.0.0/16"
}
