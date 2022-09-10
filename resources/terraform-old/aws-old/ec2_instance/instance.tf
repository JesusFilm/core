resource "aws_instance" "tfer--i-008e0171992e43ee3_" {
  ami                         = "ami-0bf61ea17cec89b3a"
  associate_public_ip_address = "true"
  availability_zone           = "us-east-2b"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count       = "1"
  cpu_threads_per_core = "2"

  credit_specification {
    cpu_credits = "unlimited"
  }

  disable_api_stop        = "false"
  disable_api_termination = "false"
  ebs_optimized           = "false"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  iam_instance_profile                 = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
  instance_initiated_shutdown_behavior = "stop"
  instance_type                        = "t3.medium"
  ipv6_address_count                   = "0"

  launch_template {
    id      = "lt-00b7269aea48aae2f"
    name    = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
    version = "1"
  }

  maintenance_options {
    auto_recovery = "default"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "2"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"

  private_dns_name_options {
    enable_resource_name_dns_a_record    = "false"
    enable_resource_name_dns_aaaa_record = "false"
    hostname_type                        = "ip-name"
  }

  private_ip = "172.31.17.193"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"
    volume_size           = "20"
    volume_type           = "gp2"
  }

  secondary_private_ips = ["172.31.16.185", "172.31.16.229", "172.31.18.43", "172.31.28.176", "172.31.31.244"]
  security_groups       = ["eks-cluster-sg-JesusFilm-core-705006638"]
  source_dest_check     = "true"
  subnet_id             = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}"

  tags = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "API"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tags_all = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "API"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tenancy                = "default"
  user_data_base64       = "TUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvbWl4ZWQ7IGJvdW5kYXJ5PSIvLyIKCi0tLy8KQ29udGVudC1UeXBlOiB0ZXh0L3gtc2hlbGxzY3JpcHQ7IGNoYXJzZXQ9InVzLWFzY2lpIgojIS9iaW4vYmFzaApzZXQgLWV4CkI2NF9DTFVTVEVSX0NBPUxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVU0xZWtORFFXTXJaMEYzU1VKQlowbENRVVJCVGtKbmEzRm9hMmxIT1hjd1FrRlJjMFpCUkVGV1RWSk5kMFZSV1VSV1VWRkVSWGR3Y21SWFNtd0tZMjAxYkdSSFZucE5RalJZUkZSSmVVMUVXWGRPUkVsM1RVUlJkMDVzYjFoRVZFMTVUVVJaZDAxVVNYZE5SRkYzVG14dmQwWlVSVlJOUWtWSFFURlZSUXBCZUUxTFlUTldhVnBZU25WYVdGSnNZM3BEUTBGVFNYZEVVVmxLUzI5YVNXaDJZMDVCVVVWQ1FsRkJSR2RuUlZCQlJFTkRRVkZ2UTJkblJVSkJUblJuQ2pOcVUxTXdObmRuYW1aNEswcGxWSGRtVWs1a1RETm5jRUZsZW1aRk5WQmxVek4wTkV0UWRXSXdVMWw1TWtZNFpVWkdkMWhZY1doMVZqUTRRVEJ2V2xrS1ozVlNSblZ2YzBkQlJ6bHdZbHBaTlRseFZrMUtNMjVTWTBoc1puSnBXRE56V1hOcVFsWTBkRmhqYzFkV1EzbG9VbFF3ZFhGcmRqaHVka3hwWTFGd1RBb3JjRnBOVFVSMGVFSXliR3cyY0VGUlJYVTJiSGRZYUhGU1FVNTJUR0ZrTTNCVVZYTkJibE5rY2l0eFRUTm1URFpJUXpCd05VSktVRXcxVG5obGJrZEhDbFV2VDNZeWJUQnViMWxxWm14S2FYQkNaRzlwU0ZVelFtZEhTWFJ4ZVRFNWVqbDVkMDR6U0c1QmVGbG1RVWRqWm1Sc2F6aHlNR1ZqYWtKallrNUJTVVVLVTFwclkwTkJUemRwZVZKaFVqZ3dPVzlpTmpsakswTXhha2RRT0Voak9FOUtTV0pFTHpGUFMwZHhNMDQzUWpCQmQwNW1OMGswVkVGUWVXa3pXSEIwUlFwc2JtcERla2NyZWpOTFVuaFZVRU5yWnl0TlEwRjNSVUZCWVU1RFRVVkJkMFJuV1VSV1VqQlFRVkZJTDBKQlVVUkJaMHRyVFVFNFIwRXhWV1JGZDBWQ0NpOTNVVVpOUVUxQ1FXWTRkMGhSV1VSV1VqQlBRa0paUlVaSVMxVktaelF4ZVdWdFVDOTROM2N5VmpNeFVFZHZSR3hJZUVOTlFUQkhRMU54UjFOSllqTUtSRkZGUWtOM1ZVRkJORWxDUVZGRVlVWm5UMHBsTUhOSmFHNU9lbTQ1YTJaTk1EbENNVWRUWnk5aFZDdERiVEpXTkVoaWMyWm5jbU5zUTJaSWFHRmtkUXBWWlVOMFduYzVOVTlXUmxod1NWWTNZVGh5ZG5BMFkwc3JVV1l5Wm1oeU1uTjJZVXcxWW01VmEwaDJPV1ZJTlZGbk5uRjFXRFJuVGxSUWRFeGlaV2RoQ2pWeFdHRnFkSE5WVlZOTldtUllWSGN6TjBSclZHMW9NVWw1Y25wYVNYTkdhemhVTjJSaVNWbElSM1IxTkZsdVprTlRlR0YzY1ZaNmJqazRZazFxVDBvS2VXSklieXRwT0VFelZIcEpXRmRTVURSSmRrWTBZbU5GUlVwWVRsbzVkemhpVkN0NFQzVnRSMWhKVFcwek5HWjZjMVEwUkVZdmRXZEZOakkyVlhVNGJRcFZURkJQT0VaUE9Fd3ZUbnBuTDNKMVZHNU5PRmRFWTFOTlExQk5ibTE0VkRZNGNFY3phV2hMUkRkSmMyTjBRa0ZZTW1GNlpTOTVNRFpGV1RkRlFrbzFDblJSVDJzclQyRlVZVmhLU2xJNVdqTlhPR1Z4Vm1sYVpXOVBkVFJZTUZSUVFteG5XUW90TFMwdExVVk9SQ0JEUlZKVVNVWkpRMEZVUlMwdExTMHRDZz09CkFQSV9TRVJWRVJfVVJMPWh0dHBzOi8vNTRBMjQyRTc4RTQzNTUzRTI1NzQxNTg1MjdBQkUzRTYuZ3I3LnVzLWVhc3QtMi5la3MuYW1hem9uYXdzLmNvbQpLOFNfQ0xVU1RFUl9ETlNfSVA9MTAuMTAwLjAuMTAKL2V0Yy9la3MvYm9vdHN0cmFwLnNoIEplc3VzRmlsbS1jb3JlIC0ta3ViZWxldC1leHRyYS1hcmdzICctLW5vZGUtbGFiZWxzPWVrcy5hbWF6b25hd3MuY29tL25vZGVncm91cC1pbWFnZT1hbWktMGJmNjFlYTE3Y2VjODliM2EsZWtzLmFtYXpvbmF3cy5jb20vY2FwYWNpdHlUeXBlPU9OX0RFTUFORCxla3MuYW1hem9uYXdzLmNvbS9ub2RlZ3JvdXA9QVBJLHR5cGU9YXBpIC0tbWF4LXBvZHM9MTcnIC0tYjY0LWNsdXN0ZXItY2EgJEI2NF9DTFVTVEVSX0NBIC0tYXBpc2VydmVyLWVuZHBvaW50ICRBUElfU0VSVkVSX1VSTCAtLWRucy1jbHVzdGVyLWlwICRLOFNfQ0xVU1RFUl9ETlNfSVAgLS11c2UtbWF4LXBvZHMgZmFsc2UKCi0tLy8tLQ=="
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--eks-cluster-sg-JesusFilm-core-705006638_sg-096321fc5ad4991e1_id}"]
}

resource "aws_instance" "tfer--i-0145d50be9ea8ec95_" {
  ami                         = "ami-0bf61ea17cec89b3a"
  associate_public_ip_address = "true"
  availability_zone           = "us-east-2c"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count       = "1"
  cpu_threads_per_core = "2"

  credit_specification {
    cpu_credits = "unlimited"
  }

  disable_api_stop        = "false"
  disable_api_termination = "false"

  ebs_block_device {
    delete_on_termination = "false"
    device_name           = "/dev/xvdbo"
    encrypted             = "false"
    iops                  = "100"

    tags = {
      Name                                      = "kubernetes-dynamic-pvc-9a489d4c-221b-4e11-9fbc-6bcb516347f6"
      "kubernetes.io/cluster/JesusFilm-core"    = "owned"
      "kubernetes.io/created-for/pv/name"       = "pvc-9a489d4c-221b-4e11-9fbc-6bcb516347f6"
      "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-5vqbwjd0"
      "kubernetes.io/created-for/pvc/namespace" = "default"
    }

    throughput  = "0"
    volume_size = "8"
    volume_type = "gp2"
  }

  ebs_block_device {
    delete_on_termination = "false"
    device_name           = "/dev/xvdcg"
    encrypted             = "false"
    iops                  = "100"

    tags = {
      Name                                      = "kubernetes-dynamic-pvc-df6b3e89-c85e-49f0-a827-bc8c2f9f2f9f"
      "kubernetes.io/cluster/JesusFilm-core"    = "owned"
      "kubernetes.io/created-for/pv/name"       = "pvc-df6b3e89-c85e-49f0-a827-bc8c2f9f2f9f"
      "kubernetes.io/created-for/pvc/name"      = "arangodb-stage-single-3uwrqtu4"
      "kubernetes.io/created-for/pvc/namespace" = "default"
    }

    throughput  = "0"
    volume_size = "20"
    volume_type = "gp2"
  }

  ebs_optimized = "false"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  iam_instance_profile                 = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
  instance_initiated_shutdown_behavior = "stop"
  instance_type                        = "t3.medium"
  ipv6_address_count                   = "0"

  launch_template {
    id      = "lt-00b7269aea48aae2f"
    name    = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
    version = "1"
  }

  maintenance_options {
    auto_recovery = "default"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "2"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"

  private_dns_name_options {
    enable_resource_name_dns_a_record    = "false"
    enable_resource_name_dns_aaaa_record = "false"
    hostname_type                        = "ip-name"
  }

  private_ip = "172.31.37.101"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"
    volume_size           = "20"
    volume_type           = "gp2"
  }

  secondary_private_ips = ["172.31.34.42", "172.31.37.158", "172.31.37.99", "172.31.40.233", "172.31.41.96"]
  security_groups       = ["eks-cluster-sg-JesusFilm-core-705006638"]
  source_dest_check     = "true"
  subnet_id             = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}"

  tags = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "API"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tags_all = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "API"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tenancy                = "default"
  user_data_base64       = "TUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvbWl4ZWQ7IGJvdW5kYXJ5PSIvLyIKCi0tLy8KQ29udGVudC1UeXBlOiB0ZXh0L3gtc2hlbGxzY3JpcHQ7IGNoYXJzZXQ9InVzLWFzY2lpIgojIS9iaW4vYmFzaApzZXQgLWV4CkI2NF9DTFVTVEVSX0NBPUxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVU0xZWtORFFXTXJaMEYzU1VKQlowbENRVVJCVGtKbmEzRm9hMmxIT1hjd1FrRlJjMFpCUkVGV1RWSk5kMFZSV1VSV1VWRkVSWGR3Y21SWFNtd0tZMjAxYkdSSFZucE5RalJZUkZSSmVVMUVXWGRPUkVsM1RVUlJkMDVzYjFoRVZFMTVUVVJaZDAxVVNYZE5SRkYzVG14dmQwWlVSVlJOUWtWSFFURlZSUXBCZUUxTFlUTldhVnBZU25WYVdGSnNZM3BEUTBGVFNYZEVVVmxLUzI5YVNXaDJZMDVCVVVWQ1FsRkJSR2RuUlZCQlJFTkRRVkZ2UTJkblJVSkJUblJuQ2pOcVUxTXdObmRuYW1aNEswcGxWSGRtVWs1a1RETm5jRUZsZW1aRk5WQmxVek4wTkV0UWRXSXdVMWw1TWtZNFpVWkdkMWhZY1doMVZqUTRRVEJ2V2xrS1ozVlNSblZ2YzBkQlJ6bHdZbHBaTlRseFZrMUtNMjVTWTBoc1puSnBXRE56V1hOcVFsWTBkRmhqYzFkV1EzbG9VbFF3ZFhGcmRqaHVka3hwWTFGd1RBb3JjRnBOVFVSMGVFSXliR3cyY0VGUlJYVTJiSGRZYUhGU1FVNTJUR0ZrTTNCVVZYTkJibE5rY2l0eFRUTm1URFpJUXpCd05VSktVRXcxVG5obGJrZEhDbFV2VDNZeWJUQnViMWxxWm14S2FYQkNaRzlwU0ZVelFtZEhTWFJ4ZVRFNWVqbDVkMDR6U0c1QmVGbG1RVWRqWm1Sc2F6aHlNR1ZqYWtKallrNUJTVVVLVTFwclkwTkJUemRwZVZKaFVqZ3dPVzlpTmpsakswTXhha2RRT0Voak9FOUtTV0pFTHpGUFMwZHhNMDQzUWpCQmQwNW1OMGswVkVGUWVXa3pXSEIwUlFwc2JtcERla2NyZWpOTFVuaFZVRU5yWnl0TlEwRjNSVUZCWVU1RFRVVkJkMFJuV1VSV1VqQlFRVkZJTDBKQlVVUkJaMHRyVFVFNFIwRXhWV1JGZDBWQ0NpOTNVVVpOUVUxQ1FXWTRkMGhSV1VSV1VqQlBRa0paUlVaSVMxVktaelF4ZVdWdFVDOTROM2N5VmpNeFVFZHZSR3hJZUVOTlFUQkhRMU54UjFOSllqTUtSRkZGUWtOM1ZVRkJORWxDUVZGRVlVWm5UMHBsTUhOSmFHNU9lbTQ1YTJaTk1EbENNVWRUWnk5aFZDdERiVEpXTkVoaWMyWm5jbU5zUTJaSWFHRmtkUXBWWlVOMFduYzVOVTlXUmxod1NWWTNZVGh5ZG5BMFkwc3JVV1l5Wm1oeU1uTjJZVXcxWW01VmEwaDJPV1ZJTlZGbk5uRjFXRFJuVGxSUWRFeGlaV2RoQ2pWeFdHRnFkSE5WVlZOTldtUllWSGN6TjBSclZHMW9NVWw1Y25wYVNYTkdhemhVTjJSaVNWbElSM1IxTkZsdVprTlRlR0YzY1ZaNmJqazRZazFxVDBvS2VXSklieXRwT0VFelZIcEpXRmRTVURSSmRrWTBZbU5GUlVwWVRsbzVkemhpVkN0NFQzVnRSMWhKVFcwek5HWjZjMVEwUkVZdmRXZEZOakkyVlhVNGJRcFZURkJQT0VaUE9Fd3ZUbnBuTDNKMVZHNU5PRmRFWTFOTlExQk5ibTE0VkRZNGNFY3phV2hMUkRkSmMyTjBRa0ZZTW1GNlpTOTVNRFpGV1RkRlFrbzFDblJSVDJzclQyRlVZVmhLU2xJNVdqTlhPR1Z4Vm1sYVpXOVBkVFJZTUZSUVFteG5XUW90TFMwdExVVk9SQ0JEUlZKVVNVWkpRMEZVUlMwdExTMHRDZz09CkFQSV9TRVJWRVJfVVJMPWh0dHBzOi8vNTRBMjQyRTc4RTQzNTUzRTI1NzQxNTg1MjdBQkUzRTYuZ3I3LnVzLWVhc3QtMi5la3MuYW1hem9uYXdzLmNvbQpLOFNfQ0xVU1RFUl9ETlNfSVA9MTAuMTAwLjAuMTAKL2V0Yy9la3MvYm9vdHN0cmFwLnNoIEplc3VzRmlsbS1jb3JlIC0ta3ViZWxldC1leHRyYS1hcmdzICctLW5vZGUtbGFiZWxzPWVrcy5hbWF6b25hd3MuY29tL25vZGVncm91cC1pbWFnZT1hbWktMGJmNjFlYTE3Y2VjODliM2EsZWtzLmFtYXpvbmF3cy5jb20vY2FwYWNpdHlUeXBlPU9OX0RFTUFORCxla3MuYW1hem9uYXdzLmNvbS9ub2RlZ3JvdXA9QVBJLHR5cGU9YXBpIC0tbWF4LXBvZHM9MTcnIC0tYjY0LWNsdXN0ZXItY2EgJEI2NF9DTFVTVEVSX0NBIC0tYXBpc2VydmVyLWVuZHBvaW50ICRBUElfU0VSVkVSX1VSTCAtLWRucy1jbHVzdGVyLWlwICRLOFNfQ0xVU1RFUl9ETlNfSVAgLS11c2UtbWF4LXBvZHMgZmFsc2UKCi0tLy8tLQ=="
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--eks-cluster-sg-JesusFilm-core-705006638_sg-096321fc5ad4991e1_id}"]
}

resource "aws_instance" "tfer--i-02ccb0b1c8ed2dd11_" {
  ami                         = "ami-0bf61ea17cec89b3a"
  associate_public_ip_address = "true"
  availability_zone           = "us-east-2b"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count          = "1"
  cpu_threads_per_core    = "2"
  disable_api_stop        = "false"
  disable_api_termination = "false"

  ebs_block_device {
    delete_on_termination = "false"
    device_name           = "/dev/xvdbw"
    encrypted             = "false"
    iops                  = "100"

    tags = {
      Name                                      = "kubernetes-dynamic-pvc-5121a995-8f84-4778-a6cd-a18af7928194"
      "kubernetes.io/cluster/JesusFilm-core"    = "owned"
      "kubernetes.io/created-for/pv/name"       = "pvc-5121a995-8f84-4778-a6cd-a18af7928194"
      "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-5rpkbvze"
      "kubernetes.io/created-for/pvc/namespace" = "default"
    }

    throughput  = "0"
    volume_size = "8"
    volume_type = "gp2"
  }

  ebs_block_device {
    delete_on_termination = "false"
    device_name           = "/dev/xvdct"
    encrypted             = "false"
    iops                  = "100"

    tags = {
      Name                                      = "kubernetes-dynamic-pvc-0d8f8556-49b8-4f72-9a56-11b78d9379f0"
      "kubernetes.io/cluster/JesusFilm-core"    = "owned"
      "kubernetes.io/created-for/pv/name"       = "pvc-0d8f8556-49b8-4f72-9a56-11b78d9379f0"
      "kubernetes.io/created-for/pvc/name"      = "arangodb-single-zatsw0uk"
      "kubernetes.io/created-for/pvc/namespace" = "default"
    }

    throughput  = "0"
    volume_size = "20"
    volume_type = "gp2"
  }

  ebs_optimized = "false"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  iam_instance_profile                 = "eks-acc0982c-86db-4719-77b5-b8974aeb2772"
  instance_initiated_shutdown_behavior = "stop"
  instance_type                        = "i3.large"
  ipv6_address_count                   = "0"

  launch_template {
    id      = "lt-044598351a93c44d1"
    name    = "eks-acc0982c-86db-4719-77b5-b8974aeb2772"
    version = "1"
  }

  maintenance_options {
    auto_recovery = "default"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "2"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"

  private_dns_name_options {
    enable_resource_name_dns_a_record    = "false"
    enable_resource_name_dns_aaaa_record = "false"
    hostname_type                        = "ip-name"
  }

  private_ip = "172.31.17.230"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"
    volume_size           = "20"
    volume_type           = "gp2"
  }

  secondary_private_ips = ["172.31.16.77", "172.31.18.100", "172.31.18.21", "172.31.18.8", "172.31.22.154", "172.31.22.4", "172.31.25.32", "172.31.26.29", "172.31.27.227"]
  security_groups       = ["eks-cluster-sg-JesusFilm-core-705006638"]
  source_dest_check     = "true"
  subnet_id             = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-4d17ab36_id}"

  tags = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "ArangoDB"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tags_all = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "ArangoDB"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tenancy                = "default"
  user_data_base64       = "TUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvbWl4ZWQ7IGJvdW5kYXJ5PSIvLyIKCi0tLy8KQ29udGVudC1UeXBlOiB0ZXh0L3gtc2hlbGxzY3JpcHQ7IGNoYXJzZXQ9InVzLWFzY2lpIgojIS9iaW4vYmFzaApzZXQgLWV4CkI2NF9DTFVTVEVSX0NBPUxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVU0xZWtORFFXTXJaMEYzU1VKQlowbENRVVJCVGtKbmEzRm9hMmxIT1hjd1FrRlJjMFpCUkVGV1RWSk5kMFZSV1VSV1VWRkVSWGR3Y21SWFNtd0tZMjAxYkdSSFZucE5RalJZUkZSSmVVMUVXWGRPUkVsM1RVUlJkMDVzYjFoRVZFMTVUVVJaZDAxVVNYZE5SRkYzVG14dmQwWlVSVlJOUWtWSFFURlZSUXBCZUUxTFlUTldhVnBZU25WYVdGSnNZM3BEUTBGVFNYZEVVVmxLUzI5YVNXaDJZMDVCVVVWQ1FsRkJSR2RuUlZCQlJFTkRRVkZ2UTJkblJVSkJUblJuQ2pOcVUxTXdObmRuYW1aNEswcGxWSGRtVWs1a1RETm5jRUZsZW1aRk5WQmxVek4wTkV0UWRXSXdVMWw1TWtZNFpVWkdkMWhZY1doMVZqUTRRVEJ2V2xrS1ozVlNSblZ2YzBkQlJ6bHdZbHBaTlRseFZrMUtNMjVTWTBoc1puSnBXRE56V1hOcVFsWTBkRmhqYzFkV1EzbG9VbFF3ZFhGcmRqaHVka3hwWTFGd1RBb3JjRnBOVFVSMGVFSXliR3cyY0VGUlJYVTJiSGRZYUhGU1FVNTJUR0ZrTTNCVVZYTkJibE5rY2l0eFRUTm1URFpJUXpCd05VSktVRXcxVG5obGJrZEhDbFV2VDNZeWJUQnViMWxxWm14S2FYQkNaRzlwU0ZVelFtZEhTWFJ4ZVRFNWVqbDVkMDR6U0c1QmVGbG1RVWRqWm1Sc2F6aHlNR1ZqYWtKallrNUJTVVVLVTFwclkwTkJUemRwZVZKaFVqZ3dPVzlpTmpsakswTXhha2RRT0Voak9FOUtTV0pFTHpGUFMwZHhNMDQzUWpCQmQwNW1OMGswVkVGUWVXa3pXSEIwUlFwc2JtcERla2NyZWpOTFVuaFZVRU5yWnl0TlEwRjNSVUZCWVU1RFRVVkJkMFJuV1VSV1VqQlFRVkZJTDBKQlVVUkJaMHRyVFVFNFIwRXhWV1JGZDBWQ0NpOTNVVVpOUVUxQ1FXWTRkMGhSV1VSV1VqQlBRa0paUlVaSVMxVktaelF4ZVdWdFVDOTROM2N5VmpNeFVFZHZSR3hJZUVOTlFUQkhRMU54UjFOSllqTUtSRkZGUWtOM1ZVRkJORWxDUVZGRVlVWm5UMHBsTUhOSmFHNU9lbTQ1YTJaTk1EbENNVWRUWnk5aFZDdERiVEpXTkVoaWMyWm5jbU5zUTJaSWFHRmtkUXBWWlVOMFduYzVOVTlXUmxod1NWWTNZVGh5ZG5BMFkwc3JVV1l5Wm1oeU1uTjJZVXcxWW01VmEwaDJPV1ZJTlZGbk5uRjFXRFJuVGxSUWRFeGlaV2RoQ2pWeFdHRnFkSE5WVlZOTldtUllWSGN6TjBSclZHMW9NVWw1Y25wYVNYTkdhemhVTjJSaVNWbElSM1IxTkZsdVprTlRlR0YzY1ZaNmJqazRZazFxVDBvS2VXSklieXRwT0VFelZIcEpXRmRTVURSSmRrWTBZbU5GUlVwWVRsbzVkemhpVkN0NFQzVnRSMWhKVFcwek5HWjZjMVEwUkVZdmRXZEZOakkyVlhVNGJRcFZURkJQT0VaUE9Fd3ZUbnBuTDNKMVZHNU5PRmRFWTFOTlExQk5ibTE0VkRZNGNFY3phV2hMUkRkSmMyTjBRa0ZZTW1GNlpTOTVNRFpGV1RkRlFrbzFDblJSVDJzclQyRlVZVmhLU2xJNVdqTlhPR1Z4Vm1sYVpXOVBkVFJZTUZSUVFteG5XUW90TFMwdExVVk9SQ0JEUlZKVVNVWkpRMEZVUlMwdExTMHRDZz09CkFQSV9TRVJWRVJfVVJMPWh0dHBzOi8vNTRBMjQyRTc4RTQzNTUzRTI1NzQxNTg1MjdBQkUzRTYuZ3I3LnVzLWVhc3QtMi5la3MuYW1hem9uYXdzLmNvbQpLOFNfQ0xVU1RFUl9ETlNfSVA9MTAuMTAwLjAuMTAKL2V0Yy9la3MvYm9vdHN0cmFwLnNoIEplc3VzRmlsbS1jb3JlIC0ta3ViZWxldC1leHRyYS1hcmdzICctLW5vZGUtbGFiZWxzPWVrcy5hbWF6b25hd3MuY29tL25vZGVncm91cC1pbWFnZT1hbWktMGJmNjFlYTE3Y2VjODliM2EsZWtzLmFtYXpvbmF3cy5jb20vY2FwYWNpdHlUeXBlPU9OX0RFTUFORCxla3MuYW1hem9uYXdzLmNvbS9ub2RlZ3JvdXA9QXJhbmdvREIsdHlwZT1kYXRhYmFzZSAtLW1heC1wb2RzPTI5JyAtLWI2NC1jbHVzdGVyLWNhICRCNjRfQ0xVU1RFUl9DQSAtLWFwaXNlcnZlci1lbmRwb2ludCAkQVBJX1NFUlZFUl9VUkwgLS1kbnMtY2x1c3Rlci1pcCAkSzhTX0NMVVNURVJfRE5TX0lQIC0tdXNlLW1heC1wb2RzIGZhbHNlCgotLS8vLS0="
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--eks-cluster-sg-JesusFilm-core-705006638_sg-096321fc5ad4991e1_id}"]
}

resource "aws_instance" "tfer--i-075ae1a01a15f5a9d_" {
  ami                         = "ami-0bf61ea17cec89b3a"
  associate_public_ip_address = "true"
  availability_zone           = "us-east-2a"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count       = "1"
  cpu_threads_per_core = "2"

  credit_specification {
    cpu_credits = "unlimited"
  }

  disable_api_stop        = "false"
  disable_api_termination = "false"
  ebs_optimized           = "false"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  iam_instance_profile                 = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
  instance_initiated_shutdown_behavior = "stop"
  instance_type                        = "t3.medium"
  ipv6_address_count                   = "0"

  launch_template {
    id      = "lt-00b7269aea48aae2f"
    name    = "eks-44c0982c-e213-b4b9-339a-f2fe936b5f86"
    version = "1"
  }

  maintenance_options {
    auto_recovery = "default"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "2"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"

  private_dns_name_options {
    enable_resource_name_dns_a_record    = "false"
    enable_resource_name_dns_aaaa_record = "false"
    hostname_type                        = "ip-name"
  }

  private_ip = "172.31.10.99"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"
    volume_size           = "20"
    volume_type           = "gp2"
  }

  secondary_private_ips = ["172.31.12.131", "172.31.13.193", "172.31.14.173", "172.31.14.87", "172.31.15.237"]
  security_groups       = ["eks-cluster-sg-JesusFilm-core-705006638"]
  source_dest_check     = "true"
  subnet_id             = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-bb4432d2_id}"

  tags = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "API"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tags_all = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "API"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tenancy                = "default"
  user_data_base64       = "TUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvbWl4ZWQ7IGJvdW5kYXJ5PSIvLyIKCi0tLy8KQ29udGVudC1UeXBlOiB0ZXh0L3gtc2hlbGxzY3JpcHQ7IGNoYXJzZXQ9InVzLWFzY2lpIgojIS9iaW4vYmFzaApzZXQgLWV4CkI2NF9DTFVTVEVSX0NBPUxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVU0xZWtORFFXTXJaMEYzU1VKQlowbENRVVJCVGtKbmEzRm9hMmxIT1hjd1FrRlJjMFpCUkVGV1RWSk5kMFZSV1VSV1VWRkVSWGR3Y21SWFNtd0tZMjAxYkdSSFZucE5RalJZUkZSSmVVMUVXWGRPUkVsM1RVUlJkMDVzYjFoRVZFMTVUVVJaZDAxVVNYZE5SRkYzVG14dmQwWlVSVlJOUWtWSFFURlZSUXBCZUUxTFlUTldhVnBZU25WYVdGSnNZM3BEUTBGVFNYZEVVVmxLUzI5YVNXaDJZMDVCVVVWQ1FsRkJSR2RuUlZCQlJFTkRRVkZ2UTJkblJVSkJUblJuQ2pOcVUxTXdObmRuYW1aNEswcGxWSGRtVWs1a1RETm5jRUZsZW1aRk5WQmxVek4wTkV0UWRXSXdVMWw1TWtZNFpVWkdkMWhZY1doMVZqUTRRVEJ2V2xrS1ozVlNSblZ2YzBkQlJ6bHdZbHBaTlRseFZrMUtNMjVTWTBoc1puSnBXRE56V1hOcVFsWTBkRmhqYzFkV1EzbG9VbFF3ZFhGcmRqaHVka3hwWTFGd1RBb3JjRnBOVFVSMGVFSXliR3cyY0VGUlJYVTJiSGRZYUhGU1FVNTJUR0ZrTTNCVVZYTkJibE5rY2l0eFRUTm1URFpJUXpCd05VSktVRXcxVG5obGJrZEhDbFV2VDNZeWJUQnViMWxxWm14S2FYQkNaRzlwU0ZVelFtZEhTWFJ4ZVRFNWVqbDVkMDR6U0c1QmVGbG1RVWRqWm1Sc2F6aHlNR1ZqYWtKallrNUJTVVVLVTFwclkwTkJUemRwZVZKaFVqZ3dPVzlpTmpsakswTXhha2RRT0Voak9FOUtTV0pFTHpGUFMwZHhNMDQzUWpCQmQwNW1OMGswVkVGUWVXa3pXSEIwUlFwc2JtcERla2NyZWpOTFVuaFZVRU5yWnl0TlEwRjNSVUZCWVU1RFRVVkJkMFJuV1VSV1VqQlFRVkZJTDBKQlVVUkJaMHRyVFVFNFIwRXhWV1JGZDBWQ0NpOTNVVVpOUVUxQ1FXWTRkMGhSV1VSV1VqQlBRa0paUlVaSVMxVktaelF4ZVdWdFVDOTROM2N5VmpNeFVFZHZSR3hJZUVOTlFUQkhRMU54UjFOSllqTUtSRkZGUWtOM1ZVRkJORWxDUVZGRVlVWm5UMHBsTUhOSmFHNU9lbTQ1YTJaTk1EbENNVWRUWnk5aFZDdERiVEpXTkVoaWMyWm5jbU5zUTJaSWFHRmtkUXBWWlVOMFduYzVOVTlXUmxod1NWWTNZVGh5ZG5BMFkwc3JVV1l5Wm1oeU1uTjJZVXcxWW01VmEwaDJPV1ZJTlZGbk5uRjFXRFJuVGxSUWRFeGlaV2RoQ2pWeFdHRnFkSE5WVlZOTldtUllWSGN6TjBSclZHMW9NVWw1Y25wYVNYTkdhemhVTjJSaVNWbElSM1IxTkZsdVprTlRlR0YzY1ZaNmJqazRZazFxVDBvS2VXSklieXRwT0VFelZIcEpXRmRTVURSSmRrWTBZbU5GUlVwWVRsbzVkemhpVkN0NFQzVnRSMWhKVFcwek5HWjZjMVEwUkVZdmRXZEZOakkyVlhVNGJRcFZURkJQT0VaUE9Fd3ZUbnBuTDNKMVZHNU5PRmRFWTFOTlExQk5ibTE0VkRZNGNFY3phV2hMUkRkSmMyTjBRa0ZZTW1GNlpTOTVNRFpGV1RkRlFrbzFDblJSVDJzclQyRlVZVmhLU2xJNVdqTlhPR1Z4Vm1sYVpXOVBkVFJZTUZSUVFteG5XUW90TFMwdExVVk9SQ0JEUlZKVVNVWkpRMEZVUlMwdExTMHRDZz09CkFQSV9TRVJWRVJfVVJMPWh0dHBzOi8vNTRBMjQyRTc4RTQzNTUzRTI1NzQxNTg1MjdBQkUzRTYuZ3I3LnVzLWVhc3QtMi5la3MuYW1hem9uYXdzLmNvbQpLOFNfQ0xVU1RFUl9ETlNfSVA9MTAuMTAwLjAuMTAKL2V0Yy9la3MvYm9vdHN0cmFwLnNoIEplc3VzRmlsbS1jb3JlIC0ta3ViZWxldC1leHRyYS1hcmdzICctLW5vZGUtbGFiZWxzPWVrcy5hbWF6b25hd3MuY29tL25vZGVncm91cC1pbWFnZT1hbWktMGJmNjFlYTE3Y2VjODliM2EsZWtzLmFtYXpvbmF3cy5jb20vY2FwYWNpdHlUeXBlPU9OX0RFTUFORCxla3MuYW1hem9uYXdzLmNvbS9ub2RlZ3JvdXA9QVBJLHR5cGU9YXBpIC0tbWF4LXBvZHM9MTcnIC0tYjY0LWNsdXN0ZXItY2EgJEI2NF9DTFVTVEVSX0NBIC0tYXBpc2VydmVyLWVuZHBvaW50ICRBUElfU0VSVkVSX1VSTCAtLWRucy1jbHVzdGVyLWlwICRLOFNfQ0xVU1RFUl9ETlNfSVAgLS11c2UtbWF4LXBvZHMgZmFsc2UKCi0tLy8tLQ=="
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--eks-cluster-sg-JesusFilm-core-705006638_sg-096321fc5ad4991e1_id}"]
}

resource "aws_instance" "tfer--i-0d9b3282bd0810174_" {
  ami                         = "ami-0bf61ea17cec89b3a"
  associate_public_ip_address = "true"
  availability_zone           = "us-east-2c"

  capacity_reservation_specification {
    capacity_reservation_preference = "open"
  }

  cpu_core_count          = "1"
  cpu_threads_per_core    = "2"
  disable_api_stop        = "false"
  disable_api_termination = "false"

  ebs_block_device {
    delete_on_termination = "false"
    device_name           = "/dev/xvdbs"
    encrypted             = "false"
    iops                  = "100"

    tags = {
      Name                                      = "kubernetes-dynamic-pvc-49eb07ee-322a-49d1-8cd2-2f8578ffd94c"
      "kubernetes.io/cluster/JesusFilm-core"    = "owned"
      "kubernetes.io/created-for/pv/name"       = "pvc-49eb07ee-322a-49d1-8cd2-2f8578ffd94c"
      "kubernetes.io/created-for/pvc/name"      = "arangodb-single-xpien1ul"
      "kubernetes.io/created-for/pvc/namespace" = "default"
    }

    throughput  = "0"
    volume_size = "20"
    volume_type = "gp2"
  }

  ebs_block_device {
    delete_on_termination = "false"
    device_name           = "/dev/xvdci"
    encrypted             = "false"
    iops                  = "100"

    tags = {
      Name                                      = "kubernetes-dynamic-pvc-10adb4bb-136c-472a-b301-4db933c16e26"
      "kubernetes.io/cluster/JesusFilm-core"    = "owned"
      "kubernetes.io/created-for/pv/name"       = "pvc-10adb4bb-136c-472a-b301-4db933c16e26"
      "kubernetes.io/created-for/pvc/name"      = "arangodb-agent-raqb8dat"
      "kubernetes.io/created-for/pvc/namespace" = "default"
    }

    throughput  = "0"
    volume_size = "8"
    volume_type = "gp2"
  }

  ebs_optimized = "false"

  enclave_options {
    enabled = "false"
  }

  get_password_data                    = "false"
  hibernation                          = "false"
  iam_instance_profile                 = "eks-acc0982c-86db-4719-77b5-b8974aeb2772"
  instance_initiated_shutdown_behavior = "stop"
  instance_type                        = "i3.large"
  ipv6_address_count                   = "0"

  launch_template {
    id      = "lt-044598351a93c44d1"
    name    = "eks-acc0982c-86db-4719-77b5-b8974aeb2772"
    version = "1"
  }

  maintenance_options {
    auto_recovery = "default"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = "2"
    http_tokens                 = "optional"
    instance_metadata_tags      = "disabled"
  }

  monitoring = "false"

  private_dns_name_options {
    enable_resource_name_dns_a_record    = "false"
    enable_resource_name_dns_aaaa_record = "false"
    hostname_type                        = "ip-name"
  }

  private_ip = "172.31.46.9"

  root_block_device {
    delete_on_termination = "true"
    encrypted             = "false"
    volume_size           = "20"
    volume_type           = "gp2"
  }

  secondary_private_ips = ["172.31.33.4", "172.31.35.246", "172.31.40.197", "172.31.40.207", "172.31.42.15", "172.31.42.85", "172.31.43.104", "172.31.45.142", "172.31.45.153"]
  security_groups       = ["eks-cluster-sg-JesusFilm-core-705006638"]
  source_dest_check     = "true"
  subnet_id             = "${data.terraform_remote_state.subnet.outputs.aws_subnet_tfer--subnet-305d917d_id}"

  tags = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "ArangoDB"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tags_all = {
    "eks:cluster-name"                         = "JesusFilm-core"
    "eks:nodegroup-name"                       = "ArangoDB"
    "k8s.io/cluster-autoscaler/JesusFilm-core" = "owned"
    "k8s.io/cluster-autoscaler/enabled"        = "true"
    "kubernetes.io/cluster/JesusFilm-core"     = "owned"
  }

  tenancy                = "default"
  user_data_base64       = "TUlNRS1WZXJzaW9uOiAxLjAKQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvbWl4ZWQ7IGJvdW5kYXJ5PSIvLyIKCi0tLy8KQ29udGVudC1UeXBlOiB0ZXh0L3gtc2hlbGxzY3JpcHQ7IGNoYXJzZXQ9InVzLWFzY2lpIgojIS9iaW4vYmFzaApzZXQgLWV4CkI2NF9DTFVTVEVSX0NBPUxTMHRMUzFDUlVkSlRpQkRSVkpVU1VaSlEwRlVSUzB0TFMwdENrMUpTVU0xZWtORFFXTXJaMEYzU1VKQlowbENRVVJCVGtKbmEzRm9hMmxIT1hjd1FrRlJjMFpCUkVGV1RWSk5kMFZSV1VSV1VWRkVSWGR3Y21SWFNtd0tZMjAxYkdSSFZucE5RalJZUkZSSmVVMUVXWGRPUkVsM1RVUlJkMDVzYjFoRVZFMTVUVVJaZDAxVVNYZE5SRkYzVG14dmQwWlVSVlJOUWtWSFFURlZSUXBCZUUxTFlUTldhVnBZU25WYVdGSnNZM3BEUTBGVFNYZEVVVmxLUzI5YVNXaDJZMDVCVVVWQ1FsRkJSR2RuUlZCQlJFTkRRVkZ2UTJkblJVSkJUblJuQ2pOcVUxTXdObmRuYW1aNEswcGxWSGRtVWs1a1RETm5jRUZsZW1aRk5WQmxVek4wTkV0UWRXSXdVMWw1TWtZNFpVWkdkMWhZY1doMVZqUTRRVEJ2V2xrS1ozVlNSblZ2YzBkQlJ6bHdZbHBaTlRseFZrMUtNMjVTWTBoc1puSnBXRE56V1hOcVFsWTBkRmhqYzFkV1EzbG9VbFF3ZFhGcmRqaHVka3hwWTFGd1RBb3JjRnBOVFVSMGVFSXliR3cyY0VGUlJYVTJiSGRZYUhGU1FVNTJUR0ZrTTNCVVZYTkJibE5rY2l0eFRUTm1URFpJUXpCd05VSktVRXcxVG5obGJrZEhDbFV2VDNZeWJUQnViMWxxWm14S2FYQkNaRzlwU0ZVelFtZEhTWFJ4ZVRFNWVqbDVkMDR6U0c1QmVGbG1RVWRqWm1Sc2F6aHlNR1ZqYWtKallrNUJTVVVLVTFwclkwTkJUemRwZVZKaFVqZ3dPVzlpTmpsakswTXhha2RRT0Voak9FOUtTV0pFTHpGUFMwZHhNMDQzUWpCQmQwNW1OMGswVkVGUWVXa3pXSEIwUlFwc2JtcERla2NyZWpOTFVuaFZVRU5yWnl0TlEwRjNSVUZCWVU1RFRVVkJkMFJuV1VSV1VqQlFRVkZJTDBKQlVVUkJaMHRyVFVFNFIwRXhWV1JGZDBWQ0NpOTNVVVpOUVUxQ1FXWTRkMGhSV1VSV1VqQlBRa0paUlVaSVMxVktaelF4ZVdWdFVDOTROM2N5VmpNeFVFZHZSR3hJZUVOTlFUQkhRMU54UjFOSllqTUtSRkZGUWtOM1ZVRkJORWxDUVZGRVlVWm5UMHBsTUhOSmFHNU9lbTQ1YTJaTk1EbENNVWRUWnk5aFZDdERiVEpXTkVoaWMyWm5jbU5zUTJaSWFHRmtkUXBWWlVOMFduYzVOVTlXUmxod1NWWTNZVGh5ZG5BMFkwc3JVV1l5Wm1oeU1uTjJZVXcxWW01VmEwaDJPV1ZJTlZGbk5uRjFXRFJuVGxSUWRFeGlaV2RoQ2pWeFdHRnFkSE5WVlZOTldtUllWSGN6TjBSclZHMW9NVWw1Y25wYVNYTkdhemhVTjJSaVNWbElSM1IxTkZsdVprTlRlR0YzY1ZaNmJqazRZazFxVDBvS2VXSklieXRwT0VFelZIcEpXRmRTVURSSmRrWTBZbU5GUlVwWVRsbzVkemhpVkN0NFQzVnRSMWhKVFcwek5HWjZjMVEwUkVZdmRXZEZOakkyVlhVNGJRcFZURkJQT0VaUE9Fd3ZUbnBuTDNKMVZHNU5PRmRFWTFOTlExQk5ibTE0VkRZNGNFY3phV2hMUkRkSmMyTjBRa0ZZTW1GNlpTOTVNRFpGV1RkRlFrbzFDblJSVDJzclQyRlVZVmhLU2xJNVdqTlhPR1Z4Vm1sYVpXOVBkVFJZTUZSUVFteG5XUW90TFMwdExVVk9SQ0JEUlZKVVNVWkpRMEZVUlMwdExTMHRDZz09CkFQSV9TRVJWRVJfVVJMPWh0dHBzOi8vNTRBMjQyRTc4RTQzNTUzRTI1NzQxNTg1MjdBQkUzRTYuZ3I3LnVzLWVhc3QtMi5la3MuYW1hem9uYXdzLmNvbQpLOFNfQ0xVU1RFUl9ETlNfSVA9MTAuMTAwLjAuMTAKL2V0Yy9la3MvYm9vdHN0cmFwLnNoIEplc3VzRmlsbS1jb3JlIC0ta3ViZWxldC1leHRyYS1hcmdzICctLW5vZGUtbGFiZWxzPWVrcy5hbWF6b25hd3MuY29tL25vZGVncm91cC1pbWFnZT1hbWktMGJmNjFlYTE3Y2VjODliM2EsZWtzLmFtYXpvbmF3cy5jb20vY2FwYWNpdHlUeXBlPU9OX0RFTUFORCxla3MuYW1hem9uYXdzLmNvbS9ub2RlZ3JvdXA9QXJhbmdvREIsdHlwZT1kYXRhYmFzZSAtLW1heC1wb2RzPTI5JyAtLWI2NC1jbHVzdGVyLWNhICRCNjRfQ0xVU1RFUl9DQSAtLWFwaXNlcnZlci1lbmRwb2ludCAkQVBJX1NFUlZFUl9VUkwgLS1kbnMtY2x1c3Rlci1pcCAkSzhTX0NMVVNURVJfRE5TX0lQIC0tdXNlLW1heC1wb2RzIGZhbHNlCgotLS8vLS0="
  vpc_security_group_ids = ["${data.terraform_remote_state.sg.outputs.aws_security_group_tfer--eks-cluster-sg-JesusFilm-core-705006638_sg-096321fc5ad4991e1_id}"]
}
