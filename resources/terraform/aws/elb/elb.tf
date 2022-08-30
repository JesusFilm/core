resource "aws_elb" "tfer--a027a643b38aa47f296f59ffc4db05a0" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:30624"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "30624"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a027a643b38aa47f296f59ffc4db05a0"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a027a643b38aa47f296f59ffc4db05a0_sg-015ab1628104b67ad_id}"]
  source_security_group = "894231352815/k8s-elb-a027a643b38aa47f296f59ffc4db05a0"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-videos-main"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-videos-main"
  }
}

resource "aws_elb" "tfer--a0ac84891964c48a0acf5b0c1c713f79" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:30231"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "30231"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a0ac84891964c48a0acf5b0c1c713f79"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a0ac84891964c48a0acf5b0c1c713f79_sg-040c31ad4452f0463_id}"]
  source_security_group = "894231352815/k8s-elb-a0ac84891964c48a0acf5b0c1c713f79"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-users-stage"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-users-stage"
  }
}

resource "aws_elb" "tfer--a18ee3304cf31448ebe9ea12b48784e2" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:30773"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "30773"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a18ee3304cf31448ebe9ea12b48784e2"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a18ee3304cf31448ebe9ea12b48784e2_sg-0010de5fe00d22d20_id}"]
  source_security_group = "894231352815/k8s-elb-a18ee3304cf31448ebe9ea12b48784e2"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-languages-stage"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-languages-stage"
  }
}

resource "aws_elb" "tfer--a3d9299b3410e44caa7a267ecb001a23" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:32665"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "32665"
    instance_protocol  = "http"
    lb_port            = "8529"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a3d9299b3410e44caa7a267ecb001a23"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a3d9299b3410e44caa7a267ecb001a23_sg-0f0910f619d4e4fd6_id}"]
  source_security_group = "894231352815/k8s-elb-a3d9299b3410e44caa7a267ecb001a23"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/arangodb-loadbalancer"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/arangodb-loadbalancer"
  }
}

resource "aws_elb" "tfer--a582ad585291849e38e39ad52807888f" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:32132"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "32132"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a582ad585291849e38e39ad52807888f"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a582ad585291849e38e39ad52807888f_sg-06ef5221ff196f35a_id}"]
  source_security_group = "894231352815/k8s-elb-a582ad585291849e38e39ad52807888f"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-languages-main"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-languages-main"
  }
}

resource "aws_elb" "tfer--a638c213857e049869afa3fe4aca2939" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:32385"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "32385"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a638c213857e049869afa3fe4aca2939"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a638c213857e049869afa3fe4aca2939_sg-0a2e02b19d2100700_id}"]
  source_security_group = "894231352815/k8s-elb-a638c213857e049869afa3fe4aca2939"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-videos-stage"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-videos-stage"
  }
}

resource "aws_elb" "tfer--a69e78adac8cb45d4be52ec1c927eaff" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:30128"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "30128"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a69e78adac8cb45d4be52ec1c927eaff"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a69e78adac8cb45d4be52ec1c927eaff_sg-01aee220479bc0778_id}"]
  source_security_group = "894231352815/k8s-elb-a69e78adac8cb45d4be52ec1c927eaff"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-journeys-main"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-journeys-main"
  }
}

resource "aws_elb" "tfer--a819711c5a4b94c288be61fe48947a8c" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:31868"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "31868"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a819711c5a4b94c288be61fe48947a8c"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a819711c5a4b94c288be61fe48947a8c_sg-0b5a5774ea382b09f_id}"]
  source_security_group = "894231352815/k8s-elb-a819711c5a4b94c288be61fe48947a8c"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-journeys-stage"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-journeys-stage"
  }
}

resource "aws_elb" "tfer--a899cf7a7e14a44ae81280f5067bb761" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:30324"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "30324"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "a899cf7a7e14a44ae81280f5067bb761"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-a899cf7a7e14a44ae81280f5067bb761_sg-061439617061fdb2c_id}"]
  source_security_group = "894231352815/k8s-elb-a899cf7a7e14a44ae81280f5067bb761"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-gateway-main"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-gateway-main"
  }
}

resource "aws_elb" "tfer--aacad535ab2c34d5eb8227d978849ebe" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:31134"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "31134"
    instance_protocol  = "http"
    lb_port            = "8529"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "aacad535ab2c34d5eb8227d978849ebe"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-aacad535ab2c34d5eb8227d978849ebe_sg-0da17490a553727c2_id}"]
  source_security_group = "894231352815/k8s-elb-aacad535ab2c34d5eb8227d978849ebe"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/arangodb-stage-loadbalancer"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/arangodb-stage-loadbalancer"
  }
}

resource "aws_elb" "tfer--ac51376bfb6a34a529800a5c74892f4b" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:30010"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "30010"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "ac51376bfb6a34a529800a5c74892f4b"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-ac51376bfb6a34a529800a5c74892f4b_sg-03f05715ba8bb810f_id}"]
  source_security_group = "894231352815/k8s-elb-ac51376bfb6a34a529800a5c74892f4b"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-users-main"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-users-main"
  }
}

resource "aws_elb" "tfer--af2b3bdd93c4d44faad69f8ceef76733" {
  availability_zones          = ["us-east-2a", "us-east-2b", "us-east-2c"]
  connection_draining         = "false"
  connection_draining_timeout = "300"
  cross_zone_load_balancing   = "false"
  desync_mitigation_mode      = "defensive"

  health_check {
    healthy_threshold   = "2"
    interval            = "10"
    target              = "TCP:32520"
    timeout             = "5"
    unhealthy_threshold = "6"
  }

  idle_timeout = "60"
  internal     = "false"

  listener {
    instance_port      = "32520"
    instance_protocol  = "http"
    lb_port            = "443"
    lb_protocol        = "https"
    ssl_certificate_id = "arn:aws:acm:us-east-2:894231352815:certificate/15347d85-a737-49a7-8b2f-0b060df6f1d1"
  }

  name                  = "af2b3bdd93c4d44faad69f8ceef76733"
  security_groups       = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--k8s-elb-af2b3bdd93c4d44faad69f8ceef76733_sg-0ef4d9eef9f42f7a5_id}"]
  source_security_group = "894231352815/k8s-elb-af2b3bdd93c4d44faad69f8ceef76733"
  subnets               = ["${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}", "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"]

  tags = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-gateway-stage"
  }

  tags_all = {
    "kubernetes.io/cluster/JesusFilm-core" = "owned"
    "kubernetes.io/service-name"           = "default/api-gateway-stage"
  }
}
