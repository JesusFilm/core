variable "env" {
  type = string
}

variable "name" {
  type = string
}

variable "doppler_token" {
  type        = string
  description = "Doppler token for Aurora"
  sensitive   = true
}

variable "subnet_group_name" {
  type = string
}

variable "doppler_project" {
  type = string
}

variable "vpc_security_group_id" {
  type = string
}

variable "PG_DATABASE_URL_ENV_VAR" {
  type = string
}

variable "engine_version" {
  type        = string
  description = "Aurora PostgreSQL version; major upgrades require a tested compatible parameter group."
  default     = "13.23"

  validation {
    condition     = can(regex("^[0-9]+\\.[0-9]+$", var.engine_version))
    error_message = "engine_version must be an Aurora PostgreSQL major.minor version such as 13.23."
  }
}

variable "db_cluster_parameter_group_name" {
  type        = string
  description = "Existing parameter group compatible with engine_version, including required replication settings."
  default     = "aurora-postgresql13-cluster-replication"

  validation {
    condition     = length(trimspace(var.db_cluster_parameter_group_name)) > 0
    error_message = "db_cluster_parameter_group_name must not be empty."
  }
}

variable "storage_type" {
  type        = string
  description = "Aurora storage configuration. Null preserves the existing default; aurora-iopt1 selects I/O-Optimized."
  default     = null

  validation {
    condition     = var.storage_type == null ? true : contains(["aurora", "aurora-iopt1"], var.storage_type)
    error_message = "storage_type must be null, aurora, or aurora-iopt1."
  }
}

variable "serverlessv2_capacity" {
  type = object({
    min_capacity = number
    max_capacity = number
  })
  description = "Serverless v2 ACU bounds. Zero minimum and larger maxima require an eligible engine/platform version."
  default = {
    min_capacity = 0.5
    max_capacity = 16
  }

  validation {
    condition = (
      var.serverlessv2_capacity.min_capacity >= 0 &&
      var.serverlessv2_capacity.max_capacity >= 0.5 &&
      var.serverlessv2_capacity.max_capacity <= 256 &&
      var.serverlessv2_capacity.min_capacity <= var.serverlessv2_capacity.max_capacity &&
      alltrue([for capacity in values(var.serverlessv2_capacity) : floor(capacity * 2) == capacity * 2])
    )
    error_message = "ACU bounds must use 0.5 increments, with 0 <= min_capacity <= max_capacity and 0.5 <= max_capacity <= 256; engine/platform eligibility must also be checked."
  }
}

variable "apply_immediately" {
  type        = bool
  description = "Apply cluster changes immediately rather than during maintenance; choose explicitly for each rollout."
  default     = true
}
