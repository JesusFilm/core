variable "identifier" {
  description = "Application name"
  type        = string  
}

variable "env" {
  description = "Application environment"
  type        = string
}

variable "port" {
  description = "Internal application aort"
  type        = number
  default     = 8529
}

variable "public_url" {
  description = "Publicly available url"
  type        = string
}

variable "env_secrets" {
  description = "Environment variable secrets"
  type        = map
  default     = {}
}

variable "owner" {
  description = "Email address of application owner"
  type        = string
  default     = "apps@cru.org"
}

variable "tags" {
  description = "Tags for aws"
  type        = map
}

variable "cpu" {
  description = "CPU for container"
  type        = number
  default     = 2048
}

variable "memory" {
  description = "Memory for container"
  type        = number
  default     = 16384
}

variable "desired_count" {
  description = "Desired count of containers"
  type        = number
  default     = 1
}