#------------------------------
# DEFAULT Security Groups
#------------------------------
module "default_main" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name            = "default"
  description     = "default VPC security group"
  vpc_id          = data.aws_vpc.main.id
  use_name_prefix = false

  egress_rules = ["all-all"]

  # TODO: Move these to a more specific security group
  ingress_cidr_blocks      = local.networks.public
  ingress_ipv6_cidr_blocks = local.ipv6_networks.public
  ingress_rules            = ["nfs-tcp"]

  tags = {
    Name = "Default (Main VPC)"
  }
}

#------------------------------
# Load Balancer Security Groups
#------------------------------
module "load_balancer_public" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name            = "Default-LoadBalancer-Public"
  description     = "Allows ingress on HTTP/HTTPS from anywhere"
  vpc_id          = data.aws_vpc.main.id
  use_name_prefix = false

  ingress_cidr_blocks      = local.networks.public
  ingress_ipv6_cidr_blocks = local.ipv6_networks.public
  ingress_rules            = ["http-80-tcp", "https-443-tcp"]

  tags = {
    function = "load-balancer"
    type     = "ingress"
    network  = "public"
  }
}

module "load_balancer_internal" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name            = "Default-LoadBalancer-Internal"
  description     = "Allows ingress on HTTP/HTTPS from internal networks"
  vpc_id          = data.aws_vpc.main.id
  use_name_prefix = false

  ingress_cidr_blocks      = local.networks.internal
  ingress_ipv6_cidr_blocks = local.ipv6_networks.internal
  ingress_rules            = ["http-80-tcp", "https-443-tcp"]

  tags = {
    function = "load-balancer"
    type     = "ingress"
    network  = "internal"
  }
}

module "postgres_rds" {
  source  = "terraform-aws-modules/security-group/aws"
  version = "4.9.0"

  name            = "postgres-rds"
  description     = "Postgres RDS Security Group"
  vpc_id          = data.aws_vpc.main.id
  use_name_prefix = false

  ingress_cidr_blocks      = local.networks.internal
  ingress_ipv6_cidr_blocks = local.ipv6_networks.internal
  ingress_rules            = ["postgresql-tcp"]

  # TODO: Remove this is favor of adding egress SG to RDS instances
  egress_rules = ["all-all"]

  tags = {
    Name     = "Default-Postgres-RDS"
    function = "postgres"
    type     = "ingress"
    network  = "internal"
  }
}
