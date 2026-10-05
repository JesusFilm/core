variable "env" {
  type        = string
  description = "Environment"
}

variable "name" {
  type        = string
  description = "What is being snapshotted, e.g. plausible-clickhouse. Used in the policy, role and tag names."

  validation {
    condition     = can(regex("^[a-z0-9]+(-[a-z0-9]+)*$", var.name))
    error_message = "name must be lowercase alphanumerics separated by single hyphens."
  }
}

variable "cluster_name" {
  type        = string
  description = "EKS cluster whose nodes the target volumes are attached to (matched on the eks:cluster-name instance tag)."
}

variable "pvc_names" {
  type        = list(string)
  description = "PersistentVolumeClaim names whose backing EBS volumes this policy snapshots (matched on the kubernetes.io/created-for/pvc/name volume tag)."

  validation {
    condition     = length(var.pvc_names) > 0
    error_message = "pvc_names must list at least one PersistentVolumeClaim."
  }
}

variable "schedules" {
  type = list(object({
    name            = string
    cron_expression = string
    retain_count    = number
  }))
  description = "DLM schedules. cron_expression uses the DLM form, e.g. cron(0 1 * * ? *) for 01:00 UTC daily. retain_count is how many snapshots each schedule keeps before deleting the oldest."

  validation {
    condition     = length(var.schedules) >= 1 && length(var.schedules) <= 4
    error_message = "A DLM policy supports between 1 and 4 schedules."
  }

  validation {
    condition     = alltrue([for schedule in var.schedules : can(regex("^cron\\(.+\\)$", schedule.cron_expression))])
    error_message = "Each cron_expression must use the DLM form cron(...)."
  }

  validation {
    condition     = alltrue([for schedule in var.schedules : schedule.retain_count >= 1 && schedule.retain_count <= 1000])
    error_message = "Each retain_count must be between 1 and 1000."
  }
}
