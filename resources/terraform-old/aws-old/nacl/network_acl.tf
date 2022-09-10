resource "aws_network_acl" "tfer--acl-ff8be196" {
  egress {
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = "0"
    icmp_code  = "0"
    icmp_type  = "0"
    protocol   = "-1"
    rule_no    = "100"
    to_port    = "0"
  }

  ingress {
    action     = "allow"
    cidr_block = "0.0.0.0/0"
    from_port  = "0"
    icmp_code  = "0"
    icmp_type  = "0"
    protocol   = "-1"
    rule_no    = "100"
    to_port    = "0"
  }

  subnet_ids = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]
  vpc_id     = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-b896f6d1_id}"
}
