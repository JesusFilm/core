variable "env" {
  description = "Environment the service belongs to"
  type        = string

  validation {
    condition     = contains(["stage", "prod"], var.env)
    error_message = "env must be stage or prod."
  }
}

variable "region" {
  description = "ClickHouse Cloud region on AWS. Cannot be changed once the service exists."
  type        = string
  default     = "us-east-2"
}

variable "replica_memory_gb" {
  description = "Memory of the single replica in GiB. The Basic tier allows 8 or 12."
  type        = number
  default     = 8

  validation {
    condition     = var.replica_memory_gb >= 8 && var.replica_memory_gb % 4 == 0
    error_message = "replica_memory_gb must be a multiple of 4 and at least 8."
  }
}

variable "idle_scaling" {
  description = "Pause the service after idle_timeout_minutes without queries. Compute is not billed while paused; storage is."
  type        = bool
  default     = true
}

variable "idle_timeout_minutes" {
  description = "Minutes without queries before an idling service pauses (ClickHouse minimum is 5)."
  type        = number
  default     = 15

  validation {
    condition     = var.idle_timeout_minutes >= 5
    error_message = "idle_timeout_minutes must be at least 5."
  }
}

variable "doppler_token" {
  description = "Doppler token with write access to doppler_project"
  type        = string
  sensitive   = true
}

variable "doppler_project" {
  description = "Doppler project that receives the service URL and admin password"
  type        = string
  default     = "core"
}
