variable "subnet_ids" {
  description = "The subnet IDs to use for the ElastiCache cluster"
  type        = list(string)
}

variable "cluster_id" {
  description = "The ID of the ElastiCache cluster"
  type        = string
}
