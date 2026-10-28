variable "upgrade_phase" {
  type        = string
  description = "Reviewed upgrade phase. Apply stage-aurora before complete."
  # Last applied phase: complete on 2026-10-20. Both environments are on Aurora 17.11.
  # The EKS phases went with the clusters
  # (docs/plans/2026-10-28-001-feat-eks-platform-cluster-teardown-plan.md).
  default = "complete"

  validation {
    condition     = contains(["prepare", "stage-aurora", "complete"], var.upgrade_phase)
    error_message = "Choose a documented phase from infrastructure/UPGRADES.md."
  }
}

locals {
  # Advance the committed default in a separate reviewed PR for each phase.
  # Atlantis automerges after the first apply; future autoplan uses that default.
  upgrade_phases = {
    prepare        = { stage_pg = "13.23", prod_pg = "13.23" }
    "stage-aurora" = { stage_pg = "17.11", prod_pg = "13.23" }
    complete       = { stage_pg = "17.11", prod_pg = "17.11" }
  }
  upgrade = local.upgrade_phases[var.upgrade_phase]
}

variable "allow_stage_aurora_major_upgrade" {
  type        = bool
  description = "Approve the staging Aurora major upgrade in the freshly reviewed saved plan after preflight and recovery checks."
  default     = false
}

variable "allow_prod_aurora_major_upgrade" {
  type        = bool
  description = "Approve the production Aurora major upgrade in the freshly reviewed saved plan after staging verification and production preflight."
  default     = false
}
