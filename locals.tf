locals {
  # Internal ALB config
  internal_alb_config = {
    name = "internal-alb"
    listeners = {
      "HTTP" = {
        listener_port     = 80
        listener_protocol = "HTTP"
      }
    }
    ingress_rules = [
      {
        from_port   = 80
        to_port     = 3000
        protocol    = "tcp"
        cidr_blocks = [var.cidr]
      }
    ]
    egress_rules = [
      {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = [var.cidr]
      }
    ]
  }
  internal_url_name = "service.internal"

  # Public ALB config
  public_alb_config = {
    name = "public-alb"
    listeners = {
      "HTTP" = {
        listener_port     = 80
        listener_protocol = "HTTP"
      }
    }
    ingress_rules = [
      {
        from_port   = 80
        to_port     = 80
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    ]
    egress_rules = [
      {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
      }
    ]
  }
}
