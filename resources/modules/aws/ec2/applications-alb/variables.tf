variable "identifier" {
  description = "Resource name"
  type        = string
  default     = "applications-alb"
}

variable "env" {
  description = "Environment (main, stage)"
  type        = string
}

variable "extra_tags" {
  description = "AWS Tags, merged with local tags"
  type        = map(string)
  default     = {}
}

variable "security_groups" {
  description = "A list of security group IDs to assign to the LB."
  type        = list(string)
}

variable "subnets" {
  description = "A list of subnet IDs to attach to the LB."
  type        = list(string)
}

variable "certificates_arns" {
  description = "Default certificates ARNs to attach to the LB https listener."
  type        = list(string)
}

variable "internal" {
  description = "If true, the LB will be internal."
  type        = bool
  default     = false
}

variable "log_bucket" {
  description = "The S3 bucket name to store the logs in."
  type        = string
  default     = "jfp-alb-logs"
}

variable "add_http_listener" {
  description = "Add an HTTP listener with a default HTTP->HTTPS redirect action."
  type        = bool
  default     = true
}

variable "idle_timeout" {
  description = "The time in seconds that the connection is allowed to be idle."
  type        = number
  default     = 60
}
