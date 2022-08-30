resource "aws_network_interface" "tfer--eni-00000cf39051e2133" {
  attachment {
    device_index = "0"
    instance     = "i-0d9b3282bd0810174"
  }

  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.46.9"
  private_ip_list    = ["172.31.33.4", "172.31.35.246", "172.31.40.197", "172.31.40.207", "172.31.42.15", "172.31.42.85", "172.31.43.104", "172.31.45.142", "172.31.45.153", "172.31.46.9"]
  private_ips        = ["172.31.33.4", "172.31.35.246", "172.31.40.197", "172.31.40.207", "172.31.42.15", "172.31.42.85", "172.31.43.104", "172.31.45.142", "172.31.45.153", "172.31.46.9"]
  private_ips_count  = "9"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"

  tags = {
    "node.k8s.amazonaws.com/instance_id" = "i-0d9b3282bd0810174"
  }

  tags_all = {
    "node.k8s.amazonaws.com/instance_id" = "i-0d9b3282bd0810174"
  }
}

resource "aws_network_interface" "tfer--eni-0036a93ddfa2ab895" {
  description        = "ELB a899cf7a7e14a44ae81280f5067bb761"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.2.51"
  private_ip_list    = ["172.31.2.51"]
  private_ips        = ["172.31.2.51"]
  private_ips_count  = "0"
  security_groups    = ["sg-061439617061fdb2c"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-00946b7b77e0f3dc9" {
  description        = "ELB ac51376bfb6a34a529800a5c74892f4b"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.16.255"
  private_ip_list    = ["172.31.16.255"]
  private_ips        = ["172.31.16.255"]
  private_ips_count  = "0"
  security_groups    = ["sg-03f05715ba8bb810f"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-00cf250c1f41c7ef6" {
  description        = "ELB a3d9299b3410e44caa7a267ecb001a23"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.9.77"
  private_ip_list    = ["172.31.9.77"]
  private_ips        = ["172.31.9.77"]
  private_ips_count  = "0"
  security_groups    = ["sg-0f0910f619d4e4fd6"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-015f489fdf3fd8aa4" {
  attachment {
    device_index = "1"
    instance     = "i-02ccb0b1c8ed2dd11"
  }

  description        = "aws-K8S-i-02ccb0b1c8ed2dd11"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.24.188"
  private_ip_list    = ["172.31.16.75", "172.31.18.15", "172.31.18.73", "172.31.24.188", "172.31.25.39", "172.31.25.54", "172.31.25.99", "172.31.26.140", "172.31.30.132", "172.31.30.135"]
  private_ips        = ["172.31.16.75", "172.31.18.15", "172.31.18.73", "172.31.24.188", "172.31.25.39", "172.31.25.54", "172.31.25.99", "172.31.26.140", "172.31.30.132", "172.31.30.135"]
  private_ips_count  = "9"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:25:01Z"
    "node.k8s.amazonaws.com/instance_id" = "i-02ccb0b1c8ed2dd11"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:25:01Z"
    "node.k8s.amazonaws.com/instance_id" = "i-02ccb0b1c8ed2dd11"
  }
}

resource "aws_network_interface" "tfer--eni-01d3ebbdaf4738b35" {
  description        = "ELB a819711c5a4b94c288be61fe48947a8c"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.24.18"
  private_ip_list    = ["172.31.24.18"]
  private_ips        = ["172.31.24.18"]
  private_ips_count  = "0"
  security_groups    = ["sg-0b5a5774ea382b09f"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-02183fbf1c5fdadbc" {
  description        = "ELB a69e78adac8cb45d4be52ec1c927eaff"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.41.98"
  private_ip_list    = ["172.31.41.98"]
  private_ips        = ["172.31.41.98"]
  private_ips_count  = "0"
  security_groups    = ["sg-01aee220479bc0778"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0261cde1ae701c387" {
  description        = "ELB a638c213857e049869afa3fe4aca2939"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.11.238"
  private_ip_list    = ["172.31.11.238"]
  private_ips        = ["172.31.11.238"]
  private_ips_count  = "0"
  security_groups    = ["sg-0a2e02b19d2100700"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-027faeee34883287e" {
  description        = "ELB a899cf7a7e14a44ae81280f5067bb761"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.45.172"
  private_ip_list    = ["172.31.45.172"]
  private_ips        = ["172.31.45.172"]
  private_ips_count  = "0"
  security_groups    = ["sg-061439617061fdb2c"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-02fb66bb3910e04fe" {
  description        = "ELB app/43561ac5-echoserver-echose-2ad7/5c4c63ef054f3304"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.36.32"
  private_ip_list    = ["172.31.36.32"]
  private_ips        = ["172.31.36.32"]
  private_ips_count  = "0"
  security_groups    = ["sg-00d4def5bbc6a8ec1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-031db84b1f6cb5f9a" {
  description        = "ELB a18ee3304cf31448ebe9ea12b48784e2"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.3.196"
  private_ip_list    = ["172.31.3.196"]
  private_ips        = ["172.31.3.196"]
  private_ips_count  = "0"
  security_groups    = ["sg-0010de5fe00d22d20"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-032967a268173ebe6" {
  description        = "ELB aacad535ab2c34d5eb8227d978849ebe"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.14.244"
  private_ip_list    = ["172.31.14.244"]
  private_ips        = ["172.31.14.244"]
  private_ips_count  = "0"
  security_groups    = ["sg-0da17490a553727c2"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-03cdf53dc50e12794" {
  attachment {
    device_index = "2"
    instance     = "i-008e0171992e43ee3"
  }

  description        = "aws-K8S-i-008e0171992e43ee3"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.26.115"
  private_ip_list    = ["172.31.21.127", "172.31.22.111", "172.31.24.232", "172.31.26.115", "172.31.26.222", "172.31.28.218"]
  private_ips        = ["172.31.21.127", "172.31.22.111", "172.31.24.232", "172.31.26.115", "172.31.26.222", "172.31.28.218"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-29T04:08:03Z"
    "node.k8s.amazonaws.com/instance_id" = "i-008e0171992e43ee3"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-29T04:08:03Z"
    "node.k8s.amazonaws.com/instance_id" = "i-008e0171992e43ee3"
  }
}

resource "aws_network_interface" "tfer--eni-042f6e6c5cabd51a1" {
  attachment {
    device_index = "2"
    instance     = "i-075ae1a01a15f5a9d"
  }

  description        = "aws-K8S-i-075ae1a01a15f5a9d"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.1.225"
  private_ip_list    = ["172.31.1.225", "172.31.15.33", "172.31.2.199", "172.31.3.69", "172.31.4.70", "172.31.7.220"]
  private_ips        = ["172.31.1.225", "172.31.15.33", "172.31.2.199", "172.31.3.69", "172.31.4.70", "172.31.7.220"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-29T03:28:40Z"
    "node.k8s.amazonaws.com/instance_id" = "i-075ae1a01a15f5a9d"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-29T03:28:40Z"
    "node.k8s.amazonaws.com/instance_id" = "i-075ae1a01a15f5a9d"
  }
}

resource "aws_network_interface" "tfer--eni-04c26b705ddccba12" {
  description        = "ELB a582ad585291849e38e39ad52807888f"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.20.105"
  private_ip_list    = ["172.31.20.105"]
  private_ips        = ["172.31.20.105"]
  private_ips_count  = "0"
  security_groups    = ["sg-06ef5221ff196f35a"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-04c4ad1e0e7f0ddaa" {
  description        = "ELB af2b3bdd93c4d44faad69f8ceef76733"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.41.143"
  private_ip_list    = ["172.31.41.143"]
  private_ips        = ["172.31.41.143"]
  private_ips_count  = "0"
  security_groups    = ["sg-0ef4d9eef9f42f7a5"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-04ed11057c6013f0a" {
  attachment {
    device_index = "0"
    instance     = "i-075ae1a01a15f5a9d"
  }

  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.10.99"
  private_ip_list    = ["172.31.10.99", "172.31.12.131", "172.31.13.193", "172.31.14.173", "172.31.14.87", "172.31.15.237"]
  private_ips        = ["172.31.10.99", "172.31.12.131", "172.31.13.193", "172.31.14.173", "172.31.14.87", "172.31.15.237"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"

  tags = {
    "node.k8s.amazonaws.com/instance_id" = "i-075ae1a01a15f5a9d"
  }

  tags_all = {
    "node.k8s.amazonaws.com/instance_id" = "i-075ae1a01a15f5a9d"
  }
}

resource "aws_network_interface" "tfer--eni-05076a36ec5338300" {
  attachment {
    device_index = "2"
    instance     = "i-0145d50be9ea8ec95"
  }

  description        = "aws-K8S-i-0145d50be9ea8ec95"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.32.184"
  private_ip_list    = ["172.31.32.177", "172.31.32.184", "172.31.37.150", "172.31.37.50", "172.31.38.50", "172.31.45.75"]
  private_ips        = ["172.31.32.177", "172.31.32.184", "172.31.37.150", "172.31.37.50", "172.31.38.50", "172.31.45.75"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T22:01:45Z"
    "node.k8s.amazonaws.com/instance_id" = "i-0145d50be9ea8ec95"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T22:01:45Z"
    "node.k8s.amazonaws.com/instance_id" = "i-0145d50be9ea8ec95"
  }
}

resource "aws_network_interface" "tfer--eni-0549d7e02e4cf3431" {
  description        = "ELB a18ee3304cf31448ebe9ea12b48784e2"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.32.101"
  private_ip_list    = ["172.31.32.101"]
  private_ips        = ["172.31.32.101"]
  private_ips_count  = "0"
  security_groups    = ["sg-0010de5fe00d22d20"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-057d5262899b40190" {
  description        = "ELB a582ad585291849e38e39ad52807888f"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.47.15"
  private_ip_list    = ["172.31.47.15"]
  private_ips        = ["172.31.47.15"]
  private_ips_count  = "0"
  security_groups    = ["sg-06ef5221ff196f35a"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-060fba76fc5fc5131" {
  description        = "Amazon EKS JesusFilm-core"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.7.12"
  private_ip_list    = ["172.31.7.12"]
  private_ips        = ["172.31.7.12"]
  private_ips_count  = "0"
  security_groups    = ["sg-096321fc5ad4991e1", "sg-be0e39d7"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-067ad6e5f491072ec" {
  description        = "ELB a0ac84891964c48a0acf5b0c1c713f79"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.23.131"
  private_ip_list    = ["172.31.23.131"]
  private_ips        = ["172.31.23.131"]
  private_ips_count  = "0"
  security_groups    = ["sg-040c31ad4452f0463"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-068e2c60cecf53870" {
  description        = "ELB a69e78adac8cb45d4be52ec1c927eaff"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.27.43"
  private_ip_list    = ["172.31.27.43"]
  private_ips        = ["172.31.27.43"]
  private_ips_count  = "0"
  security_groups    = ["sg-01aee220479bc0778"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-06b161abb2efd4e78" {
  description        = "ELB a819711c5a4b94c288be61fe48947a8c"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.10.127"
  private_ip_list    = ["172.31.10.127"]
  private_ips        = ["172.31.10.127"]
  private_ips_count  = "0"
  security_groups    = ["sg-0b5a5774ea382b09f"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-06d337933e0767e8e" {
  description        = "ELB a638c213857e049869afa3fe4aca2939"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.21.102"
  private_ip_list    = ["172.31.21.102"]
  private_ips        = ["172.31.21.102"]
  private_ips_count  = "0"
  security_groups    = ["sg-0a2e02b19d2100700"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-076fe4db6117f1a20" {
  description        = "ELB aacad535ab2c34d5eb8227d978849ebe"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.37.91"
  private_ip_list    = ["172.31.37.91"]
  private_ips        = ["172.31.37.91"]
  private_ips_count  = "0"
  security_groups    = ["sg-0da17490a553727c2"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-07905f4bc898b49cd" {
  description        = "ELB a0ac84891964c48a0acf5b0c1c713f79"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.45.163"
  private_ip_list    = ["172.31.45.163"]
  private_ips        = ["172.31.45.163"]
  private_ips_count  = "0"
  security_groups    = ["sg-040c31ad4452f0463"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-07e4d1d767a424000" {
  description        = "ELB a69e78adac8cb45d4be52ec1c927eaff"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.13.37"
  private_ip_list    = ["172.31.13.37"]
  private_ips        = ["172.31.13.37"]
  private_ips_count  = "0"
  security_groups    = ["sg-01aee220479bc0778"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-07f31b6e9713d5037" {
  description        = "ELB a582ad585291849e38e39ad52807888f"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.3.61"
  private_ip_list    = ["172.31.3.61"]
  private_ips        = ["172.31.3.61"]
  private_ips_count  = "0"
  security_groups    = ["sg-06ef5221ff196f35a"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-0927025d83ab2aa16" {
  description        = "ELB a3d9299b3410e44caa7a267ecb001a23"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.24.37"
  private_ip_list    = ["172.31.24.37"]
  private_ips        = ["172.31.24.37"]
  private_ips_count  = "0"
  security_groups    = ["sg-0f0910f619d4e4fd6"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-094acf94a9dadd4ca" {
  attachment {
    device_index = "0"
    instance     = "i-008e0171992e43ee3"
  }

  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.17.193"
  private_ip_list    = ["172.31.16.185", "172.31.16.229", "172.31.17.193", "172.31.18.43", "172.31.28.176", "172.31.31.244"]
  private_ips        = ["172.31.16.185", "172.31.16.229", "172.31.17.193", "172.31.18.43", "172.31.28.176", "172.31.31.244"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"

  tags = {
    "node.k8s.amazonaws.com/instance_id" = "i-008e0171992e43ee3"
  }

  tags_all = {
    "node.k8s.amazonaws.com/instance_id" = "i-008e0171992e43ee3"
  }
}

resource "aws_network_interface" "tfer--eni-09eab0fd79d3794e9" {
  description        = "ELB ac51376bfb6a34a529800a5c74892f4b"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.6.208"
  private_ip_list    = ["172.31.6.208"]
  private_ips        = ["172.31.6.208"]
  private_ips_count  = "0"
  security_groups    = ["sg-03f05715ba8bb810f"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-09fa0dcf469f71c9e" {
  description        = "ELB a027a643b38aa47f296f59ffc4db05a0"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.30.165"
  private_ip_list    = ["172.31.30.165"]
  private_ips        = ["172.31.30.165"]
  private_ips_count  = "0"
  security_groups    = ["sg-015ab1628104b67ad"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-09fb5b90dbd85d743" {
  description        = "ELB a18ee3304cf31448ebe9ea12b48784e2"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.30.145"
  private_ip_list    = ["172.31.30.145"]
  private_ips        = ["172.31.30.145"]
  private_ips_count  = "0"
  security_groups    = ["sg-0010de5fe00d22d20"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-0a32a31b59554cb83" {
  attachment {
    device_index = "0"
    instance     = "i-001f7540c5c9d46af"
  }

  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.12.146"
  private_ip_list    = ["172.31.12.146"]
  private_ips        = ["172.31.12.146"]
  private_ips_count  = "0"
  security_groups    = ["sg-080612b5c467b92f5"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"

  tags = {
    Name = "ApolloGateway"
  }

  tags_all = {
    Name = "ApolloGateway"
  }
}

resource "aws_network_interface" "tfer--eni-0a358243c6a688935" {
  description        = "ELB a3d9299b3410e44caa7a267ecb001a23"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.39.137"
  private_ip_list    = ["172.31.39.137"]
  private_ips        = ["172.31.39.137"]
  private_ips_count  = "0"
  security_groups    = ["sg-0f0910f619d4e4fd6"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0a8de1b8f486443d2" {
  attachment {
    device_index = "1"
    instance     = "i-0145d50be9ea8ec95"
  }

  description        = "aws-K8S-i-0145d50be9ea8ec95"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.33.160"
  private_ip_list    = ["172.31.32.96", "172.31.33.160", "172.31.34.94", "172.31.42.87", "172.31.46.205", "172.31.46.70"]
  private_ips        = ["172.31.32.96", "172.31.33.160", "172.31.34.94", "172.31.42.87", "172.31.46.205", "172.31.46.70"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:14:42Z"
    "node.k8s.amazonaws.com/instance_id" = "i-0145d50be9ea8ec95"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:14:42Z"
    "node.k8s.amazonaws.com/instance_id" = "i-0145d50be9ea8ec95"
  }
}

resource "aws_network_interface" "tfer--eni-0aa805dac8a1aa297" {
  attachment {
    device_index = "0"
    instance     = "i-02ccb0b1c8ed2dd11"
  }

  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.17.230"
  private_ip_list    = ["172.31.16.77", "172.31.17.230", "172.31.18.100", "172.31.18.21", "172.31.18.8", "172.31.22.154", "172.31.22.4", "172.31.25.32", "172.31.26.29", "172.31.27.227"]
  private_ips        = ["172.31.16.77", "172.31.17.230", "172.31.18.100", "172.31.18.21", "172.31.18.8", "172.31.22.154", "172.31.22.4", "172.31.25.32", "172.31.26.29", "172.31.27.227"]
  private_ips_count  = "9"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"

  tags = {
    "node.k8s.amazonaws.com/instance_id" = "i-02ccb0b1c8ed2dd11"
  }

  tags_all = {
    "node.k8s.amazonaws.com/instance_id" = "i-02ccb0b1c8ed2dd11"
  }
}

resource "aws_network_interface" "tfer--eni-0ae5b3d082a3d1226" {
  description        = "Amazon EKS JesusFilm-core"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.41.206"
  private_ip_list    = ["172.31.41.206"]
  private_ips        = ["172.31.41.206"]
  private_ips_count  = "0"
  security_groups    = ["sg-096321fc5ad4991e1", "sg-be0e39d7"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0b4be848a52c407e5" {
  description        = "ELB a027a643b38aa47f296f59ffc4db05a0"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.41.167"
  private_ip_list    = ["172.31.41.167"]
  private_ips        = ["172.31.41.167"]
  private_ips_count  = "0"
  security_groups    = ["sg-015ab1628104b67ad"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0bacfa1421877a4da" {
  description        = "ELB a0ac84891964c48a0acf5b0c1c713f79"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.2.123"
  private_ip_list    = ["172.31.2.123"]
  private_ips        = ["172.31.2.123"]
  private_ips_count  = "0"
  security_groups    = ["sg-040c31ad4452f0463"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-0bdb24ed15dd7798d" {
  description        = "ELB ac51376bfb6a34a529800a5c74892f4b"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.42.39"
  private_ip_list    = ["172.31.42.39"]
  private_ips        = ["172.31.42.39"]
  private_ips_count  = "0"
  security_groups    = ["sg-03f05715ba8bb810f"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0be84a9d223f037a5" {
  description        = "ELB a638c213857e049869afa3fe4aca2939"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.42.250"
  private_ip_list    = ["172.31.42.250"]
  private_ips        = ["172.31.42.250"]
  private_ips_count  = "0"
  security_groups    = ["sg-0a2e02b19d2100700"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0c4a58231928d209a" {
  attachment {
    device_index = "1"
    instance     = "i-008e0171992e43ee3"
  }

  description        = "aws-K8S-i-008e0171992e43ee3"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.16.178"
  private_ip_list    = ["172.31.16.178", "172.31.20.107", "172.31.24.195", "172.31.26.66", "172.31.27.192", "172.31.29.247"]
  private_ips        = ["172.31.16.178", "172.31.20.107", "172.31.24.195", "172.31.26.66", "172.31.27.192", "172.31.29.247"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:23:45Z"
    "node.k8s.amazonaws.com/instance_id" = "i-008e0171992e43ee3"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:23:45Z"
    "node.k8s.amazonaws.com/instance_id" = "i-008e0171992e43ee3"
  }
}

resource "aws_network_interface" "tfer--eni-0c5d2efe34aeeeb7b" {
  description        = "ELB a899cf7a7e14a44ae81280f5067bb761"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.18.48"
  private_ip_list    = ["172.31.18.48"]
  private_ips        = ["172.31.18.48"]
  private_ips_count  = "0"
  security_groups    = ["sg-061439617061fdb2c"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-0c60c8971eeea76fc" {
  description        = "ELB af2b3bdd93c4d44faad69f8ceef76733"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.14.223"
  private_ip_list    = ["172.31.14.223"]
  private_ips        = ["172.31.14.223"]
  private_ips_count  = "0"
  security_groups    = ["sg-0ef4d9eef9f42f7a5"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-0ca1d83bea4870405" {
  attachment {
    device_index = "0"
    instance     = "i-0145d50be9ea8ec95"
  }

  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.37.101"
  private_ip_list    = ["172.31.34.42", "172.31.37.101", "172.31.37.158", "172.31.37.99", "172.31.40.233", "172.31.41.96"]
  private_ips        = ["172.31.34.42", "172.31.37.101", "172.31.37.158", "172.31.37.99", "172.31.40.233", "172.31.41.96"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"

  tags = {
    "node.k8s.amazonaws.com/instance_id" = "i-0145d50be9ea8ec95"
  }

  tags_all = {
    "node.k8s.amazonaws.com/instance_id" = "i-0145d50be9ea8ec95"
  }
}

resource "aws_network_interface" "tfer--eni-0d0250d44375620d1" {
  description        = "ELB a027a643b38aa47f296f59ffc4db05a0"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.12.179"
  private_ip_list    = ["172.31.12.179"]
  private_ips        = ["172.31.12.179"]
  private_ips_count  = "0"
  security_groups    = ["sg-015ab1628104b67ad"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"
}

resource "aws_network_interface" "tfer--eni-0e7d974fb7991df44" {
  description        = "ELB a819711c5a4b94c288be61fe48947a8c"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.33.242"
  private_ip_list    = ["172.31.33.242"]
  private_ips        = ["172.31.33.242"]
  private_ips_count  = "0"
  security_groups    = ["sg-0b5a5774ea382b09f"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"
}

resource "aws_network_interface" "tfer--eni-0f4fb5fc79ba28e31" {
  attachment {
    device_index = "1"
    instance     = "i-075ae1a01a15f5a9d"
  }

  description        = "aws-K8S-i-075ae1a01a15f5a9d"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.9.115"
  private_ip_list    = ["172.31.11.109", "172.31.14.177", "172.31.3.42", "172.31.5.40", "172.31.9.115", "172.31.9.235"]
  private_ips        = ["172.31.11.109", "172.31.14.177", "172.31.3.42", "172.31.5.40", "172.31.9.115", "172.31.9.235"]
  private_ips_count  = "5"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-bb4432d2"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-27T00:30:13Z"
    "node.k8s.amazonaws.com/instance_id" = "i-075ae1a01a15f5a9d"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-27T00:30:13Z"
    "node.k8s.amazonaws.com/instance_id" = "i-075ae1a01a15f5a9d"
  }
}

resource "aws_network_interface" "tfer--eni-0f98b35ae47602820" {
  description        = "ELB af2b3bdd93c4d44faad69f8ceef76733"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.17.47"
  private_ip_list    = ["172.31.17.47"]
  private_ips        = ["172.31.17.47"]
  private_ips_count  = "0"
  security_groups    = ["sg-0ef4d9eef9f42f7a5"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}

resource "aws_network_interface" "tfer--eni-0fc32d01cc8010e54" {
  attachment {
    device_index = "1"
    instance     = "i-0d9b3282bd0810174"
  }

  description        = "aws-K8S-i-0d9b3282bd0810174"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.45.203"
  private_ip_list    = ["172.31.32.196", "172.31.33.65", "172.31.35.133", "172.31.38.65", "172.31.39.99", "172.31.41.221", "172.31.42.108", "172.31.42.242", "172.31.43.15", "172.31.45.203"]
  private_ips        = ["172.31.32.196", "172.31.33.65", "172.31.35.133", "172.31.38.65", "172.31.39.99", "172.31.41.221", "172.31.42.108", "172.31.42.242", "172.31.43.15", "172.31.45.203"]
  private_ips_count  = "9"
  security_groups    = ["sg-096321fc5ad4991e1"]
  source_dest_check  = "true"
  subnet_id          = "subnet-305d917d"

  tags = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:25:02Z"
    "node.k8s.amazonaws.com/instance_id" = "i-0d9b3282bd0810174"
  }

  tags_all = {
    "node.k8s.amazonaws.com/createdAt"   = "2022-06-04T20:25:02Z"
    "node.k8s.amazonaws.com/instance_id" = "i-0d9b3282bd0810174"
  }
}

resource "aws_network_interface" "tfer--eni-0fd57d751772fe842" {
  description        = "ELB aacad535ab2c34d5eb8227d978849ebe"
  interface_type     = "interface"
  ipv4_prefix_count  = "0"
  ipv6_address_count = "0"
  ipv6_prefix_count  = "0"
  private_ip         = "172.31.27.139"
  private_ip_list    = ["172.31.27.139"]
  private_ips        = ["172.31.27.139"]
  private_ips_count  = "0"
  security_groups    = ["sg-0da17490a553727c2"]
  source_dest_check  = "true"
  subnet_id          = "subnet-4d17ab36"
}
