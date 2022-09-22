// Lookup Default ALB security group
data "aws_security_group" "default_load_balancer" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    function = "load-balancer"
    type     = "ingress"
    network  = "public"
  }
}

// Lookup ECS security group
data "aws_security_group" "ecs" {
  vpc_id = data.aws_vpc.main.id
  tags = {
    function = "ecs"
    env      = var.env
  }
}

// Create Load Balancer Security group with egress to all outbound IP addresses
resource "aws_security_group" "load_balancer" {
  name        = "${local.name}-alb"
  description = "${var.identifier} (${var.env}) ALB"
  vpc_id      = data.aws_vpc.main.id
  tags = merge(local.tags, {
    Name = "${local.name}-alb"
  })

  egress {
    from_port       = 0
    protocol        = "-1"
    to_port         = 0
    security_groups = [data.aws_security_group.ecs.id]
    description     = data.aws_security_group.ecs.description
    cidr_blocks     = ["0.0.0.0/0"] # Allowing traffic out to all IP addresses
  }
}

// Allow ingress on ECS from Load Balancer using ephemeral ports.
resource "aws_security_group_rule" "ecs_ingress" {
  security_group_id        = data.aws_security_group.ecs.id
  type                     = "ingress"
  description              = aws_security_group.load_balancer.description
  from_port                = 49153
  protocol                 = "tcp"
  to_port                  = 65535
  source_security_group_id = aws_security_group.load_balancer.id
}