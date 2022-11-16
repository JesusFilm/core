resource "aws_acm_certificate" "vpn_server" {
  domain_name       = var.dns_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "vpn_server" {
  certificate_arn = aws_acm_certificate.vpn_server.arn

  timeouts {
    create = "1m"
  }
}


resource "aws_acm_certificate" "vpn_client_root" {
  private_key       = data.aws_ssm_parameter.vpn_client_key.value
  certificate_body  = data.aws_ssm_parameter.vpn_client_cert.value
  certificate_chain = data.aws_ssm_parameter.vpn_root_cert.value
}

resource "aws_cloudwatch_log_group" "vpn" {
  name = var.name
}

resource "aws_cloudwatch_log_stream" "vpn" {
  name           = var.name
  log_group_name = aws_cloudwatch_log_group.vpn.name
}

resource "aws_ec2_client_vpn_endpoint" "private" {
  description            = var.name
  server_certificate_arn = aws_acm_certificate.vpn_server.arn
  client_cidr_block      = var.cidr_block
  split_tunnel           = true

  authentication_options {
    type                       = "certificate-authentication"
    root_certificate_chain_arn = aws_acm_certificate.vpn_client_root.arn
  }

  connection_log_options {
    enabled               = true
    cloudwatch_log_group  = aws_cloudwatch_log_group.vpn.name
    cloudwatch_log_stream = aws_cloudwatch_log_stream.vpn.name
  }
}

resource "aws_security_group" "vpn_access" {
  vpc_id = var.vpc_id
  name   = "vpn-example-sg"

  ingress {
    from_port   = 443
    protocol    = "UDP"
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
    description = "Incoming VPN connection"
  }

  egress {
    from_port   = 0
    protocol    = "-1"
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ec2_client_vpn_network_association" "vpn_subnets" {
  count = length(var.subnets)

  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.private.id
  subnet_id              = var.subnets[count.index]
  security_groups        = [aws_security_group.vpn_access.id]

  lifecycle {
    // The issue why we are ignoring changes is that on every change
    // terraform screws up most of the vpn assosciations
    // see: https://github.com/hashicorp/terraform-provider-aws/issues/14717
    ignore_changes = [subnet_id]
  }
}

resource "aws_ec2_client_vpn_authorization_rule" "vpn_auth_rule" {
  client_vpn_endpoint_id = aws_ec2_client_vpn_endpoint.private.id
  target_network_cidr    = var.vpc_cidr_block
  authorize_all_groups   = true
}
