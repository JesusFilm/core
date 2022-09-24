resource "aws_security_group" "load_balancer" {
  name   = "${local.name}-sg-alb"
  vpc_id = data.aws_vpc.main.id

  ingress {
    protocol         = "tcp"
    from_port        = 80
    to_port          = 80
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  ingress {
    protocol         = "tcp"
    from_port        = 443
    to_port          = 443
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(local.tags, {
    Name        = "${local.name}-sg-alb"
    Environment = var.env
  })
}

resource "aws_security_group" "task" {
  name   = "${local.name}-sg-task"
  vpc_id = data.aws_vpc.main.id

  ingress {
    protocol         = "tcp"
    from_port        = var.port
    to_port          = var.port
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }

  tags = merge(local.tags, {
    Name        = "${local.name}-sg-task"
    Environment = var.env
  })
}