variable "env" {
  type        = string
  description = "Environment"
}

variable "name" {
  type        = string
  description = "EKS Cluster Name"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs"
}

variable "subnet_ids_2a" {
  type        = list(string)
  description = "Subnet Group 2a"
}

variable "subnet_ids_2b" {
  type        = list(string)
  description = "Subnet Group 2b"
}

variable "subnet_ids_2c" {
  type        = list(string)
  description = "Subnet Group 2c"
}

variable "security_group_ids" {
  type        = list(string)
  description = "Security Group IDs"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}
