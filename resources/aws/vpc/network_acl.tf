resource "aws_default_network_acl" "default" {
  default_network_acl_id = aws_vpc.main.default_network_acl_id
  tags = merge(local.tags, {
    Name = "Default ACL"
  })
  ingress {
    action     = "allow"
    from_port  = 0
    protocol   = "-1"
    rule_no    = 100
    to_port    = 0
    cidr_block = "0.0.0.0/0"
  }

  egress {
    action     = "allow"
    from_port  = 0
    protocol   = "-1"
    rule_no    = 100
    to_port    = 0
    cidr_block = "0.0.0.0/0"
  }

  lifecycle {
    // Subnets are assigned by default to the Default ACL. Tracking it here would require adding all
    // subnet_ids that aren't assigned to a different acl, or terraform would show a diff.
    // Ignore it and let AWS handle the assignments
    ignore_changes = [subnet_ids]
  }
}

