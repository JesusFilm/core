resource "aws_lb" "tfer--43561ac5-echoserver-echose-2ad7" {
  desync_mitigation_mode     = "defensive"
  drop_invalid_header_fields = "false"
  enable_deletion_protection = "false"
  enable_http2               = "true"
  enable_waf_fail_open       = "false"
  idle_timeout               = "60"
  internal                   = "false"
  ip_address_type            = "ipv4"
  load_balancer_type         = "application"
  name                       = "43561ac5-echoserver-echose-2ad7"
  preserve_host_header       = "false"
  security_groups            = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--43561ac5-echoserver-echose-2ad7_sg-00d4def5bbc6a8ec1_id}"]

  subnet_mapping {
    subnet_id = "subnet-305d917d"
  }

  subnet_mapping {
    subnet_id = "subnet-4d17ab36"
  }

  subnet_mapping {
    subnet_id = "subnet-bb4432d2"
  }

  subnets = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "ingress.k8s.aws/cluster"                         = "JesusFilm-core-production"
    "ingress.k8s.aws/resource"                        = "LoadBalancer"
    "ingress.k8s.aws/stack"                           = "echoserver/echoserver"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/ingress-name"                      = "echoserver"
    "kubernetes.io/namespace"                         = "echoserver"
  }

  tags_all = {
    "ingress.k8s.aws/cluster"                         = "JesusFilm-core-production"
    "ingress.k8s.aws/resource"                        = "LoadBalancer"
    "ingress.k8s.aws/stack"                           = "echoserver/echoserver"
    "kubernetes.io/cluster/JesusFilm-core-production" = "owned"
    "kubernetes.io/ingress-name"                      = "echoserver"
    "kubernetes.io/namespace"                         = "echoserver"
  }
}
