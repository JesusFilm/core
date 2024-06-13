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

variable "security_group_ids" {
  type        = list(string)
  description = "Security Group IDs"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}