resource "aws_main_route_table_association" "tfer--vpc-b896f6d1" {
  route_table_id = "${data.terraform_remote_state.route_table.outputs.aws_route_table_tfer--rtb-ecf38285_id}"
  vpc_id         = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-b896f6d1_id}"
}
