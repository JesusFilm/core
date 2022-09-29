resource "aws_security_group" "load_balancer" {
  name   = "${local.name}-sg-alb"
  vpc_id = data.aws_vpc.main.id

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