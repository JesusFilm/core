variable "description" {
  type        = string
  description = "The description of the kms key."
  default     = "Managed by Terraform"
}

variable "enable_key_rotation" {
  type        = string
  description = "Whether or not to enable key rotation. 'true' or 'false'."
  default     = "true"
}

variable "deletion_window_in_days" {
  type        = string
  description = "The minimum number of days which must transpire before a key can be deleted. Minimum allowed 7."
  default     = "30"
}

variable "name" {
  type        = string
  description = "The name of the kms key alias."
}

variable "trusted_kms_arns" {
  description = "ARNs of AWS entities who can have carte blanche use of the key"
  type        = list(string)
  default     = []
}

variable "trusted_kms_admin_arns" {
  description = "ARNs of AWS entities who can have admin rights use of the key"
  type        = list(string)
  default     = []
}

variable "trusted_kms_role_arns" {
  description = "ARNs of AWS entities who will have basic role rights use of the key"
  type        = list(string)
  default     = []
}

variable "key_tags" {
  description = "A map of tags to add to KMS key resource"
  type        = map(string)
  default     = {}
}

variable "application" {
  description = "Application name"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment (eg. prod, stage, lab)"
  type        = string
  default     = ""
}
