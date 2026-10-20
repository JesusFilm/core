variable "upgrade_phase" {
  type        = string
  description = "Reviewed upgrade phase. Apply prepare and each Kubernetes minor in order, staging before production, then Aurora staging before production."
  # Next phase: complete (production Aurora 13.23 -> 17.11). Staging Aurora is 17.11.
  default = "complete"

  validation {
    condition = contains([
      "prepare", "stage-addons", "stage-1.33", "stage-1.34", "stage-1.35", "stage-1.36",
      "prod-prepare", "prod-addons", "prod-1.33", "prod-1.34", "prod-1.35", "prod-1.36",
      "stage-aurora", "complete"
    ], var.upgrade_phase)
    error_message = "Choose a documented phase from infrastructure/UPGRADES.md."
  }
}

locals {
  # Advance the committed default in a separate reviewed PR for each phase.
  # Atlantis automerges after the first apply; future autoplan uses that default.
  upgrade_phases = {
    prepare        = { stage_eks = "1.32", prod_eks = "1.32", prod_nodes = "1.31", stage_pg = "13.23", prod_pg = "13.23", prod_addons = false }
    "stage-addons" = { stage_eks = "1.32", prod_eks = "1.32", prod_nodes = "1.31", stage_pg = "13.23", prod_pg = "13.23", prod_addons = false }
    "stage-1.33"   = { stage_eks = "1.33", prod_eks = "1.32", prod_nodes = "1.31", stage_pg = "13.23", prod_pg = "13.23", prod_addons = false }
    "stage-1.34"   = { stage_eks = "1.34", prod_eks = "1.32", prod_nodes = "1.31", stage_pg = "13.23", prod_pg = "13.23", prod_addons = false }
    "stage-1.35"   = { stage_eks = "1.35", prod_eks = "1.32", prod_nodes = "1.31", stage_pg = "13.23", prod_pg = "13.23", prod_addons = false }
    "stage-1.36"   = { stage_eks = "1.36", prod_eks = "1.32", prod_nodes = "1.31", stage_pg = "13.23", prod_pg = "13.23", prod_addons = false }
    "prod-prepare" = { stage_eks = "1.36", prod_eks = "1.32", prod_nodes = "1.32", stage_pg = "13.23", prod_pg = "13.23", prod_addons = true }
    "prod-addons"  = { stage_eks = "1.36", prod_eks = "1.32", prod_nodes = "1.32", stage_pg = "13.23", prod_pg = "13.23", prod_addons = true }
    "prod-1.33"    = { stage_eks = "1.36", prod_eks = "1.33", prod_nodes = "1.33", stage_pg = "13.23", prod_pg = "13.23", prod_addons = true }
    "prod-1.34"    = { stage_eks = "1.36", prod_eks = "1.34", prod_nodes = "1.34", stage_pg = "13.23", prod_pg = "13.23", prod_addons = true }
    "prod-1.35"    = { stage_eks = "1.36", prod_eks = "1.35", prod_nodes = "1.35", stage_pg = "13.23", prod_pg = "13.23", prod_addons = true }
    "prod-1.36"    = { stage_eks = "1.36", prod_eks = "1.36", prod_nodes = "1.36", stage_pg = "13.23", prod_pg = "13.23", prod_addons = true }
    "stage-aurora" = { stage_eks = "1.36", prod_eks = "1.36", prod_nodes = "1.36", stage_pg = "17.11", prod_pg = "13.23", prod_addons = true }
    complete       = { stage_eks = "1.36", prod_eks = "1.36", prod_nodes = "1.36", stage_pg = "17.11", prod_pg = "17.11", prod_addons = true }
  }
  upgrade = local.upgrade_phases[var.upgrade_phase]

  # Adopt bootstrap components at the observed versions before upgrading them.
  # Recheck live images and ownership before either environment's preparation.
  eks_adoption_versions = {
    kube-proxy = "v1.30.0-eksbuild.3"
    vpc-cni    = "v1.18.1-eksbuild.3"
    coredns    = "v1.11.1-eksbuild.8"
  }
  stage_addon_versions = var.upgrade_phase == "prepare" ? local.eks_adoption_versions : local.eks_addon_versions[local.upgrade.stage_eks]
  prod_addon_versions  = var.upgrade_phase == "prod-prepare" ? local.eks_adoption_versions : local.eks_addon_versions[local.upgrade.prod_eks]

  # Pinned regional defaults verified with DescribeAddonVersions. Do not use
  # most_recent: a new add-on release must be reviewed before deployment.
  eks_addon_versions = {
    "1.32" = { kube-proxy = "v1.32.13-eksbuild.32", vpc-cni = "v1.22.4-eksbuild.3", coredns = "v1.11.4-eksbuild.79" }
    "1.33" = { kube-proxy = "v1.33.10-eksbuild.29", vpc-cni = "v1.22.4-eksbuild.3", coredns = "v1.12.4-eksbuild.57" }
    "1.34" = { kube-proxy = "v1.34.6-eksbuild.29", vpc-cni = "v1.22.4-eksbuild.3", coredns = "v1.12.4-eksbuild.57" }
    "1.35" = { kube-proxy = "v1.35.3-eksbuild.29", vpc-cni = "v1.22.4-eksbuild.3", coredns = "v1.13.2-eksbuild.50" }
    "1.36" = { kube-proxy = "v1.36.0-eksbuild.25", vpc-cni = "v1.22.4-eksbuild.3", coredns = "v1.14.7-eksbuild.10" }
  }
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
