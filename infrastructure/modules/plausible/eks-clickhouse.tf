# Temporary bridge to the EKS ClickHouse.
#
# Plausible moves to ECS before its events move to ClickHouse Cloud. Until
# then the task reads and writes the ClickHouse StatefulSet on the EKS Platform
# Cluster through an internal NLB, which the AWS Load Balancer Controller
# creates from infrastructure/kube/plausible-analytics/clickhouse-ecs-bridge.yaml.
# This is that NLB's security group: ClickHouse's HTTP port, only from the
# public ECS security group the task runs in (shared with api-gateway and
# Arclight). The controller adds the matching rule on the cluster nodes.
#
# Remove this file and the manifest once the events are on ClickHouse Cloud
# (README.md, "Moving the events to ClickHouse Cloud").

locals {
  eks_clickhouse_port = 8123
}

data "aws_vpc" "this" {
  id = var.ecs_config.vpc_id
}

resource "aws_security_group" "eks_clickhouse_nlb" {
  name        = "jfp-plausible-eks-clickhouse-${var.env}"
  description = "Plausible ECS tasks to the EKS ClickHouse internal NLB (temporary)"
  vpc_id      = var.ecs_config.vpc_id

  tags = {
    Name = "jfp-plausible-eks-clickhouse-${var.env}"
    Env  = var.env
  }
}

resource "aws_vpc_security_group_ingress_rule" "eks_clickhouse_from_ecs" {
  security_group_id            = aws_security_group.eks_clickhouse_nlb.id
  description                  = "ClickHouse HTTP from the public ECS tasks"
  referenced_security_group_id = var.ecs_config.security_group_id
  ip_protocol                  = "tcp"
  from_port                    = local.eks_clickhouse_port
  to_port                      = local.eks_clickhouse_port
}

resource "aws_vpc_security_group_egress_rule" "eks_clickhouse_to_pods" {
  security_group_id = aws_security_group.eks_clickhouse_nlb.id
  description       = "ClickHouse HTTP to the pod"
  cidr_ipv4         = data.aws_vpc.this.cidr_block
  ip_protocol       = "tcp"
  from_port         = local.eks_clickhouse_port
  to_port           = local.eks_clickhouse_port
}
