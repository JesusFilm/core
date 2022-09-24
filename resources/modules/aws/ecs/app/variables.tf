variable "identifier" {
  description = "Application name"
  type        = string  
}

variable "env" {
  description = "Application environment"
  type        = string
}

variable "port" {
  description = "Internal application port"
  type        = number
  default     = 80
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
  default     = 256
}

variable "memory" {
  description = "Memory for container"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "Desired count of containers"
  type        = number
  default     = 1
}

variable "health_check_path" {
  description = "path in container to run health check"
  type        = string
  default     = "/.well-known/apollo/server-health"
}

