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
