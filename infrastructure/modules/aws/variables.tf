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


variable "datadog_forwarder_lambda_arn" {
  type        = string
  description = "ARN of the Datadog log forwarder Lambda function"
}

variable "datadog_forwarder_lambda_function_name" {
  type        = string
  description = "Name of the Datadog log forwarder Lambda function"
}

