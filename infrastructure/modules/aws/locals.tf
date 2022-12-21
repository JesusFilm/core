locals {
  egress_rules = [{
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }]
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
        to_port     = 5000
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

  # Public ALB config
  public_alb_config = {
    name = "public-alb"
    listeners = {
      "HTTPS" = {
        listener_port     = 443
        listener_protocol = "HTTPS"
      }
    }
    redirects = {
      "HTTP" = {
        listener_port     = 80
        listener_protocol = "HTTP"
        redirect_port     = 443
        redirect_protocol = "HTTPS"
      }
    }
    ingress_rules = [
      {
        from_port   = 443
        to_port     = 443
        protocol    = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
      }
    ]
    egress_rules = local.egress_rules
  }
}
