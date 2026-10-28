variable "env" {
  type        = string
  description = "Environment"
}

variable "name" {
  type        = string
  description = "EKS Cluster Name"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs"
}

variable "subnet_ids_2a" {
  type        = list(string)
  description = "Subnet Group 2a"
}

variable "subnet_ids_2b" {
  type        = list(string)
  description = "Subnet Group 2b"
}

variable "subnet_ids_2c" {
  type        = list(string)
  description = "Subnet Group 2c"
}

variable "security_group_ids" {
  type        = list(string)
  description = "Security Group IDs"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "cluster_version" {
  type        = string
  description = "Kubernetes control-plane version; upgrade each environment one minor at a time."
  default     = "1.32"

  validation {
    condition     = can(regex("^1\\.[0-9]+$", var.cluster_version))
    error_message = "cluster_version must be a Kubernetes minor version such as 1.32."
  }
}

variable "node_version" {
  type        = string
  description = "Managed-node Kubernetes version. Null preserves the existing provider-managed version."
  default     = null

  validation {
    condition     = var.node_version == null ? true : can(regex("^1\\.[0-9]+$", var.node_version))
    error_message = "node_version must be null or a Kubernetes minor version such as 1.32."
  }
}

variable "enforce_sequential_upgrade" {
  type        = bool
  description = "Validate the requested minor against an existing live cluster before planning an upgrade."
  default     = false
}

variable "node_ami_type" {
  type        = string
  description = "Managed-node AMI type; existing clusters use AL2023 rather than unsupported AL2 AMIs."
  default     = null

  validation {
    condition     = var.node_ami_type == null ? true : contains(["AL2023_x86_64_STANDARD", "AL2023_ARM_64_STANDARD"], var.node_ami_type)
    error_message = "node_ami_type must be null or a supported standard AL2023 architecture."
  }
}

variable "addons" {
  type = map(object({
    version              = string
    configuration_values = optional(string)
    existing             = optional(bool, false)
  }))
  description = "Pinned EKS add-ons. Existing managed add-ons retain their live configuration and service-account IAM role."
  default     = {}

  validation {
    condition     = alltrue([for name, addon in var.addons : contains(["kube-proxy", "vpc-cni", "coredns", "eks-node-monitoring-agent"], name) && can(regex("^v[0-9]+\\.[0-9]+\\.[0-9]+-eksbuild\\.[0-9]+$", addon.version))])
    error_message = "Use a pinned eksbuild version for bootstrap or monitoring add-ons. EBS CSI is managed separately through its existing owner."
  }
}

variable "node_scaling_config" {
  type = object({
    desired_size = number
    min_size     = number
    max_size     = number
  })
  description = "Managed-node capacities, configured independently for each environment."
  default = {
    desired_size = 3
    min_size     = 3
    max_size     = 5
  }

  validation {
    condition = (
      alltrue([for size in values(var.node_scaling_config) : size >= 0 && floor(size) == size]) &&
      var.node_scaling_config.max_size >= 1 &&
      var.node_scaling_config.min_size <= var.node_scaling_config.desired_size &&
      var.node_scaling_config.desired_size <= var.node_scaling_config.max_size
    )
    error_message = "Node capacities must be whole nonnegative numbers, with min_size <= desired_size <= max_size and max_size >= 1."
  }
}

variable "node_max_unavailable" {
  type        = number
  description = "Maximum nodes unavailable during an update; review disruption budgets before changing."
  default     = 2

  validation {
    condition     = var.node_max_unavailable >= 1 && floor(var.node_max_unavailable) == var.node_max_unavailable && var.node_max_unavailable <= var.node_scaling_config.max_size
    error_message = "node_max_unavailable must be a positive whole number no greater than max_size."
  }
}

variable "node_repair_thresholds" {
  type = object({
    max_parallel_nodes_repaired_percentage  = optional(number)
    max_unhealthy_node_threshold_percentage = optional(number)
  })
  description = "Preserve environment-specific repair limits; null leaves a threshold unset."
  default     = {}

  validation {
    condition = alltrue([
      for threshold in values(var.node_repair_thresholds) :
      threshold == null ? true : threshold >= 1 && threshold <= 100 && floor(threshold) == threshold
    ])
    error_message = "Node repair percentages must be null or whole numbers between 1 and 100."
  }
}
