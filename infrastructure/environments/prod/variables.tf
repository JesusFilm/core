variable "datadog_forwarder_lambda_arn" {
  type = string
}

variable "versions" {
  type = object({
    aurora = string
  })
  description = "Version targets selected by the root upgrade phase."

  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+$", var.versions.aurora))
    error_message = "Use an Aurora major.minor version."
  }
}

variable "allow_aurora_major_upgrade" {
  type        = bool
  description = "Explicit approval for this environment's live Aurora major upgrade; never inferred from an upgrade phase."
  default     = false
}
