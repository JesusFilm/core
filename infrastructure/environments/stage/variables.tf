variable "datadog_forwarder_lambda_arn" {
  type = string
}





variable "versions" {
  type = object({
    eks_cluster = string
    eks_nodes   = string
    aurora      = string
  })
  description = "Version targets selected by the root upgrade phase."

  validation {
    condition = (
      can(regex("^1\\.[0-9]+$", var.versions.eks_cluster)) &&
      can(regex("^1\\.[0-9]+$", var.versions.eks_nodes)) &&
      can(regex("^[0-9]+\\.[0-9]+$", var.versions.aurora))
    )
    error_message = "Use Kubernetes major.minor and Aurora major.minor versions."
  }
}

variable "eks_addon_versions" {
  type        = map(string)
  description = "Pinned, compatible core add-on versions; empty defers adoption in this environment."
}

variable "allow_aurora_major_upgrade" {
  type        = bool
  description = "Explicit approval for this environment's live Aurora major upgrade; never inferred from an EKS phase."
  default     = false
}
