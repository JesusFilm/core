resource "aws_security_group" "tfer--43561ac5-echoserver-echose-2ad7_sg-00d4def5bbc6a8ec1" {
  description = "managed LoadBalancer securityGroup by ALB Ingress Controller"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow ingress on port 80 from 0.0.0.0/0"
    from_port   = "80"
    protocol    = "tcp"
    self        = "false"
    to_port     = "80"
  }

  name = "43561ac5-echoserver-echose-2ad7"

  tags = {
    "ingress.k8s.aws/cluster"    = "JesusFilm-core-production"
    "ingress.k8s.aws/resource"   = "ManagedLBSecurityGroup"
    "ingress.k8s.aws/stack"      = "echoserver/echoserver"
    "kubernetes.io/cluster-name" = "JesusFilm-core-production"
    "kubernetes.io/ingress-name" = "echoserver"
    "kubernetes.io/namespace"    = "echoserver"
  }

  tags_all = {
    "ingress.k8s.aws/cluster"    = "JesusFilm-core-production"
    "ingress.k8s.aws/resource"   = "ManagedLBSecurityGroup"
    "ingress.k8s.aws/stack"      = "echoserver/echoserver"
    "kubernetes.io/cluster-name" = "JesusFilm-core-production"
    "kubernetes.io/ingress-name" = "echoserver"
    "kubernetes.io/namespace"    = "echoserver"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--default_sg-be0e39d7" {
  description = "default VPC security group"

  egress {
    cidr_blocks      = ["0.0.0.0/0"]
    from_port        = "0"
    ipv6_cidr_blocks = ["::/0"]
    protocol         = "-1"
    self             = "false"
    to_port          = "0"
  }

  ingress {
    from_port = "0"
    protocol  = "-1"
    self      = "true"
    to_port   = "0"
  }

  name   = "default"
  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--eks-cluster-sg-JesusFilm-core-705006638_sg-096321fc5ad4991e1" {
  description = "EKS created security group applied to ENI that is attached to EKS Control Plane master nodes, as well as any managed workloads."

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    from_port       = "0"
    protocol        = "-1"
    security_groups = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a027a643b38aa47f296f59ffc4db05a0_sg-015ab1628104b67ad_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a0ac84891964c48a0acf5b0c1c713f79_sg-040c31ad4452f0463_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a18ee3304cf31448ebe9ea12b48784e2_sg-0010de5fe00d22d20_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a3d9299b3410e44caa7a267ecb001a23_sg-0f0910f619d4e4fd6_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a582ad585291849e38e39ad52807888f_sg-06ef5221ff196f35a_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a638c213857e049869afa3fe4aca2939_sg-0a2e02b19d2100700_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a69e78adac8cb45d4be52ec1c927eaff_sg-01aee220479bc0778_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a819711c5a4b94c288be61fe48947a8c_sg-0b5a5774ea382b09f_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a899cf7a7e14a44ae81280f5067bb761_sg-061439617061fdb2c_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-aacad535ab2c34d5eb8227d978849ebe_sg-0da17490a553727c2_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-ac51376bfb6a34a529800a5c74892f4b_sg-03f05715ba8bb810f_id}", "${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-af2b3bdd93c4d44faad69f8ceef76733_sg-0ef4d9eef9f42f7a5_id}"]
    self            = "true"
    to_port         = "0"
  }

  name = "eks-cluster-sg-JesusFilm-core-705006638"

  tags = {
    Name                                   = "eks-cluster-sg-JesusFilm-core-705006638"
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    Name                                   = "eks-cluster-sg-JesusFilm-core-705006638"
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a027a643b38aa47f296f59ffc4db05a0_sg-015ab1628104b67ad" {
  description = "Security group for Kubernetes ELB a027a643b38aa47f296f59ffc4db05a0 (default/api-videos-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a027a643b38aa47f296f59ffc4db05a0"
  name_prefix = "k8s-elb-a027a6"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a0ac84891964c48a0acf5b0c1c713f79_sg-040c31ad4452f0463" {
  description = "Security group for Kubernetes ELB a0ac84891964c48a0acf5b0c1c713f79 (default/api-users-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a0ac84891964c48a0acf5b0c1c713f79"
  name_prefix = "k8s-elb-a0ac84"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a188c4a54fc3742ae8b6d451fe9ff295_sg-0fda1e7e460e6bcf9" {
  description = "Security group for Kubernetes ELB a188c4a54fc3742ae8b6d451fe9ff295 (default/arangodb-loadbalancer-prod)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "8529"
    protocol    = "tcp"
    self        = "false"
    to_port     = "8529"
  }

  name        = "k8s-elb-a188c4a54fc3742ae8b6d451fe9ff295"
  name_prefix = "k8s-elb-a188c4"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a18ee3304cf31448ebe9ea12b48784e2_sg-0010de5fe00d22d20" {
  description = "Security group for Kubernetes ELB a18ee3304cf31448ebe9ea12b48784e2 (default/api-languages-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a18ee3304cf31448ebe9ea12b48784e2"
  name_prefix = "k8s-elb-a18ee3"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a3d9299b3410e44caa7a267ecb001a23_sg-0f0910f619d4e4fd6" {
  description = "Security group for Kubernetes ELB a3d9299b3410e44caa7a267ecb001a23 (default/arangodb-loadbalancer)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "8529"
    protocol    = "tcp"
    self        = "false"
    to_port     = "8529"
  }

  name        = "k8s-elb-a3d9299b3410e44caa7a267ecb001a23"
  name_prefix = "k8s-elb-a3d929"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a48cb96b78675430e9813a9db6a72c52_sg-0ed4b0cd8c082cc0a" {
  description = "Security group for Kubernetes ELB a48cb96b78675430e9813a9db6a72c52 (default/api-languages-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a48cb96b78675430e9813a9db6a72c52"
  name_prefix = "k8s-elb-a48cb9"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a582ad585291849e38e39ad52807888f_sg-06ef5221ff196f35a" {
  description = "Security group for Kubernetes ELB a582ad585291849e38e39ad52807888f (default/api-languages-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a582ad585291849e38e39ad52807888f"
  name_prefix = "k8s-elb-a582ad"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a638c213857e049869afa3fe4aca2939_sg-0a2e02b19d2100700" {
  description = "Security group for Kubernetes ELB a638c213857e049869afa3fe4aca2939 (default/api-videos-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a638c213857e049869afa3fe4aca2939"
  name_prefix = "k8s-elb-a638c2"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a69e78adac8cb45d4be52ec1c927eaff_sg-01aee220479bc0778" {
  description = "Security group for Kubernetes ELB a69e78adac8cb45d4be52ec1c927eaff (default/api-journeys-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a69e78adac8cb45d4be52ec1c927eaff"
  name_prefix = "k8s-elb-a69e78"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a6be4f32b97b443c3b9ed90904039ec8_sg-06d718bc9f5077908" {
  description = "Security group for Kubernetes ELB a6be4f32b97b443c3b9ed90904039ec8 (default/api-users-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "4002"
    protocol    = "tcp"
    self        = "false"
    to_port     = "4002"
  }

  name        = "k8s-elb-a6be4f32b97b443c3b9ed90904039ec8"
  name_prefix = "k8s-elb-a6be4f"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a819711c5a4b94c288be61fe48947a8c_sg-0b5a5774ea382b09f" {
  description = "Security group for Kubernetes ELB a819711c5a4b94c288be61fe48947a8c (default/api-journeys-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a819711c5a4b94c288be61fe48947a8c"
  name_prefix = "k8s-elb-a81971"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a896edcbce94842a8833ed4e410688e3_sg-097c8c9c979834706" {
  description = "Security group for Kubernetes ELB a896edcbce94842a8833ed4e410688e3 (default/arangodb-ea)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "8529"
    protocol    = "tcp"
    self        = "false"
    to_port     = "8529"
  }

  name        = "k8s-elb-a896edcbce94842a8833ed4e410688e3"
  name_prefix = "k8s-elb-a896ed"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a899cf7a7e14a44ae81280f5067bb761_sg-061439617061fdb2c" {
  description = "Security group for Kubernetes ELB a899cf7a7e14a44ae81280f5067bb761 (default/api-gateway-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a899cf7a7e14a44ae81280f5067bb761"
  name_prefix = "k8s-elb-a899cf"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a8b2a4355a3734f45a29b6f5161e67bf_sg-03dd16ebf4ed95d0d" {
  description = "Security group for Kubernetes ELB a8b2a4355a3734f45a29b6f5161e67bf (default/api-journeys-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a8b2a4355a3734f45a29b6f5161e67bf"
  name_prefix = "k8s-elb-a8b2a4"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a9177a36d5e1c4df684244dc2bfec6c3_sg-0b26db6a1def41ebb" {
  description = "Security group for Kubernetes ELB a9177a36d5e1c4df684244dc2bfec6c3 (default/api-videos-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-a9177a36d5e1c4df684244dc2bfec6c3"
  name_prefix = "k8s-elb-a9177a"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-a987a4231357740d8ae5e50b2199f0f0_sg-0c807a09b0288c023" {
  description = "Security group for Kubernetes ELB a987a4231357740d8ae5e50b2199f0f0 (default/api-journeys-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "4001"
    protocol    = "tcp"
    self        = "false"
    to_port     = "4001"
  }

  name        = "k8s-elb-a987a4231357740d8ae5e50b2199f0f0"
  name_prefix = "k8s-elb-a987a4"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-aacad535ab2c34d5eb8227d978849ebe_sg-0da17490a553727c2" {
  description = "Security group for Kubernetes ELB aacad535ab2c34d5eb8227d978849ebe (default/arangodb-stage-loadbalancer)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "8529"
    protocol    = "tcp"
    self        = "false"
    to_port     = "8529"
  }

  name        = "k8s-elb-aacad535ab2c34d5eb8227d978849ebe"
  name_prefix = "k8s-elb-aacad5"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-ab86d82ec0e24459f9fcf85491c2a17e_sg-007b19a2740ead4bf" {
  description = "Security group for Kubernetes ELB ab86d82ec0e24459f9fcf85491c2a17e (default/api-gateway-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-ab86d82ec0e24459f9fcf85491c2a17e"
  name_prefix = "k8s-elb-ab86d8"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-abbe4d922d0064b0cad3e5210b400e04_sg-0cfe3befcee87593b" {
  description = "Security group for Kubernetes ELB abbe4d922d0064b0cad3e5210b400e04 (default/api-journeys-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "4001"
    protocol    = "tcp"
    self        = "false"
    to_port     = "4001"
  }

  name        = "k8s-elb-abbe4d922d0064b0cad3e5210b400e04"
  name_prefix = "k8s-elb-abbe4d"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-ac51376bfb6a34a529800a5c74892f4b_sg-03f05715ba8bb810f" {
  description = "Security group for Kubernetes ELB ac51376bfb6a34a529800a5c74892f4b (default/api-users-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-ac51376bfb6a34a529800a5c74892f4b"
  name_prefix = "k8s-elb-ac5137"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-aca684e3919204085a23aa9c8b4ae233_sg-001f8576df7400a01" {
  description = "Security group for Kubernetes ELB aca684e3919204085a23aa9c8b4ae233 (default/api-gateway-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "4000"
    protocol    = "tcp"
    self        = "false"
    to_port     = "4000"
  }

  name        = "k8s-elb-aca684e3919204085a23aa9c8b4ae233"
  name_prefix = "k8s-elb-aca684"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-ad67299f5087f4d1b845926ce1832198_sg-01c3a159c754e81ab" {
  description = "Security group for Kubernetes ELB ad67299f5087f4d1b845926ce1832198 (default/api-users-main)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-ad67299f5087f4d1b845926ce1832198"
  name_prefix = "k8s-elb-ad6729"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-ae060f35594ed4da686c52fdd5cb0684_sg-0ec49422ebcc23254" {
  description = "Security group for Kubernetes ELB ae060f35594ed4da686c52fdd5cb0684 (default/api-users-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "4002"
    protocol    = "tcp"
    self        = "false"
    to_port     = "4002"
  }

  name        = "k8s-elb-ae060f35594ed4da686c52fdd5cb0684"
  name_prefix = "k8s-elb-ae060f"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-af2b3bdd93c4d44faad69f8ceef76733_sg-0ef4d9eef9f42f7a5" {
  description = "Security group for Kubernetes ELB af2b3bdd93c4d44faad69f8ceef76733 (default/api-gateway-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "443"
    protocol    = "tcp"
    self        = "false"
    to_port     = "443"
  }

  name        = "k8s-elb-af2b3bdd93c4d44faad69f8ceef76733"
  name_prefix = "k8s-elb-af2b3b"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-af4916aeca2934cc7a2ca30cc2bb49fb_sg-01453597ba8aebd75" {
  description = "Security group for Kubernetes ELB af4916aeca2934cc7a2ca30cc2bb49fb (default/arangodb-loadbalancer)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "8529"
    protocol    = "tcp"
    self        = "false"
    to_port     = "8529"
  }

  name        = "k8s-elb-af4916aeca2934cc7a2ca30cc2bb49fb"
  name_prefix = "k8s-elb-af4916"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--k8s-elb-afeab0c8f2e9544349752919393dfaf3_sg-00156eb7925aba87f" {
  description = "Security group for Kubernetes ELB afeab0c8f2e9544349752919393dfaf3 (default/api-gateway-stage)"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "3"
    protocol    = "icmp"
    self        = "false"
    to_port     = "4"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "4000"
    protocol    = "tcp"
    self        = "false"
    to_port     = "4000"
  }

  name        = "k8s-elb-afeab0c8f2e9544349752919393dfaf3"
  name_prefix = "k8s-elb-afeab0"

  tags = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
  }

  vpc_id = "vpc-b896f6d1"
}

resource "aws_security_group" "tfer--launch-wizard-1_sg-080612b5c467b92f5" {
  description = "launch-wizard-1 created 2021-11-12T18:51:27.407-08:00"

  egress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "0"
    protocol    = "-1"
    self        = "false"
    to_port     = "0"
  }

  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = "22"
    protocol    = "tcp"
    self        = "false"
    to_port     = "22"
  }

  name   = "launch-wizard-1"
  vpc_id = "vpc-b896f6d1"
}
