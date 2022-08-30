resource "aws_eks_cluster" "tfer--JesusFilm-core" {
  kubernetes_network_config {
    ip_family         = "ipv4"
    service_ipv4_cidr = "10.100.0.0/16"
  }

  name     = "JesusFilm-core"
  role_arn = "arn:aws:iam::894231352815:role/EksAWSControl"
  version  = "1.21"

  vpc_config {
    endpoint_private_access = "false"
    endpoint_public_access  = "true"
    public_access_cidrs     = ["0.0.0.0/0"]
    security_group_ids      = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--default_sg-be0e39d7_id}"]
    subnet_ids              = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]
  }
}
