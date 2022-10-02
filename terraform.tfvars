## Application configurations
account      = 000000
region       = "us-east-2"
env          = "prod"
app_services = ["api-gateway"]

#VPC configurations
cidr               = "10.10.0.0/16"
availability_zones = ["us-east-2a", "us-east-2b"]
public_subnets     = ["10.10.50.0/24", "10.10.51.0/24"]
private_subnets    = ["10.10.0.0/24", "10.10.1.0/24"]

#Internal ALB configurations
internal_alb_config = {
  name      = "internal-alb"
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
      cidr_blocks = ["10.10.0.0/16"]
    }
  ]

  egress_rules = [
    {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["10.10.0.0/16"]
    }
  ]
}

#Friendly url name for internal load balancer DNS
internal_url_name = "service.internal"

#Public ALB configurations
public_alb_config = {
  name      = "public-alb"
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