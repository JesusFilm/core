variable "env" {
  type = string
}

variable "cidr" {
  type = string
}

variable "s3_gateway_endpoint" {
  type        = bool
  default     = false
  description = "Route same-region S3 traffic (ECR image layers included) through a free gateway endpoint instead of the NAT gateway."
}
