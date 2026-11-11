variable "env" {
  type        = string
  description = "Environment"
}

# VPC
variable "s3_gateway_endpoint" {
  type        = bool
  default     = false
  description = "Passed to the VPC module; see its variable of the same name."
}

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


variable "datadog_forwarder_lambda_arn" {
  type        = string
  description = "ARN of the Datadog log forwarder Lambda function"
}



