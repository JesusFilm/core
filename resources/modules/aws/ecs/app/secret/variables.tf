variable "identifier" {
  description = "Application Identifier (most often the github repo name)"
  type        = string
}

variable "env" {
  description = "Environment (prod, stage, lab)"
  type        = string
}

variable "key" {
  description = "The environment variable name"
  type        = string
}

variable "value" {
  description = "The secret value"
  type        = string
}

variable "param_type" {
  description = "The secret value"
  type        = string
  default     = "RUNTIME"
}

variable "contact_email" {
  description = "Email address to contact with question about this application. Prefer group email."
  type        = string
}

variable "extra_tags" {
  description = "AWS Tags, merged with local tags"
  type        = map(string)
  default     = {}
}
