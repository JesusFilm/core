# AWS Generic Security Groups 
Defines generic security groups that can be used by instances/ENI to allow ingress/egress.

## Tag based filtering
The following tags are defined for all generic security groups

* `type` - Security Group direction (Ingress/Egress)
  - `ingress`
  - `egress`
* `network` - Allowed network
  - `public` - All networks ("0.0.0.0/0", "::/0")
  - `internal` - Internal Cru network ("10.0.0.0/8")
  - `aws` - Associated AWS VPC cidr (Main VPC "10.16.0.0/16")
* `protocol`
  - `http` - HTTP port 80
  - `https` - HTTPS port 443
  - `ssh` - TCP port 22
  - `any` - All ports

Example:
```hcl
data "aws_security_groups" "load_balancer" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main.id]
  }
  filter {
    name   = "tag:protocol"
    values = ["http", "https"]
  }
  tags = {
    type    = "ingress"
    network = "public"
  }
}
```
