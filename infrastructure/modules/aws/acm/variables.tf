variable "zone_id" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "alternative_names" {
  type    = list(string)
  default = []
}
