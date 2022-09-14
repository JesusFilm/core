resource "aws_security_group" "dns_resolver" {
  description = "For AWS DNS Resolver in US East1"
  vpc_id      = data.aws_vpc.main.id

  ingress {
    from_port        = 53
    to_port          = 53
    protocol         = "udp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    from_port        = 53
    to_port          = 53
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    description      = "Allow ICMP from internal network"
    from_port        = -1
    to_port          = -1
    protocol         = "icmp"
    cidr_blocks      = ["10.0.0.0/8"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name  = "DNS Resolver for us-east1"
    owner = "dps-ndpt@cru.org"
  })
}

resource "aws_route53_resolver_endpoint" "inbound" {
  name      = "US-EAST1"
  direction = "INBOUND"

  security_group_ids = [aws_security_group.dns_resolver.id]

  ip_address {
    subnet_id = data.aws_subnet.prod_apps_2a.id
    ip        = "10.16.2.23"
  }

  ip_address {
    subnet_id = data.aws_subnet.prod_apps_2b.id
    ip        = "10.16.3.23"
  }

  tags = merge(local.tags, {
    owner = "dps-ndpt@cru.org"
  })
}

output "inbound_resolver_endpoint_id" {
  description = "The ID of the Route 53 inbound Resolver endpoint."
  value       = aws_route53_resolver_endpoint.inbound.id
}

output "inbound_resolver_endpoint_arn" {
  description = "The ARN of the Route 53 inbound Resolver endpoint."
  value       = aws_route53_resolver_endpoint.inbound.arn
}

resource "aws_route53_resolver_endpoint" "outbound" {
  name      = "US-EAST1"
  direction = "OUTBOUND"

  security_group_ids = [aws_security_group.dns_resolver.id]

  ip_address {
    subnet_id = data.aws_subnet.prod_apps_2a.id
  }

  ip_address {
    subnet_id = data.aws_subnet.prod_apps_2b.id
  }

  tags = merge(local.tags, {
    owner = "dps-ndpt@cru.org"
  })
}

output "outbound_resolver_endpoint_id" {
  description = "The ID of the Route 53 outbound Resolver endpoint."
  value       = aws_route53_resolver_endpoint.outbound.id
}

output "outbound_resolver_endpoint_arn" {
  description = "The ARN of the Route 53 outbound Resolver endpoint."
  value       = aws_route53_resolver_endpoint.outbound.arn
}
