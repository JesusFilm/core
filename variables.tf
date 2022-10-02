# Application
variable "account" {
  type        = number
  description = "AWS account number"
}

variable "region" {
  type        = string
  description = "region"
}

variable "app_services" {
  type        = list(string)
  description = "service name list"
}

variable "env" {
  type        = string
  description = "Environment"
}

# VPC
variable "cidr" {
  type        = string
  description = "VPC CIDR"
}

variable "availability_zones" {
  type        = list(string)
  description = "Availability zones that the services are running"
}

variable "private_subnets" {
  type        = list(string)
  description = "Private subnets"
}

variable "public_subnets" {
  type        = list(string)
  description = "Public subnets"
}

#ALB
variable "internal_alb_config" {
  type = object({
    name = string
    listeners = map(object({
      listener_port     = number
      listener_protocol = string
    }))
    ingress_rules = list(object({
      from_port   = number
      to_port     = number
      protocol    = string
      cidr_blocks = list(string)
    }))
    egress_rules = list(object({
      from_port   = number
      to_port     = number
      protocol    = string
      cidr_blocks = list(string)
    }))
  })
  description = "Internal ALB configuration"
}

variable "internal_url_name" {
  type        = string
  description = "Friendly url name for the internal load balancer DNS"
}

variable "public_alb_config" {
  type = object({
    name = string
    listeners = map(object({
      listener_port     = number
      listener_protocol = string
    }))
    ingress_rules = list(object({
      from_port   = number
      to_port     = number
      protocol    = string
      cidr_blocks = list(string)
    }))
    egress_rules = list(object({
      from_port   = number
      to_port     = number
      protocol    = string
      cidr_blocks = list(string)
    }))
  })
  description = "Public ALB configuration"
}
