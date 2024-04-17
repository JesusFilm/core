variable "subnet_ids" {
  description = "The subnet IDs to use for the ElastiCache cluster"
  type        = list(string)
}

variable "cluster_id" {
  description = "The ID of the ElastiCache cluster"
  type        = string
}

variable "env" {
  description = "The environment name"
  type        = string
  default     = "prod"
}

variable "security_group_id" {
  description = "The security group ID to use for the ElastiCache cluster"
  type        = string
}

variable "cidr" {
  description = "CIDR block"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}
