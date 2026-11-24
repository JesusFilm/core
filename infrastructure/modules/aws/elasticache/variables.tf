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

variable "node_type" {
  description = "Cache node type; verify memory, engine compatibility and recovery before downsizing."
  type        = string
  default     = "cache.t2.medium"

  validation {
    condition     = can(regex("^cache\\.[a-z0-9]+\\.[a-z0-9]+$", var.node_type))
    error_message = "node_type must be an ElastiCache node type such as cache.t2.medium."
  }
}

variable "apply_immediately" {
  description = "Apply cache changes immediately rather than during maintenance."
  type        = bool
  default     = true
}
