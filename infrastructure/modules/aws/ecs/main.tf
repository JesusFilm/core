resource "aws_ecs_cluster" "ecs_cluster" {
  name = var.name
}

resource "aws_security_group" "internal_security_group" {
  name   = "jfp-ecs-internal-sg-${var.env}"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [var.internal_alb_security_group.security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "public_security_group" {
  name   = "jfp-ecs-public-sg-${var.env}"
  vpc_id = var.vpc_id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [var.public_alb_security_group.security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Datadog API Key copied to SSM at specific path to be used by ecs_datadog_agent module
resource "aws_ssm_parameter" "dd_api_key" {
  name      = "/${var.env}/global/DD_API_KEY"
  type      = "SecureString"
  value     = data.aws_ssm_parameter.dd_api_key
  overwrite = true
}
