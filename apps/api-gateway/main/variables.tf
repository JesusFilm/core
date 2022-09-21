variable "apollo_graph_ref" {
  type = string
  description = "Apollo graph ref"
}

variable "apollo_key" {
  type = string  
}

variable "aws_access_key_id" {
  type = string
}

variable "aws_secret_access_key" {
  type = string
}

variable "google_application_json" {
  type = string
}

variable "logging_level" {
  type = string
  default = "error"
}