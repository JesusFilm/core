resource "aws_internet_gateway" "tfer--igw-4ea82d27" {
  vpc_id = "${data.terraform_remote_state.vpc.outputs.aws_vpc_tfer--vpc-b896f6d1_id}"
}
