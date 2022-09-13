locals {
  networks = {
    public   = ["0.0.0.0/0"]                  // Anywhere
    internal = ["10.0.0.0/8"]                 // Cru VPC (includes AWS/LH/GCP)
    aws      = [data.aws_vpc.main.cidr_block] // AWS Main VPC CIDR
  }

  ipv6_networks = {
    public   = ["::/0"]                                     // Anywhere
    internal = []                                           // Internal ipv6 not set up
    aws      = compact([data.aws_vpc.main.ipv6_cidr_block]) // AWS MAin VPC ipv6 CIDR (Main VPC doesn't currently have IPV6)
  }

  tags = {
    # owner      = "devops-engineering-team@cru.org"
    managed_by = "terraform"
    terraform  = replace(abspath(path.root), "/^.*/(core|default)/", "")
  }
}