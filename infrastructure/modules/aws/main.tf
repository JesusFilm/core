module "vpc" {
  source = "./vpc"
  env    = var.env
  cidr   = var.cidr
}

module "internal_alb_security_group" {
  source        = "./security-group"
  name          = "jfp-internal-alb-sg-${var.env}"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = local.internal_alb_config.ingress_rules
  egress_rules  = local.internal_alb_config.egress_rules
}

module "internal_rds_security_group" {
  source = "./security-group"
  name   = "jfp-internal-rds-sg-${var.env}"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [
    {
      from_port   = 5432
      to_port     = 5432
      protocol    = "tcp"
      cidr_blocks = [var.cidr]
    }
  ]
  egress_rules = local.egress_rules
}

module "public_alb_security_group" {
  source        = "./security-group"
  name          = "jfp-public-alb-sg-${var.env}"
  vpc_id        = module.vpc.vpc_id
  ingress_rules = local.public_alb_config.ingress_rules
  egress_rules  = local.public_alb_config.egress_rules
}

module "public_bastion_security_group" {
  source = "./security-group"
  name   = "jfp-public-bastion-sg-${var.env}"
  vpc_id = module.vpc.vpc_id
  ingress_rules = [
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = concat([var.cidr], local.google_datastream_ip_list)
    },
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["172.221.20.111/32"]
    },
    {
      // Mike Allison
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["47.36.114.169/32"]
    },
    {
      // Mike Allison
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["172.221.20.229/32"]
    },
    {
      // Tataihono Nikora
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["203.86.193.21/32"]
    },

    // EC2_INSTANCE_CONNECT
    {
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = ["3.16.146.0/29"]
    }
  ]
  egress_rules = local.egress_rules
}

module "internal_alb" {
  source          = "./alb"
  name            = "jfp-internal-alb-${var.env}"
  subnets         = module.vpc.internal_subnets
  vpc_id          = module.vpc.vpc_id
  internal        = true
  security_groups = [module.internal_alb_security_group.security_group_id]
}

module "internal_alb_listener" {
  source   = "./alb-listener"
  alb_arn  = module.internal_alb.arn
  port     = 80
  protocol = "HTTP"
}

module "public_alb" {
  source          = "./alb"
  name            = "jfp-public-alb-${var.env}"
  subnets         = module.vpc.public_subnets
  vpc_id          = module.vpc.vpc_id
  internal        = false
  redirects       = local.public_alb_config.redirects
  security_groups = [module.public_alb_security_group.security_group_id]
}

module "public_alb_listener" {
  source          = "./alb-listener"
  alb_arn         = module.public_alb.arn
  port            = 443
  protocol        = "HTTPS"
  certificate_arn = var.certificate_arn
}
resource "aws_lb_listener" "ssl_forwarder" {
  load_balancer_arn = module.public_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener_certificate" "acm_nextstep_is" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_nextstep_is.arn
}

resource "aws_lb_listener_certificate" "acm_core_arclight_org" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_core_arclight_org.arn
}

resource "aws_lb_listener_certificate" "acm_core_stage_arclight_org" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_core_stage_arclight_org.arn
}

resource "aws_lb_listener_certificate" "acm_arclight_org" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_arclight_org.arn
}

resource "aws_lb_listener_certificate" "acm_arc_gt" {
  listener_arn    = module.public_alb_listener.arn
  certificate_arn = data.aws_acm_certificate.acm_arc_gt.arn
}

module "route53_private_zone" {
  source            = "./route53"
  internal_url_name = var.internal_url_name
  alb               = module.internal_alb
  vpc_id            = module.vpc.vpc_id
}

module "ecs" {
  source                      = "./ecs"
  name                        = "jfp-ecs-cluster-${var.env}"
  vpc_id                      = module.vpc.vpc_id
  internal_alb_security_group = module.internal_alb_security_group
  public_alb_security_group   = module.public_alb_security_group
  env                         = var.env
}
