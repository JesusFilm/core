variable "env" {
  type = string
}

variable "cidr" {
  type = string
}

variable "availability_zones" {
  type = list(string)
}

variable "internal_subnets" {
  type = list(string)
}

variable "public_subnets" {
  type = list(string)
}
