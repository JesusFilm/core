variable "ecs_config" {
  type = object({
    vpc_id    = string
    is_public = bool
    subnets   = list(string)
    zone_id   = string
    alb = object({
      arn      = string
      dns_name = string
    })
    alb_target_group = object({
      port              = number
      protocol          = string
      path_pattern      = list(string)
      health_check_path = string
      health_check_port = optional(number)
      priority          = number
    })
    security_group_id       = string
    task_execution_role_arn = string
    cluster = object({
      id   = string
      name = string
    })
  })
}

variable "env" {
  type = string

  validation {
    condition     = contains(["stage", "prod"], var.env)
    error_message = "env must be stage or prod."
  }
}

variable "doppler_token" {
  type        = string
  description = "Doppler service token for the `plausible` project, in this environment's config"
  sensitive   = true
}

variable "alb_listener_arn" {
  type = string
}

variable "alb_dns_name" {
  type = string
}

variable "host_names" {
  type        = list(string)
  description = "Hostnames the public ALB routes to Plausible: the real analytics hostname plus the module's own plausible.<zone> record for smoke tests."

  validation {
    condition     = length(var.host_names) > 0
    error_message = "host_names must name at least one hostname."
  }
}

variable "plausible_version" {
  type        = string
  default     = "v2.1.1"
  description = "Tag of ghcr.io/plausible/community-edition to run. Must be published for linux/arm64 (every release since v2.0 is). Bumping this is the whole of a Plausible upgrade; check the release notes for ClickHouse-side requirements first."

  validation {
    condition     = can(regex("^v[0-9]+\\.[0-9]+\\.[0-9]+$", var.plausible_version))
    error_message = "plausible_version must be a release tag like v2.1.1."
  }
}
