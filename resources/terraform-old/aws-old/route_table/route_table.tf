resource "aws_route_table" "tfer--rtb-ecf38285" {
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = "igw-4ea82d27"
  }

  vpc_id = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-b896f6d1_id}"
}
