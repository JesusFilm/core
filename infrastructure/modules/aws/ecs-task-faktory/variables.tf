variable "env" {
  type    = string
  default = "prod"
}

variable "doppler_token" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "alb_target_group" {
  type = object({
    port              = number
    protocol          = string
    path_pattern      = list(string)
    health_check_path = string
    priority          = number
  })
}

variable "alb_listener" {
  type = any
}
