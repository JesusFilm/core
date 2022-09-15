variable "name" {
  description = "The internal unique name of the Permissions."
  type        = string
  validation {
    condition     = length(var.name) > 5 && length(var.name) <= 32
    error_message = "Permission name must be between 6 and 32 characters."
  }
}

variable "description" {
  description = "The description of the Permissions."
  type        = string
}

variable "session_duration" {
  description = "The length of time that the application user sessions are valid in the ISO-8601 standard. Default: PT2H."
  type        = string
  default     = "PT4H"
}

variable "landing_page" {
  description = "The URL used to redirect users within the application during the federation authentication process."
  type        = string
  default     = "https://console.aws.amazon.com/console/home?region=us-east-1"
}

variable "tags" {
  description = "Key-value map of resource tags."
  type        = map(string)
}

variable "okta_groups" {
  description = "List of Okta group names to be granted access."
  type        = list(string)
  default     = []
}

variable "okta_users" {
  description = "List of individual Okta user logins (email address) to be granted access."
  type        = list(string)
  default     = []
}

variable "aws_account_ids" {
  description = "List of AWS account ids where access is granted. Defaults to organization root account (cruds)."
  type        = list(string)
  default     = []
}

variable "iam_policy_arns" {
  description = "List of IAM policies that define permissions granted."
  type        = list(string)
  default     = []
}

variable "iam_policy_document_json" {
  description = "Custom inline IAM policy document that defines permissions granted."
  type        = string
  default     = null
}
