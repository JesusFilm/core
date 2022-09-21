variable "identifier" {
  description = "Application Identifier (most often the github repo name)"
  type        = string
}

variable "env" {
  description = "Environment (prod, stage, lab)"
  type        = string
}

variable "contact_email" {
  description = "Email address to contact with question about this application. Prefer group email."
  type        = string
}

variable "zone_id" {
  description = "The id of the DNS zone in which the app's domain name will live. If blank, no domain name will be created."
  type        = string
  default     = ""
}

variable "extra_tags" {
  description = "AWS Tags, merged with local tags"
  type        = map(string)
  default     = {}
}

variable "task_execution_policy_override_json" {
  description = "Additional IAM policy document json to override the task execution role¹."
  type        = string
  default     = "{}"
}

variable "additional_task_execution_policy_arns" {
  description = "Attach additional IAM policies to the task execution role."
  type        = list(string)
  default     = []
}

variable "task_policy_override_json" {
  description = "Additional IAM policy document json to override the task role¹ and SSO Permission Set."
  type        = string
  default     = "{}"
}

variable "additional_task_policy_arns" {
  description = "Attach additional IAM policies to the task role."
  type        = list(string)
  default     = []
}

variable "sso_iam_policy_arns" {
  description = "Attach IAM policies to the SSO Permission Set. These are required to be AWS managed."
  type        = list(string)
  default     = []
}

variable "task_assume_role_policy_override_json" {
  description = "Additional IAM policy document json to override the task assume role¹."
  type        = string
  default     = "{}"
}

variable "load_balancer_arn" {
  description = "Load balancer ARN to use."
  type        = string
  default     = ""
}

variable "dns_name" {
  description = "DNS record to add, must include zone name. Defaults to \"{identifier}[-{env}].{zone_name}\"."
  type        = string
  default     = ""
}

variable "developers" {
  description = "Grant Okta users (emails) access to assume the role."
  type        = set(string)
  default     = []
}

variable "grant_devops_access" {
  description = "Grant the devops team access to assume the application role."
  type        = bool
  default     = true
}

variable "create_target_group" {
  description = "Should a target group be created?"
  type        = bool
  default     = true
}

variable "target_group_name" {
  description = "Target group name. Defaults to \"{identifier}-{env}\" with underscores replaced by dashes."
  type        = string
  default     = ""
}

variable "target_group_port" {
  description = "Target group port. Defaults to 80."
  type        = number
  default     = 80
}

variable "target_group_protocol" {
  description = "Target group protocol. Defaults to \"HTTP\"."
  type        = string
  default     = "HTTP"
}

variable "target_group_healthcheck_path" {
  description = "Target group healthcheck path. Defaults to \"/monitors/lb\"."
  type        = string
  default     = "/monitors/lb"
}

variable "create_listener_rule" {
  description = "Should a load balancer listener rule be created? Must be false if `target_group_arns` is set."
  type        = bool
  default     = true
}

variable "listener_arn" {
  description = "Load balancer listener ARN to add rule to. Defaults to \"HTTPS\" listener on `load_balancer_arn`."
  type        = string
  default     = ""
}

variable "target_group_arn" {
  description = "Target group ARN to forward listener rule to. Ignored if `create_target_group` is true, or if `target_group_arns` is set."
  type        = string
  default     = ""
}

variable "target_group_arns" {
  description = "Set of target group ARNs to forward listener rule to. Ignored if `create_target_group` is true."
  type        = set(string)
  default     = null
}

variable "target_group_deregistration_delay" {
  description = "The amount time for Elastic Load Balancing to wait before changing the state of a deregistering target from draining to unused. Default 60"
  type        = number
  default     = 60
}

variable "target_group_target_type" {
  description = "The type of target that you must specify when registering targets with this target group (instance, ip)."
  type        = string
  default     = "instance"
}

variable "listener_rule_hostnames" {
  description = "List of DNS names to listen to and forward to the target_group, in addition to `domain_name`."
  type        = list(string)
  default     = []
}

variable "target_group_stickiness_enabled" {
  description = "Should the target group use cookie-based sticky sessions?"
  type        = bool
  default     = false
}

variable "certificates" {
  description = "Additional certificates to add to the HTTPS load balancer listener."
  type        = list(string)
  default     = []
}

variable "parameters" {
  description = "SSM Parameters (secrets). See above for more details."
  # Any is required here. map requires all values to be of the same type, and object requires specific keys to be set.
  type    = any
  default = {}
}

variable "redis_db_index" {
  description = "Redis DB index. If set, redis SESSION and STORAGE parameters will be added to parameter store."
  type        = number
  default     = -1
}

variable "maintenance_db_index" {
  description = "MAINTENANCE redis DB index. If set to -1, MAINTENANCE parameters will not be added to parameter store."
  type        = number
  default     = 3
}

variable "services" {
  description = "ECS Services. Defaults to a single `app` service."
  type        = list(map(string))
  default     = [{ name = "app" }]
}

variable "task_names" {
  description = "List of ECS service/scheduled task names provided in the `services` and `scheduled_tasks` variables."
  type        = list(string)
  default     = ["app"]
}

variable "scheduled_tasks" {
  description = "ECS Schedule Tasks."
  type        = list(map(string))
  default     = []
}

variable "notification_recipients" {
  description = "List of email adresses to receive alerts from Datadog"
  type        = list(string)
  default     = []
}

variable "github_repo" {
  description = "GitHub repository. Must be owned by JesusFilm. Defaults to `identifier`"
  type        = string
  default     = ""
}
