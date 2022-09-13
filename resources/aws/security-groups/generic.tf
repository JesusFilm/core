resource "aws_security_group" "ingress_http_public" {
  name        = "Ingress-HTTP-Public"
  description = "Allows ingress on port 80 from anywhere"
  vpc_id      = data.aws_vpc.main.id
  tags = {
    Name     = "Ingress-HTTP-Public"
    type     = "ingress"
    protocol = "http"
    network  = "public"
  }

  ingress {
    from_port        = 80
    to_port          = 80
    protocol         = "tcp"
    cidr_blocks      = local.networks.public
    ipv6_cidr_blocks = local.ipv6_networks.public
    description      = "HTTP"
  }
}

resource "aws_security_group" "ingress_https_public" {
  name        = "Ingress-HTTPS-Public"
  description = "Allows ingress on port 443 from anywhere"
  vpc_id      = data.aws_vpc.main.id
  tags = {
    Name     = "Ingress-HTTPS-Public"
    type     = "ingress"
    protocol = "https"
    network  = "public"
  }

  ingress {
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = local.networks.public
    ipv6_cidr_blocks = local.ipv6_networks.public
    description      = "HTTPS"
  }
}

# resource "aws_security_group" "ingress_ssh_public" {
#   name        = "Ingress-SSH-Public"
#   description = "Allows ingress on port 22 from anywhere"
#   vpc_id      = data.aws_vpc.main.id
#   tags = {
#     Name     = "Ingress-SSH-Public"
#     type     = "ingress"
#     protocol = "ssh"
#     network  = "public"
#   }

#   ingress {
#     from_port        = 22
#     to_port          = 22
#     protocol         = "tcp"
#     cidr_blocks      = local.networks.public
#     ipv6_cidr_blocks = local.ipv6_networks.public
#     description      = "SSH public"
#   }
# }

# resource "aws_security_group" "ingress_ssh_internal" {
#   name        = "Ingress-SSH-Internal"
#   description = "Allows ingress on port 22 from internal Cru VPC"
#   vpc_id      = data.aws_vpc.main.id
#   tags = {
#     Name     = "Ingress-SSH-Internal"
#     type     = "ingress"
#     protocol = "ssh"
#     network  = "internal"
#   }

#   ingress {
#     from_port        = 22
#     to_port          = 22
#     protocol         = "tcp"
#     cidr_blocks      = local.networks.internal
#     ipv6_cidr_blocks = local.ipv6_networks.internal
#     description      = "SSH internal"
#   }
# }

resource "aws_security_group" "egress_any_public" {
  name        = "Egress-Any-Public"
  description = "Allows all egress to anywhere"
  vpc_id      = data.aws_vpc.main.id
  tags = {
    Name     = "Egress-Any-Public"
    type     = "egress"
    protocol = "any"
    network  = "public"
  }

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = local.networks.public
    ipv6_cidr_blocks = local.ipv6_networks.public
    description      = "Default egress anywhere"
  }
}
